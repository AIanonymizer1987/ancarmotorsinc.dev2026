import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

const IdentityVerificationPrompt: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Show dialog if user is authenticated, email is verified, but ID verification is not requested or approved
    if (
      isAuthenticated &&
      user?.emailVerified &&
      (!user.id_verification_status || user.id_verification_status === 'not requested' || user.id_verification_status === 'denied')
    ) {
      // Check if we've already shown this dialog in this session
      const hasShownDialog = sessionStorage.getItem('identityVerificationPromptShown');
      if (!hasShownDialog) {
        setShowDialog(true);
        sessionStorage.setItem('identityVerificationPromptShown', 'true');
      }
    }
  }, [isAuthenticated, user]);

  const handleProceed = () => {
    setShowDialog(false);
    navigate('/profile?tab=identity');
  };

  const handleSkip = () => {
    setShowDialog(false);
  };

  return (
    <ConfirmDialog
      isOpen={showDialog}
      title="Identity Verification Required"
      message="For more secure transactions, verify your identity further by submitting a valid ID!"
      confirmText="Proceed to Verification"
      cancelText="Skip for Now"
      onConfirm={handleProceed}
      onCancel={handleSkip}
    />
  );
};

export default IdentityVerificationPrompt;