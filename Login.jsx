import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { LOGO_GALUNO } from "./logo";

// Chave pública (site key) do hCaptcha — defina VITE_HCAPTCHA_SITEKEY no Vercel.
// Vazia = captcha desligado (login funciona normal). A chave SECRETA vai no Supabase.
const HCAPTCHA_SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY || "";

// Paleta ESCURA (tema invertido)
const BG = "#0E0F11";          // fundo da página (quase preto)
const CARD = "#1B1E22";        // cartão escuro
const BORDA_CARD = "#2A2E33";
const CREME = "#F5EFE2";       // texto claro / marca
const OURO = "#F0C05A";        // botão principal (acento do sistema)
const LINK = "#60A5FA";        // links (azul claro, legível no escuro)
const BORDA = "#3A3F45";       // borda dos campos
const CAMPO_BG = "#14161A";    // fundo dos campos
const ROTULO = "#B9B2A5";      // rótulos
const SUB = "#9CA3AF";
const ERRO = "#F87171";

const IconeOlho = ({ aberto }) => (
  aberto ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 11s3.5 7 10 7a9.1 9.1 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
);

export default function Login() {
  const [modo, setModo] = useState("entrar"); // "entrar" | "criar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Carrega e renderiza o widget do hCaptcha (só se a site key estiver definida).
  useEffect(() => {
    if (!HCAPTCHA_SITEKEY) return;
    function render() {
      if (window.hcaptcha && captchaRef.current && widgetIdRef.current == null) {
        widgetIdRef.current = window.hcaptcha.render(captchaRef.current, {
          sitekey: HCAPTCHA_SITEKEY,
          callback: (t) => setCaptchaToken(t),
          "expired-callback": () => setCaptchaToken(""),
          "error-callback": () => setCaptchaToken(""),
        });
      }
    }
    if (window.hcaptcha) { render(); return; }
    if (!document.getElementById("hcaptcha-api")) {
      window.__hcaptchaOnLoad = render;
      const s = document.createElement("script");
      s.id = "hcaptcha-api";
      s.src = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=__hcaptchaOnLoad";
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    } else {
      const iv = setInterval(() => { if (window.hcaptcha) { clearInterval(iv); render(); } }, 200);
      return () => clearInterval(iv);
    }
  }, []);

  function resetCaptcha() {
    setCaptchaToken("");
    if (HCAPTCHA_SITEKEY && window.hcaptcha && widgetIdRef.current != null) {
      try { window.hcaptcha.reset(widgetIdRef.current); } catch (_e) { /* ignore */ }
    }
  }
  function faltaCaptcha() {
    if (HCAPTCHA_SITEKEY && !captchaToken) { setErro("Confirme que você não é um robô (captcha)."); return true; }
    return false;
  }
  const opcoesCaptcha = () => (HCAPTCHA_SITEKEY && captchaToken ? { captchaToken } : {});

  function limpaMsgs() { setErro(""); setInfo(""); }
  function trocarModo(m) { setModo(m); limpaMsgs(); }

  async function entrar(e) {
    e.preventDefault();
    limpaMsgs();
    if (faltaCaptcha()) return;
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha, options: opcoesCaptcha() });
    if (error) setErro("E-mail ou senha inválidos.");
    setCarregando(false);
    resetCaptcha();
  }

  async function criarConta(e) {
    e.preventDefault();
    limpaMsgs();
    if (!nome.trim()) return setErro("Preencha seu nome completo.");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (faltaCaptcha()) return;
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { nome: nome.trim(), cargo: cargo.trim() },
        emailRedirectTo: window.location.origin,
        ...opcoesCaptcha(),
      },
    });
    setCarregando(false);
    resetCaptcha();
    if (error) {
      const m = String(error.message || "").toLowerCase();
      if (m.includes("already") || m.includes("registered")) setErro("Este e-mail já tem conta. Use “Entrar”.");
      else setErro("Não consegui criar a conta: " + error.message);
      return;
    }
    if (!data.session) {
      setInfo(`Conta criada! Enviamos um e-mail de confirmação para ${email.trim()}. Confirme o cadastro e, em seguida, peça ao administrador para liberar seu acesso.`);
      setModo("entrar");
      setSenha("");
    }
  }

  async function esqueci() {
    limpaMsgs();
    if (!email.trim()) return setErro("Digite seu e-mail acima primeiro, depois clique em “Esqueci minha senha”.");
    if (faltaCaptcha()) return;
    setCarregando(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin, ...opcoesCaptcha() });
    setCarregando(false);
    resetCaptcha();
    setInfo("Se este e-mail estiver cadastrado, enviamos um link para você redefinir a senha.");
  }

  const inputStyle = { borderColor: BORDA, background: CAMPO_BG, color: CREME };
  const inputCls = "w-full px-3 py-2 rounded-lg border outline-none focus:ring-2";
  const Rotulo = ({ children }) => (
    <label className="block text-sm mb-1 font-medium" style={{ color: ROTULO }}>{children}</label>
  );

  const CampoSenha = (
    <div>
      <Rotulo>Senha</Rotulo>
      <div className="relative">
        <input
          type={verSenha ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          placeholder="••••••••"
          className={inputCls + " pr-11"}
          style={inputStyle}
        />
        <button type="button" onClick={() => setVerSenha((v) => !v)}
          aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
          title={verSenha ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
          style={{ color: "#9CA3AF" }}>
          <IconeOlho aberto={verSenha} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG, fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif" }}>
      <div className="w-full max-w-sm rounded-2xl p-8 shadow-2xl border" style={{ background: CARD, borderColor: BORDA_CARD }}>
        {/* Marca */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src={LOGO_GALUNO} alt="Galuno Artesanato" style={{ height: 40, width: "auto" }} />
          <span className="text-xl font-extrabold uppercase tracking-wider" style={{ color: CREME, letterSpacing: "0.06em" }}>Galuno Artesanato</span>
        </div>
        <p className="text-sm text-center mb-6" style={{ color: SUB }}>Sistema interno do escritório</p>

        {/* Abas Entrar / Criar conta */}
        <div className="flex p-1 rounded-lg mb-6" style={{ background: "#14161A" }}>
          {[["entrar", "Entrar"], ["criar", "Criar conta"]].map(([k, rot]) => (
            <button key={k} type="button" onClick={() => trocarModo(k)}
              className="flex-1 py-2 rounded-md text-sm font-semibold transition-colors"
              style={modo === k ? { background: "#33383E", color: CREME, boxShadow: "0 1px 2px rgba(0,0,0,0.35)" } : { background: "transparent", color: SUB }}>
              {rot}
            </button>
          ))}
        </div>

        {info && <p className="text-sm mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.12)", color: "#86EFAC" }}>{info}</p>}
        {erro && <p className="text-sm mb-4" style={{ color: ERRO }}>{erro}</p>}

        {HCAPTCHA_SITEKEY && <div ref={captchaRef} className="flex justify-center mb-4" />}

        {modo === "entrar" ? (
          <form onSubmit={entrar}>
            <div className="mb-4">
              <Rotulo>E-mail</Rotulo>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@empresa.com" className={inputCls} style={inputStyle} />
            </div>
            <div className="mb-5">{CampoSenha}</div>
            <button type="submit" disabled={carregando} className="w-full py-2.5 rounded-lg font-bold disabled:opacity-60" style={{ background: OURO, color: "#1A1815" }}>
              {carregando ? "Entrando…" : "Entrar"}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={esqueci} className="text-sm font-medium" style={{ color: LINK }}>Esqueci minha senha</button>
            </div>
          </form>
        ) : (
          <form onSubmit={criarConta}>
            <div className="mb-4">
              <Rotulo>Nome completo</Rotulo>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Gabriel Noris" className={inputCls} style={inputStyle} />
            </div>
            <div className="mb-4">
              <Rotulo>Cargo / função</Rotulo>
              <input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Sócio-diretor" className={inputCls} style={inputStyle} />
            </div>
            <div className="mb-4">
              <Rotulo>E-mail</Rotulo>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@empresa.com" className={inputCls} style={inputStyle} />
            </div>
            <div className="mb-5">{CampoSenha}</div>
            <button type="submit" disabled={carregando} className="w-full py-2.5 rounded-lg font-bold disabled:opacity-60" style={{ background: OURO, color: "#1A1815" }}>
              {carregando ? "Criando…" : "Criar conta"}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => trocarModo("entrar")} className="text-sm font-medium" style={{ color: LINK }}>← Voltar para o login</button>
            </div>
          </form>
        )}

        <p className="text-xs mt-6 text-center" style={{ color: "#8A8172" }}>
          Acesso restrito à equipe. Novas contas entram sem permissão até o administrador liberar o acesso.
        </p>
      </div>
    </div>
  );
}
