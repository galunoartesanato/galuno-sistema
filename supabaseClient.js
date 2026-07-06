import { createClient } from "@supabase/supabase-js";

// Estes dois valores são PÚBLICOS e seguros de ficar no código:
// - a URL do projeto
// - a chave "publicável" (feita para rodar no navegador; a segurança de
//   verdade está nas regras RLS do banco, que exigem login)
//
// Se um dia quiser trocá-los sem mexer no código, defina as variáveis de
// ambiente VITE_SUPABASE_URL e VITE_SUPABASE_KEY no Vercel.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://ykfxkqbuwttguhngfemf.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  "sb_publishable_dfrn0uK3TAAN20tCCqXu4Q_q6Fogj2D";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
