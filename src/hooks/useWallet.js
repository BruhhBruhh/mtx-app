// src/hooks/useWallet.js
import { useState, useEffect, useCallback } from 'react';
import { saveToLocalStorage, getFromLocalStorage, saveToSessionStorage, getFromSessionStorage } from '../utils/storage.js';
import { validatePrivateKey } from '../utils/xenft-utils.js';

export const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have a stored wallet address and verification
    const savedAddress = getFromLocalStorage('lastWalletAddress');
    const isVerified = getFromLocalStorage('verificationComplete');
    const sessionKey = getFromSessionStorage('encryptedPrivateKey');
    
    if (savedAddress && isVerified && sessionKey) {
      // Auto-restore session if all conditions are met
      try {
        const decryptedKey = sessionKey.replace('enc_', '');
        const restoredWallet = {
          address: savedAddress,
          privateKey: decryptedKey
        };
        setWallet(restoredWallet);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to restore wallet session:', err);
        clearWalletData();
      }
    }
  }, []);

  const generateWallet = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, you would use ethers.Wallet.createRandom()
      // For now, we'll generate a mock wallet
      const mockWallet = {
        address: '0x' + Math.random().toString(16).substr(2, 40).padStart(40, '0'),
        privateKey: '0x' + Math.random().toString(16).substr(2, 64).padStart(64, '0')
      };
      
      setWallet(mockWallet);
      setIsConnected(true);
      
      // Store wallet info
      saveToLocalStorage('lastWalletAddress', mockWallet.address);
      saveToSessionStorage('encryptedPrivateKey', `enc_${mockWallet.privateKey}`);
      
      return mockWallet;
    } catch (err) {
      setError('Failed to generate wallet: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importWallet = useCallback(async (privateKey) => {
    setIsLoading(true);
    setError('');
    
    try {
      const validation = validatePrivateKey(privateKey);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // In a real implementation, you would use new ethers.Wallet(privateKey)
      const importedWallet = {
        address: '0x' + Math.random().toString(16).substr(2, 40).padStart(40, '0'),
        privateKey: privateKey
      };
      
      setWallet(importedWallet);
      setIsConnected(true);
      
      // Store wallet info
      saveToLocalStorage('lastWalletAddress', importedWallet.address);
      saveToSessionStorage('encryptedPrivateKey', `enc_${privateKey}`);
      
      return importedWallet;
    } catch (err) {
      setError('Failed to import wallet: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearWalletData = useCallback(() => {
    setWallet(null);
    setIsConnected(false);
    setError('');
    
    // Clear stored data
    localStorage.removeItem('lastWalletAddress');
    localStorage.removeItem('verificationComplete');
    sessionStorage.removeItem('encryptedPrivateKey');
  }, []);

  const disconnectWallet = useCallback(() => {
    clearWalletData();
  }, [clearWalletData]);

  const verifyWallet = useCallback(() => {
    if (!wallet) {
      setError('No wallet to verify');
      return false;
    }
    
    saveToLocalStorage('verificationComplete', true);
    return true;
  }, [wallet]);

  return {
    wallet,
    isConnected,
    error,
    isLoading,
    generateWallet,
    importWallet,
    disconnectWallet,
    verifyWallet,
    clearError: () => setError('')
  };
};