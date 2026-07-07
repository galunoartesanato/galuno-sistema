import { supabase } from "./supabaseClient";

// Adaptador que liga o "window.storage" do App ao Supabase.
//
// ANTES: uma "caixa única" (tabela app_estado, linha 'principal') com TODOS os
// dados juntos. Qualquer pessoa logada baixava tudo.
//
// AGORA: os dados sensíveis ficam em "baldes" separados (outras linhas de
// app_estado), cada um com sua própria regra de acesso (RLS) no banco. Assim,
// quem não pode ver aquele balde não recebe os dados nem pela API — não é só a
// tela que esconde.
//
// A interface get/set continua a mesma, então o App praticamente não muda: o
// split/junção acontece aqui dentro.
//
// Fase 1a: balde 'financeiro'. (Fase 1b adicionará 'rh' com os colaboradores.)

// Mapa: chave do estado -> id do balde (linha) em app_estado.
const BALDES = {
  financeiro: "financeiro",
  // rh: "rh",  // <- Fase 1b
};

// Marca quais baldes foram realmente carregados nesta sessão. Só gravamos um
// balde que foi lido — assim um usuário sem acesso nunca apaga o dado de quem tem.
const carregado = {};

async function lerBalde(id) {
  // maybeSingle: se a linha não existe OU o RLS bloqueia, volta null (sem erro).
  const { data, error } = await supabase
    .from("app_estado")
    .select("dados")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? data.dados : null;
}

export const supabaseStorage = {
  async get() {
    const principal = await lerBalde("principal");
    // Caixa vazia (primeiro uso): App carrega o SEED.
    if (
      !principal ||
      (typeof principal === "object" && Object.keys(principal).length === 0)
    ) {
      throw new Error("caixa vazia");
    }

    const estado = { ...principal };

    for (const [chave, id] of Object.entries(BALDES)) {
      let val = null;
      try {
        val = await lerBalde(id);
      } catch (_e) {
        val = null;
      }

      if (val !== null && val !== undefined) {
        // Balde existe e tenho acesso -> uso o balde e marco para poder gravar.
        estado[chave] = val;
        carregado[id] = true;
      } else {
        // Balde ainda não existe (pré-migração) ou sem acesso.
        // Se o principal ainda tiver essa chave (compatibilidade com o modelo
        // antigo), mantém o valor dele; senão, vazio. NÃO marco como carregado,
        // então o set() não vai apagar nada.
        if (!(chave in estado)) estado[chave] = [];
        carregado[id] = false;
      }
    }

    return { value: JSON.stringify(estado) };
  },

  async set(_key, value) {
    const estado = JSON.parse(value);
    const principal = { ...estado };

    // Grava cada balde sensível SÓ se ele foi carregado nesta sessão.
    for (const [chave, id] of Object.entries(BALDES)) {
      if (carregado[id]) {
        // O balde é a fonte da verdade -> tira a chave do principal.
        delete principal[chave];
        const dados = estado[chave] ?? [];
        const { error } = await supabase
          .from("app_estado")
          .update({ dados })
          .eq("id", id);
        if (error) throw error;
      }
      // Se NÃO foi carregado, deixamos a chave no principal como estava
      // (comportamento antigo) para não perder dado durante a transição.
    }

    const { error } = await supabase
      .from("app_estado")
      .update({ dados: principal })
      .eq("id", "principal");
    if (error) throw error;
  },
};
