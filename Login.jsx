import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    if (error) setErro("E-mail ou senha inválidos.");
    setCarregando(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F5EFE2" }}
    >
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-2xl p-8 shadow-sm"
        style={{ background: "#FFFFFF" }}
      >
        <h1 className="text-xl font-semibold" style={{ color: "#1A1815" }}>
          Sistema Galuno
        </h1>
        <p className="text-sm mb-6" style={{ color: "#948B7C" }}>
          Precificação e controle de vendas
        </p>

        <label className="block text-sm mb-1" style={{ color: "#6E675C" }}>
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded-lg border outline-none"
          style={{ borderColor: "#E4DCCB" }}
        />

        <label className="block text-sm mb-1" style={{ color: "#6E675C" }}>
          Senha
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded-lg border outline-none"
          style={{ borderColor: "#E4DCCB" }}
        />

        {erro && (
          <p className="text-sm mb-4" style={{ color: "#B4462F" }}>
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-2 rounded-lg font-medium disabled:opacity-60"
          style={{ background: "#1A1815", color: "#F5EFE2" }}
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>

        <p className="text-xs mt-6" style={{ color: "#B5A98F" }}>
          Acesso restrito à equipe. Se não tem login, peça ao administrador.
        </p>
      </form>
    </div>
  );
}
