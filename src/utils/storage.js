// storage.js - Enhanced but UX-friendly
export const saveToSecureStorage = async (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      // Simple encryption using WebCrypto - protects against casual XSS
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(value));
      
      // Generate a simple session key (stored in memory only)
      if (!window.sessionEncryptionKey) {
        window.sessionEncryptionKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
      }
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        window.sessionEncryptionKey,
        data
      );
      
      // Store IV + encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      sessionStorage.setItem(key, btoa(String.fromCharCode(...combined)));
    }
  } catch (error) {
    console.error('Error saving to secure storage:', error);
    // Fallback to regular storage if encryption fails
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

export const getFromSecureStorage = async (key) => {
  try {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      
      // Try to decrypt
      if (window.sessionEncryptionKey) {
        try {
          const combined = new Uint8Array(
            atob(stored).split('').map(char => char.charCodeAt(0))
          );
          
          const iv = combined.slice(0, 12);
          const encrypted = combined.slice(12);
          
          const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            window.sessionEncryptionKey,
            encrypted
          );
          
          const decoder = new TextDecoder();
          return JSON.parse(decoder.decode(decrypted));
        } catch (decryptError) {
          console.warn('Failed to decrypt, clearing stored data');
          sessionStorage.removeItem(key);
          return null;
        }
      } else {
        // Try parsing as regular JSON (fallback)
        return JSON.parse(stored);
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading from secure storage:', error);
    return null;
  }
};

// Enhanced logging with security
export const createSecureLog = (message, type = 'info') => {
  // Sanitize sensitive data
  let sanitizedMessage = message;
  
  // Replace private keys
  sanitizedMessage = sanitizedMessage.replace(/0x[a-fA-F0-9]{64}/g, '0x[PRIVATE_KEY]');
  
  // Shorten addresses for readability
  sanitizedMessage = sanitizedMessage.replace(
    /0x([a-fA-F0-9]{40})/g, 
    (match, addr) => `0x${addr.slice(0, 6)}...${addr.slice(-4)}`
  );
  
  return {
    timestamp: new Date().toLocaleTimeString(),
    message: sanitizedMessage,
    type
  };
};

// RPC validation with user choice
export const validateRpcUrl = (url) => {
  const trustedProviders = [
    'mainnet.optimism.io',
    'rpc.ankr.com',
    'eth-mainnet.alchemyapi.io', 
    'mainnet.infura.io',
    'mainnet.base.org'
  ];
  
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS
    if (parsed.protocol !== 'https:') {
      return { 
        valid: false, 
        error: 'RPC must use HTTPS for security',
        severity: 'error'
      };
    }
    
    // Check if trusted
    const isTrusted = trustedProviders.some(provider => 
      parsed.hostname === provider || parsed.hostname.endsWith('.' + provider)
    );
    
    if (isTrusted) {
      return { valid: true, trusted: true };
    }
    
    // Allow but warn for unknown providers
    return {
      valid: true,
      trusted: false,
      warning: 'This RPC provider is not in our verified list. Only use if you trust it.',
      requiresConfirmation: true
    };
    
  } catch (error) {
    return { 
      valid: false, 
      error: 'Invalid URL format',
      severity: 'error'
    };
  }
};

// Auto-cleanup for security
export const setupSecurityCleanup = () => {
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('mintxen_wallet_key');
    sessionStorage.removeItem('mintxen_encrypted_key');
  });
  
  // Auto-logout after inactivity (30 minutes)
  let inactivityTimer;
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      sessionStorage.clear();
      window.location.reload();
    }, 30 * 60 * 1000);
  };
  
  // Reset on user activity
  ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });
  
  resetTimer();
};

// Simple transaction verification
export const verifyTransaction = (tx, expected) => {
  const warnings = [];
  
  // Check contract address
  if (tx.to?.toLowerCase() !== expected.contract?.toLowerCase()) {
    warnings.push(`Contract mismatch: ${tx.to} vs ${expected.contract}`);
  }
  
  // Check for suspicious gas prices
  if (tx.maxFeePerGas) {
    const gasGwei = parseFloat(ethers.formatUnits(tx.maxFeePerGas, 'gwei'));
    if (gasGwei > 500) {
      warnings.push(`Very high gas price: ${gasGwei} gwei`);
    }
  }
  
  // Should not send ETH for minting
  if (tx.value && tx.value !== '0x0') {
    warnings.push('XENFT minting should not send ETH');
  }
  
  return {
    safe: warnings.length === 0,
    warnings
  };
};