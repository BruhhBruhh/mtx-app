import { useState, useEffect } from 'react';

export const useDisclaimer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    // Check if user has already accepted terms in this session
    const accepted = sessionStorage.getItem('mintxen_terms_accepted');
    
    if (accepted === 'true') {
      setHasAccepted(true);
      setShowDisclaimer(false);
    } else {
      setShowDisclaimer(true);
      setHasAccepted(false);
    }
  }, []);

  const acceptTerms = () => {
    sessionStorage.setItem('mintxen_terms_accepted', 'true');
    setHasAccepted(true);
    setShowDisclaimer(false);
  };

  return {
    showDisclaimer,
    hasAccepted,
    acceptTerms
  };
};