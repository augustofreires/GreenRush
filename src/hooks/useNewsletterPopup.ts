import { useState, useEffect } from 'react';

const POPUP_DELAY = 5000; // 5 seconds
const STORAGE_KEY = 'newsletter-popup-shown';
const STORAGE_SUBMITTED_KEY = 'newsletter-popup-submitted';

export const useNewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user already submitted or closed the popup
    const hasSubmitted = localStorage.getItem(STORAGE_SUBMITTED_KEY);
    const hasSeenPopup = sessionStorage.getItem(STORAGE_KEY);

    // Don't show if already submitted or seen in this session
    if (hasSubmitted || hasSeenPopup) {
      return;
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    closePopup
  };
};
