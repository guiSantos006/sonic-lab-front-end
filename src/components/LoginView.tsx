import React from 'react';
import { UserProfile, ViewType } from '../types';
import AuthSwitch from './AuthSwitch';

interface LoginViewProps {
  onLoginSuccess: (user: Partial<UserProfile> & { email?: string; token?: string }) => void;
  onNavigate: (view: ViewType) => void;
  onClose?: () => void;
  currentProfile?: UserProfile;
  isAlreadyLoggedIn?: boolean;
  onLogout?: () => void;
  initialEmail?: string;
  initialSuccessMessage?: string | null;
  isModal?: boolean;
  initialMode?: 'login' | 'register' | 'forgot-password' | 'reset-password';
  initialResetToken?: string | null;
}

export default function LoginView({
  onLoginSuccess,
  onNavigate,
  onClose,
  currentProfile,
  isAlreadyLoggedIn = false,
  onLogout,
  initialEmail = '',
  initialSuccessMessage = null,
  isModal = false,
  initialMode = 'login',
  initialResetToken = null,
}: LoginViewProps) {
  return (
    <AuthSwitch
      initialIsSignUp={initialMode === 'register'}
      onLoginSuccess={onLoginSuccess}
      onNavigate={onNavigate}
      onClose={onClose}
      currentProfile={currentProfile}
      isAlreadyLoggedIn={isAlreadyLoggedIn}
      onLogout={onLogout}
      initialEmail={initialEmail}
      initialSuccessMessage={initialSuccessMessage}
      isModal={isModal}
      initialMode={initialMode}
      initialResetToken={initialResetToken}
    />
  );
}
