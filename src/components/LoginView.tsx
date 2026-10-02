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
}: LoginViewProps) {
  return (
    <AuthSwitch
      initialIsSignUp={false}
      onLoginSuccess={onLoginSuccess}
      onNavigate={onNavigate}
      onClose={onClose}
      currentProfile={currentProfile}
      isAlreadyLoggedIn={isAlreadyLoggedIn}
      onLogout={onLogout}
      initialEmail={initialEmail}
      initialSuccessMessage={initialSuccessMessage}
      isModal={isModal}
    />
  );
}
