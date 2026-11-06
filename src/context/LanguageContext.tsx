import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'pt' | 'en';

export interface Translations {
  nav: {
    catalog: string;
    drumKits: string;
    samples: string;
    presets: string;
    publishKit: string;
    cart: string;
    profile: string;
    login: string;
    logout: string;
    fullCatalog: string;
    emptyCart: string;
    producer: string;
  };
  catalog: {
    title: string;
    showing: string;
    searchPlaceholder: string;
    filters: string;
    category: string;
    allCategories: string;
    drumKit: string;
    samplePack: string;
    presetBank: string;
    priceRange: string;
    tags: string;
    allTags: string;
    noTagsYet: string;
    sortBy: string;
    sortDefault: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortAlphabetical: string;
    clearFilters: string;
    noAudioFound: string;
    noAudioFoundDesc: string;
    resetFilters: string;
    files: string;
    by: string;
    addToCart: string;
    inCart: string;
    listenOnVinyl: string;
    pausePreview: string;
  };
  home: {
    heroTitlePrefix: string;
    heroSubtitle: string;
    exploreKits: string;
    sellKit: string;
    drumKitsTitle: string;
    drumKitsSubtitle: string;
    viewAll: string;
    noDrumKits: string;
    noDrumKitsDesc: string;
    publishSoundKit: string;
    samplePacksTitle: string;
    samplePacksSubtitle: string;
    noSamplePacks: string;
    noSamplePacksDesc: string;
    publishSamplePack: string;
    presetBanksTitle: string;
    presetBanksSubtitle: string;
    noPresetBanks: string;
    noPresetBanksDesc: string;
    publishPresetBank: string;
    newBadge: string;
  };
  common: {
    langPt: string;
    langEn: string;
    switchLang: string;
  };
  auth: {
    signInTitle: string;
    signUpTitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    producerOrUsernamePlaceholder: string;
    forgotPasswordLink: string;
    orSignInWithGoogle: string;
    orSignUpWithGoogle: string;
    continueWithGoogle: string;
    loginButton: string;
    loginLoading: string;
    signUpButton: string;
    signUpLoading: string;
    newHereTitle: string;
    newHereDesc: string;
    oneOfUsTitle: string;
    oneOfUsDesc: string;
    fillThisField: string;
    validEmailRequired: string;
    passwordRequirements: string;
    passwordsDoNotMatch: string;
    hidePassword: string;
    showPassword: string;
    recoveryTitle: string;
    recoveryDesc: string;
    registeredEmailPlaceholder: string;
    sendResetLink: string;
    sending: string;
    backToLogin: string;
    alreadyHaveToken: string;
    resetPasswordHere: string;
    newPasswordTitle: string;
    newPasswordDesc: string;
    tokenPlaceholder: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    saveNewPassword: string;
    saving: string;
    fillNewPassword: string;
    tokenRequired: string;
    passwordResetSuccess: string;
    passwordResetLoginPrompt: string;
    activeSession: string;
    goToProfile: string;
    signOut: string;
    home: string;
    close: string;
    userRegisteredSuccess: string;
    registrationSuccessPrompt: string;
    loggedInSuccess: string;
  };
}

const translations: Record<Language, Translations> = {
  pt: {
    nav: {
      catalog: 'Catálogo',
      drumKits: 'Drum Kits',
      samples: 'Samples',
      presets: 'Presets',
      publishKit: 'Publicar Kit',
      cart: 'Carrinho',
      profile: 'Meu Perfil',
      login: 'Entrar',
      logout: 'Sair',
      fullCatalog: 'Catálogo Completo',
      emptyCart: 'Vazio',
      producer: 'Produtor',
    },
    catalog: {
      title: 'Catálogo',
      showing: 'Exibindo {displayed} de {total} itens sonoros',
      searchPlaceholder: 'Buscar sound kits, tags, produtores...',
      filters: 'Filtros & Categorias',
      category: 'Categoria',
      allCategories: 'Todas as Categorias',
      drumKit: 'Drum Kit',
      samplePack: 'Sample Pack',
      presetBank: 'Preset Bank',
      priceRange: 'Faixa de Preço',
      tags: 'Tags do Sound Kit',
      allTags: 'Todas as tags',
      noTagsYet: 'Nenhuma tag disponível no momento.',
      sortBy: 'Ordenar Por',
      sortDefault: 'Padrão (Recomendados)',
      sortPriceAsc: 'Menor Preço',
      sortPriceDesc: 'Maior Preço',
      sortAlphabetical: 'Ordem Alfabética (A-Z)',
      clearFilters: 'Limpar Filtros',
      noAudioFound: 'Nenhum sound kit encontrado',
      noAudioFoundDesc: 'Não encontramos nenhum kit que corresponda aos filtros e tags selecionados.',
      resetFilters: 'Restaurar Filtros',
      files: 'Arquivos',
      by: 'Por',
      addToCart: 'Adicionar ao Carrinho',
      inCart: 'No Carrinho',
      listenOnVinyl: 'Ouvir prévia no vinil',
      pausePreview: 'Pausar prévia',
    },
    home: {
      heroTitlePrefix: 'Seu arsenal para',
      heroSubtitle: 'O maior portal de Drum Kits, Samples e Presets. Sons essenciais curados para elevar suas produções musicais.',
      exploreKits: 'Explorar Kits',
      sellKit: 'Venda seu Kit',
      drumKitsTitle: 'Drum Kits',
      drumKitsSubtitle: 'Pacotes de percussão e bateria autoral',
      viewAll: 'Ver todos',
      noDrumKits: 'Nenhum Drum Kit cadastrado',
      noDrumKitsDesc: 'Adicione os sons e kits autorais da sua equipe para exibi-los aqui no catálogo.',
      publishSoundKit: '+ Publicar Sound Kit',
      samplePacksTitle: 'Sample Packs',
      samplePacksSubtitle: 'Melodias, vocal chops & loops de texturas',
      noSamplePacks: 'Nenhum Sample Pack cadastrado',
      noSamplePacksDesc: 'Adicione suas próprias melodias, loops e texturas autorais na plataforma.',
      publishSamplePack: '+ Publicar Sample Pack',
      presetBanksTitle: 'Preset Banks',
      presetBanksSubtitle: 'Wavetables e presets para sintetizadores modernos',
      noPresetBanks: 'Nenhum Preset Bank cadastrado',
      noPresetBanksDesc: 'Disponibilize seus próprios presets de Serum, Vital ou sintetizadores autorais.',
      publishPresetBank: '+ Publicar Presets',
      newBadge: 'Novo',
    },
    common: {
      langPt: 'Português (BR)',
      langEn: 'English (US)',
      switchLang: 'Mudar idioma',
    },
    auth: {
      signInTitle: 'Entrar',
      signUpTitle: 'Cadastrar',
      emailPlaceholder: 'E-mail',
      passwordPlaceholder: 'Senha',
      producerOrUsernamePlaceholder: 'Nome do Produtor / Usuário',
      forgotPasswordLink: 'Esqueceu sua senha?',
      orSignInWithGoogle: 'Ou entre com o Google',
      orSignUpWithGoogle: 'Ou cadastre-se com o Google',
      continueWithGoogle: 'Continuar com o Google',
      loginButton: 'Entrar',
      loginLoading: 'Autenticando...',
      signUpButton: 'Cadastrar',
      signUpLoading: 'Cadastrando...',
      newHereTitle: 'Novo por aqui?',
      newHereDesc: 'Junte-se à nossa comunidade de produtores. Crie sua conta em poucos segundos!',
      oneOfUsTitle: 'Já tem uma conta?',
      oneOfUsDesc: 'Bem-vindo de volta! Entre com sua conta para continuar produzindo.',
      fillThisField: 'Preencha este campo.',
      validEmailRequired: 'Insira um endereço de e-mail válido.',
      passwordRequirements: 'Mínimo de 8 caracteres (letras e números).',
      passwordsDoNotMatch: 'As senhas não coincidem.',
      hidePassword: 'Ocultar senha',
      showPassword: 'Ver senha',
      recoveryTitle: 'Recuperação',
      recoveryDesc: 'Insira seu e-mail cadastrado para receber as instruções de redefinição de senha.',
      registeredEmailPlaceholder: 'E-mail cadastrado',
      sendResetLink: 'Enviar Link',
      sending: 'Enviando...',
      backToLogin: 'Voltar ao login',
      alreadyHaveToken: 'Já tem um token?',
      resetPasswordHere: 'Redefinir senha aqui',
      newPasswordTitle: 'Nova Senha',
      newPasswordDesc: 'Crie uma nova senha de no mínimo 8 caracteres (com letras e números).',
      tokenPlaceholder: 'Token recebido por e-mail',
      newPasswordPlaceholder: 'Nova senha (mín. 8 caracteres)',
      confirmPasswordPlaceholder: 'Confirmar nova senha',
      saveNewPassword: 'Salvar Nova Senha',
      saving: 'Salvando...',
      fillNewPassword: 'Preencha a nova senha.',
      tokenRequired: 'Insira o token de recuperação.',
      passwordResetSuccess: 'Senha redefinida com sucesso!',
      passwordResetLoginPrompt: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
      activeSession: 'Sessão Ativa',
      goToProfile: 'Acessar Perfil',
      signOut: 'Encerrar Sessão',
      home: 'Início',
      close: 'Fechar',
      userRegisteredSuccess: 'Usuário cadastrado com sucesso! Redirecionando...',
      registrationSuccessPrompt: 'Cadastro realizado! Digite sua senha para entrar.',
      loggedInSuccess: 'Logado com Êxito',
    },
  },
  en: {
    nav: {
      catalog: 'Catalog',
      drumKits: 'Drum Kits',
      samples: 'Samples',
      presets: 'Presets',
      publishKit: 'Publish Kit',
      cart: 'Cart',
      profile: 'My Profile',
      login: 'Sign In',
      logout: 'Log Out',
      fullCatalog: 'Full Catalog',
      emptyCart: 'Empty',
      producer: 'Producer',
    },
    catalog: {
      title: 'Catalog',
      showing: 'Showing {displayed} of {total} sonic assets',
      searchPlaceholder: 'Search sound kits, tags, creators...',
      filters: 'Filters & Categories',
      category: 'Category',
      allCategories: 'All Categories',
      drumKit: 'Drum Kit',
      samplePack: 'Sample Pack',
      presetBank: 'Preset Bank',
      priceRange: 'Price Range',
      tags: 'Sound Kit Tags',
      allTags: 'All tags',
      noTagsYet: 'No tags available yet.',
      sortBy: 'Sort By',
      sortDefault: 'Default (Featured)',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortAlphabetical: 'Alphabetical (A-Z)',
      clearFilters: 'Clear Filters',
      noAudioFound: 'No sound kits found',
      noAudioFoundDesc: "We couldn't find any kits matching your selected filters and tags.",
      resetFilters: 'Reset Filters',
      files: 'Files',
      by: 'By',
      addToCart: 'Add to Cart',
      inCart: 'In Cart',
      listenOnVinyl: 'Listen preview on vinyl',
      pausePreview: 'Pause preview',
    },
    home: {
      heroTitlePrefix: 'Your arsenal for',
      heroSubtitle: 'The largest hub for Drum Kits, Samples and Presets. Curated essential sounds to elevate your musical productions.',
      exploreKits: 'Explore Kits',
      sellKit: 'Sell your Kit',
      drumKitsTitle: 'Drum Kits',
      drumKitsSubtitle: 'Engineered percussion & drum packs',
      viewAll: 'View all',
      noDrumKits: 'No Drum Kits registered',
      noDrumKitsDesc: 'Upload your team original sounds and kits to display them here in the catalog.',
      publishSoundKit: '+ Publish Sound Kit',
      samplePacksTitle: 'Sample Packs',
      samplePacksSubtitle: 'Melodics, vocal chops & SFX loop textures',
      noSamplePacks: 'No Sample Packs registered',
      noSamplePacksDesc: 'Upload your own melody loops, chords and textures to the platform.',
      publishSamplePack: '+ Publish Sample Pack',
      presetBanksTitle: 'Preset Banks',
      presetBanksSubtitle: 'Wavetables and presets for modern synthesizers',
      noPresetBanks: 'No Preset Banks registered',
      noPresetBanksDesc: 'Offer your custom Serum, Vital or synthesizer banks.',
      publishPresetBank: '+ Publish Presets',
      newBadge: 'New',
    },
    common: {
      langPt: 'Português (BR)',
      langEn: 'English (US)',
      switchLang: 'Change language',
    },
    auth: {
      signInTitle: 'Sign in',
      signUpTitle: 'Sign up',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      producerOrUsernamePlaceholder: 'Producer / Username',
      forgotPasswordLink: 'Forgot password?',
      orSignInWithGoogle: 'Or sign in with Google',
      orSignUpWithGoogle: 'Or sign up with Google',
      continueWithGoogle: 'Continue with Google',
      loginButton: 'Sign In',
      loginLoading: 'Signing in...',
      signUpButton: 'Sign Up',
      signUpLoading: 'Creating account...',
      newHereTitle: 'New here?',
      newHereDesc: 'Join us today and discover a world of possibilities. Create your account in seconds!',
      oneOfUsTitle: 'One of us?',
      oneOfUsDesc: 'Welcome back! Sign in to continue your journey with us.',
      fillThisField: 'Please fill in this field.',
      validEmailRequired: 'Please enter a valid email address.',
      passwordRequirements: 'Minimum of 8 characters (letters and numbers).',
      passwordsDoNotMatch: 'Passwords do not match.',
      hidePassword: 'Hide password',
      showPassword: 'Show password',
      recoveryTitle: 'Password Recovery',
      recoveryDesc: 'Enter your registered email to receive password reset instructions.',
      registeredEmailPlaceholder: 'Registered email',
      sendResetLink: 'Send Link',
      sending: 'Sending...',
      backToLogin: 'Back to login',
      alreadyHaveToken: 'Already have a token?',
      resetPasswordHere: 'Reset password here',
      newPasswordTitle: 'New Password',
      newPasswordDesc: 'Create a new password of at least 8 characters (letters and numbers).',
      tokenPlaceholder: 'Token received by email',
      newPasswordPlaceholder: 'New password (min. 8 characters)',
      confirmPasswordPlaceholder: 'Confirm new password',
      saveNewPassword: 'Save New Password',
      saving: 'Saving...',
      fillNewPassword: 'Fill in the new password.',
      tokenRequired: 'Please enter the recovery token.',
      passwordResetSuccess: 'Password reset successfully!',
      passwordResetLoginPrompt: 'Password reset successfully! Sign in with your new password.',
      activeSession: 'Active Session',
      goToProfile: 'Go to Profile',
      signOut: 'Log Out',
      home: 'Home',
      close: 'Close',
      userRegisteredSuccess: 'User registered successfully! Redirecting...',
      registrationSuccessPrompt: 'Account created! Enter your password to sign in.',
      loggedInSuccess: 'Signed In Successfully',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'sonic_lab_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') {
        return saved;
      }
      // System language check
      if (typeof navigator !== 'undefined' && navigator.language) {
        if (navigator.language.toLowerCase().startsWith('pt')) {
          return 'pt';
        }
      }
    } catch {
      // ignore
    }
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
