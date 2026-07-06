import { supabase } from "./supabaseClient";

// Adaptador que substitui o "window.storage" antigo (que salvava no navegador)
// por salvamento na "caixa única" do Supabase (tabela app_estado, linha 'principal').
// Mantém a MESMA interface get/set que o App já usa, então o App não muda.
export const supabaseStorage = {
  async get() {
    const { data, error } = await supabase
      .from("app_estado")
      .select("dados")
      .eq("id", "principal")
      .single();
    if (error) throw error;
    const d = data?.dados;
    // Caixa vazia (primeiro uso): lança erro para o App carregar os dados iniciais (SEED)
    if (!d || (typeof d === "object" && Object.keys(d).length === 0)) {
      throw new Error("caixa vazia");
    }
    return { value: JSON.stringify(d) };
  },

  async set(_key, value) {
    const dados = JSON.parse(value);
    const { error } = await supabase
      .from("app_estado")
      .update({ dados })
      .eq("id", "principal");
    if (error) throw error;
  },
};
