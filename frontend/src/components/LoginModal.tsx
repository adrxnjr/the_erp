import React from 'react';
import { LoginPage } from '../pages/LoginPage';

export interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialPortalType?: 'staff' | 'student' | 'parent';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <LoginPage />
    </div>
  );
};

export default LoginModal;
