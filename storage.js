import { supabase } from "./supabaseClient";

// Adaptador que liga o "window.storage" do App ao Supabase.
//
// ANTES: uma "caixa única" (tabela app_estado, linha 'principal') com TODOS os
// dados juntos. Qualquer pessoa logada baixava tudo.
//
// AGORA: os dados sensíveis ficam em "baldes" separados (outras linhas de
// app_estado), cada um com sua própria regra de acesso (RLS) no banco. Quem não
// pode ver aquele balde não recebe os dados nem pela API — não é só a tela.
//
// A interface get/set continua a mesma; o split/junção acontece aqui dentro.
//
//   Balde 'financeiro'  -> data.financeiro           (dono, financeiro)
//   Balde 'rh'          -> colaboradores das fábricas (dono, financeiro, rh)
//
// Para o RH: as listas de colaboradores (com nome/salário) saem de dentro de
// 'fabricas' e vão para o balde 'rh'. No principal, cada fábrica guarda só o
// total agregado (custosFixos / montagem.custoColaboradores), que é o que a
// precificação usa. Assim o setor 'vendas' calcula preço sem ver salário.

// Baldes que são uma chave simples do estado.
const BALDES = {
  financeiro: "financeiro",
};

// Marca quais baldes foram lidos nesta sessão. Só gravamos um balde que foi
// lido — assim um usuário sem acesso nunca apaga o dado de quem tem.
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

// Injeta as listas de colaboradores (vindas do balde 'rh') de volta em fabricas.
function injetarRH(fabricas, rh) {
  return (fabricas || []).map((f) => {
    const r = (rh && rh[f.id]) || {};
    const nf = { ...f, colaboradores: r.colaboradores || [] };
    if (nf.montagem) {
      nf.montagem = { ...nf.montagem, colaboradores: r.montagem || [] };
    }
    return nf;
  });
}

// Garante que 'colaboradores' exista (vazio) mesmo sem acesso ao balde 'rh',
// para a interface não quebrar. O preço usa o agregado, não a lista.
function fabricasSemRH(fabricas) {
  return (fabricas || []).map((f) => {
    const nf = { ...f, colaboradores: f.colaboradores || [] };
    if (nf.montagem && !nf.montagem.colaboradores) {
      nf.montagem = { ...nf.montagem, colaboradores: [] };
    }
    return nf;
  });
}

// Tira as listas de colaboradores das fábricas (o que vai para o principal).
// Mantém os agregados (custosFixos, montagem.custoColaboradores).
function fabricasParaPrincipal(fabricas) {
  return (fabricas || []).map((f) => {
    const nf = { ...f };
    delete nf.colaboradores;
    if (nf.montagem) {
      nf.montagem = { ...nf.montagem };
      delete nf.montagem.colaboradores;
    }
    return nf;
  });
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

    // Baldes de chave simples (financeiro).
    for (const [chave, id] of Object.entries(BALDES)) {
      let val = null;
      try {
        val = await lerBalde(id);
      } catch (_e) {
        val = null;
      }
      if (val !== null && val !== undefined) {
        estado[chave] = val;
        carregado[id] = true;
      } else {
        if (!(chave in estado)) estado[chave] = [];
        carregado[id] = false;
      }
    }

    // Balde 'rh' (colaboradores dentro de fabricas).
    let rh = null;
    try {
      rh = await lerBalde("rh");
    } catch (_e) {
      rh = null;
    }
    if (rh !== null && rh !== undefined) {
      estado.fabricas = injetarRH(estado.fabricas, rh);
      carregado.rh = true;
    } else {
      estado.fabricas = fabricasSemRH(estado.fabricas);
      carregado.rh = false;
    }

    return { value: JSON.stringify(estado) };
  },

  async set(_key, value) {
    const estado = JSON.parse(value);
    const principal = { ...estado };

    // Baldes de chave simples (financeiro): grava só se carregado; senão deixa
    // a chave no principal (comportamento antigo) para não perder dado.
    for (const [chave, id] of Object.entries(BALDES)) {
      if (carregado[id]) {
        delete principal[chave];
        const dados = estado[chave] ?? [];
        const { error } = await supabase
          .from("app_estado")
          .update({ dados })
          .eq("id", id);
        if (error) throw error;
      }
    }

    // Balde 'rh': só vira fonte da verdade se foi carregado. Aí as listas de
    // colaboradores saem do principal e vão para o balde. Se NÃO foi carregado
    // (pré-migração, ou sem acesso), deixamos fabricas como estão para não
    // perder dado — comportamento antigo.
    if (Array.isArray(estado.fabricas) && carregado.rh) {
      principal.fabricas = fabricasParaPrincipal(estado.fabricas);
      const rh = {};
      for (const f of estado.fabricas) {
        rh[f.id] = {
          colaboradores: f.colaboradores || [],
          montagem: (f.montagem && f.montagem.colaboradores) || [],
        };
      }
      const { error } = await supabase
        .from("app_estado")
        .update({ dados: rh })
        .eq("id", "rh");
      if (error) throw error;
    }

    const { error } = await supabase
      .from("app_estado")
      .update({ dados: principal })
      .eq("id", "principal");
    if (error) throw error;
  },
};
