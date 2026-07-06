import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import { supabaseStorage } from "./storage";
import App from "./App.jsx";
import Login from "./Login.jsx";

// O App usa window.storage.get/set — aqui ligamos isso ao Supabase (nuvem).
window.storage = supabaseStorage;

function BotaoSair({ email }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#FFFFFF",
        border: "1px solid #E4DCCB",
        borderRadius: 999,
        padding: "6px 10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        fontSize: 12,
        color: "#6E675C",
      }}
    >
      <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {email}
      </span>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{ color: "#B4462F", fontWeight: 500 }}
      >
        Sair
      </button>
    </div>
  );
}

function Raiz() {
  const [sessao, setSessao] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) =>
      setSessao(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (sessao === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F5EFE2", color: "#6E675C" }}
      >
        Carregando…
      </div>
    );
  }

  if (!sessao) return <Login />;

  return (
    <>
      <App />
      <BotaoSair email={sessao.user?.email} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Raiz />
  </StrictMode>
);
