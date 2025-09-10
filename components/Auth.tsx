import React, { useEffect, useRef } from 'react';
import Modal from './Modal';
import { User } from '../App';

// --- Type definition for Google's CredentialResponse ---
interface CredentialResponse {
  credential?: string;
}

// --- Auth Modal Controller ---
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignInSuccess }) => {
  const googleSignInButtonRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isOpen || hasInitialized.current) {
      return;
    }

    const google = (window as any).google;
    if (google && googleSignInButtonRef.current) {
        hasInitialized.current = true;
        
        google.accounts.id.initialize({
            client_id: process.env.GOOGLE_CLIENT_ID,
            callback: (response: CredentialResponse) => {
                if (response.credential) {
                    try {
                        const idToken = response.credential;
                        const payload = JSON.parse(atob(idToken.split('.')[1]));
                        
                        onSignInSuccess({
                            name: payload.name,
                            email: payload.email,
                            picture: payload.picture,
                        });
                        onClose();
                    } catch (error) {
                        console.error("Error decoding JWT:", error);
                    }
                }
            },
        });

        google.accounts.id.renderButton(
            googleSignInButtonRef.current,
            { theme: "outline", size: "large", type: 'standard', text: 'continue_with', width: '300' }
        );

        // Optional: Show one-tap prompt if user is already signed in to Google
        // google.accounts.id.prompt();
    }
    
    return () => {
        // Cleanup if necessary, though GSI script manages its own state well.
        hasInitialized.current = false;
    }
  }, [isOpen, onSignInSuccess, onClose]);
  

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In / Sign Up"
    >
      <div className="flex flex-col items-center justify-center space-y-4 py-4">
        <p className="text-gray-300 text-center">Continue with your Google account to get started.</p>
        <div ref={googleSignInButtonRef} />
      </div>
    </Modal>
  );
};

export default AuthModal;