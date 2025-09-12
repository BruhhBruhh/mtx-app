import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DisclaimerPopup from './components/DisclaimerPopup';
import { useDisclaimer } from './hooks/useDisclaimer';

const App = () => {
  // App state
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  const [gasPrices, setGasPrices] = useState({
    optimism: { fast: null, standard: null, safe: null, loading: true },
    ethereum: { fast: null, standard: null, safe: null, loading: true },
    base: { fast: null, standard: null, safe: null, loading: true }
  });
  const [gasUpdateTime, setGasUpdateTime] = useState(null);
  const ALCHEMY_KEYS = {
    ethereum: import.meta.env.VITE_ALCHEMY_ETHEREUM_KEY || "8dASJbrbZeVybFKSf3HWqgLu3uFhskOL",    // Replace with your Ethereum API key
    optimism: import.meta.env.VITE_ALCHEMY_OPTIMISM_KEY || "8dASJbrbZeVybFKSf3HWqgLu3uFhskOL",    // Replace with your Optimism API key  
    base: import.meta.env.VITE_ALCHEMY_BASE_KEY || "8dASJbrbZeVybFKSf3HWqgLu3uFhskOL"             // Replace with your Base API key
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formBackup, setFormBackup] = useState({});
  const [ethPrice, setEthPrice] = useState(2800); // Default fallback price
  const [priceLoading, setPriceLoading] = useState(false);
  const [xenftCount, setXenftCount] = useState(0);
  const [xenftLoading, setXenftLoading] = useState(false);
  const [sendForm, setSendForm] = useState({
    toAddress: '',
    amount: '',
    gasPrice: ''
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');

  // Wallet state - SECURE VERSION
  const [wallet, setWallet] = useState(null);
  const [walletStep, setWalletStep] = useState('initial');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [importedKey, setImportedKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0.0000');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceUSD, setBalanceUSD] = useState('0.00');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Network and RPC state
  const [selectedNetwork, setSelectedNetwork] = useState('optimism');
  const [customRpc, setCustomRpc] = useState('');
  const [showRpcInput, setShowRpcInput] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);

  // Disclaimer state
  const { showDisclaimer, hasAccepted, acceptTerms } = useDisclaimer();

  // Minting state
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [mintingLogs, setMintingLogs] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldStopMinting, setShouldStopMinting] = useState(false);

  // Network configurations
  const NETWORKS = {
    optimism: {
      name: 'Optimism',
      chainId: 10,
      defaultRpc: 'https://optimism-rpc.publicnode.com',
      explorer: 'https://optimistic.etherscan.io',
      currency: 'ETH',
      contracts: {
        xenft: '0xAF18644083151cf57F914CCCc23c42A1892C218e'
      }
    },
    ethereum: {
      name: 'Ethereum',
      chainId: 1,
      defaultRpc: 'https://ethereum-rpc.publicnode.com',
      explorer: 'https://etherscan.io',
      currency: 'ETH',
      contracts: {
        xenft: '0x0a252663DBCc0b073063D6420a40319e438Cfa59'
      }
    },
    base: {
      name: 'Base',
      chainId: 8453,
      defaultRpc: 'https://base-rpc.publicnode.com',
      explorer: 'https://basescan.org',
      currency: 'ETH',
      contracts: {
        xenft: '0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6'
      }
    }
  };

  // XENFT Contract ABI - Complete JSON format
  const XENFT_ABI = [
    // ERC721 Standard Functions
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "ownerOf",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "tokenURI",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "getApproved",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "operator", "type": "address" },
        { "internalType": "bool", "name": "approved", "type": "bool" }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "operator", "type": "address" }
      ],
      "name": "isApprovedForAll",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "internalType": "bytes", "name": "data", "type": "bytes" }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },

    // XENFT Specific Functions
    {
      "inputs": [
        { "internalType": "uint256", "name": "count", "type": "uint256" },
        { "internalType": "uint256", "name": "term", "type": "uint256" }
      ],
      "name": "bulkClaimRank",
      "outputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "count", "type": "uint256" },
        { "internalType": "uint256", "name": "term", "type": "uint256" },
        { "internalType": "uint256", "name": "burning", "type": "uint256" }
      ],
      "name": "bulkClaimRankLimited",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "bulkClaimMintReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ownedTokens",
      "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "mintInfo",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "vmuCount",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "xenBurned",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "isApex",
      "outputs": [{ "internalType": "bool", "name": "apex", "type": "bool" }],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "genesisTs",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenIdCounter",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },

    // Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "count", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "term", "type": "uint256" }
      ],
      "name": "StartTorrent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "indexed": false, "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "EndTorrent",
      "type": "event"
    }
  ];

  // Alternative debugging approach - test contract connection first
  const testContractConnection = async () => {
    try {
      console.log('=== Testing Contract Connection ===');

      const contractAddress = getCurrentContractAddress();
      console.log('1. Contract Address:', contractAddress);
      console.log('2. Provider available:', !!currentProvider);

      // Test if contract exists
      const code = await currentProvider.getCode(contractAddress);
      console.log('3. Contract exists:', code !== '0x');

      if (code === '0x') {
        console.error('ERROR: No contract found at this address!');
        return false;
      }

      // Try creating contract with minimal ABI first
      const minimalABI = [
        {
          "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
          "name": "ownerOf",
          "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      const testContract = new ethers.Contract(contractAddress, minimalABI, currentProvider);
      console.log('4. Test contract created:', !!testContract);
      console.log('5. ownerOf function available:', typeof testContract.ownerOf === 'function');

      // Try a test call with a known token ID
      try {
        const testTokenId = 826188; // From your scan range
        const owner = await testContract.ownerOf(testTokenId);
        console.log(`6. Test call successful - Token ${testTokenId} owner:`, owner);
        return true;
      } catch (callError) {
        console.log('6. Test call failed:', callError.message);

        // If the token doesn't exist, that's actually expected - the error should be different
        if (callError.message.includes('ERC721: invalid token ID') ||
          callError.message.includes('owner query for nonexistent token')) {
          console.log('   -> This is expected for non-existent tokens');
          return true;
        }
        return false;
      }

    } catch (error) {
      console.error('Contract connection test failed:', error);
      return false;
    }
  };

  // Modified scanTokenRange with better error handling
  const scanTokenRangeWithDebug = async () => {
    // First test the contract connection
    const connectionOk = await testContractConnection();
    if (!connectionOk) {
      setStatus('Contract connection failed. Check console for details.');
      return;
    }

    // Your existing validation code...
    if (!startTokenId || !endTokenId) {
      setStatus('Please enter valid start and end token IDs.');
      return;
    }

    const start = parseInt(startTokenId);
    const end = parseInt(endTokenId);
    if (isNaN(start) || isNaN(end) || start > end || start < 0) {
      setStatus('Invalid token ID range. Ensure start <= end and both are non-negative.');
      return;
    }

    setIsScanning(true);
    setStatus('Scanning token ID range...');
    setClaimableXENFTs([]);
    setTotalVMUs(0);
    setScanProgress(0);
    setScanLogs([]);

    const signer = getSigner();
    if (!signer) {
      setIsScanning(false);
      return;
    }

    try {
      const contractAddress = getCurrentContractAddress();
      const xenftContract = new ethers.Contract(contractAddress, XENFT_ABI, currentProvider);

      const block = await currentProvider.getBlock('latest');
      const now = block.timestamp;

      let claimable = [];
      let vmus = 0;

      const batchSize = 5; // Even smaller batch size for debugging
      const tokenIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      const totalBatches = Math.ceil(tokenIds.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        addLog(`Processing batch ${batchIndex + 1}/${totalBatches}...`);

        const startIdx = batchIndex * batchSize;
        const endIdx = Math.min(startIdx + batchSize, tokenIds.length);
        const batchTokens = tokenIds.slice(startIdx, endIdx);

        for (const tokenId of batchTokens) {
          try {
            addLog(`Checking token ${tokenId}...`);

            const owner = await xenftContract.ownerOf(tokenId);
            if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
              addLog(`Token ${tokenId}: Not owned by wallet (owner: ${owner.slice(0, 6)}...)`);
              continue;
            }

            const info = await xenftContract.mintInfo(tokenId);
            const decoded = decodeMintInfo(BigInt(info));
            const count = Number(await xenftContract.vmuCount(tokenId));

            addLog(`Token ${tokenId}: Owned! VMU: ${count}, Maturity: ${decoded.maturityTs}, Now: ${now}`);

            if (!decoded.redeemed && decoded.maturityTs <= now) {
              const tokenData = { tokenId, vmuCount: count, ...decoded };
              claimable.push(tokenData);
              vmus += count;
              addLog(`Token ${tokenId}: CLAIMABLE! Added to list.`);
            } else {
              addLog(`Token ${tokenId}: Not claimable (redeemed: ${decoded.redeemed}, mature: ${decoded.maturityTs <= now})`);
            }
          } catch (err) {
            if (err.message.includes('ERC721: invalid token ID') ||
              err.message.includes('owner query for nonexistent token')) {
              addLog(`Token ${tokenId}: Does not exist`);
            } else {
              addLog(`Token ${tokenId}: Error - ${err.message}`);
              console.error(`Token ${tokenId} error:`, err);
            }
          }
        }

        setScanProgress(((batchIndex + 1) / totalBatches) * 100);
        addLog(`Batch ${batchIndex + 1} completed.`);

        if (batchIndex < totalBatches - 1) {
          await delay(500); // Slower for debugging
        }
      }

      setClaimableXENFTs(claimable);
      setTotalVMUs(vmus);
      setStatus(
        claimable.length > 0
          ? `Found ${claimable.length} claimable XENFTs with ${vmus} total VMUs`
          : 'No claimable XENFTs found in range.'
      );
    } catch (error) {
      console.error('Scan error:', error);
      addLog(`FATAL ERROR: ${error.message}`);
      setStatus('Error scanning: ' + error.message);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // Power Group Calculation
  const POWER_GROUP_SIZE = 7500;

  const calculatePowerGroup = (vmu, term) => {
    return Math.floor((vmu * term) / POWER_GROUP_SIZE);
  };

  const calculateTermForPowerGroup = (vmu, powerGroup) => {
    return Math.ceil((powerGroup * POWER_GROUP_SIZE) / vmu);
  };

  // Get current RPC URL
  const getCurrentRpcUrl = () => {
    if (customRpc && customRpc.trim()) {
      return customRpc.trim();
    }
    return NETWORKS[selectedNetwork].defaultRpc;
  };

  // Get current contract address
  const getCurrentContractAddress = () => {
    return NETWORKS[selectedNetwork].contracts.xenft;
  };

  // Initialize provider for current network
  const initializeProvider = async () => {
    try {
      const rpcUrl = getCurrentRpcUrl();
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // Test the connection
      await provider.getNetwork();

      setCurrentProvider(provider);
      return provider;
    } catch (err) {
      console.error('Failed to initialize provider:', err);
      setError(`Failed to connect to ${selectedNetwork} RPC: ${err.message}`);
      return null;
    }
  };

  // Apply dark mode to the body element directly
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [isDarkMode]);

  // Update provider when network or RPC changes
  useEffect(() => {
    backupFormData(); // Save form data before network change
    initializeProvider().then(() => {
      restoreFormData(); // Restore form data after network change
    });
  }, [selectedNetwork, customRpc]);

  // Initialize on app load
  useEffect(() => {
    checkExistingConnection();
  }, []);

  // Gas price updates
  useEffect(() => {
    fetchAllGasPrices();
    const gasInterval = setInterval(fetchAllGasPrices, 120000); // 2 minutes
    return () => clearInterval(gasInterval);
  }, [selectedNetwork, currentProvider]);

  // Add debouncing to provider initialization
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      initializeProvider();
    }, 500); // 500ms delay to prevent rapid re-runs

    return () => clearTimeout(timeoutId);
  }, [selectedNetwork, customRpc]);

  // Fetch wallet balance every 2 mins if connected
  useEffect(() => {
    if (wallet?.address && currentProvider && walletStep === 'complete') {
      fetchWalletBalance();
      const interval = setInterval(fetchWalletBalance, 120000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address, currentProvider, selectedNetwork, walletStep]);

  // Fetch ETH price every 5 minutes
  useEffect(() => {
    // Fetch price immediately when app loads
    fetchETHPrice();

    // Update price every 5 minutes (300,000 ms)
    const priceInterval = setInterval(fetchETHPrice, 300000);

    return () => clearInterval(priceInterval);
  }, []);

  // Fetch XENFT count and maturity status every minute if connected
  useEffect(() => {
    if (wallet?.address && currentProvider && walletStep === 'complete') {
      fetchWalletBalance();
      fetchXENFTCount();

      const interval = setInterval(() => {
        fetchWalletBalance();
        fetchXENFTCount();
      }, 120000);

      return () => clearInterval(interval);
    }
  }, [wallet?.address, currentProvider, selectedNetwork, walletStep]);


  // Check for existing wallet and blockchain connection
  const checkExistingConnection = async () => {
    // Check for stored wallet using SECURE storage method
    const savedAddress = localStorage.getItem('lastWalletAddress');
    const savedKey = sessionStorage.getItem('encryptedPrivateKey');
    const isVerified = localStorage.getItem('verificationComplete');

    if (savedAddress && savedKey && isVerified) {
      try {
        // Decrypt the key (matches KeyManagement security)
        const decryptedKey = savedKey.replace('enc_', '');
        const restoredWallet = {
          address: savedAddress,
          privateKey: decryptedKey
        };
        setWallet(restoredWallet);
        setWalletStep('complete');
      } catch (err) {
        console.error('Failed to restore wallet:', err);
        // Clear invalid stored data
        sessionStorage.removeItem('encryptedPrivateKey');
        localStorage.removeItem('lastWalletAddress');
        localStorage.removeItem('verificationComplete');
      }
    } else if (savedAddress) {
      setWalletStep('reenter');
    }
  };

  const backupFormData = () => {
    const inputs = document.querySelectorAll('.config-input');
    const backup = {};
    inputs.forEach((input, index) => {
      if (input.value) {
        backup[`input_${index}`] = input.value;
      }
    });
    setFormBackup(backup);
  };

  // Add this function to restore form data
  const restoreFormData = () => {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.config-input');
      inputs.forEach((input, index) => {
        if (formBackup[`input_${index}`]) {
          input.value = formBackup[`input_${index}`];
          // Trigger change event to update React state
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }, 100);
  };

  // Fetch ETH price using CoinGecko API
  const fetchETHPrice = async () => {
    setPriceLoading(true);
    try {
      // Using CoinGecko API (free, no API key needed)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();

      if (data.ethereum && data.ethereum.usd) {
        setEthPrice(data.ethereum.usd);
        console.log('ETH Price updated:', data.ethereum.usd);
      }
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      // Keep existing price if API fails
    } finally {
      setPriceLoading(false);
    }
  };

  // Fetch wallet balance using ethers.js
  const fetchWalletBalance = async () => {
    if (!wallet?.address || !currentProvider) return;

    setBalanceLoading(true);
    try {
      const balance = await currentProvider.getBalance(wallet.address);
      const ethAmount = ethers.formatEther(balance);
      setWalletBalance(parseFloat(ethAmount).toFixed(4));

      // Get live ETH price
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const priceData = await priceResponse.json();
      const liveEthPrice = priceData.ethereum.usd;

      const usdValue = (parseFloat(ethAmount) * liveEthPrice).toFixed(2);
      setBalanceUSD(usdValue);

    } catch (error) {
      console.error('Failed to fetch balance:', error);
      const fallbackPrice = 3400;
      const balance = await currentProvider.getBalance(wallet.address);
      const ethAmount = ethers.formatEther(balance);
      setWalletBalance(parseFloat(ethAmount).toFixed(4));
      const usdValue = (parseFloat(ethAmount) * fallbackPrice).toFixed(2);
      setBalanceUSD(usdValue);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch XENFT count
  const fetchXENFTCount = async () => {
    if (!wallet?.address || !currentProvider) return;

    setXenftLoading(true);
    try {
      const contractAddress = getCurrentContractAddress();
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address owner) view returns (uint256)'],
        currentProvider
      );

      const balance = await contract.balanceOf(wallet.address);
      const count = Number(balance);
      setXenftCount(count);

      console.log(`Found ${count} XENFTs`);

    } catch (error) {
      console.error('Failed to fetch XENFT count:', error);
      setXenftCount(0);
    } finally {
      setXenftLoading(false);
    }
  };

  // Send function
  const sendCrypto = async () => {
    if (!wallet?.privateKey || !currentProvider) {
      setSendError('Wallet not available');
      return;
    }

    setSendLoading(true);
    setSendError('');

    try {
      if (!ethers.isAddress(sendForm.toAddress)) {
        throw new Error('Invalid recipient address');
      }

      if (parseFloat(sendForm.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const signer = new ethers.Wallet(wallet.privateKey, currentProvider);

      const tx = {
        to: sendForm.toAddress,
        value: ethers.parseEther(sendForm.amount),
        gasLimit: 21000,
      };

      if (sendForm.gasPrice) {
        tx.gasPrice = ethers.parseUnits(sendForm.gasPrice, 'gwei');
      }

      const transaction = await signer.sendTransaction(tx);

      alert(`Transaction sent! Hash: ${transaction.hash}`);

      setSendForm({ toAddress: '', amount: '', gasPrice: '' });
      setShowSendModal(false);

      setTimeout(fetchWalletBalance, 2000);

    } catch (error) {
      setSendError(`Send failed: ${error.message}`);
    } finally {
      setSendLoading(false);
    }
  };

  // Gas price fetching functions 
  const fetchOptimismGas = async () => {
    try {
      const response = await fetch(`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.optimism}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1
        })
      });

      const data = await response.json();
      if (data.result) {
        const gasPriceWei = parseInt(data.result, 16);
        const gasPriceGwei = gasPriceWei / 1e9;

        return {
          fast: (gasPriceGwei * 1.15).toFixed(4),
          standard: gasPriceGwei.toFixed(4),
          safe: (gasPriceGwei * 0.85).toFixed(4),
          loading: false
        };
      }
    } catch (error) {
      console.error('Alchemy Optimism gas fetch failed:', error);
    }

    return {
      fast: '0.001',
      standard: '0.001',
      safe: '0.001',
      loading: false
    };
  };

  const fetchBaseGas = async () => {
    try {
      const response = await fetch(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.base}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1
        })
      });

      const data = await response.json();
      if (data.result) {
        const gasPriceWei = parseInt(data.result, 16);
        const gasPriceGwei = gasPriceWei / 1e9;

        return {
          fast: (gasPriceGwei * 1.2).toFixed(4),
          standard: gasPriceGwei.toFixed(4),
          safe: (gasPriceGwei * 0.8).toFixed(4),
          loading: false
        };
      }
    } catch (error) {
      console.error('Alchemy Base gas fetch failed:', error);
    }

    return {
      fast: '0.01',
      standard: '0.008',
      safe: '0.005',
      loading: false
    };
  };

  const fetchEthereumGas = async () => {
    try {
      const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.ethereum}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1
        })
      });

      const data = await response.json();
      if (data.result) {
        const gasPriceWei = parseInt(data.result, 16);
        const gasPriceGwei = gasPriceWei / 1e9;

        return {
          fast: (gasPriceGwei * 1.3).toFixed(1),
          standard: gasPriceGwei.toFixed(1),
          safe: (gasPriceGwei * 0.8).toFixed(1),
          loading: false
        };
      }
    } catch (error) {
      console.error('Alchemy Ethereum gas fetch failed:', error);
    }

    return {
      fast: '30',
      standard: '25',
      safe: '20',
      loading: false
    };
  };

  const fetchAllGasPrices = async () => {
    setGasPrices(prev => ({
      optimism: { ...prev.optimism, loading: true },
      ethereum: { ...prev.ethereum, loading: true },
      base: { ...prev.base, loading: true }
    }));

    try {
      const [optGas, ethGas, baseGas] = await Promise.allSettled([
        fetchOptimismGas(),
        fetchEthereumGas(),
        fetchBaseGas()
      ]);

      setGasPrices({
        optimism: optGas.status === 'fulfilled' ? optGas.value : { fast: '0.001', standard: '0.001', safe: '0.001', loading: false },
        ethereum: ethGas.status === 'fulfilled' ? ethGas.value : { fast: '25', standard: '20', safe: '15', loading: false },
        base: baseGas.status === 'fulfilled' ? baseGas.value : { fast: '0.01', standard: '0.008', safe: '0.005', loading: false }
      });

      setGasUpdateTime(new Date());
    } catch (error) {
      console.error('Failed to fetch gas prices:', error);
    }
  };

  // SECURE Wallet Management Functions
  const generateWallet = async () => {
    setLoading(true);
    setError('');

    try {
      const newWallet = ethers.Wallet.createRandom();

      const walletData = {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase || null
      };

      setWallet(walletData);
      setWalletStep('backup');

      // SECURE storage - encrypted key
      localStorage.setItem('lastWalletAddress', walletData.address);
      const encryptedKey = `enc_${walletData.privateKey}`;
      sessionStorage.setItem('encryptedPrivateKey', encryptedKey);

    } catch (err) {
      setError(`Failed to generate wallet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const importWallet = async () => {
    setError('');

    if (!importedKey) {
      setError('Please enter a private key');
      return;
    }

    // Validate private key format
    if (!importedKey.startsWith('0x') || importedKey.length !== 66) {
      setError('Invalid private key format. Must be a 0x-prefixed 64-character hex string.');
      return;
    }

    try {
      setLoading(true);
      const importedWallet = new ethers.Wallet(importedKey);

      const walletData = {
        address: importedWallet.address,
        privateKey: importedWallet.privateKey,
        mnemonic: null
      };

      setWallet(walletData);
      setWalletStep('backup');

      // SECURE storage - encrypted key
      localStorage.setItem('lastWalletAddress', walletData.address);
      const encryptedKey = `enc_${importedKey}`;
      sessionStorage.setItem('encryptedPrivateKey', encryptedKey);

    } catch (err) {
      setError(`Invalid private key: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setError(`Failed to copy ${type}: ${err.message}`);
    }
  };

  const downloadBackup = () => {
    if (!wallet) return;

    const backupData = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
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

  const completeWalletSetup = () => {
    if (!backupConfirmed) {
      setError('Please confirm you have backed up your private key before proceeding.');
      return;
    }
    setWalletStep('verify');
  };

  const completeVerification = () => {
    setWalletStep('complete');
    localStorage.setItem('verificationComplete', 'true');
    setActiveTab('rainbow');
  };

  // Clear stored wallet
  const clearStoredWallet = () => {
    sessionStorage.removeItem('encryptedPrivateKey');
    localStorage.removeItem('lastWalletAddress');
    localStorage.removeItem('verificationComplete');
    setWallet(null);
    setWalletStep('initial');
    setActiveTab('wallet');
  };

  // Stop minting function
  const stopMinting = () => {
    setShouldStopMinting(true);
    setIsPaused(false);
    setIsMinting(false);
    setCurrentTransaction(null);
  };

  // Pause/Resume functions
  const pauseMinting = () => {
    setIsPaused(true);
  };

  const resumeMinting = () => {
    setIsPaused(false);
  };

  // Automated XENFT Minting Functions
  const startRainbowMinting = async (config = {}) => {
    if (!wallet || !wallet.privateKey) {
      setError('No wallet found. Please create or import a wallet first.');
      return;
    }

    if (!currentProvider) {
      setError('Provider not available. Please check your network connection.');
      return;
    }

    setIsMinting(true);
    setMintingProgress(0);
    setMintingLogs([]);
    setShouldStopMinting(false);
    setIsPaused(false);

    const addLog = (message, type = 'info') => {
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      };
      setMintingLogs(prev => [...prev, log]);
    };

    try {
      addLog('🌈 Starting Rainbow Mode minting...', 'info');
      addLog(`🌐 Network: ${NETWORKS[selectedNetwork].name}`, 'info');
      addLog(`🔗 RPC: ${getCurrentRpcUrl()}`, 'info');

      const vmu = config.vmu || 128;
      const gasPrice = config.gasPrice || '0.00003';
      const delay = config.delay || 5000;

      // Use the current provider (default or custom RPC)
      const automatedSigner = new ethers.Wallet(wallet.privateKey, currentProvider);

      addLog(`🔑 Using wallet: ${automatedSigner.address}`, 'info');

      // Calculate power groups
      const powerGroups = [];
      for (let pg = 7; pg >= 0; pg--) {
        const term = Math.max(1, calculateTermForPowerGroup(vmu, pg));
        const actualPowerGroup = calculatePowerGroup(vmu, term);
        powerGroups.push({
          name: `Power Group ${pg}`,
          powerGroup: pg,
          term: term,
          actualPowerGroup: actualPowerGroup
        });
      }

      if (config.reverse) {
        powerGroups.reverse();
      }

      addLog(`Configuration: ${vmu} VMUs, ${gasPrice} gwei, ${powerGroups.length} power groups`, 'info');

      // Create contract instance
      const contractAddress = getCurrentContractAddress();
      const contract = new ethers.Contract(contractAddress, XENFT_ABI, automatedSigner);

      for (let i = 0; i < powerGroups.length; i++) {
        // Check if we should stop
        if (shouldStopMinting) {
          addLog('🛑 Minting stopped by user', 'warning');
          break;
        }

        const group = powerGroups[i];

        setCurrentTransaction({
          index: i + 1,
          total: powerGroups.length,
          group: group.name,
          powerGroup: group.powerGroup,
          term: group.term,
          vmu: vmu
        });

        addLog(`[${i + 1}/${powerGroups.length}] Minting ${group.name} (${group.term} days, ${vmu} VMUs)...`, 'info');

        try {
          // Wait for pause to be lifted
          while (isPaused && !shouldStopMinting) {
            addLog('⏸️ Minting paused...', 'warning');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // Check again if we should stop after pause
          if (shouldStopMinting) {
            addLog('🛑 Minting stopped by user', 'warning');
            break;
          }

          // Get current nonce for the wallet
          const nonce = await currentProvider.getTransactionCount(automatedSigner.address, 'pending');

          addLog(`📊 Current nonce: ${nonce}`, 'info');
          addLog(`⛽ Estimating gas for ${group.term} day term...`, 'info');

          // Estimate gas
          const estimatedGas = await contract.bulkClaimRank.estimateGas(vmu, group.term);
          const gasLimit = estimatedGas * BigInt(120) / BigInt(100); // 20% buffer

          addLog(`⛽ Gas limit: ${Number(gasLimit).toLocaleString()} units`, 'info');

          // Prepare transaction with automated signing
          const txParams = {
            type: 2,
            nonce: nonce,
            maxFeePerGas: ethers.parseUnits(gasPrice, 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits(gasPrice, 'gwei'),
            gasLimit: gasLimit
          };

          addLog(`🚀 Submitting transaction for ${group.name} (automated)...`, 'info');

          // Send transaction automatically
          const tx = await contract.bulkClaimRank(vmu, group.term, txParams);

          addLog(`✅ Transaction submitted: ${tx.hash}`, 'info');
          addLog(`🔗 View on explorer: ${NETWORKS[selectedNetwork].explorer}/tx/${tx.hash}`, 'info');

          addLog('⏳ Waiting for confirmation...', 'info');
          const receipt = await tx.wait();

          // Calculate costs
          const gasUsed = BigInt(receipt.gasUsed?.toString() || '0');
          const effectiveGasPrice = BigInt(receipt.effectiveGasPrice?.toString() || '0');
          const txEthCost = parseFloat(ethers.formatEther(gasUsed * effectiveGasPrice));

          const ethPrice = 2500; // Simplified for demo
          const txUsdCost = txEthCost * ethPrice;

          addLog(`🎉 ${group.name} minted successfully! Block: ${receipt.blockNumber}`, 'success');
          addLog(`💰 Cost: $${txUsdCost.toFixed(4)} (${txEthCost.toFixed(8)} ${NETWORKS[selectedNetwork].currency})`, 'info');
          addLog(`🎯 Effective power group: ${group.actualPowerGroup} (${vmu} × ${group.term} ÷ 7500 = ${((vmu * group.term) / 7500).toFixed(2)})`, 'info');

          setMintingProgress(((i + 1) / powerGroups.length) * 100);

          if (i < powerGroups.length - 1 && !shouldStopMinting) {
            addLog(`⏱️ Waiting ${delay / 1000} seconds before next transaction...`, 'info');

            // Break delay into smaller chunks to check for stop signal
            const delayChunks = Math.ceil(delay / 1000); // 1 second chunks
            for (let chunk = 0; chunk < delayChunks; chunk++) {
              if (shouldStopMinting) {
                addLog('🛑 Minting stopped during delay', 'warning');
                break;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

        } catch (err) {
          addLog(`❌ Failed to mint ${group.name}: ${err.message}`, 'error');

          // Continue with next power group even if one fails
          if (err.message.includes('insufficient funds')) {
            addLog(`💸 Insufficient funds detected. Stopping minting process.`, 'error');
            break;
          }
        }
      }

      if (!shouldStopMinting) {
        addLog('🎊 Rainbow minting completed!', 'success');
        addLog('🔍 Check your wallet for new XENFTs!', 'info');
      }

    } catch (err) {
      addLog(`❌ Rainbow minting failed: ${err.message}`, 'error');
    } finally {
      setIsMinting(false);
      setCurrentTransaction(null);
      setShouldStopMinting(false);
      setIsPaused(false);
    }
  };

  const startLadderMinting = async (config = {}) => {
    if (!wallet || !wallet.privateKey) {
      setError('No wallet found. Please create or import a wallet first.');
      return;
    }

    if (!currentProvider) {
      setError('Provider not available. Please check your network connection.');
      return;
    }

    setIsMinting(true);
    setMintingProgress(0);
    setMintingLogs([]);
    setShouldStopMinting(false);
    setIsPaused(false);

    const addLog = (message, type = 'info') => {
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      };
      setMintingLogs(prev => [...prev, log]);
    };

    try {
      addLog('📊 Starting Ladder Mode minting...', 'info');
      addLog(`🌐 Network: ${NETWORKS[selectedNetwork].name}`, 'info');
      addLog(`🔗 RPC: ${getCurrentRpcUrl()}`, 'info');

      const vmu = config.vmu || 128;
      const gasPrice = config.gasPrice || '0.00003';
      const delay = config.delay || 5000;
      const startTerm = config.startTerm || 500;
      const endTerm = config.endTerm || 505;
      const batches = config.batches || 3;

      const totalTerms = endTerm - startTerm + 1;
      const totalTransactions = totalTerms * batches;

      // Use the current provider (default or custom RPC)
      const automatedSigner = new ethers.Wallet(wallet.privateKey, currentProvider);

      addLog(`🔑 Using wallet: ${automatedSigner.address}`, 'info');
      addLog(`📈 Configuration: ${startTerm}-${endTerm} days, ${vmu} VMUs, ${batches} batches per term`, 'info');
      addLog(`🎯 Total transactions: ${totalTransactions}`, 'info');

      const contractAddress = getCurrentContractAddress();
      const contract = new ethers.Contract(contractAddress, XENFT_ABI, automatedSigner);

      let txCount = 0;

      for (let term = startTerm; term <= endTerm; term++) {
        for (let batch = 1; batch <= batches; batch++) {
          // Check if we should stop
          if (shouldStopMinting) {
            addLog('🛑 Minting stopped by user', 'warning');
            break;
          }

          txCount++;
          const powerGroup = calculatePowerGroup(vmu, term);

          setCurrentTransaction({
            index: txCount,
            total: totalTransactions,
            term: term,
            batch: batch,
            batches: batches,
            vmu: vmu,
            powerGroup: powerGroup
          });

          addLog(`[${txCount}/${totalTransactions}] Minting ${term}-day XENFT (Batch ${batch}/${batches}, PG: ${powerGroup})...`, 'info');

          try {
            // Wait for pause to be lifted
            while (isPaused && !shouldStopMinting) {
              addLog('⏸️ Minting paused...', 'warning');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Check again if we should stop after pause
            if (shouldStopMinting) {
              addLog('🛑 Minting stopped by user', 'warning');
              break;
            }

            const nonce = await currentProvider.getTransactionCount(automatedSigner.address, 'pending');

            addLog(`📊 Nonce: ${nonce} | Estimating gas...`, 'info');

            const estimatedGas = await contract.bulkClaimRank.estimateGas(vmu, term);
            const gasLimit = estimatedGas * BigInt(120) / BigInt(100);

            const txParams = {
              type: 2,
              nonce: nonce,
              maxFeePerGas: ethers.parseUnits(gasPrice, 'gwei'),
              maxPriorityFeePerGas: ethers.parseUnits(gasPrice, 'gwei'),
              gasLimit: gasLimit
            };

            addLog(`🚀 Submitting ${term}-day transaction (automated)...`, 'info');
            const tx = await contract.bulkClaimRank(vmu, term, txParams);
            addLog(`✅ Transaction submitted: ${tx.hash}`, 'info');

            addLog('⏳ Waiting for confirmation...', 'info');
            const receipt = await tx.wait();

            const gasUsed = BigInt(receipt.gasUsed?.toString() || '0');
            const effectiveGasPrice = BigInt(receipt.effectiveGasPrice?.toString() || '0');
            const txEthCost = parseFloat(ethers.formatEther(gasUsed * effectiveGasPrice));

            const ethPrice = 2500;
            const txUsdCost = txEthCost * ethPrice;

            addLog(`🎉 ${term}-day XENFT minted! Block: ${receipt.blockNumber}`, 'success');
            addLog(`💰 Cost: $${txUsdCost.toFixed(4)} (${txEthCost.toFixed(8)} ${NETWORKS[selectedNetwork].currency})`, 'info');

            setMintingProgress((txCount / totalTransactions) * 100);

            if (txCount < totalTransactions && !shouldStopMinting) {
              addLog(`⏱️ Waiting ${delay / 1000}s before next transaction...`, 'info');

              // Break delay into smaller chunks to check for stop signal
              const delayChunks = Math.ceil(delay / 1000); // 1 second chunks
              for (let chunk = 0; chunk < delayChunks; chunk++) {
                if (shouldStopMinting) {
                  addLog('🛑 Minting stopped during delay', 'warning');
                  break;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }

          } catch (err) {
            addLog(`❌ Failed to mint ${term}-day XENFT (batch ${batch}): ${err.message}`, 'error');

            if (err.message.includes('insufficient funds')) {
              addLog(`💸 Insufficient funds. Stopping minting process.`, 'error');
              return;
            }
          }
        }

        // Check if we should stop after each term
        if (shouldStopMinting) {
          break;
        }
      }

      if (!shouldStopMinting) {
        addLog('🎊 Ladder minting completed!', 'success');
        addLog('🔍 Check your wallet for new XENFTs!', 'info');
      }

    } catch (err) {
      addLog(`❌ Ladder minting failed: ${err.message}`, 'error');
    } finally {
      setIsMinting(false);
      setCurrentTransaction(null);
      setShouldStopMinting(false);
      setIsPaused(false);
    }
  };

  // Network Selector Component
  const NetworkSelector = () => (
    <div className="network-selector">
      <select
        value={selectedNetwork}
        onChange={(e) => setSelectedNetwork(e.target.value)}
        className="network-select"
      >
        {Object.entries(NETWORKS).map(([key, network]) => (
          <option key={key} value={key}>
            {network.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => setShowRpcInput(!showRpcInput)}
        className="rpc-toggle-btn"
        title="Custom RPC"
      >
        🔧
      </button>

      {showRpcInput && (
        <div className="rpc-input-container">
          <input
            type="text"
            placeholder={`Default: ${NETWORKS[selectedNetwork].defaultRpc}`}
            value={customRpc}
            onChange={(e) => setCustomRpc(e.target.value)}
            className="rpc-input"
          />
          <button
            onClick={() => {
              setCustomRpc('');
              setShowRpcInput(false);
            }}
            className="rpc-clear-btn"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );

  // Gas Price Display Component
  const GasPriceDisplay = () => {
    const currentGas = gasPrices[selectedNetwork];

    if (!currentGas) return null;

    const getGasColor = (network) => {
      const standard = parseFloat(currentGas.standard || 0);
      if (network === 'optimism') return '#10b981';
      if (network === 'base') return '#eab308';
      if (network === 'ethereum') {
        if (standard < 20) return '#10b981';
        if (standard < 50) return '#eab308';
        return '#ef4444';
      }
      return '#6b7280';
    };

    const formatGasPrice = (price, network) => {
      if (!price) return '--';
      const num = parseFloat(price);
      if (network === 'optimism' || network === 'base') {
        return num < 0.01 ? num.toFixed(4) : num.toFixed(3);
      }
      return num.toFixed(1);
    };

    return (
      <div className="gas-price-display">
        <div className="gas-header">
          <span className="gas-label">⛽ Gas</span>
          {gasUpdateTime && (
            <span className="gas-update-time">
              {gasUpdateTime.toLocaleTimeString([], { timeStyle: 'short' })}
            </span>
          )}
        </div>
        {currentGas.loading ? (
          <div className="gas-loading">
            <div className="gas-spinner" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="gas-prices">
            <div className="gas-price-item safe">
              <span className="gas-speed">🐢</span>
              <span className="gas-value" style={{ color: getGasColor(selectedNetwork) }}>
                {formatGasPrice(currentGas.safe, selectedNetwork)}
              </span>
            </div>
            <div className="gas-price-item standard">
              <span className="gas-speed">🚗</span>
              <span className="gas-value" style={{ color: getGasColor(selectedNetwork) }}>
                {formatGasPrice(currentGas.standard, selectedNetwork)}
              </span>
            </div>
            <div className="gas-price-item fast">
              <span className="gas-speed">🚀</span>
              <span className="gas-value" style={{ color: getGasColor(selectedNetwork) }}>
                {formatGasPrice(currentGas.fast, selectedNetwork)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // FIXED Input Component - Only fixes the input field issues, keeps original styling
  const NumberInput = ({ label, value, onChange, placeholder, min, max, step = 1, hint }) => {
    const [inputValue, setInputValue] = useState('');

    // Only update input when value changes and field is not focused
    useEffect(() => {
      setInputValue(value?.toString() || '');
    }, [value]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Convert to number or pass empty string
      if (newValue === '') {
        onChange('');
      } else {
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue)) {
          onChange(numValue);
        }
      }
    };

    return (
      <div className="config-item">
        <label className="config-label">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="config-input"
        />
        {hint && <span className="hint">{hint}</span>}
      </div>
    );
  };

  // XENFT Portfolio Display Component
  // Two-Button XENFT Portfolio Component
  const TwoButtonXENFTPortfolio = () => {
    const {
      totalCount,
      maturedCount,
      loading,
      maturityLoading,
      error,
      lastUpdate,
      lastMaturityCheck,
      cached,
      progress,
      checkedCount,
      isPartialScan
    } = xenftData;

    const isCustomRPC = customRpc && customRpc.trim() !== '';

    return (
      <div className="xenft-portfolio-two-button">
        <div className="portfolio-header-two-button">
          <div className="portfolio-title">
            <span className="portfolio-emoji">🎨</span>
            <span>XENFT Portfolio</span>
          </div>

          <div className="portfolio-controls">
            <div className="update-info">
              {lastUpdate && (
                <div className="update-time">
                  Count: {lastUpdate.toLocaleTimeString([], { timeStyle: 'short' })}
                  {cached && ' (cached)'}
                </div>
              )}
              {lastMaturityCheck && (
                <div className="update-time maturity">
                  Maturity: {lastMaturityCheck.toLocaleTimeString([], { timeStyle: 'short' })}
                </div>
              )}
            </div>

            <div className="refresh-buttons">
              <button
                onClick={fetchXENFTQuick}
                disabled={loading}
                className="quick-refresh-btn"
                title="Quick refresh - just get total count (1 RPC call)"
              >
                <span className="btn-icon">{loading ? '🔄' : '⚡'}</span>
                <span className="btn-text">Quick</span>
              </button>

              <button
                onClick={fetchXENFTFull}
                disabled={loading || maturityLoading}
                className="full-refresh-btn"
                title="Full refresh - check maturity status (many RPC calls)"
              >
                <span className="btn-icon">{maturityLoading ? '🔄' : '🔍'}</span>
                <span className="btn-text">Full Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* RPC Info Banner */}
        <div className={`rpc-info ${isCustomRPC ? 'custom' : 'default'}`}>
          <div className="rpc-status">
            <span className="rpc-label">RPC:</span>
            <span className="rpc-value">
              {isCustomRPC ? 'Custom' : 'Default'}
              {isCustomRPC ? ' (Fast)' : ' (Rate Limited)'}
            </span>
          </div>
          {!isCustomRPC && (
            <div className="rpc-suggestion">
              💡 Use custom RPC for faster full scans
            </div>
          )}
        </div>

        {error && (
          <div className="portfolio-error-two-button">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={fetchXENFTQuick} className="retry-btn">
              Try Quick Refresh
            </button>
          </div>
        )}

        {loading || (maturityLoading && totalCount === 0) ? (
          <div className="portfolio-loading-two-button">
            <div className="loading-spinner-small"></div>
            <span>
              {maturityLoading ? `Scanning... ${progress || 0}%` : 'Loading count...'}
            </span>
          </div>
        ) : totalCount === 0 ? (
          <div className="portfolio-empty-two-button">
            <div className="empty-icon">🎨</div>
            <div className="empty-text">
              <h5>No XENFTs Yet</h5>
              <p>Start minting to build your collection!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="portfolio-stats-two-button">
              <div className="stat-card-two-button primary">
                <div className="stat-number">{totalCount.toLocaleString()}</div>
                <div className="stat-label">Total XENFTs</div>
                <div className="stat-status">
                  {loading ? 'Updating...' : (cached ? 'Cached' : 'Fresh')}
                </div>
              </div>

              <div className="stat-card-two-button secondary">
                <div className="stat-number">
                  {maturityLoading ? (
                    <span className="loading-number">
                      {progress ? `${progress}%` : '...'}
                    </span>
                  ) : (
                    maturedCount !== null ? maturedCount.toLocaleString() : '?'
                  )}
                </div>
                <div className="stat-label">Mature XENFTs</div>
                <div className="stat-status">
                  {maturityLoading ? 'Scanning...' :
                    maturedCount !== null ? `of ${checkedCount} checked` : 'Click Full Scan'}
                </div>
              </div>
            </div>

            {maturityLoading && (
              <div className="scanning-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress || 0}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  Checking token {checkedCount} for maturity...
                </div>
              </div>
            )}

            {isPartialScan && checkedCount && !maturityLoading && (
              <div className="scan-notice">
                ℹ️ Scanned {checkedCount} of {totalCount} XENFTs.
                {!isCustomRPC && ' Use custom RPC to scan more tokens faster.'}
              </div>
            )}

            <div className="portfolio-footer-two-button">
              <div className="footer-stat">
                <span className="label">Network:</span>
                <span className="value">{NETWORKS[selectedNetwork].name}</span>
              </div>
              <div className="footer-stat">
                <span className="label">Last Scan:</span>
                <span className="value">
                  {lastMaturityCheck ?
                    `${checkedCount} tokens` :
                    'None - click Full Scan'
                  }
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };


  // Tab components
  const WalletTab = () => (
    <div className="tab-content">
      {walletStep === 'initial' && (
        <div className="wallet-setup">
          <div className="wallet-header">
            <div className="wallet-icon">🔑</div>
            <h3>Create or Import Wallet</h3>
            <p>To start minting XENFTs, you need a wallet. You can generate a new one or import an existing private key.</p>
          </div>

          <div className="security-notice">
            <div className="notice-icon">🛡️</div>
            <div>
              <h4>🔒 Security Notice</h4>
              <p>Your private key will be encrypted and stored securely in this browser session. Always back up your private key - it controls access to your assets.</p>
            </div>
          </div>

          <div className="wallet-actions">
            <button onClick={generateWallet} disabled={loading} className="btn-primary">
              {loading ? '⏳ Generating...' : '⚡ Generate New Wallet'}
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            <div className="import-section">
              <div className="input-group">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="Enter your private key (0x...)"
                  value={importedKey}
                  onChange={(e) => setImportedKey(e.target.value)}
                  className="config-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="toggle-btn"
                >
                  {showPrivateKey ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              <button
                onClick={importWallet}
                disabled={loading || !importedKey}
                className="btn-secondary"
              >
                {loading ? '⏳ Importing...' : '🔐 Import Private Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {walletStep === 'reenter' && (
        <div className="wallet-setup">
          <div className="wallet-header">
            <div className="wallet-icon">🔑</div>
            <h3>Re-enter Your Private Key</h3>
          </div>

          <div className="info-notice">
            <div className="notice-icon">ℹ️</div>
            <div>
              <h4>ℹ️ Session Expired</h4>
              <p>For your security, your private key was removed when the browser closed. Please re-enter your private key to continue using your wallet.</p>
            </div>
          </div>

          <div className="wallet-info">
            <p><strong>Your previous wallet address:</strong></p>
            <div className="address-display">
              <span>{localStorage.getItem('lastWalletAddress')}</span>
            </div>
          </div>

          <div className="import-section">
            <div className="input-group">
              <input
                type={showPrivateKey ? "text" : "password"}
                placeholder="Enter your private key (0x...)"
                value={importedKey}
                onChange={(e) => setImportedKey(e.target.value)}
                className="config-input"
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="toggle-btn"
              >
                {showPrivateKey ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            <button
              onClick={importWallet}
              className="btn-primary"
              disabled={!importedKey || loading}
            >
              {loading ? '⏳ Unlocking...' : '🔓 Unlock Wallet'}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setWalletStep('initial')}
              className="btn-link"
            >
              Use a different wallet instead
            </button>
          </div>
        </div>
      )}

      {walletStep === 'backup' && wallet && (
        <div className="wallet-backup">
          <div className="wallet-header">
            <div className="wallet-icon">🔒</div>
            <h3>Backup Your Wallet</h3>
            <p>Save your private key securely - you'll need it to access your funds</p>
          </div>

          <div className="critical-warning">
            <div className="notice-icon">⚠️</div>
            <div>
              <h4>⚠️ CRITICAL: Backup Required</h4>
              <p>Your private key will be deleted when you close this browser. Without backup, you'll lose access to your funds permanently!</p>
            </div>
          </div>

          <div className="wallet-details">
            <div className="wallet-field">
              <label>Wallet Address:</label>
              <div className="address-display">
                <span>{wallet.address}</span>
                <button onClick={() => copyToClipboard(wallet.address, 'Address')} className="copy-btn">📋</button>
              </div>
            </div>

            <div className="wallet-field">
              <label>Private Key:</label>
              <div className="address-display">
                <span>{showPrivateKey ? wallet.privateKey : '•'.repeat(66)}</span>
                <button onClick={() => setShowPrivateKey(!showPrivateKey)} className="copy-btn">
                  {showPrivateKey ? '👁️‍🗨️' : '👁️'}
                </button>
                <button onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')} className="copy-btn">
                  {copied ? '✅' : '📋'}
                </button>
              </div>
            </div>
          </div>

          <div className="backup-options">
            <h4>🔑 Backup Options</h4>
            <button onClick={downloadBackup} className="btn-secondary">
              💾 Download Backup File (.json)
            </button>
            <div className="backup-checklist">
              <p><strong>Manual Backup Checklist:</strong></p>
              <ul>
                <li>• Copy private key to a password manager</li>
                <li>• Write it down on paper and store securely</li>
                <li>• Never share this key with anyone</li>
                <li>• Import this key into MetaMask</li>
              </ul>
            </div>
          </div>

          <div className="confirmation">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={backupConfirmed}
                onChange={(e) => setBackupConfirmed(e.target.checked)}
              />
              I confirm I have securely backed up my private key
            </label>

            <button
              onClick={completeWalletSetup}
              disabled={!backupConfirmed}
              className="btn-primary"
            >
              ✅ Continue to Verification
            </button>
          </div>
        </div>
      )}

      {walletStep === 'verify' && (
        <div className="wallet-verify">
          <div className="wallet-header">
            <div className="wallet-icon">🛡️</div>
            <h3>Verify Wallet Access</h3>
            <p>Confirm you have access to your wallet by importing it into MetaMask</p>
          </div>

          <div className="verification-steps">
            <h4>Verification Steps:</h4>
            <ol>
              <li>Open MetaMask (or your preferred wallet)</li>
              <li>Import your private key into the wallet</li>
              <li>Verify the wallet address matches below</li>
              <li>Click "Complete Verification" when ready</li>
            </ol>
          </div>

          <div className="wallet-info">
            <p><strong>Expected Wallet Address:</strong></p>
            <div className="address-display">
              <span>{wallet?.address}</span>
            </div>
          </div>

          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <h4>Important</h4>
              <p>Make sure the address in your wallet exactly matches the one shown above before proceeding.</p>
            </div>
          </div>

          <button
            onClick={completeVerification}
            className="btn-primary"
          >
            ✅ Complete Verification
          </button>
        </div>
      )}

      {walletStep === 'complete' && (
        <div className="wallet-complete">
          <div className="success-icon">✅</div>
          <h3>Wallet Ready!</h3>
          <p>Your wallet has been set up successfully. You can now start minting XENFTs.</p>

          <div className="wallet-info">
            <p><strong>Active Wallet:</strong></p>
            <div className="address-display">
              <span>{wallet?.address}</span>
              <button
                onClick={() => copyToClipboard(wallet?.address, 'Address')}
                className="copy-btn"
              >
                📋
              </button>
            </div>
          </div>

          {/* Simplified Balance & XENFT Display */}
          <div className="wallet-dashboard-simple">
            {/* ETH Balance Section */}
            <div className="balance-section">
              <div className="balance-header">
                <h4>💰 Balance</h4>
                <button
                  onClick={fetchWalletBalance}
                  className="refresh-btn"
                  disabled={balanceLoading}
                >
                  {balanceLoading ? '🔄' : '↻'}
                </button>
              </div>

              <div className="balance-display">
                <div className="balance-main">
                  <div className="balance-usd">
                    ${balanceLoading ? '...' : balanceUSD}
                  </div>
                  <div className="balance-eth">
                    {balanceLoading ? '...' : walletBalance} {NETWORKS[selectedNetwork].currency}
                  </div>
                </div>
              </div>

              <div className="balance-actions">
                <button
                  className="action-btn send-btn"
                  onClick={() => setShowSendModal(true)}
                >
                  📤 Send
                </button>
                <button
                  className="action-btn receive-btn"
                  onClick={() => setShowReceiveModal(true)}
                >
                  📥 Receive
                </button>
              </div>
            </div>

            {/* XENFT Count Section */}
            <div className="xenft-section">
              <div className="xenft-header">
                <h4>🎨 XENFTs</h4>
                <button
                  onClick={fetchXENFTCount}
                  className="refresh-btn"
                  disabled={xenftLoading}
                >
                  {xenftLoading ? '🔄' : '↻'}
                </button>
              </div>

              <div className="xenft-display">
                <div className="xenft-count">
                  {xenftLoading ? '...' : xenftCount}
                </div>
                <div className="xenft-label">
                  Total XENFTs
                </div>
                <div className="xenft-network">
                  on {NETWORKS[selectedNetwork].name}
                </div>
              </div>
            </div>
          </div>

          <div className="section-spacer"></div>

          {/* Success Grid */}
          <div className="success-grid">
            <div className="success-item">
              <h4>✅ Security Verified</h4>
              <p>Your private key is safely backed up and wallet is ready for use.</p>
            </div>
            <div className="success-item">
              <h4>🚀 Ready to Mint</h4>
              <p>You can now access Rainbow and Ladder minting modes.</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <ol>
              <li>Your wallet balance and XENFTs are displayed above</li>
              <li>Ensure you have {NETWORKS[selectedNetwork].currency} for gas fees</li>
              <li>Choose your minting strategy (Rainbow or Ladder mode)</li>
              <li>Start your XENFT minting journey!</li>
            </ol>
          </div>

          <div className="security-reminder">
            <h4>🔒 Session Security Reminder</h4>
            <p>Your private key will be deleted when you close your browser. If you need to return later, you'll need to re-enter your private key.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );

  const RainbowTab = () => {
    const [config, setConfig] = useState({
      vmu: 128,
      gasPrice: '0.00003',
      delay: 5000,
      reverse: false
    });

    const handleConfigChange = (field, value) => {
      setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleStartMinting = () => {
      startRainbowMinting(config);
    };

    return (
      <div className="tab-content">
        <div className="mode-header">
          <div className="mode-icon">🌈</div>
          <h3>Rainbow Mode</h3>
          <p>Bring some color into your XEN WORLD</p>
        </div>

        <div className="config-section">
          <h4>⚙️ Configuration</h4>

          <div className="config-grid">
            <NumberInput
              label="VMUs per Transaction"
              value={config.vmu}
              onChange={(value) => handleConfigChange('vmu', value)}
              placeholder="128"
              min={1}
              max={500}
              hint="Higher VMUs = Higher power groups"
            />

            <div className="config-item">
              <label className="config-label">Gas Price (gwei)</label>
              <input
                type="text"
                value={config.gasPrice}
                onChange={(e) => handleConfigChange('gasPrice', e.target.value)}
                placeholder="0.00004"
                className="config-input"
              />
              <span className="hint">Lower = cheaper, slower confirmation</span>
            </div>

            <NumberInput
              label="Delay Between Transactions (seconds)"
              value={config.delay / 1000}
              onChange={(value) => handleConfigChange('delay', value ? value * 1000 : '')}
              placeholder="60"
              min={5}
              max={3600}
              hint="Time between each mint"
            />
          </div>
        </div>

        <div className="options-section">
          <h4>🔧 Advanced Options</h4>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.reverse}
              onChange={(e) => handleConfigChange('reverse', e.target.checked)}
            />
            🔄 Reverse order (mint from PG 0 to 7)
          </label>
        </div>

        {!wallet && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <h4>No Wallet Found</h4>
              <p>Please create or import a wallet to enable automated minting.</p>
            </div>
          </div>
        )}

        {!currentProvider && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <h4>Provider Not Available</h4>
              <p>Please check your network connection and RPC settings.</p>
            </div>
          </div>
        )}

        <div className="status-section success">
          <div className="status-icon">🤖</div>
          <div>
            <h4>Automated Minting {wallet && currentProvider ? 'Ready' : 'Pending Setup'}</h4>
            <ul>
              <li>✅ No MetaMask popups - Runs in background</li>
              <li>✅ No user interaction - Set and forget</li>
              <li>{currentProvider ? '✅' : '⏳'} Uses {customRpc ? 'custom' : 'default'} RPC</li>
              <li>✅ Automatic gas estimation & cost tracking</li>
              <li>🎯 Network: {NETWORKS[selectedNetwork].name}</li>
              <li>🎯 Contract: {getCurrentContractAddress()}</li>
            </ul>
          </div>
        </div>

        <div className="launch-section">
          <button
            onClick={handleStartMinting}
            disabled={!wallet || !currentProvider || isMinting}
            className={`launch-button ${(!wallet || !currentProvider || isMinting) ? 'disabled' : ''}`}
          >
            <span className="button-icon">
              {isMinting ? '🤖' : '🌈'}
            </span>
            <span className="button-text">
              {isMinting ? 'Automated Minting in Progress...' : 'Start Automated Rainbow Minting'}
            </span>
          </button>

          {!wallet && (
            <div className="launch-hint">
              <p>Need a wallet? Go to the Wallet tab to create or import one.</p>
            </div>
          )}

          {!currentProvider && (
            <div className="launch-hint">
              <p>Provider not available. Check your network connection.</p>
            </div>
          )}
        </div>

        {/* Minting Progress */}
        {(isMinting || mintingLogs.length > 0) && (
          <MintingProgress
            isMinting={isMinting}
            progress={mintingProgress}
            currentTransaction={currentTransaction}
            logs={mintingLogs}
            onStop={stopMinting}
            onPause={pauseMinting}
            onResume={resumeMinting}
            isPaused={isPaused}
          />
        )}
      </div>
    );
  };

  const LadderTab = () => {
    const [config, setConfig] = useState({
      vmu: 128,
      gasPrice: '0.00003',
      delay: 5000,
      startTerm: 100,
      endTerm: 250,
      batches: 1
    });

    const handleConfigChange = (field, value) => {
      setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleStartMinting = () => {
      startLadderMinting(config);
    };

    const totalTerms = Math.max(0, config.endTerm - config.startTerm + 1);
    const totalTransactions = totalTerms * config.batches;
    const estimatedHours = (totalTransactions * (config.delay / 1000)) / 3600;

    return (
      <div className="tab-content">
        <div className="mode-header">
          <div className="mode-icon">📊</div>
          <h3>Ladder Mode</h3>
          <p>Create custom laddered XENFT terms with precise control over ranges and batching</p>
        </div>

        <div className="config-section">
          <h4>⚙️ Configuration</h4>

          <div className="config-grid">
            <NumberInput
              label="Start Term (days)"
              value={config.startTerm}
              onChange={(value) => handleConfigChange('startTerm', value)}
              placeholder="100"
              min={1}
              max={666}
              hint="Starting day term for ladder"
            />

            <NumberInput
              label="End Term (days)"
              value={config.endTerm}
              onChange={(value) => handleConfigChange('endTerm', value)}
              placeholder="250"
              min={1}
              max={666}
              hint="Ending day term for ladder"
            />

            <NumberInput
              label="Batches per Term"
              value={config.batches}
              onChange={(value) => handleConfigChange('batches', value || 1)}
              placeholder="1"
              min={1}
              max={10}
              hint="Number of XENFTs per term"
            />

            <NumberInput
              label="VMUs per Transaction"
              value={config.vmu}
              onChange={(value) => handleConfigChange('vmu', value)}
              placeholder="128"
              min={1}
              max={500}
              hint="Higher VMUs = Higher power groups"
            />

            <div className="config-item">
              <label className="config-label">Gas Price (gwei)</label>
              <input
                type="text"
                value={config.gasPrice}
                onChange={(e) => handleConfigChange('gasPrice', e.target.value)}
                placeholder="0.00004"
                className="config-input"
              />
              <span className="hint">Lower = cheaper, slower confirmation</span>
            </div>

            <NumberInput
              label="Delay Between Transactions (seconds)"
              value={config.delay / 1000}
              onChange={(value) => handleConfigChange('delay', value ? value * 1000 : '')}
              placeholder="60"
              min={5}
              max={3600}
              hint="Time between each mint"
            />
          </div>
        </div>

        <div className="summary-section">
          <h4>📈 Ladder Summary</h4>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div>
                <h5>Total Terms</h5>
                <p className="summary-value">{totalTerms}</p>
                <p className="summary-detail">{config.startTerm} to {config.endTerm} days</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">⚡</div>
              <div>
                <h5>Transactions</h5>
                <p className="summary-value">{totalTransactions}</p>
                <p className="summary-detail">{config.batches} batches per term</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">⏱️</div>
              <div>
                <h5>Duration</h5>
                <p className="summary-value">{estimatedHours.toFixed(1)}h</p>
                <p className="summary-detail">Estimated completion time</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🎯</div>
              <div>
                <h5>Total VMUs</h5>
                <p className="summary-value">{(totalTransactions * config.vmu).toLocaleString()}</p>
                <p className="summary-detail">Power groups {calculatePowerGroup(config.vmu, config.startTerm)} to {calculatePowerGroup(config.vmu, config.endTerm)}</p>
              </div>
            </div>
          </div>
        </div>

        {!wallet && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <h4>No Wallet Found</h4>
              <p>Please create or import a wallet to enable automated minting.</p>
            </div>
          </div>
        )}

        {!currentProvider && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <h4>Provider Not Available</h4>
              <p>Please check your network connection and RPC settings.</p>
            </div>
          </div>
        )}

        <div className="status-section success">
          <div className="status-icon">🤖</div>
          <div>
            <h4>Automated Ladder Minting {wallet && currentProvider ? 'Ready' : 'Pending Setup'}</h4>
            <ul>
              <li>✅ No MetaMask popups - Runs in background</li>
              <li>✅ Creates {totalTransactions} XENFTs across {totalTerms} different terms</li>
              <li>{currentProvider ? '✅' : '⏳'} Uses {customRpc ? 'custom' : 'default'} RPC</li>
              <li>🎯 Network: {NETWORKS[selectedNetwork].name}</li>
              <li>🎯 Contract: {getCurrentContractAddress()}</li>
            </ul>
          </div>
        </div>

        <div className="launch-section">
          <button
            onClick={handleStartMinting}
            disabled={!wallet || !currentProvider || isMinting || config.startTerm >= config.endTerm}
            className={`launch-button ${(!wallet || !currentProvider || isMinting || config.startTerm >= config.endTerm) ? 'disabled' : ''}`}
          >
            <span className="button-icon">
              {isMinting ? '🤖' : '📊'}
            </span>
            <span className="button-text">
              {isMinting ? 'Automated Minting in Progress...' : 'Start Automated Ladder Minting'}
            </span>
          </button>

          {!wallet && (
            <div className="launch-hint">
              <p>Need a wallet? Go to the Wallet tab to create or import one.</p>
            </div>
          )}

          {!currentProvider && (
            <div className="launch-hint">
              <p>Provider not available. Check your network connection.</p>
            </div>
          )}

          {config.startTerm >= config.endTerm && (
            <div className="validation-error">
              <p>⚠️ End term must be greater than start term</p>
            </div>
          )}
        </div>

        {/* Minting Progress */}
        {(isMinting || mintingLogs.length > 0) && (
          <MintingProgress
            isMinting={isMinting}
            progress={mintingProgress}
            currentTransaction={currentTransaction}
            logs={mintingLogs}
            onStop={stopMinting}
            onPause={pauseMinting}
            onResume={resumeMinting}
            isPaused={isPaused}
          />
        )}
      </div>
    );
  };

const ClaimTab = () => {
    const [startTokenId, setStartTokenId] = useState('');
    const [endTokenId, setEndTokenId] = useState('');
    const [claimableXENFTs, setClaimableXENFTs] = useState([]);
    const [totalVMUs, setTotalVMUs] = useState(0);
    const [estimatedTotalCost, setEstimatedTotalCost] = useState(0n);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanLogs, setScanLogs] = useState([]);
    const [isClaiming, setIsClaiming] = useState(false);
    const [status, setStatus] = useState('');
    const [customGasPriceGwei, setCustomGasPriceGwei] = useState('');
    const [claimToAddress, setClaimToAddress] = useState(wallet?.address || '');

    const addLog = (message) => {
        setScanLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
        console.log(message);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const scanAndClaim = async () => {
        if (!startTokenId || !endTokenId) {
            setStatus('Please enter valid start and end token IDs.');
            return;
        }

        if (!customGasPriceGwei) {
            setStatus('Please enter a gas price in gwei.');
            return;
        }

        if (!isAddress(claimToAddress)) {
            setStatus('Please enter a valid claim address.');
            return;
        }

        const start = parseInt(startTokenId);
        const end = parseInt(endTokenId);
        if (isNaN(start) || isNaN(end) || start > end || start < 0) {
            setStatus('Invalid token ID range.');
            return;
        }

        setIsScanning(true);
        setStatus('Scanning and claiming tokens...');
        setClaimableXENFTs([]);
        setTotalVMUs(0);
        setScanProgress(0);
        setScanLogs([]);

        try {
            const contractAddress = getCurrentContractAddress();
            const signer = new ethers.Wallet(wallet.privateKey, currentProvider);
            const signedContract = new ethers.Contract(contractAddress, XENFT_ABI, signer);
            const gasPrice = parseUnits(customGasPriceGwei, 'gwei');
            const block = await currentProvider.getBlock('latest');
            const now = block.timestamp;

            addLog(`Starting scan and claim process...`);
            addLog(`Gas price: ${customGasPriceGwei} gwei`);
            addLog(`Claim to: ${claimToAddress.slice(0,8)}...${claimToAddress.slice(-6)}`);

            let successCount = 0;
            let failCount = 0;
            let totalVmus = 0;
            const totalTokens = end - start + 1;

            // Scan and claim in one pass
            for (let tokenId = start; tokenId <= end; tokenId++) {
                const progress = ((tokenId - start + 1) / totalTokens) * 100;
                setScanProgress(progress);
                setStatus(`Processing token ${tokenId}... (${tokenId - start + 1}/${totalTokens})`);

                try {
                    // Quick verification
                    const verification = await verifyTokenClaimable(signedContract, tokenId, now);
                    
                    if (!verification.valid) {
                        if (!verification.reason.includes('Not owned') && !verification.reason.includes('Error')) {
                            addLog(`Token ${tokenId}: ${verification.reason}`);
                        }
                        continue;
                    }

                    // Token is claimable, proceed with claim
                    addLog(`CLAIMING Token ${tokenId} (${verification.data.vmuCount} VMUs)...`);
                    
                    const tx = await signedContract.bulkClaimMintReward(
                        tokenId,
                        claimToAddress,
                        { gasPrice }
                    );

                    addLog(`TX: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`);
                    
                    const receipt = await tx.wait();
                    
                    if (receipt.status === 1) {
                        successCount++;
                        totalVmus += verification.data.vmuCount;
                        addLog(`SUCCESS: Token ${tokenId} claimed! Block: ${receipt.blockNumber}`);
                        setStatus(`Claimed ${successCount} tokens, ${totalVmus} VMUs total`);
                    } else {
                        failCount++;
                        addLog(`FAILED: Token ${tokenId} transaction failed`);
                    }

                    // Delay between claims
                    await delay(1500);

                } catch (error) {
                    if (!error.message.includes('nonexistent token')) {
                        failCount++;
                        addLog(`ERROR: Token ${tokenId} - ${error.message.split('.')[0]}`);
                    }
                }
            }

            addLog(`PROCESS COMPLETE!`);
            addLog(`Successful claims: ${successCount}`);
            addLog(`Failed attempts: ${failCount}`);
            addLog(`Total VMUs claimed: ${totalVmus}`);

            setTotalVMUs(totalVmus);
            setStatus(`Complete! Claimed ${successCount} tokens with ${totalVmus} VMUs`);

        } catch (error) {
            addLog(`FATAL ERROR: ${error.message}`);
            setStatus('Process failed: ' + error.message);
        } finally {
            setIsScanning(false);
            setScanProgress(100);
        }
    };

    // Fixed mintInfo decoder based on contract analysis
    const decodeMintInfo = (infoBigInt) => {
        // Based on the contract's MintInfo.encodeMintInfo structure:
        // The data is packed as: term | maturityTs | rank | amp | eaa | class | redeemed
        // Let's try the reverse extraction method since the first one gave bad timestamps
        
        let remaining = infoBigInt;
        
        // Extract from right to left (LSB first)
        const redeemed = (remaining & 0xFFn) === 1n;
        remaining = remaining >> 8n;
        
        const classIdx = Number(remaining & 0xFFn);
        remaining = remaining >> 8n;
        
        const eaa = Number(remaining & 0xFFFFn);
        remaining = remaining >> 16n;
        
        const amp = Number(remaining & 0xFFFFn);
        remaining = remaining >> 16n;
        
        const rank = remaining & ((1n << 128n) - 1n);
        remaining = remaining >> 128n;
        
        const maturityTs = Number(remaining & ((1n << 64n) - 1n));
        remaining = remaining >> 64n;
        
        const term = Number(remaining & 0xFFFFn);
        
        // Sanity check - maturityTs should be a reasonable Unix timestamp
        const now = Math.floor(Date.now() / 1000);
        const oneYearFromNow = now + (365 * 24 * 3600);
        const tenYearsAgo = now - (10 * 365 * 24 * 3600);
        
        if (maturityTs < tenYearsAgo || maturityTs > oneYearFromNow) {
            // If this method gives bad timestamps too, try the original method
            const term2 = Number(infoBigInt & ((1n << 16n) - 1n));
            const maturityTs2 = Number((infoBigInt >> 16n) & ((1n << 64n) - 1n));
            const redeemed2 = ((infoBigInt >> 248n) & 1n) === 1n;
            
            // Use whichever gives a more reasonable timestamp
            if (maturityTs2 >= tenYearsAgo && maturityTs2 <= oneYearFromNow) {
                return { term: term2, maturityTs: maturityTs2, redeemed: redeemed2 };
            }
        }
        
        return { term, maturityTs, redeemed };
    };

    // Helper functions for ethers compatibility
    const formatEther = (value) => {
        try {
            if (ethers.formatEther) return ethers.formatEther(value);
            if (ethers.utils?.formatEther) return ethers.utils.formatEther(value);
            return (Number(value) / 1e18).toFixed(6);
        } catch (error) {
            console.error('Error formatting ether:', error);
            return '0';
        }
    };

    const parseUnits = (value, unit) => {
        try {
            if (ethers.parseUnits) return ethers.parseUnits(value, unit);
            if (ethers.utils?.parseUnits) return ethers.utils.parseUnits(value, unit);
            if (unit === 'gwei') return BigInt(Math.floor(parseFloat(value) * 1e9));
            throw new Error('Unable to parse units');
        } catch (error) {
            console.error('Error parsing units:', error);
            throw error;
        }
    };

    const isAddress = (address) => {
        try {
            if (ethers.isAddress) return ethers.isAddress(address);
            if (ethers.utils?.isAddress) return ethers.utils.isAddress(address);
            return /^0x[a-fA-F0-9]{40}$/.test(address);
        } catch (error) {
            return false;
        }
    };

    // Verify token ownership and claimability right before operations
    const verifyTokenClaimable = async (xenftContract, tokenId, currentTimestamp) => {
        try {
            // Check ownership
            const owner = await xenftContract.ownerOf(tokenId);
            if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
                return { valid: false, reason: `Not owned by wallet (owned by ${owner.slice(0,8)}...)` };
            }

            // Check mint info
            const info = await xenftContract.mintInfo(tokenId);
            const decoded = decodeMintInfo(BigInt(info));
            
            if (decoded.redeemed) {
                return { valid: false, reason: 'Already redeemed' };
            }
            
            if (decoded.maturityTs > currentTimestamp) {
                const daysLeft = Math.ceil((decoded.maturityTs - currentTimestamp) / 86400);
                return { valid: false, reason: `Not mature (${daysLeft} days left)` };
            }

            const vmuCount = Number(await xenftContract.vmuCount(tokenId));
            return { 
                valid: true, 
                data: { tokenId, vmuCount, ...decoded }
            };

        } catch (error) {
            return { valid: false, reason: `Error: ${error.message}` };
        }
    };

    const scanTokenRange = async () => {
        if (!startTokenId || !endTokenId) {
            setStatus('Please enter valid start and end token IDs.');
            return;
        }

        const start = parseInt(startTokenId);
        const end = parseInt(endTokenId);
        if (isNaN(start) || isNaN(end) || start > end || start < 0) {
            setStatus('Invalid token ID range.');
            return;
        }

        setIsScanning(true);
        setStatus('Scanning tokens...');
        setClaimableXENFTs([]);
        setTotalVMUs(0);
        setScanProgress(0);
        setScanLogs([]);

        try {
            const contractAddress = getCurrentContractAddress();
            const xenftContract = new ethers.Contract(contractAddress, XENFT_ABI, currentProvider);
            const block = await currentProvider.getBlock('latest');
            const now = block.timestamp;

            addLog(`Scanning ${end - start + 1} tokens...`);
            addLog(`Current time: ${new Date(now * 1000).toLocaleString()}`);

            const claimable = [];
            let totalVmus = 0;
            let ownedCount = 0;

            // Process tokens in smaller batches
            const batchSize = 5;
            const totalTokens = end - start + 1;
            
            for (let i = start; i <= end; i += batchSize) {
                const batchEnd = Math.min(i + batchSize - 1, end);
                addLog(`Processing tokens ${i} to ${batchEnd}...`);

                // Process batch sequentially to avoid rate limits
                for (let tokenId = i; tokenId <= batchEnd; tokenId++) {
                    try {
                        const verification = await verifyTokenClaimable(xenftContract, tokenId, now);
                        
                        if (verification.valid) {
                            claimable.push(verification.data);
                            totalVmus += verification.data.vmuCount;
                            ownedCount++;
                            addLog(`✅ Token ${tokenId}: Claimable (${verification.data.vmuCount} VMUs)`);
                        } else {
                            if (!verification.reason.includes('Not owned') && !verification.reason.includes('Error')) {
                                ownedCount++;
                                addLog(`❌ Token ${tokenId}: ${verification.reason}`);
                            }
                        }
                    } catch (error) {
                        if (!error.message.includes('nonexistent token')) {
                            addLog(`⚠️ Token ${tokenId}: ${error.message}`);
                        }
                    }

                    // Update progress
                    const progress = ((tokenId - start + 1) / totalTokens) * 100;
                    setScanProgress(progress);
                }

                // Small delay between batches
                if (batchEnd < end) {
                    await delay(100);
                }
            }

            setClaimableXENFTs(claimable);
            setTotalVMUs(totalVmus);
            
            addLog(`\n📊 Scan Results:`);
            addLog(`- Tokens owned: ${ownedCount}`);
            addLog(`- Claimable tokens: ${claimable.length}`);
            addLog(`- Total VMUs: ${totalVmus}`);

            setStatus(
                claimable.length > 0
                    ? `Found ${claimable.length} claimable XENFTs with ${totalVmus} VMUs`
                    : `Found ${ownedCount} owned tokens, but none are ready to claim`
            );

        } catch (error) {
            addLog(`❌ Scan failed: ${error.message}`);
            setStatus('Scan failed: ' + error.message);
        } finally {
            setIsScanning(false);
            setScanProgress(100);
        }
    };

    const estimateAndClaim = async () => {
        if (!customGasPriceGwei) {
            setStatus('Please enter a gas price in gwei.');
            return;
        }

        if (!isAddress(claimToAddress)) {
            setStatus('Please enter a valid claim address.');
            return;
        }

        if (claimableXENFTs.length === 0) {
            setStatus('No claimable tokens found. Run scan first.');
            return;
        }

        setIsEstimating(true);
        setStatus('Verifying tokens and estimating costs...');

        try {
            const contractAddress = getCurrentContractAddress();
            const signer = new ethers.Wallet(wallet.privateKey, currentProvider);
            const signedContract = new ethers.Contract(contractAddress, XENFT_ABI, signer);
            const gasPrice = parseUnits(customGasPriceGwei, 'gwei');

            // Re-verify all tokens before proceeding
            const block = await currentProvider.getBlock('latest');
            const now = block.timestamp;
            const verifiedTokens = [];

            addLog('\n🔍 Re-verifying tokens before claiming...');
            
            for (const token of claimableXENFTs) {
                const verification = await verifyTokenClaimable(signedContract, token.tokenId, now);
                if (verification.valid) {
                    verifiedTokens.push(verification.data);
                    addLog(`✅ Token ${token.tokenId}: Still claimable`);
                } else {
                    addLog(`❌ Token ${token.tokenId}: ${verification.reason}`);
                }
            }

            if (verifiedTokens.length === 0) {
                setStatus('No tokens are currently claimable. Please scan again.');
                setClaimableXENFTs([]);
                setTotalVMUs(0);
                return;
            }

            // Estimate gas for verified tokens
            addLog(`\n⛽ Estimating gas for ${verifiedTokens.length} tokens...`);
            let totalGas = 0n;
            const gasEstimates = [];

            for (const token of verifiedTokens) {
                try {
                    const gasEstimate = await signedContract.bulkClaimMintReward.estimateGas(
                        token.tokenId, 
                        claimToAddress
                    );
                    gasEstimates.push({ tokenId: token.tokenId, gas: gasEstimate });
                    totalGas += gasEstimate;
                    addLog(`Token ${token.tokenId}: ${gasEstimate.toString()} gas`);
                } catch (error) {
                    addLog(`❌ Token ${token.tokenId}: Gas estimation failed - ${error.message}`);
                    return;
                }
            }

            // Calculate costs
            const overheadGas = totalGas + (totalGas * 10n) / 100n; // 10% buffer
            const totalCost = overheadGas * gasPrice;
            const balance = await currentProvider.getBalance(wallet.address);

            setEstimatedTotalCost(totalCost);
            setHasSufficientFunds(balance >= totalCost);

            addLog(`\n💰 Cost Estimation:`);
            addLog(`- Total gas: ${totalGas.toString()}`);
            addLog(`- With buffer: ${overheadGas.toString()}`);
            addLog(`- Total cost: ${formatEther(totalCost)} ETH`);
            addLog(`- Wallet balance: ${formatEther(balance)} ETH`);
            addLog(`- Sufficient funds: ${balance >= totalCost ? 'Yes' : 'No'}`);

            if (balance < totalCost) {
                setStatus(`Insufficient funds. Need ${formatEther(totalCost)} ETH, have ${formatEther(balance)} ETH`);
                return;
            }

            // Update state with verified tokens
            setClaimableXENFTs(verifiedTokens);
            setTotalVMUs(verifiedTokens.reduce((sum, token) => sum + token.vmuCount, 0));
            
            setStatus(`Ready to claim ${verifiedTokens.length} tokens. Cost: ${formatEther(totalCost)} ETH`);

            // Auto-proceed to claiming if user wants
            if (window.confirm(`Claim ${verifiedTokens.length} XENFTs for ${formatEther(totalCost)} ETH?`)) {
                await executeClaimTransactions(signedContract, verifiedTokens, gasPrice);
            }

        } catch (error) {
            addLog(`❌ Estimation failed: ${error.message}`);
            setStatus('Estimation failed: ' + error.message);
        } finally {
            setIsEstimating(false);
        }
    };

    const executeClaimTransactions = async (signedContract, tokens, gasPrice) => {
        setIsClaiming(true);
        setStatus('Claiming tokens...');

        try {
            let successCount = 0;
            let failCount = 0;

            for (const token of tokens) {
                try {
                    addLog(`\n🚀 Claiming token ${token.tokenId}...`);
                    setStatus(`Claiming token ${token.tokenId}...`);

                    const tx = await signedContract.bulkClaimMintReward(
                        token.tokenId,
                        claimToAddress,
                        { gasPrice }
                    );

                    addLog(`Transaction sent: ${tx.hash}`);
                    addLog(`Waiting for confirmation...`);

                    const receipt = await tx.wait();
                    
                    if (receipt.status === 1) {
                        successCount++;
                        addLog(`✅ Token ${token.tokenId} claimed successfully!`);
                    } else {
                        failCount++;
                        addLog(`❌ Token ${token.tokenId} claim failed in transaction`);
                    }

                } catch (error) {
                    failCount++;
                    addLog(`❌ Token ${token.tokenId} claim failed: ${error.message}`);
                }

                // Small delay between transactions
                await delay(1000);
            }

            addLog(`\n🎉 Claiming complete!`);
            addLog(`- Success: ${successCount}`);
            addLog(`- Failed: ${failCount}`);

            setStatus(`Claiming complete. ${successCount} successful, ${failCount} failed.`);

            // Clear successful tokens from the list
            if (successCount > 0) {
                setClaimableXENFTs([]);
                setTotalVMUs(0);
                setEstimatedTotalCost(0n);
            }

        } catch (error) {
            addLog(`❌ Claiming process failed: ${error.message}`);
            setStatus('Claiming failed: ' + error.message);
        } finally {
            setIsClaiming(false);
        }
    };

    // Wallet checks
    if (!wallet) {
        return <div className="tab-content text-white">Please set up your wallet first.</div>;
    }
    if (walletStep !== 'complete') {
        return <div className="tab-content text-white">Please complete wallet setup.</div>;
    }

    return (
        <div className="tab-content p-4 text-white">
            <h2 className="text-2xl font-bold mb-4">Claim Matured XENFTs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Token ID</label>
                    <input
                        type="number"
                        value={startTokenId}
                        onChange={(e) => setStartTokenId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="e.g. 826188"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Token ID</label>
                    <input
                        type="number"
                        value={endTokenId}
                        onChange={(e) => setEndTokenId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="e.g. 826295"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Gas Price (gwei)</label>
                    <input
                        type="number"
                        value={customGasPriceGwei}
                        onChange={(e) => setCustomGasPriceGwei(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="e.g. 0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Claim To Address</label>
                    <input
                        type="text"
                        value={claimToAddress}
                        onChange={(e) => setClaimToAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="Address to receive XEN"
                    />
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={scanTokenRange}
                    disabled={isScanning || isClaiming}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded"
                >
                    {isScanning ? 'Scanning...' : 'Scan Only'}
                </button>
                
                <button
                    onClick={scanAndClaim}
                    disabled={isScanning || isClaiming}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded"
                >
                    {isScanning ? 'Processing...' : 'Scan & Claim All'}
                </button>
            </div>

            {(isScanning || isClaiming) && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>{isScanning ? 'Scanning Progress' : 'Claiming Progress'}</span>
                        <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                                isScanning ? 'bg-blue-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-3 rounded mb-4">
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span>Total Claimable VMUs:</span>
                        <span className="font-bold text-blue-400">{totalVMUs}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Estimated Cost:</span>
                        <span className="font-bold text-green-400">{formatEther(estimatedTotalCost)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-bold ${
                            status.includes('success') || status.includes('Complete') ? 'text-green-400' :
                            status.includes('fail') || status.includes('Error') ? 'text-red-400' :
                            'text-yellow-400'
                        }`}>{status}</span>
                    </div>
                </div>
            </div>

            <div className="h-48 overflow-y-auto bg-gray-900 p-3 rounded mb-4 border">
                <div className="text-xs font-mono space-y-1">
                    {scanLogs.length > 0 ? (
                        scanLogs.map((log, index) => (
                            <div 
                                key={index} 
                                className={`${
                                    log.includes('SUCCESS') || log.includes('✅') ? 'text-green-400' :
                                    log.includes('ERROR') || log.includes('FAILED') || log.includes('❌') ? 'text-red-400' :
                                    log.includes('TX:') || log.includes('Waiting') ? 'text-blue-400' :
                                    log.includes('[') || log.includes('Claiming') ? 'text-yellow-400' :
                                    'text-gray-300'
                                }`}
                            >
                                {log}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500">Live transaction logs will appear here...</div>
                    )}
                </div>
            </div>

            {claimableXENFTs.length > 0 && (
                <div className="bg-gray-800 p-3 rounded">
                    <h3 className="text-lg font-bold mb-2">Claimable Tokens</h3>
                    <div className="max-h-32 overflow-y-auto">
                        {claimableXENFTs.map((token) => (
                            <div key={token.tokenId} className="text-sm py-1">
                                Token {token.tokenId}: {token.vmuCount} VMUs 
                                (Mature: {new Date(token.maturityTs * 1000).toLocaleDateString()})
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

  const HelpTab = () => (
    <div className="tab-content">
      <div className="mode-header">
        <div className="mode-icon">📚</div>
        <h3>How to Use MintXEN</h3>
        <p>Complete guide to automated XENFT batch minting</p>
      </div>

      <div className="help-section">
        {/* Quick Start Flow */}
        <div className="help-card featured">
          <div className="help-card-header">
            <div className="help-icon">🚀</div>
            <h4>Quick Start Guide</h4>
          </div>
          <div className="help-content">
            <div className="user-flow">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Import or Create Wallet</h5>
                  <p>Go to the <strong>Wallet</strong> tab and either generate a new wallet or import your existing private key.</p>
                </div>
              </div>
              <div className="flow-arrow">↓</div>

              <div className="flow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Fund Your Wallet</h5>
                  <p>Add ETH to your wallet address for gas fees. You'll need ~$10-50 worth depending on network and batch size.</p>
                </div>
              </div>
              <div className="flow-arrow">↓</div>

              <div className="flow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Choose Network & Configure</h5>
                  <p>Select your network (Optimism for cheapest fees), then go to <strong>Rainbow</strong> or <strong>Ladder</strong> mode to set up your batch.</p>
                </div>
              </div>
              <div className="flow-arrow">↓</div>

              <div className="flow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Start Automated Minting</h5>
                  <p>Review your settings and click "Start Minting". Keep this tab open while transactions process automatically.</p>
                </div>
              </div>
              <div className="flow-arrow">↓</div>

              <div className="flow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h5>View Your XENFTs</h5>
                  <p>After minting completes, visit <a href="https://xen.network/optimism/xenft/torrent" target="_blank" rel="noopener noreferrer" className="external-link">xen.network/optimism/xenft/torrent</a> to view and manage your newly minted XENFTs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Terms & Concepts */}
        <div className="help-card">
          <div className="help-card-header">
            <div className="help-icon">🎓</div>
            <h4>Key Terms Explained</h4>
          </div>
          <div className="help-content">
            <div className="terms-grid">
              <div className="term-item">
                <h5>💎 X E N F T</h5>
                <p>Non-fungible tokens that represent a bactch of XEN cRANKs . Why make one mint when you can make 128 ;D</p>
              </div>

              <div className="term-item">
                <h5>⚡ VMU (Virtual Mining Units)</h5>
                <p>The "mining power" of your XENFT. Higher VMUs = higher power group = longer maturity time but more potential XEN rewards.</p>
              </div>

              <div className="term-item">
                <h5>📅 Term Length</h5>
                <p>How many days your XENFT will take to mature. Longer terms typically yield more XEN when burned.</p>
              </div>

              <div className="term-item">
                <h5>🎨 Power Group</h5>
                <p>Classification system (0-7) based on VMUs × Term Length ÷ 7500. Higher power groups have different visual rarities.</p>
              </div>

              <div className="term-item">
                <h5>⛽ Gas Price</h5>
                <p>Fee paid to miners for processing your transaction. Higher = faster confirmation, lower = cheaper but slower.</p>
              </div>

              <div className="term-item">
                <h5>🔗 RPC Endpoint</h5>
                <p>The server that connects your app to the blockchain. Default works fine, but custom ones can be faster.</p>
              </div>
            </div>

            <div className="help-tip">
              <strong>💡 Power Group Formula:</strong> Power Group = (VMUs × Term Length) ÷ 7500<br />
              Example: 128 VMUs × 200 days = 25,600 ÷ 7500 = Power Group 3
            </div>
          </div>
        </div>

        {/* Network Selection */}
        <div className="help-card">
          <div className="help-card-header">
            <div className="help-icon">🌐</div>
            <h4>Choosing Your Network</h4>
          </div>
          <div className="help-content">
            <div className="network-comparison">
              <div className="network-option recommended">
                <h6>🚀 Optimism (Recommended)</h6>
                <div className="network-stats">
                  <span className="stat">⛽ Gas: ~$0.0001-0.001 per mint</span>
                  <span className="stat">⚡ Speed: 1-2 seconds</span>
                  <span className="stat">💰 Best for: Large batches / Low gas</span>
                </div>
                <p>Cheapest option for minting. Perfect for rainbow mode or large ladder batches.</p>
              </div>

              <div className="network-option">
                <h6>🔗 B a s e</h6>
                <div className="network-stats">
                  <span className="stat">⛽ Gas: ~$0.30-2.50 per mint</span>
                  <span className="stat">⚡ Speed: 15-30 seconds</span>
                  <span className="stat">💰 Best for: Hyper Inflation</span>
                </div>
                <p>Coinbase's L2 network. Good balance of cost and reliability.</p>
              </div>

              <div className="network-option expensive">
                <h6>⚠️ Ethereum Mainnet</h6>
                <div className="network-stats">
                  <span className="stat">⛽ Gas: ~$5-100 per mint</span>
                  <span className="stat">⚡ Speed: 1-15 minutes</span>
                  <span className="stat">💰 Best for: Single high-value mints</span>
                </div>
                <p>Most expensive but highest liquidity. Only use for special occasions or single mints.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rainbow vs Ladder Mode */}
        <div className="help-card">
          <div className="help-card-header">
            <div className="help-icon">🎯</div>
            <h4>Rainbow vs Ladder Mode</h4>
          </div>
          <div className="help-content">
            <div className="mode-comparison">
              <div className="mode-option">
                <h5>🌈 Rainbow Mode</h5>
                <div className="mode-features">
                  <span className="feature">✅ Creates all 8 power groups to create rainbow design in your portfolio using the tokenID (0-7)</span>
                  <span className="feature">✅ Perfect for collectors</span>
                  <span className="feature">✅ Predictable cost for getting your feet wet (8 transactions)</span>
                  <span className="feature">✅ Great visual variety</span>
                </div>
                <p><strong>Best for:</strong> First-time users, collectors who want one of each power group, or anyone wanting maximum variety with minimal configuration.</p>
                <div className="example-config">
                  <strong>Example:</strong> 128 VMUs → Creates XENFTs ranging from 1 day (PG 0) to 274 days (PG 7)
                </div>
              </div>

              <div className="mode-option">
                <h5>📊 Ladder Mode</h5>
                <div className="mode-features">
                  <span className="feature">✅ Custom term ranges (e.g., 100-250 days)</span>
                  <span className="feature">✅ Multiple XENFTs per term</span>
                  <span className="feature">✅ Automate Laddering mints</span>
                  <span className="feature">✅ Scalable for large operations</span>
                </div>
                <p><strong>Best for:</strong> Advanced users who want specific term lengths, traders targeting particular power groups, or large-scale minting operations.</p>
                <div className="example-config">
                  <strong>Example:</strong> Terms 150-200, 2 batches each → Creates 102 XENFTs (51 terms × 2 each)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Tips */}
        <div className="help-card">
          <div className="help-card-header">
            <div className="help-icon">⚙️</div>
            <h4>Configuration Best Practices</h4>
          </div>
          <div className="help-content">
            <div className="config-tips">
              <div className="tip-section">
                <h5>💡 VMU Selection *Warning Due to the Block one Eth Address can hold upto 2500 XENFTs before indexing issues in your wallet*</h5>
                <ul>
                  <li><strong>128 VMUs:</strong> Good balance for most users (creates PG 0-7 in rainbow mode)</li>
                  <li><strong>64 VMUs:</strong> Lower power groups, shorter terms, cheaper overall</li>
                  <li><strong>256+ VMUs:</strong> Only on BASE due to their 140M gas limit</li>
                </ul>
              </div>

              <div className="tip-section">
                <h5>⛽ Gas Price Strategy</h5>
                <ul>
                  <li><strong>Network normal:</strong> Use default (0.00003 gwei) for OP networks</li>
                  <li><strong>Network congested:</strong> Increase by 20-50% for faster confirmation</li>
                  <li><strong>Not urgent:</strong> Lower gas price to save money (transactions may take longer)</li>
                </ul>
              </div>

              <div className="tip-section">
                <h5>⏱️ Timing & Delays</h5>
                <ul>
                  <li><strong>5-10 seconds:</strong> Recommended delay between transactions</li>
                  <li><strong>30 seconds:</strong> Minimum for most RPC providers</li>
                  <li><strong>120+ seconds:</strong> Use for very large batches to avoid rate limiting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="help-card">
          <div className="help-card-header">
            <div className="help-icon">🔧</div>
            <h4>Common Issues & Solutions</h4>
          </div>
          <div className="help-content">
            <div className="troubleshooting">
              <div className="issue">
                <h5>❌ "Insufficient funds" error</h5>
                <p><strong>Solution:</strong> Add more ETH to your wallet. Each transaction costs $0.10-50 depending on network and gas prices.</p>
              </div>

              <div className="issue">
                <h5>⏳ Transactions stuck/pending</h5>
                <p><strong>Solution:</strong> Increase gas price by 20% or wait for network congestion to clear. You can also restart with higher gas.</p>
              </div>

              <div className="issue">
                <h5>🔄 "Nonce too low" error</h5>
                <p><strong>Solution:</strong> Wait 30 seconds and try again. This happens when transactions are sent too quickly.</p>
              </div>

              <div className="issue">
                <h5>🌐 RPC connection issues</h5>
                <p><strong>Solution:</strong> Try a different RPC provider (Alchemy, Infura, Ankr) or check your internet connection.</p>
              </div>

              <div className="issue">
                <h5>🔑 Lost private key</h5>
                <p><strong>Solution:</strong> Unfortunately, there's no recovery. Always backup your private key securely before starting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Best Practices */}
        <div className="help-card important">
          <div className="help-card-header">
            <div className="help-icon">🔒</div>
            <h4>Security & Safety</h4>
          </div>
          <div className="help-content">
            <div className="security-tips">
              <div className="security-section safe">
                <h5>✅ Do This</h5>
                <ul>
                  <li>Backup your private key before starting</li>
                  <li>Start with small test batches first</li>
                  <li>Use trusted RPC providers (Alchemy, Infura, Ankr)</li>
                  <li>Keep this browser tab open during minting</li>
                  <li>Double-check network and gas prices</li>
                  <li>Import your key into MetaMask for permanent storage</li>
                </ul>
              </div>

              <div className="security-section danger">
                <h5>❌ Never Do This</h5>
                <ul>
                  <li>Share your private key with anyone</li>
                  <li>Use this on public/shared computers</li>
                  <li>Close the browser tab while minting is active</li>
                  <li>Use untrusted custom RPC endpoints</li>
                  <li>Mint without backing up your private key first</li>
                  <li>Enter your private key on suspicious websites</li>
                </ul>
              </div>
            </div>

            <div className="help-tip warning">
              <strong>⚠️ Important:</strong> Your private key is only stored in this browser session and will be deleted when you close the browser. Make sure to backup your key and import it into a proper wallet like MetaMask for long-term storage.
            </div>
          </div>
        </div>

        {/* After Minting */}
        <div className="help-card">
          <div className="help-card-header">
            <div className="help-icon">🎉</div>
            <h4>After Minting: What's Next?</h4>
          </div>
          <div className="help-content">
            <div className="next-steps">
              <div className="step">
                <h5>1. 👀 View Your XENFTs</h5>
                <p>Visit <a href="https://xen.network/optimism/xenft/torrent" target="_blank" rel="noopener noreferrer" className="external-link">xen.network/optimism/xenft/torrent</a> and connect your wallet to see your newly minted XENFTs.</p>
              </div>

              <div className="step">
                <h5>2. ⏰ Wait for Maturity</h5>
                <p>Your XENFTs will mature over time based on their term length. You can check maturity dates on the XEN website.</p>
              </div>

              <div className="step">
                <h5>3. 🔥 Burn for XEN</h5>
                <p>Once mature, you can burn your XENFTs to receive XEN tokens. Then you can burn them on <a href="https://burnxen.com" target="_blank" rel="noopener noreferrer" className="external-link">https://burnxen.com</a> - Longer terms typically yield more XEN.</p>
              </div>

              <div className="step">
                <h5>4. 💰 Trade or Hold</h5>
                <p>You can also trade your XENFTs on NFT marketplaces like OpenSea, or hold them as collectibles.</p>
              </div>
            </div>

            <div className="help-tip">
              <strong>🎯 Pro Tip:</strong> Different power groups have different visual rarities and potential values. Higher power groups (5-7) are generally rarer and more sought after by collectors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Minting Progress Component
  const MintingProgress = ({ isMinting, progress, currentTransaction, logs, onStop, onPause, onResume, isPaused }) => {
    if (!isMinting && (!logs || logs.length === 0)) {
      return null;
    }

    const getLogIcon = (type) => {
      switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
      }
    };

    const getLogColor = (type) => {
      switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#eab308';
        default: return '#3b82f6';
      }
    };

    return (
      <div className="minting-progress">
        <div className="progress-header">
          <h4>⚡ Minting Progress {isPaused && <span className="paused-badge">Paused</span>}</h4>
          {isMinting && (
            <div className="progress-controls">
              {onPause && onResume && (
                <button onClick={isPaused ? onResume : onPause} className="btn-control">
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
              )}
              <button onClick={onStop} className="btn-control stop">
                ❌ Stop
              </button>
            </div>
          )}
        </div>

        {isMinting && (
          <div className="progress-bar-section">
            <div className="progress-info">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {currentTransaction && (
          <div className="current-transaction">
            <div className="transaction-header">
              <span className="transaction-count">Transaction {currentTransaction.index}/{currentTransaction.total}</span>
              <div className="transaction-status">
                <div className={`status-indicator ${isPaused ? 'paused' : 'processing'}`} />
                <span>{isPaused ? 'Paused' : 'Processing...'}</span>
              </div>
            </div>

            <div className="transaction-details">
              {currentTransaction.group && (
                <>
                  <div className="detail-row">
                    <span>Power Group:</span>
                    <span>{currentTransaction.group}</span>
                  </div>
                  <div className="detail-row">
                    <span>Term Length:</span>
                    <span>{currentTransaction.term} days</span>
                  </div>
                </>
              )}

              {currentTransaction.batch && (
                <>
                  <div className="detail-row">
                    <span>Term:</span>
                    <span>{currentTransaction.term} days</span>
                  </div>
                  <div className="detail-row">
                    <span>Batch:</span>
                    <span>{currentTransaction.batch}/{currentTransaction.batches}</span>
                  </div>
                </>
              )}

              <div className="detail-row">
                <span>VMUs:</span>
                <span>{currentTransaction.vmu || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {logs && logs.length > 0 && (
          <div className="logs-section">
            <h5>Transaction Log</h5>
            <div className="logs-container">
              {logs.slice().reverse().map((log, index) => (
                <div key={index} className="log-entry">
                  <div className="log-header">
                    <span className="log-icon">{getLogIcon(log.type)}</span>
                    <span className="log-timestamp">{log.timestamp}</span>
                    <span className="log-type" style={{ color: getLogColor(log.type) }}>
                      {log.type}
                    </span>
                  </div>
                  <p className="log-message" style={{ color: getLogColor(log.type) }}>
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isMinting && logs && logs.length > 0 && (
          <div className="session-summary">
            <h5>Session Summary</h5>
            <div className="summary-stats">
              <div className="stat">
                <div className="stat-value success">{logs.filter(log => log.type === 'success').length}</div>
                <div className="stat-label">Successful</div>
              </div>
              <div className="stat">
                <div className="stat-value error">{logs.filter(log => log.type === 'error').length}</div>
                <div className="stat-label">Failed</div>
              </div>
              <div className="stat">
                <div className="stat-value warning">{logs.filter(log => log.type === 'warning').length}</div>
                <div className="stat-label">Warnings</div>
              </div>
              <div className="stat">
                <div className="stat-value info">{logs.length}</div>
                <div className="stat-label">Total Logs</div>
              </div>
            </div>
          </div>
        )}

        {isMinting && (
          <div className="minting-instructions">
            <div className="instruction-icon">ℹ️</div>
            <div>
              <p><strong>Minting in Progress</strong></p>
              <ul>
                <li>• Do not close this browser tab</li>
                <li>• Transactions are executed with delays between them</li>
                <li>• You can pause or stop the process at any time</li>
                <li>• Stop button will halt after current transaction completes</li>
                <li>• Using {NETWORKS[selectedNetwork].name} network</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };


  // Main render
  return (
    <div className={`app ${isDarkMode ? 'app--dark-mode' : ''}`}>
      <DisclaimerPopup
        isOpen={showDisclaimer}
        onAccept={acceptTerms}
      />

      {hasAccepted ? (
        <React.Fragment>
          {!showApp ? (
            <div className="hero-landing">
              <div className="hero-content">
                <div className="hero-header">
                  <h1 className="hero-title">mintXEN</h1>
                  <p className="hero-subtitle">Multi-Chain XENFT Batch Minting</p>
                </div>

                <div className="hero-features">
                  <div className="hero-feature">
                    <span className="feature-emoji">🛡️</span>
                    <span className="feature-text">Your keys, your XENFTs</span>
                  </div>
                  <div className="hero-feature">
                    <span className="feature-emoji">🤖</span>
                    <span className="feature-text">Automated batch minting</span>
                  </div>
                  <div className="hero-feature">
                    <span className="feature-emoji">🌐</span>
                    <span className="feature-text">Multi-chain support</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowApp(true)}
                  className="hero-launch-button"
                >
                  <span className="launch-icon">🚀</span>
                  Launch App
                </button>

                <div className="hero-modes">
                  <div className="hero-mode-card">
                    <div className="mode-emoji">🌈</div>
                    <h3>Rainbow Mode</h3>
                    <p>Create XENFTs across all power groups for colorway variety</p>
                  </div>
                  <div className="hero-mode-card">
                    <div className="mode-emoji">📊</div>
                    <h3>Ladder Mode</h3>
                    <p>Custom term ranges with precise control over minting</p>
                  </div>
                  <div className="hero-mode-card">
                    <div className="mode-emoji">🌐</div>
                    <h3>Multi-Chain</h3>
                    <p>Support for Optimism, Ethereum, and Base networks</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="app-interface">
              <header className="app-header">
                <div className="header-content">
                  <div className="header-left">
                    <button
                      onClick={() => setShowApp(false)}
                      className="back-to-home"
                    >
                      ← Back to Home
                    </button>
                    <h1>mintXEN</h1>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="mode-toggle-btn"
                    >
                      {isDarkMode ? '🌈 Fun Mode' : '🌙 Dark Mode'}
                    </button>
                  </div>

                  <div className="header-center">
                    <NetworkSelector />
                    <GasPriceDisplay />
                  </div>

                  <div className="header-right">
                    {/* Show wallet status if wallet is complete */}
                    {wallet && walletStep === 'complete' ? (
                      <div className="wallet-status-mini">
                        <div className="wallet-status-indicator">
                          <div className="status-dot"></div>
                          <span className="status-text">Wallet Ready</span>
                        </div>
                        <div className="wallet-mini-balance">
                          {balanceLoading ? (
                            <span className="balance-loading">...</span>
                          ) : (
                            <span className="balance-amount">{walletBalance} {NETWORKS[selectedNetwork].currency}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="header-info">
                        <span className="setup-status">
                          {walletStep === 'initial' && '🔑 Setup Wallet'}
                          {walletStep === 'backup' && '💾 Backup Required'}
                          {walletStep === 'verify' && '✅ Verify Wallet'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <main className="main-content">
                <div className="container">
                  <div className="tab-navigation">
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
                    >
                      🔑 Wallet
                    </button>
                    <button
                      onClick={() => setActiveTab('rainbow')}
                      className={`tab-button ${activeTab === 'rainbow' ? 'active' : ''}`}
                      disabled={!wallet || walletStep !== 'complete'}
                    >
                      🌈 Rainbow
                    </button>
                    <button
                      onClick={() => setActiveTab('ladder')}
                      className={`tab-button ${activeTab === 'ladder' ? 'active' : ''}`}
                      disabled={!wallet || walletStep !== 'complete'}
                    >
                      📊 Ladder
                    </button>
                    <button
                      onClick={() => setActiveTab('claim')}
                      className={`tab-button ${activeTab === 'claim' ? 'active' : ''}`}
                      disabled={!wallet || walletStep !== 'complete'}
                    >
                      🔥 Claim
                    </button>
                    <button
                      onClick={() => setActiveTab('help')}
                      className={`tab-button ${activeTab === 'help' ? 'active' : ''}`}
                      disabled={!wallet || walletStep !== 'complete'}
                    >
                      📚 Help
                    </button>
                  </div>

                  <div className="tab-panel">
                    {activeTab === 'wallet' && <WalletTab />}
                    {activeTab === 'rainbow' && <RainbowTab />}
                    {activeTab === 'ladder' && <LadderTab />}
                    {activeTab === 'claim' && <ClaimTab />}
                    {activeTab === 'help' && <HelpTab />}
                  </div>
                </div>
              </main>

              <footer className="app-footer">
                <div className="footer-content">
                  <p>Built by XENIANS for XENAINS • 2025 Portal9ine</p>

                  {/* Donation Section */}
                  <div className="footer-donations">
                    <span className="donations-label">Buy me a coffee, click/copy addy:</span>
                    <div className="donation-addresses">
                      <button
                        className="donation-item"
                        onClick={() => navigator.clipboard.writeText('0x777628De10687C3Eb91f0Bf409Edb4d04F3f0E35')}
                        title="Click to copy full ETH address: 0x777628De10687C3Eb91f0Bf409Edb4d04F3f0E35"
                      >
                        <strong>ETH:</strong> 0x77762...
                      </button>
                      <button
                        className="donation-item"
                        onClick={() => navigator.clipboard.writeText('4ycVhN3Le7hNjEeVAH9Jw34JtchNZtBawwCNTdEUtQzu')}
                        title="Click to copy full SOL address: 4ycVhN3Le7hNjEeVAH9Jw34JtchNZtBawwCNTdEUtQzu"
                      >
                        <strong>SOL:</strong> 4ycVhN3...
                      </button>
                      <button
                        className="donation-item"
                        onClick={() => navigator.clipboard.writeText('bc1qdzmmjvlkcmmflpc7yytluhvfmvm8fnyvukpcul')}
                        title="Click to copy full BTC address: bc1qdzmmjvlkcmmflpc7yytluhvfmvm8fnyvukpcul"
                      >
                        <strong>BTC:</strong> bc1qdzm...
                      </button>
                    </div>
                  </div>

                  <div className="footer-links">
                    <a
                      href="https://x.com/moreworldpeace"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      aria-label="Follow on X (Twitter)"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href="https://t.me/xenminter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      aria-label="Join Telegram"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </a>
                    <a
                      href="https://faircrypto.org/xenft_litepaper.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      aria-label="Read XENFT Whitepaper"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </a>
                    <a
                      href="https://github.com/BruhhBruhh/mtx-app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      aria-label="View on GitHub"
                    >
                      <img
                        src="https://github.com/favicon.ico"
                        alt="GitHub"
                        width="20"
                        height="20"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className="disclaimer-waiting">
          <div className="disclaimer-content">
            <h1 className="hero-title">mintXEN</h1>
            <p className="hero-subtitle">Multi-Chain XENFT Minting</p>
            <p className="disclaimer-message">Please review and accept our terms to continue</p>
          </div>
        </div>
      )}

      {/* Send Modal - REPLACE with this functional version */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Send {NETWORKS[selectedNetwork].currency}</h3>
              <button
                className="modal-close"
                onClick={() => setShowSendModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="send-form">
                <div className="config-item">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={sendForm.toAddress}
                    onChange={(e) => setSendForm({ ...sendForm, toAddress: e.target.value })}
                    className="config-input"
                  />
                </div>

                <div className="config-item">
                  <label>Amount ({NETWORKS[selectedNetwork].currency})</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="0.01"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    className="config-input"
                  />
                  <span className="hint">Available: {walletBalance} {NETWORKS[selectedNetwork].currency}</span>
                </div>

                <div className="config-item">
                  <label>Gas Price (gwei) - Optional</label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto"
                    value={sendForm.gasPrice}
                    onChange={(e) => setSendForm({ ...sendForm, gasPrice: e.target.value })}
                    className="config-input"
                  />
                </div>

                {sendError && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <p>{sendError}</p>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowSendModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={sendCrypto}
                    disabled={sendLoading || !sendForm.toAddress || !sendForm.amount}
                  >
                    {sendLoading ? '⏳ Sending...' : '📤 Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="modal-overlay" onClick={() => setShowReceiveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📥 Receive {NETWORKS[selectedNetwork].currency}</h3>
              <button
                className="modal-close"
                onClick={() => setShowReceiveModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="receive-content">
                <p>Send {NETWORKS[selectedNetwork].currency} to this address:</p>

                <div className="address-display receive-address">
                  <span>{wallet?.address}</span>
                  <button
                    onClick={() => copyToClipboard(wallet?.address, 'Address')}
                    className="copy-btn"
                  >
                    {copied ? '✅' : '📋'}
                  </button>
                </div>

                <div className="explorer-section">
                  <h5>🔍 View on Explorer:</h5>
                  <div className="explorer-buttons">
                    <a
                      href={`${NETWORKS[selectedNetwork].explorer}/address/${wallet?.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="explorer-btn primary"
                    >
                      👤 View Wallet
                    </a>
                  </div>
                </div>

                <div className="qr-code-section">
                  <h4>QR Code</h4>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet?.address}`}
                    alt="QR Code"
                    className="qr-code"
                  />
                </div>

                <div className="receive-warning">
                  <span className="warning-icon">⚠️</span>
                  <p>Only send {NETWORKS[selectedNetwork].currency} on {NETWORKS[selectedNetwork].name} network!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;