// src/components/KeyManagement.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Key, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Wallet,
  Zap,
  Eye,
  EyeOff,
  Download,
  Upload
} from 'lucide-react';

const KeyManagement = ({ onWalletReady }) => {
  const [step, setStep] = useState('initial'); // initial, generate, backup, connect, verify, complete
  const [wallet, setWallet] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [importedKey, setImportedKey] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    // Check if we already have a stored key
    try {
      const storedKey = sessionStorage.getItem('encryptedPrivateKey');
      const savedAddress = localStorage.getItem('lastWalletAddress');
      
      if (storedKey && savedAddress) {
        try {
          // In a real app, we would decrypt the key here
          const decryptedKey = storedKey.replace('enc_', '');
          const loadedWallet = {
            address: savedAddress,
            privateKey: decryptedKey
          };
          setWallet(loadedWallet);
          setPrivateKey(decryptedKey);
          setStep('backup');
        } catch (error) {
          console.error('Failed to load stored key:', error);
          sessionStorage.removeItem('encryptedPrivateKey');
          localStorage.removeItem('lastWalletAddress');
        }
      } else if (savedAddress) {
        setStep('reenter');
      }
    } catch (error) {
      console.error('Error accessing storage:', error);
    }
  }, []);

  const generateNewWallet = () => {
    try {
      setError('');
      // In real implementation, use ethers.Wallet.createRandom()
      const newWallet = {
        address: '0x' + Math.random().toString(16).substr(2, 40).padStart(40, '0'),
        privateKey: '0x' + Math.random().toString(16).substr(2, 64).padStart(64, '0')
      };
      
      setWallet(newWallet);
      setPrivateKey(newWallet.privateKey);
      
      // Store the wallet info
      localStorage.setItem('lastWalletAddress', newWallet.address);
      const encryptedKey = `enc_${newWallet.privateKey}`;
      sessionStorage.setItem('encryptedPrivateKey', encryptedKey);
      
      setStep('backup');
    } catch (error) {
      setError(`Failed to generate wallet: ${error.message}`);
    }
  };

  const importKey = () => {
    try {
      setError('');
      
      // Validate private key format
      if (!importedKey.startsWith('0x') || importedKey.length !== 66) {
        setError('Invalid private key format. Must be a 0x-prefixed 64-character hex string.');
        return;
      }
      
      // In real implementation, use new ethers.Wallet(importedKey)
      const importedWallet = {
        address: '0x' + Math.random().toString(16).substr(2, 40).padStart(40, '0'),
        privateKey: importedKey
      };
      
      setWallet(importedWallet);
      setPrivateKey(importedKey);
      
      // Store the wallet info
      localStorage.setItem('lastWalletAddress', importedWallet.address);
      const encryptedKey = `enc_${importedKey}`;
      sessionStorage.setItem('encryptedPrivateKey', encryptedKey);
      
      setStep('backup');
    } catch (error) {
      setError(`Failed to import wallet: ${error.message}`);
    }
  };

  const copyPrivateKey = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setError('Failed to copy: ' + err.message);
    }
  };

  const downloadBackup = () => {
    const backupData = {
      address: wallet.address,
      privateKey: privateKey,
      timestamp: new Date().toISOString(),
      warning: "KEEP THIS FILE SECURE! Anyone with this private key can access your funds."
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mintxen-wallet-${wallet.address.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const proceedToVerification = () => {
    if (!backupConfirmed) {
      setError('Please confirm you have backed up your private key before proceeding.');
      return;
    }
    setStep('verify');
  };

  const completeVerification = () => {
    setVerificationComplete(true);
    localStorage.setItem('verificationComplete', 'true');
    setStep('complete');
    
    if (onWalletReady) {
      onWalletReady(wallet);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Key className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">Create or Import a Wallet</h3>
              <p className="text-gray-400">
                To start minting XENFTs, you need a wallet. You can generate a new one or import an existing private key.
              </p>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-300 font-semibold">🔒 Security Notice</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    Your private key will only be stored in this browser session and will be deleted when you close the browser.
                    Always back up your private key securely - it controls access to your assets.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={generateNewWallet} className="w-full" size="lg">
                <Zap className="w-5 h-5 mr-2" />
                Generate New Wallet
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-400">Or</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPrivateKey ? "text" : "password"}
                    placeholder="Enter your private key (0x...)"
                    value={importedKey}
                    onChange={(e) => setImportedKey(e.target.value)}
                    className="pr-10 bg-gray-900/50 border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={importKey} 
                  variant="outline" 
                  className="w-full"
                  disabled={!importedKey}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Import Private Key
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'reenter':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Key className="w-16 h-16 mx-auto mb-4 text-orange-400" />
              <h3 className="text-2xl font-bold mb-2">Re-enter Your Private Key</h3>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-300 font-semibold">ℹ️ Session Expired</h4>
                  <p className="text-blue-200 text-sm mt-1">
                    For your security, your private key was removed when the browser closed. 
                    Please re-enter your private key to continue using your wallet.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-2">Your previous wallet address:</p>
              <code className="text-green-400 font-mono text-sm break-all">
                {localStorage.getItem('lastWalletAddress')}
              </code>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="Enter your private key (0x...)"
                  value={importedKey}
                  onChange={(e) => setImportedKey(e.target.value)}
                  className="pr-10 bg-gray-900/50 border-gray-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <Button
                onClick={importKey}
                className="w-full"
                disabled={!importedKey}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Unlock Wallet
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep('initial')}
                className="text-blue-400 hover:text-blue-300"
              >
                Use a different wallet instead
              </Button>
            </div>
          </div>
        );
        
      case 'backup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Key className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h3 className="text-2xl font-bold mb-2">Backup Your Private Key</h3>
              <p className="text-gray-400">
                Save your private key securely - you'll need it to access your funds
              </p>
            </div>

            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-300 font-semibold">⚠️ CRITICAL: Backup Required</h4>
                  <p className="text-red-200 text-sm mt-1">
                    Your private key will be deleted when you close this browser. Without backup, you'll lose access to your funds permanently!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 space-y-4">
              <div>
                <Label className="text-sm text-gray-400 block mb-2">Wallet Address:</Label>
                <div className="bg-gray-800 rounded p-3 break-all font-mono text-green-400">
                  {wallet?.address}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400 block mb-2">Private Key:</Label>
                <div className="relative">
                  <div className="bg-gray-800 rounded p-3 break-all font-mono text-yellow-400 pr-24">
                    {showPrivateKey ? privateKey : '•'.repeat(66)}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={copyPrivateKey}
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <h4 className="text-blue-300 font-semibold mb-3">🔑 Backup Options</h4>
              <div className="space-y-3">
                <Button
                  onClick={downloadBackup}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup File (.json)
                </Button>
                <div className="text-blue-200 text-sm">
                  <p className="font-medium mb-2">Manual Backup Checklist:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Copy private key to a password manager (1Password, Bitwarden, etc.)</li>
                    <li>• Write it down on paper and store in a secure location</li>
                    <li>• Never share this key with anyone</li>
                    <li>• Import this key into MetaMask or your preferred wallet</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="backup-confirmed"
                  checked={backupConfirmed}
                  onChange={(e) => setBackupConfirmed(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600 text-blue-600"
                />
                <Label htmlFor="backup-confirmed" className="text-yellow-300 font-medium">
                  I confirm I have securely backed up my private key
                </Label>
              </div>
              
              <Button 
                onClick={proceedToVerification} 
                className="w-full" 
                size="lg"
                disabled={!backupConfirmed}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Continue to Verification
              </Button>
            </div>
          </div>
        );
        
      case 'verify':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold mb-2">Verify Wallet Access</h3>
              <p className="text-gray-400">
                Confirm you have access to your wallet by importing it into MetaMask
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-purple-300">Verification Steps:</h4>
              <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                <li>Open MetaMask (or your preferred wallet)</li>
                <li>Import your private key into the wallet</li>
                <li>Verify the wallet address matches below</li>
                <li>Click "Complete Verification" when ready</li>
              </ol>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Expected Wallet Address:</p>
              <div className="font-mono text-green-400 break-all bg-gray-900 p-3 rounded">
                {wallet?.address}
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-300 font-semibold">Important</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    Make sure the address in your wallet exactly matches the one shown above before proceeding.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={completeVerification} 
              className="w-full" 
              size="lg"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Verification
            </Button>
          </div>
        );
        
      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Wallet Ready!</h3>
              <p className="text-gray-400">
                Your wallet has been set up successfully. You can now start minting XENFTs.
              </p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Active Wallet Address:</p>
              <div className="font-mono text-green-400 break-all text-sm">
                {wallet?.address}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">✅ Security Verified</h4>
                <p className="text-gray-400">Your private key is safely backed up and wallet is ready for use.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-300 mb-2">🚀 Ready to Mint</h4>
                <p className="text-gray-400">You can now access Rainbow and Ladder minting modes.</p>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-left">
              <h4 className="text-blue-300 font-semibold mb-2">Next Steps:</h4>
              <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                <li>Ensure your wallet has ETH for gas fees on Optimism</li>
                <li>Choose your minting strategy (Rainbow or Ladder mode)</li>
                <li>Configure your batch parameters</li>
                <li>Start your XENFT minting journey!</li>
              </ol>
            </div>

            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <h4 className="text-gray-300 font-semibold mb-2">🔒 Session Security Reminder</h4>
              <p className="text-gray-400 text-sm">
                Your private key will be deleted when you close your browser. 
                If you need to return later, you'll need to re-enter your private key.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-800/50 border-gray-600 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Wallet Setup</CardTitle>
          <CardDescription>
            Secure wallet management for XENFT minting
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['Create', 'Backup', 'Verify', 'Complete'].map((stepName, index) => {
                const stepNames = ['initial', 'backup', 'verify', 'complete'];
                const currentStepIndex = stepNames.indexOf(step);
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <React.Fragment key={stepName}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isActive ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800' :
                        isCompleted ? 'bg-green-600 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {isCompleted ? 
                          <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`text-xs mt-2 transition-colors duration-300 ${
                        (isActive || isCompleted) ? 'text-white' : 'text-gray-500'
                      }`}>
                        {stepName}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className="flex-1 h-1 mx-3 bg-gray-700 rounded overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${
                          isCompleted ? 'bg-green-600 w-full' : 'bg-gray-700 w-0'
                        }`}></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyManagement;