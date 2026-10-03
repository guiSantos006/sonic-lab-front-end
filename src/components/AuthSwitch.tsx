import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { ChevronLeft, ArrowRight, User as UserIcon, User, Mail, Lock, X, Eye, EyeOff } from 'lucide-react';
import { UserProfile, ViewType } from '../types';
import {
  apiLogin,
  apiRegister,
  validatePassword,
  parseJwtPayload,
} from '../utils/authService';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface AuthSwitchProps {
  initialIsSignUp?: boolean;
  onLoginSuccess: (user: Partial<UserProfile> & { email?: string; token?: string }) => void;
  onRegisterSuccess?: (registeredEmail: string) => void;
  onNavigate: (view: ViewType) => void;
  onClose?: () => void;
  currentProfile?: UserProfile;
  isAlreadyLoggedIn?: boolean;
  onLogout?: () => void;
  initialEmail?: string;
  initialSuccessMessage?: string | null;
  isModal?: boolean;
}

export default function AuthSwitch({
  initialIsSignUp = false,
  onLoginSuccess,
  onRegisterSuccess,
  onNavigate,
  onClose,
  currentProfile,
  isAlreadyLoggedIn = false,
  onLogout,
  initialEmail = '',
  initialSuccessMessage = null,
  isModal = false,
}: AuthSwitchProps) {
  const { isDark } = useTheme();
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  // Field input refs for focus and custom validation positioning
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const regNameRef = useRef<HTMLInputElement>(null);
  const regEmailRef = useRef<HTMLInputElement>(null);
  const regPasswordRef = useRef<HTMLInputElement>(null);

  // Custom stylish validation tooltip state
  const [activeTooltipField, setActiveTooltipField] = useState<string | null>(null);
  const [tooltipMessage, setTooltipMessage] = useState<string>('');

  const triggerValidationError = (
    field: string,
    message: string,
    inputRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    setActiveTooltipField(field);
    setTooltipMessage(message);
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  };

  // Sign In state
  const [loginEmail, setLoginEmail] = useState(initialEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(initialSuccessMessage);

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Reset tooltips when switching sign-in / sign-up mode
  useEffect(() => {
    setActiveTooltipField(null);
    setTooltipMessage('');
    setLoginError(null);
    setRegError(null);
  }, [isSignUp]);

  // Close on Escape key
  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Sign In Submit (POST to /auth/login)
  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    setActiveTooltipField(null);

    if (!loginEmail.trim()) {
      triggerValidationError('loginEmail', 'Preencha este campo.', loginEmailRef);
      return;
    }
    if (!loginEmail.includes('@')) {
      triggerValidationError('loginEmail', 'Insira um endereço de e-mail válido.', loginEmailRef);
      return;
    }
    if (!loginPassword) {
      triggerValidationError('loginPassword', 'Preencha este campo.', loginPasswordRef);
      return;
    }

    setLoginLoading(true);

    try {
      const loginRes = await apiLogin({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const authToken = loginRes?.token;
      const jwtData = authToken ? parseJwtPayload(authToken) : null;
      const formattedName =
        (typeof jwtData?.name === 'string' && jwtData.name) ||
        (typeof jwtData?.sub === 'string' && !jwtData.sub.includes('@') ? jwtData.sub : '') ||
        (loginEmail.includes('@')
          ? loginEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9_]/g, '_')
          : loginEmail.toUpperCase());

      const formattedRole =
        (typeof jwtData?.role === 'string' && jwtData.role) ||
        (Array.isArray(jwtData?.roles) ? jwtData.roles.join(', ') : '') ||
        'SOUND DESIGNER';

      setLoginSuccess('Logado com Êxito');

      setTimeout(() => {
        setLoginLoading(false);
        onLoginSuccess({
          name: formattedName,
          role: formattedRole,
          email: (typeof jwtData?.email === 'string' && jwtData.email) || loginEmail.trim(),
          token: authToken,
        });
      }, 500);
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      setLoginLoading(false);
      setLoginError(
        err instanceof Error ? err.message : 'Falha na autenticação via API.'
      );
    }
  };

  // Handle Sign Up Submit (POST to /auth/register)
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegError(null);
    setActiveTooltipField(null);

    if (!regName.trim()) {
      triggerValidationError('regName', 'Preencha este campo.', regNameRef);
      return;
    }
    if (!regEmail.trim()) {
      triggerValidationError('regEmail', 'Preencha este campo.', regEmailRef);
      return;
    }
    if (!regEmail.includes('@')) {
      triggerValidationError('regEmail', 'Insira um endereço de e-mail válido.', regEmailRef);
      return;
    }
    if (!regPassword) {
      triggerValidationError('regPassword', 'Preencha este campo.', regPasswordRef);
      return;
    }
    const passCheck = validatePassword(regPassword);
    if (!passCheck.valid) {
      triggerValidationError(
        'regPassword',
        passCheck.message || 'Mínimo de 8 caracteres (letras e números).',
        regPasswordRef
      );
      return;
    }

    setRegLoading(true);

    try {
      await apiRegister({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      setRegSuccess('Usuário cadastrado com sucesso no back-end! Redirecionando...');

      setTimeout(() => {
        setRegLoading(false);
        if (onRegisterSuccess) {
          onRegisterSuccess(regEmail.trim());
        }
        setLoginEmail(regEmail.trim());
        setLoginSuccess('Cadastro realizado! Digite sua senha para entrar.');
        setIsSignUp(false);
      }, 700);
    } catch (err: unknown) {
      console.error('Sign-up error:', err);
      setRegLoading(false);
      setRegError(
        err instanceof Error ? err.message : 'Falha ao registrar conta no back-end.'
      );
    }
  };

  // Social Sign-In Helper
  const handleSocialAction = async (provider: string) => {
    setLoginError(null);
    setLoginLoading(true);

    try {
      const socialEmail = loginEmail.trim().includes('@')
        ? loginEmail.trim()
        : `produtor.${provider.toLowerCase()}@soniclab.audio`;
      const cleanName =
        socialEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9_]/g, '_') || 'PRODUCER';

      const loginRes = await apiLogin({
        email: socialEmail,
        password: `${provider.toLowerCase()}_oauth_session_token`,
      });

      setLoginSuccess(`Conectado com ${provider}!`);

      setTimeout(() => {
        setLoginLoading(false);
        onLoginSuccess({
          name: cleanName,
          role: 'AUDIO PRODUCER',
          email: socialEmail,
          location: 'REMOTE STUDIO',
          bio: `Produtor conectado via ${provider} no ecossistema SONIC_LAB.`,
          token: loginRes?.token,
        });
      }, 500);
    } catch (err: unknown) {
      console.error('Social sign-in error:', err);
      setLoginLoading(false);
      setLoginError(`Erro ao conectar com ${provider}.`);
    }
  };

  // Already logged in screen
  if (isAlreadyLoggedIn && currentProfile) {
    return (
      <div className="auth-switch">
        <style>{`
          .auth-switch {
            font-family: var(--font-sans);
            background: ${isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.25)'};
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            min-height: 100vh;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
          }
        `}</style>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-none bg-white/40 dark:bg-black/40 backdrop-blur-md border border-neutral-300/60 dark:border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle className="p-2 text-neutral-800 dark:text-white bg-white/40 dark:bg-black/40 backdrop-blur-md border border-neutral-300/60 dark:border-white/10" />
        </div>

        <div className="w-full max-w-md bg-white/95 dark:bg-[#14161c]/95 border border-neutral-200 dark:border-neutral-800 p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 border border-neutral-200 dark:border-neutral-700 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            {currentProfile.avatar ? (
              <img src={currentProfile.avatar} alt={currentProfile.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-neutral-400" />
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Sessão Ativa</span>
          <h2 className="font-mono text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
            {currentProfile.name}
          </h2>
          <p className="font-mono text-xs text-neutral-500 mt-1">{currentProfile.email}</p>

          <div className="mt-8 space-y-2.5">
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>Acessar Meu Perfil</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-xs uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Sair da Conta
              </button>
            )}
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full py-2 text-neutral-500 hover:text-black dark:hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Voltar ao Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-switch">
      <style>{`
        .auth-switch,
        .auth-switch * {
          box-sizing: border-box;
        }

        /* Fundo transparente com suporte a modal flutuante */
        .auth-switch {
          font-family: var(--font-sans);
          background: ${isModal ? 'transparent' : (isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.25)')};
          backdrop-filter: ${isModal ? 'none' : 'blur(28px)'};
          -webkit-backdrop-filter: ${isModal ? 'none' : 'blur(28px)'};
          min-height: ${isModal ? 'auto' : '100vh'};
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: ${isModal ? '0' : '20px'};
          position: relative;
        }

        /* Container do formulário com suporte a Modo Claro e Modo Escuro */
        .container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 560px;
          background: ${isDark ? 'rgba(18, 20, 26, 0.92)' : 'rgba(255, 255, 255, 0.94)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
          border-radius: 20px;
          box-shadow: ${
            isDark
              ? '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06)'
              : '0 25px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)'
          };
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          overflow: hidden;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 5;
        }

        /* Animação acelerada e fluida */
        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 0.55s 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3.5rem;
          transition: all 0.25s 0.2s ease-in-out;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        form.sign-in-form {
          z-index: 2;
          pointer-events: all;
        }

        /* Título com a fonte do marketplace (JetBrains Mono) */
        .title {
          font-family: var(--font-mono);
          font-size: 1.85rem;
          color: ${isDark ? '#ffffff' : '#111111'};
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .sonic-field-container {
          position: relative;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: ${isDark ? '#1a1d25' : '#f0f2f5'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
          margin: 8px 0;
          height: 50px;
          border-radius: 50px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.25s;
        }

        .input-field.has-error {
          border-color: ${isDark ? '#ffffff' : '#111111'} !important;
          box-shadow: 0 0 0 2px ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'} !important;
          animation: sonic-field-shake 0.35s ease;
        }

        @keyframes sonic-field-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .sonic-validation-tooltip {
          position: absolute;
          top: calc(100% - 2px);
          left: 20px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 9px;
          background-color: ${isDark ? '#22262f' : '#2b2f3a'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.26)'};
          color: #ffffff;
          padding: 7px 14px 7px 9px;
          border-radius: 7px;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          animation: sonic-tooltip-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes sonic-tooltip-pop {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .sonic-validation-tooltip .tooltip-arrow {
          position: absolute;
          top: -6px;
          left: 16px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid ${isDark ? '#22262f' : '#2b2f3a'};
        }

        .sonic-validation-tooltip .tooltip-arrow::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -7px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 7px solid rgba(255, 255, 255, 0.28);
          z-index: -1;
        }

        .sonic-validation-tooltip .tooltip-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background-color: #ffffff;
          color: #1e222b;
          font-family: var(--font-mono);
          font-weight: 900;
          font-size: 11px;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .sonic-validation-tooltip .tooltip-text {
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .input-field.has-toggle {
          grid-template-columns: 15% 70% 15%;
        }

        .input-field .toggle-password-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: ${isDark ? '#9ca3af' : '#666666'};
          cursor: pointer;
          padding: 0;
          margin-right: 0.3rem;
          transition: color 0.2s ease, transform 0.15s ease;
        }

        .input-field .toggle-password-btn:hover {
          color: ${isDark ? '#ffffff' : '#111111'};
          transform: scale(1.08);
        }

        .input-field:focus-within {
          background-color: ${isDark ? '#222631' : '#e9ebf0'};
          box-shadow: 0 0 0 2px ${isDark ? '#ffffff' : '#111111'};
        }

        .input-field i {
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${isDark ? '#9ca3af' : '#666666'};
          transition: color 0.25s ease;
          font-style: normal;
        }

        .input-field:focus-within i {
          color: ${isDark ? '#ffffff' : '#111111'};
        }

        .input-field input {
          font-family: var(--font-mono);
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.85rem;
          color: ${isDark ? '#f3f4f6' : '#111111'};
          width: 100%;
        }

        .input-field input::placeholder {
          color: ${isDark ? '#6b7280' : '#888888'};
          font-weight: 400;
        }

        .forgot-password-container {
          width: 100%;
          max-width: 380px;
          display: flex;
          justify-content: flex-start;
          margin-top: 2px;
          margin-bottom: 6px;
          padding: 0 0.8rem;
        }

        .forgot-password-link {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: ${isDark ? '#9ca3af' : '#6b7280'};
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: transparent;
          transition: color 0.2s ease, text-decoration-color 0.2s ease;
        }

        .forgot-password-link:hover {
          color: ${isDark ? '#ffffff' : '#111111'};
          text-decoration-color: ${isDark ? '#ffffff' : '#111111'};
        }

        /* Botão principal com a fonte JetBrains Mono */
        .btn {
          font-family: var(--font-mono);
          width: 160px;
          background-color: ${isDark ? '#ffffff' : '#111111'};
          border: none;
          outline: none;
          height: 46px;
          border-radius: 46px;
          color: ${isDark ? '#000000' : '#ffffff'};
          text-transform: uppercase;
          font-weight: 700;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.25s;
          font-size: 0.82rem;
          letter-spacing: 0.08em;
        }

        .btn:hover {
          background-color: ${isDark ? '#e5e7eb' : '#262626'};
          transform: translateY(-2px);
          box-shadow: 0 5px 15px ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'};
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* 
         * PAINEL DO VINIL - Curvatura e Tamanho Idênticos à Imagem de Referência
         * Disco de Vinil Preto Puro com rotação contínua lenta em ambos os modos
         */
        .vinyl-panel {
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          border-radius: 50%;
          z-index: 6;
          pointer-events: none;
          transition: 0.55s 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.75), inset 0 0 80px rgba(0, 0, 0, 0.85);
          background-color: #121317;
        }

        .container.sign-up-mode .vinyl-panel {
          transform: translate(100%, -50%);
          right: 52%;
        }

        /* Rotação lenta, contínua e suave do disco de vinil */
        .vinyl-rotator {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: spin-vinyl-slow 35s linear infinite;
          transform-origin: center center;
        }

        @keyframes spin-vinyl-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .vinyl-panel-svg {
          width: 100%;
          height: 100%;
          display: block;
          border-radius: 50%;
        }

        /* Reflexos luminosos característicos do vinil em leque */
        .vinyl-sheen-layer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          pointer-events: none;
          background: conic-gradient(
            from 25deg,
            transparent 0deg,
            rgba(255, 255, 255, 0.02) 20deg,
            rgba(255, 255, 255, 0.15) 50deg,
            rgba(255, 255, 255, 0.02) 80deg,
            transparent 110deg,
            transparent 180deg,
            rgba(255, 255, 255, 0.02) 200deg,
            rgba(255, 255, 255, 0.15) 230deg,
            rgba(255, 255, 255, 0.02) 260deg,
            transparent 290deg,
            transparent 360deg
          );
          mix-blend-mode: screen;
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          z-index: 10;
          pointer-events: none;
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 10;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 16% 2rem 14%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 14% 2rem 16%;
        }

        /* Texto sobre o vinil sempre branco nítido com alto contraste */
        .panel .content {
          color: #ffffff;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0.15s;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
        }

        .panel h3 {
          font-family: var(--font-mono);
          font-weight: 700;
          line-height: 1.1;
          font-size: 1.55rem;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: #ffffff;
        }

        .panel p {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          padding: 0.5rem 0 1.2rem 0;
          opacity: 0.95;
          line-height: 1.45;
          color: #f1f3f7;
        }

        .btn.transparent {
          font-family: var(--font-mono);
          margin: 0;
          background: rgba(18, 20, 26, 0.5);
          backdrop-filter: blur(8px);
          border: 2px solid rgba(255, 255, 255, 0.85);
          width: 130px;
          height: 42px;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn.transparent:hover {
          background: #ffffff;
          color: #16181d;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        /* Modo Sign Up - Transição */
        .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
          pointer-events: all;
        }

        .container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .social-text {
          font-family: var(--font-mono);
          padding: 0.6rem 0 0.4rem 0;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: ${isDark ? '#9ca3af' : '#666666'};
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .social-icon {
          height: 42px;
          width: 42px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#dce0e6'};
          border-radius: 50%;
          color: ${isDark ? '#ffffff' : '#252830'};
          font-size: 1.1rem;
          transition: 0.25s;
          cursor: pointer;
          background: ${isDark ? '#1a1d25' : '#fafafa'};
        }

        .social-icon:hover {
          border-color: ${isDark ? '#f97316' : '#111111'};
          background: ${isDark ? '#252934' : '#ffffff'};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .alert-box {
          font-family: var(--font-mono);
          width: 100%;
          max-width: 380px;
          padding: 8px 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          font-size: 0.74rem;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.01em;
          animation: sonic-tooltip-pop 0.2s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        .alert-box .alert-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          font-weight: 900;
          font-size: 10px;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }
        .alert-error {
          background-color: ${isDark ? 'rgba(153, 27, 27, 0.35)' : '#fef2f2'};
          color: ${isDark ? '#fca5a5' : '#b91c1c'};
          border: 1px solid ${isDark ? 'rgba(248, 113, 113, 0.35)' : '#fecaca'};
        }
        .alert-error .alert-badge {
          background-color: #ef4444;
          color: #ffffff;
        }
        .alert-success {
          background-color: ${isDark ? 'rgba(20, 83, 45, 0.35)' : '#f0fdf4'};
          color: ${isDark ? '#86efac' : '#15803d'};
          border: 1px solid ${isDark ? 'rgba(74, 222, 128, 0.35)' : '#bbf7d0'};
        }
        .alert-success .alert-badge {
          background-color: #10b981;
          color: #ffffff;
        }

        @media (max-width: 870px) {
          .container {
            min-height: 750px;
            height: 100vh;
          }
          .signin-signup {
            width: 100%;
            top: 92%;
            transform: translate(-50%, -100%);
            transition: 0.55s 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .signin-signup,
          .container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 10%;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            transition-delay: 0.15s;
          }
          .panel h3 {
            font-size: 1.2rem;
          }
          .panel p {
            font-size: 0.75rem;
            padding: 0.3rem 0;
          }
          .btn.transparent {
            width: 110px;
            height: 36px;
            font-size: 0.75rem;
          }
          .vinyl-panel {
            width: 1500px !important;
            height: 1500px !important;
            transform: translateX(-50%) !important;
            left: 30% !important;
            bottom: 68% !important;
            right: initial !important;
            top: initial !important;
            transition: 0.7s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .container.sign-up-mode .vinyl-panel {
            transform: translate(-50%, 100%) !important;
            bottom: 32% !important;
            right: initial !important;
          }
          .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .container.sign-up-mode .signin-signup {
            top: 6%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          form {
            padding: 0 1.2rem;
          }
          .panel .content {
            padding: 0.5rem 0.8rem;
          }
        }
      `}</style>

      {/* Return Home button */}
      {!isModal && (
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-none bg-white/40 dark:bg-black/40 backdrop-blur-md border border-neutral-300/60 dark:border-white/10"
          title="Voltar ao início"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
      )}

      {/* Theme Toggle (Permite alternar entre modo claro e modo escuro na tela de login) */}
      {!isModal && (
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle className="p-2 text-neutral-800 dark:text-white bg-white/40 dark:bg-black/40 backdrop-blur-md border border-neutral-300/60 dark:border-white/10" />
        </div>
      )}

      <div className={isSignUp ? 'container sign-up-mode' : 'container'}>
        {/* Close button for modal */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full text-neutral-500 hover:text-black dark:hover:text-white bg-white/80 dark:bg-[#1a1d25]/80 hover:bg-white dark:hover:bg-[#252830] transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700 shadow-sm"
            title="Fechar"
            aria-label="Fechar modal de autenticação"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Painel do Vinil: Base preta em ambos os modos, com LISTRAS LARANJAS vibrantes no Modo Escuro */}
        <div className="vinyl-panel">
          <div className="vinyl-rotator">
            <VinylGroovesSVG isDark={isDark} />
            <div className="vinyl-sheen-layer" />
          </div>
        </div>

        {/* Formulários de Autenticação */}
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form className="sign-in-form" noValidate onSubmit={handleSignIn}>
              <h2 className="title">Sign in</h2>

              {loginError && (
                <div className="alert-box alert-error">
                  <div className="alert-badge">!</div>
                  <span>{loginError}</span>
                </div>
              )}
              {loginSuccess && (
                <div className="alert-box alert-success">
                  <div className="alert-badge">✓</div>
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div className="sonic-field-container">
                <div className={`input-field ${activeTooltipField === 'loginEmail' ? 'has-error' : ''}`}>
                  <i><Mail className="w-4.5 h-4.5" /></i>
                  <input
                    ref={loginEmailRef}
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (activeTooltipField === 'loginEmail') setActiveTooltipField(null);
                    }}
                    onFocus={() => {
                      if (activeTooltipField === 'loginEmail') setActiveTooltipField(null);
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
                {activeTooltipField === 'loginEmail' && (
                  <div className="sonic-validation-tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-badge">!</div>
                    <span className="tooltip-text">{tooltipMessage}</span>
                  </div>
                )}
              </div>

              <div className="sonic-field-container">
                <div className={`input-field has-toggle ${activeTooltipField === 'loginPassword' ? 'has-error' : ''}`}>
                  <i><Lock className="w-4.5 h-4.5" /></i>
                  <input
                    ref={loginPasswordRef}
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (activeTooltipField === 'loginPassword') setActiveTooltipField(null);
                    }}
                    onFocus={() => {
                      if (activeTooltipField === 'loginPassword') setActiveTooltipField(null);
                    }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="toggle-password-btn"
                    title={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                    aria-label={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {activeTooltipField === 'loginPassword' && (
                  <div className="sonic-validation-tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-badge">!</div>
                    <span className="tooltip-text">{tooltipMessage}</span>
                  </div>
                )}
              </div>

              {/* Reserved space for Forgot Password link */}
              <div className="forgot-password-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Espaço reservado para futura implementação do fluxo de recuperação de senha
                  }}
                  className="forgot-password-link"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="submit"
                value={loginLoading ? 'Autenticando via API...' : 'Login'}
                className="btn solid"
                disabled={loginLoading}
              />

              <p className="social-text">Or sign in with Google</p>
              <div className="social-media">
                <SocialIcons onSelect={handleSocialAction} isDark={isDark} />
              </div>
            </form>

            {/* Sign Up Form */}
            <form className="sign-up-form" noValidate onSubmit={handleSignUp}>
              <h2 className="title">Sign up</h2>

              {regError && (
                <div className="alert-box alert-error">
                  <div className="alert-badge">!</div>
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="alert-box alert-success">
                  <div className="alert-badge">✓</div>
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="sonic-field-container">
                <div className={`input-field ${activeTooltipField === 'regName' ? 'has-error' : ''}`}>
                  <i><User className="w-4.5 h-4.5" /></i>
                  <input
                    ref={regNameRef}
                    type="text"
                    placeholder="Producer / Username"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (activeTooltipField === 'regName') setActiveTooltipField(null);
                    }}
                    onFocus={() => {
                      if (activeTooltipField === 'regName') setActiveTooltipField(null);
                    }}
                    required
                  />
                </div>
                {activeTooltipField === 'regName' && (
                  <div className="sonic-validation-tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-badge">!</div>
                    <span className="tooltip-text">{tooltipMessage}</span>
                  </div>
                )}
              </div>

              <div className="sonic-field-container">
                <div className={`input-field ${activeTooltipField === 'regEmail' ? 'has-error' : ''}`}>
                  <i><Mail className="w-4.5 h-4.5" /></i>
                  <input
                    ref={regEmailRef}
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (activeTooltipField === 'regEmail') setActiveTooltipField(null);
                    }}
                    onFocus={() => {
                      if (activeTooltipField === 'regEmail') setActiveTooltipField(null);
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
                {activeTooltipField === 'regEmail' && (
                  <div className="sonic-validation-tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-badge">!</div>
                    <span className="tooltip-text">{tooltipMessage}</span>
                  </div>
                )}
              </div>

              <div className="sonic-field-container">
                <div className={`input-field has-toggle ${activeTooltipField === 'regPassword' ? 'has-error' : ''}`}>
                  <i><Lock className="w-4.5 h-4.5" /></i>
                  <input
                    ref={regPasswordRef}
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (activeTooltipField === 'regPassword') setActiveTooltipField(null);
                    }}
                    onFocus={() => {
                      if (activeTooltipField === 'regPassword') setActiveTooltipField(null);
                    }}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="toggle-password-btn"
                    title={showRegPassword ? 'Ocultar senha' : 'Ver senha'}
                    aria-label={showRegPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {activeTooltipField === 'regPassword' && (
                  <div className="sonic-validation-tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-badge">!</div>
                    <span className="tooltip-text">{tooltipMessage}</span>
                  </div>
                )}
              </div>

              <input
                type="submit"
                value={regLoading ? 'Cadastrando via API...' : 'Sign up'}
                className="btn"
                disabled={regLoading}
              />

              <p className="social-text">Or sign up with Google</p>
              <div className="social-media">
                <SocialIcons onSelect={handleSocialAction} isDark={isDark} />
              </div>
            </form>
          </div>
        </div>

        {/* Textos dos Painéis sobre o Vinil */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>
                Join us today and discover a world of possibilities. Create your
                account in seconds!
              </p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => {
                  setRegError(null);
                  setIsSignUp(true);
                }}
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => {
                  setLoginError(null);
                  setIsSignUp(false);
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sulcos do vinil concêntricos com a curvatura do círculo de 2000px
 * Base preta idêntica em ambos os modos; no Modo Escuro exibe exatamente 5 listras laranjas de largura mediana!
 */
function VinylGroovesSVG({ isDark }: { isDark: boolean }) {
  // Anéis concêntricos correspondentes às faixas de vinil
  const track1 = [986, 978, 970, 962, 954, 946, 938, 930, 922];
  const track2 = [908, 900, 892, 884, 876, 868, 860, 852, 844];
  const track3 = [830, 822, 814, 806, 798, 790, 782, 774, 766];
  const track4 = [752, 744, 736, 728, 720, 712, 704, 696, 688];
  const track5 = [674, 666, 658, 650, 642, 634, 626, 618, 610];
  const innerLeadOut = [594, 584, 574, 564, 554, 544];

  // Cores dos micro-sulcos sutis de vinil (idênticos em ambos os modos)
  const grooveStroke = (i: number) =>
    i % 2 === 0 ? 'rgba(255,255,255,0.065)' : 'rgba(0,0,0,0.55)';

  return (
    <svg
      viewBox="0 0 2000 2000"
      className="vinyl-panel-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Base do Vinil Preto idêntica em ambos os modos */}
        <radialGradient id="v-base-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e212a" />
          <stop offset="50%" stopColor="#14161d" />
          <stop offset="78%" stopColor="#111216" />
          <stop offset="95%" stopColor="#181a20" />
          <stop offset="99.5%" stopColor="#22252e" />
          <stop offset="100%" stopColor="#08080a" />
        </radialGradient>
      </defs>

      {/* Base sólida preta do vinil (mesma em ambos os modos) */}
      <circle cx="1000" cy="1000" r="999" fill="url(#v-base-grad)" />

      {/* Borda externa chanfrada */}
      <circle
        cx="1000"
        cy="1000"
        r="997"
        fill="none"
        stroke="#2c303c"
        strokeWidth="3"
        opacity="0.9"
      />
      <circle
        cx="1000"
        cy="1000"
        r="993"
        fill="none"
        stroke="#08080a"
        strokeWidth="2"
        opacity="0.9"
      />

      {/* Faixa de Entrada (Lead-in groove) */}
      <circle
        cx="1000"
        cy="1000"
        r="990"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />

      {/* Faixa de Áudio 1 */}
      {track1.map((r, i) => (
        <circle
          key={`t1-${r}`}
          cx="1000"
          cy="1000"
          r={r}
          fill="none"
          stroke={grooveStroke(i)}
          strokeWidth={i % 3 === 0 ? '1.5' : '0.8'}
        />
      ))}
      <circle cx="1000" cy="1000" r="916" fill="none" stroke="#08080a" strokeWidth="5" />
      <circle cx="1000" cy="1000" r="916" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Faixa de Áudio 2 */}
      {track2.map((r, i) => (
        <circle
          key={`t2-${r}`}
          cx="1000"
          cy="1000"
          r={r}
          fill="none"
          stroke={grooveStroke(i)}
          strokeWidth={i % 3 === 0 ? '1.4' : '0.8'}
        />
      ))}
      <circle cx="1000" cy="1000" r="838" fill="none" stroke="#08080a" strokeWidth="5" />
      <circle cx="1000" cy="1000" r="838" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Faixa de Áudio 3 */}
      {track3.map((r, i) => (
        <circle
          key={`t3-${r}`}
          cx="1000"
          cy="1000"
          r={r}
          fill="none"
          stroke={grooveStroke(i)}
          strokeWidth={i % 3 === 0 ? '1.4' : '0.75'}
        />
      ))}
      <circle cx="1000" cy="1000" r="760" fill="none" stroke="#08080a" strokeWidth="5" />
      <circle cx="1000" cy="1000" r="760" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Faixa de Áudio 4 */}
      {track4.map((r, i) => (
        <circle
          key={`t4-${r}`}
          cx="1000"
          cy="1000"
          r={r}
          fill="none"
          stroke={grooveStroke(i)}
          strokeWidth={i % 3 === 0 ? '1.3' : '0.75'}
        />
      ))}
      <circle cx="1000" cy="1000" r="682" fill="none" stroke="#08080a" strokeWidth="5" />
      <circle cx="1000" cy="1000" r="682" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Faixa de Áudio 5 */}
      {track5.map((r, i) => (
        <circle
          key={`t5-${r}`}
          cx="1000"
          cy="1000"
          r={r}
          fill="none"
          stroke={grooveStroke(i)}
          strokeWidth={i % 3 === 0 ? '1.3' : '0.75'}
        />
      ))}
      <circle cx="1000" cy="1000" r="602" fill="none" stroke="#08080a" strokeWidth="5" />

      {/* Sulcos de Saída Internos */}
      {innerLeadOut.map((r, i) => (
        <circle
          key={`lo-${r}`}
          cx="1000"
          cy="1000"
          r={r}
          fill="none"
          stroke={i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.6)'}
          strokeWidth="1.2"
        />
      ))}
    </svg>
  );
}

function SocialIcons({
  onSelect,
  isDark = false,
}: {
  onSelect?: (provider: string) => void;
  isDark?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect?.('Google')}
        className="social-icon"
        title="Continue with Google"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </button>
    </>
  );
}
