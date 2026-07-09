import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import { supabaseStorage } from "./storage";
import { LOGO_GALUNO } from "./logo";
import App from "./App.jsx";
import Login from "./Login.jsx";

// O App usa window.storage.get/set — aqui ligamos isso ao Supabase (nuvem).
window.storage = supabaseStorage;

// Paleta ESCURA (mesma do Login.jsx) para as telas de senha/confirmação.
const BG = "#0E0F11";
const CARD = "#1B1E22";
const BORDA_CARD = "#2A2E33";
const CREME = "#F5EFE2";
const OURO = "#F0C05A";
const BORDA = "#3A3F45";
const CAMPO_BG = "#14161A";
const ROTULO = "#B9B2A5";
const SUB = "#9CA3AF";
const ERRO = "#F87171";
const OK_BG = "rgba(34,197,94,0.12)";
const OK_FG = "#86EFAC";

// Lê o "type" do link de e-mail (recovery = redefinir senha, signup = confirmação)
// direto do hash da URL, antes de o Supabase limpar o endereço.
const tipoDoLink = (() => {
  try {
    const h = window.location.hash || "";
    const m = h.match(/[#&]type=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  } catch (_e) {
    return "";
  }
})();

const wrapCls = "min-h-screen flex items-center justify-center px-4";
const wrapStyle = {
  background: BG,
  fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif",
};
const cardCls = "w-full max-w-sm rounded-2xl p-8 shadow-2xl border";
const cardStyle = { background: CARD, borderColor: BORDA_CARD };
const inputCls = "w-full px-3 py-2 rounded-lg border outline-none focus:ring-2";
const inputStyle = { borderColor: BORDA, background: CAMPO_BG, color: CREME };

function Marca() {
  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-1">
        <img src={LOGO_GALUNO} alt="Galuno Artesanato" style={{ height: 40, width: "auto" }} />
        <span
          className="text-xl font-extrabold uppercase tracking-wider"
          style={{ color: CREME, letterSpacing: "0.06em" }}
        >
          Galuno Artesanato
        </span>
      </div>
      <p className="text-sm text-center mb-6" style={{ color: SUB }}>
        Sistema interno do escritório
      </p>
    </>
  );
}

const IconeOlho = ({ aberto }) =>
  aberto ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 11s3.5 7 10 7a9.1 9.1 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );

// Tela: definir nova senha (destino do link "Esqueci minha senha").
function NovaSenha({ onPronto }) {
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== senha2) return setErro("As senhas não coincidem.");
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) {
      setErro("Não consegui atualizar a senha: " + error.message);
      return;
    }
    setOk(true);
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch (_e) {
      /* ignore */
    }
    setTimeout(() => onPronto(), 1800);
  }

  return (
    <div className={wrapCls} style={wrapStyle}>
      <div className={cardCls} style={cardStyle}>
        <Marca />
        <h1 className="text-lg font-bold text-center mb-1" style={{ color: CREME }}>
          Definir nova senha
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: SUB }}>
          Escolha uma nova senha para a sua conta.
        </p>

        {ok ? (
          <p className="text-sm px-3 py-3 rounded-lg text-center" style={{ background: OK_BG, color: OK_FG }}>
            Senha atualizada com sucesso! Entrando…
          </p>
        ) : (
          <form onSubmit={salvar}>
            {erro && (
              <p className="text-sm mb-4" style={{ color: ERRO }}>
                {erro}
              </p>
            )}
            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium" style={{ color: ROTULO }}>
                Nova senha
              </label>
              <div className="relative">
                <input
                  type={ver ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputCls + " pr-11"}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setVer((v) => !v)}
                  aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
                  title={ver ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "#9CA3AF" }}
                >
                  <IconeOlho aberto={ver} />
                </button>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm mb-1 font-medium" style={{ color: ROTULO }}>
                Repetir a nova senha
              </label>
              <input
                type={ver ? "text" : "password"}
                value={senha2}
                onChange={(e) => setSenha2(e.target.value)}
                required
                placeholder="••••••••"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 rounded-lg font-bold disabled:opacity-60"
              style={{ background: OURO, color: "#1A1815" }}
            >
              {carregando ? "Salvando…" : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Tela: e-mail confirmado (destino do link de confirmação de cadastro).
function EmailConfirmado({ temSessao, onContinuar }) {
  return (
    <div className={wrapCls} style={wrapStyle}>
      <div className={cardCls + " text-center"} style={cardStyle}>
        <Marca />
        <div className="flex justify-center mb-3">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: OK_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={OK_FG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
        <h1 className="text-lg font-bold mb-1" style={{ color: CREME }}>
          E-mail confirmado!
        </h1>
        <p className="text-sm mb-6" style={{ color: SUB }}>
          Seu e-mail foi confirmado com sucesso. Novas contas entram sem permissão até o administrador liberar o acesso.
        </p>
        <button
          onClick={onContinuar}
          className="w-full py-2.5 rounded-lg font-bold"
          style={{ background: OURO, color: "#1A1815" }}
        >
          {temSessao ? "Entrar no sistema" : "Ir para o login"}
        </button>
      </div>
    </div>
  );
}

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
  // "recovery" (redefinir senha) | "signup" (confirmação de e-mail) | ""
  const [modoLink, setModoLink] = useState(tipoDoLink);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      setSessao(s);
      // Reforço: o Supabase emite este evento ao abrir o link de recuperação.
      if (evento === "PASSWORD_RECOVERY") setModoLink("recovery");
    });
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

  // Fluxos vindos de link de e-mail (têm prioridade sobre login/app).
  if (modoLink === "recovery") {
    return <NovaSenha onPronto={() => setModoLink("")} />;
  }
  if (modoLink === "signup") {
    return (
      <EmailConfirmado
        temSessao={!!sessao}
        onContinuar={() => {
          try {
            window.history.replaceState(null, "", window.location.pathname);
          } catch (_e) {
            /* ignore */
          }
          setModoLink("");
        }}
      />
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
