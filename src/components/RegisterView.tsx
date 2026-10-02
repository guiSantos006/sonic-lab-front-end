import React from 'react';
import { ViewType, UserProfile } from '../types';
import AuthSwitch from './AuthSwitch';

interface RegisterViewProps {
  onRegisterSuccess: (registeredEmail: string) => void;
  onNavigate: (view: ViewType) => void;
  onClose?: () => void;
  onLoginSuccess?: (user: Partial<UserProfile> & { email?: string; token?: string }) => void;
  isModal?: boolean;
}

export default function RegisterView({
  onRegisterSuccess,
  onNavigate,
  onClose,
  onLoginSuccess = () => {},
  isModal = false,
}: RegisterViewProps) {
  return (
    <AuthSwitch
      initialIsSignUp={true}
      onLoginSuccess={onLoginSuccess}
      onRegisterSuccess={onRegisterSuccess}
      onNavigate={onNavigate}
      onClose={onClose}
      isModal={isModal}
    />
  );
}
