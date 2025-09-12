  const ClaimTab = () => {
    const [startTokenId, setStartTokenId] = useState('');
    const [endTokenId, setEndTokenId] = useState('');
    const [claimableXENFTs, setClaimableXENFTs] = useState([]);
    const [totalVMUs, setTotalVMUs] = useState(0);
    const [estimatedTotalCost, setEstimatedTotalCost] = useState(0n);
    const [currentGasPrice, setCurrentGasPrice] = useState(0n);
    const [walletBalanceLocal, setWalletBalanceLocal] = useState(0n);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanLogs, setScanLogs] = useState([]);
    const [isEstimating, setIsEstimating] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [status, setStatus] = useState('');
    const [hasSufficientFunds, setHasSufficientFunds] = useState(false);
    const [customGasPriceGwei, setCustomGasPriceGwei] = useState('');
    const [claimToAddress, setClaimToAddress] = useState(wallet?.address || '');

    // Debug wallet state on render
    console.log('ClaimTab render:', { wallet, walletStep, hasWallet: !!wallet, isComplete: walletStep === 'complete' });

    const decodeMintInfo = (infoBigInt) => {
      const term = Number(infoBigInt & ((1n << 16n) - 1n));
      const maturityTs = Number((infoBigInt >> 16n) & ((1n << 64n) - 1n));
      const rank = (infoBigInt >> 80n) & ((1n << 128n) - 1n);
      const amp = Number((infoBigInt >> 208n) & ((1n << 16n) - 1n));
      const eaa = Number((infoBigInt >> 224n) & ((1n << 16n) - 1n));
      const classIdx = Number((infoBigInt >> 240n) & ((1n << 8n) - 1n));
      const redeemed = ((infoBigInt >> 248n) & 1n) === 1n;
      return { term, maturityTs, rank, amp, eaa, classIdx, redeemed };
    };

    const getSigner = () => {
      if (!wallet?.privateKey || !currentProvider) {
        setStatus('Wallet or provider not available.');
        console.log('getSigner failed:', { hasPrivateKey: !!wallet?.privateKey, hasProvider: !!currentProvider });
        return null;
      }
      try {
        return new ethers.Wallet(wallet.privateKey, currentProvider);
      } catch (error) {
        setStatus('Error loading wallet: ' + error.message);
        console.log('getSigner error:', error.message);
        return null;
      }
    };

    const addLog = (message) => {
      setScanLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper function to format ether - compatible with both ethers v5 and v6
    const formatEther = (value) => {
      try {
        // Try ethers v6 first
        if (ethers.formatEther) {
          return ethers.formatEther(value);
        }
        // Fall back to ethers v5
        if (ethers.utils && ethers.utils.formatEther) {
          return ethers.utils.formatEther(value);
        }
        // Manual conversion as fallback
        return (Number(value) / 1e18).toFixed(6);
      } catch (error) {
        console.error('Error formatting ether:', error);
        return '0';
      }
    };

    // Helper function to parse units - compatible with both ethers v5 and v6
    const parseUnits = (value, unit) => {
      try {
        // Try ethers v6 first
        if (ethers.parseUnits) {
          return ethers.parseUnits(value, unit);
        }
        // Fall back to ethers v5
        if (ethers.utils && ethers.utils.parseUnits) {
          return ethers.utils.parseUnits(value, unit);
        }
        // Manual conversion for gwei
        if (unit === 'gwei') {
          return BigInt(Math.floor(parseFloat(value) * 1e9));
        }
        throw new Error('Unable to parse units');
      } catch (error) {
        console.error('Error parsing units:', error);
        throw error;
      }
    };

    // Helper function to check if address is valid - compatible with both ethers v5 and v6
    const isAddress = (address) => {
      try {
        // Try ethers v6 first
        if (ethers.isAddress) {
          return ethers.isAddress(address);
        }
        // Fall back to ethers v5
        if (ethers.utils && ethers.utils.isAddress) {
          return ethers.utils.isAddress(address);
        }
        // Basic regex check as fallback
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      } catch (error) {
        console.error('Error checking address:', error);
        return false;
      }
    };

    // Enhanced debugging for mintInfo decoding and maturity checking
    const debugDecodeMintInfo = (infoBigInt, tokenId, currentTimestamp) => {
      console.log(`\n=== Debugging Token ${tokenId} ===`);
      console.log('Raw mintInfo value:', infoBigInt.toString());
      console.log('Raw mintInfo hex:', '0x' + infoBigInt.toString(16));

      // Your existing decode logic
      const term = Number(infoBigInt & ((1n << 16n) - 1n));
      const maturityTs = Number((infoBigInt >> 16n) & ((1n << 64n) - 1n));
      const rank = (infoBigInt >> 80n) & ((1n << 128n) - 1n);
      const amp = Number((infoBigInt >> 208n) & ((1n << 16n) - 1n));
      const eaa = Number((infoBigInt >> 224n) & ((1n << 16n) - 1n));
      const classIdx = Number((infoBigInt >> 240n) & ((1n << 8n) - 1n));
      const redeemed = ((infoBigInt >> 248n) & 1n) === 1n;

      console.log('Decoded values:');
      console.log('  term:', term, 'days');
      console.log('  maturityTs:', maturityTs, '(raw)');
      console.log('  maturityTs:', new Date(maturityTs * 1000).toLocaleString(), '(human readable)');
      console.log('  currentTs:', currentTimestamp, '(raw)');
      console.log('  currentTs:', new Date(currentTimestamp * 1000).toLocaleString(), '(human readable)');
      console.log('  rank:', rank.toString());
      console.log('  amp:', amp);
      console.log('  eaa:', eaa);
      console.log('  classIdx:', classIdx);
      console.log('  redeemed:', redeemed);

      // Check maturity
      const isMatured = maturityTs <= currentTimestamp;
      const timeUntilMaturity = maturityTs - currentTimestamp;
      const timeSinceMaturity = currentTimestamp - maturityTs;

      console.log('Maturity check:');
      console.log('  isMatured:', isMatured);
      if (isMatured) {
        console.log('  ✅ MATURE - matured', timeSinceMaturity, 'seconds ago');
        console.log('  ✅ MATURE - matured', Math.floor(timeSinceMaturity / 86400), 'days ago');
      } else {
        console.log('  ❌ NOT MATURE - matures in', timeUntilMaturity, 'seconds');
        console.log('  ❌ NOT MATURE - matures in', Math.floor(timeUntilMaturity / 86400), 'days');
      }

      console.log('Claimability:');
      console.log('  not redeemed:', !redeemed);
      console.log('  is matured:', isMatured);
      console.log('  IS CLAIMABLE:', !redeemed && isMatured);

      return { term, maturityTs, rank, amp, eaa, classIdx, redeemed };
    };

    // Enhanced scanTokenRange with detailed debugging
    const scanTokenRangeEnhanced = async () => {
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

        addLog(`Current block timestamp: ${now} (${new Date(now * 1000).toLocaleString()})`);

        let claimable = [];
        let vmus = 0;
        let ownedCount = 0;
        let maturedCount = 0;
        let redeemedCount = 0;

        const batchSize = 10;
        const tokenIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const totalBatches = Math.ceil(tokenIds.length / batchSize);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          addLog(`Processing batch ${batchIndex + 1}/${totalBatches}...`);

          const startIdx = batchIndex * batchSize;
          const endIdx = Math.min(startIdx + batchSize, tokenIds.length);
          const batchTokens = tokenIds.slice(startIdx, endIdx);

          for (const tokenId of batchTokens) {
            try {
              const owner = await xenftContract.ownerOf(tokenId);
              if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
                continue; // Skip tokens not owned by wallet
              }

              ownedCount++;
              addLog(`Token ${tokenId}: OWNED by wallet`);

              const info = await xenftContract.mintInfo(tokenId);
              const decoded = debugDecodeMintInfo(BigInt(info), tokenId, now);
              const count = Number(await xenftContract.vmuCount(tokenId));

              addLog(`Token ${tokenId}: VMU Count = ${count}`);

              // Track statistics
              if (decoded.redeemed) {
                redeemedCount++;
                addLog(`Token ${tokenId}: Already redeemed ❌`);
              } else if (decoded.maturityTs > now) {
                addLog(`Token ${tokenId}: Not mature yet ⏳ (matures in ${Math.floor((decoded.maturityTs - now) / 86400)} days)`);
              } else {
                maturedCount++;
                addLog(`Token ${tokenId}: Mature and unredeemed ✅`);
              }

              if (!decoded.redeemed && decoded.maturityTs <= now) {
                const tokenData = { tokenId, vmuCount: count, ...decoded };
                claimable.push(tokenData);
                vmus += count;
                addLog(`Token ${tokenId}: *** ADDED TO CLAIMABLE LIST ***`);
              }

            } catch (err) {
              if (err.message.includes('ERC721: invalid token ID') ||
                err.message.includes('owner query for nonexistent token')) {
                // Token doesn't exist - this is normal
              } else {
                addLog(`Token ${tokenId}: Error - ${err.message}`);
                console.error(`Token ${tokenId} error:`, err);
              }
            }
          }

          setScanProgress(((batchIndex + 1) / totalBatches) * 100);
          addLog(`Batch ${batchIndex + 1} completed.`);

          if (batchIndex < totalBatches - 1) {
            await delay(200);
          }
        }

        // Summary logging
        addLog(`\n=== SCAN SUMMARY ===`);
        addLog(`Total tokens owned: ${ownedCount}`);
        addLog(`Matured tokens: ${maturedCount}`);
        addLog(`Already redeemed: ${redeemedCount}`);
        addLog(`Claimable tokens: ${claimable.length}`);
        addLog(`Total VMUs claimable: ${vmus}`);

        setClaimableXENFTs(claimable);
        setTotalVMUs(vmus);
        setStatus(
          claimable.length > 0
            ? `Found ${claimable.length} claimable XENFTs (${ownedCount} owned, ${maturedCount} matured, ${redeemedCount} already redeemed)`
            : `No claimable XENFTs found. Owned: ${ownedCount}, Matured: ${maturedCount}, Redeemed: ${redeemedCount}`
        );
      } catch (error) {
        console.error('Scan error:', error);
        addLog(`Error during scan: ${error.message}`);
        setStatus('Error scanning: ' + error.message);
      } finally {
        setIsScanning(false);
        setScanProgress(100);
      }
    };

    // Alternative mintInfo decoding based on the contract source
    const alternativeDecodeMintInfo = (infoBigInt) => {
      // From the contract: MintInfo.encodeMintInfo(term, maturityTs, rank, amp, eaa, _class, false);
      // The encoding seems to be:
      // term (16 bits) | maturityTs (64 bits) | rank (128 bits) | amp (16 bits) | eaa (16 bits) | class (8 bits) | redeemed (8 bits)

      console.log('\n=== Alternative Decoding Method ===');
      console.log('Raw value:', infoBigInt.toString());
      console.log('Raw hex:', '0x' + infoBigInt.toString(16));

      // Extract fields step by step
      let remaining = infoBigInt;

      // Last 8 bits: redeemed
      const redeemed = (remaining & 0xFFn) === 1n;
      remaining = remaining >> 8n;
      console.log('redeemed:', redeemed);

      // Next 8 bits: class
      const classIdx = Number(remaining & 0xFFn);
      remaining = remaining >> 8n;
      console.log('classIdx:', classIdx);

      // Next 16 bits: eaa
      const eaa = Number(remaining & 0xFFFFn);
      remaining = remaining >> 16n;
      console.log('eaa:', eaa);

      // Next 16 bits: amp
      const amp = Number(remaining & 0xFFFFn);
      remaining = remaining >> 16n;
      console.log('amp:', amp);

      // Next 128 bits: rank
      const rank = remaining & ((1n << 128n) - 1n);
      remaining = remaining >> 128n;
      console.log('rank:', rank.toString());

      // Next 64 bits: maturityTs
      const maturityTs = Number(remaining & ((1n << 64n) - 1n));
      remaining = remaining >> 64n;
      console.log('maturityTs:', maturityTs, '=', new Date(maturityTs * 1000).toLocaleString());

      // Remaining 16 bits: term
      const term = Number(remaining & 0xFFFFn);
      console.log('term:', term);

      return { term, maturityTs, rank, amp, eaa, classIdx, redeemed };
    };

    const estimateCost = async () => {
      if (!customGasPriceGwei) {
        setStatus('Please enter a gas price in gwei.');
        return;
      }
      const gasPriceGwei = parseFloat(customGasPriceGwei);
      if (isNaN(gasPriceGwei) || gasPriceGwei <= 0) {
        setStatus('Invalid gas price. Enter a positive number.');
        return;
      }

      setIsEstimating(true);
      setStatus('Estimating gas costs...');
      setEstimatedTotalCost(0n);
      setHasSufficientFunds(false);

      const signer = getSigner();
      if (!signer || claimableXENFTs.length === 0) {
        setIsEstimating(false);
        return;
      }

      try {
        const contractAddress = getCurrentContractAddress();
        const signedContract = new ethers.Contract(contractAddress, XENFT_ABI, signer);
        const gasPrice = parseUnits(customGasPriceGwei, 'gwei');
        setCurrentGasPrice(gasPrice);

        const balance = await currentProvider.getBalance(wallet.address);
        setWalletBalanceLocal(balance);

        let totalGas = 0n;
        for (let { tokenId } of claimableXENFTs) {
          const tx = await signedContract.bulkClaimMintReward.populateTransaction(tokenId, claimToAddress);
          const gasEstimate = await currentProvider.estimateGas(tx);
          totalGas += gasEstimate;
        }

        const overheadGas = totalGas + (totalGas * 5n) / 100n;
        const totalCost = overheadGas * gasPrice;
        setEstimatedTotalCost(totalCost);

        setHasSufficientFunds(balance >= totalCost);
        setStatus(
          `Estimated total cost: ${formatEther(totalCost)} ETH (with 5% overhead). Wallet balance: ${formatEther(balance)} ETH.`
        );
      } catch (error) {
        setStatus('Error estimating: ' + error.message);
      } finally {
        setIsEstimating(false);
      }
    };

    const startClaiming = async () => {
      if (!hasSufficientFunds) {
        setStatus('Insufficient funds. Please add more ETH to your wallet.');
        return;
      }
      if (!isAddress(claimToAddress)) {
        setStatus('Invalid destination address.');
        return;
      }
      if (!customGasPriceGwei) {
        setStatus('Please enter a gas price in gwei.');
        return;
      }

      setIsClaiming(true);
      setStatus('Starting claims...');

      const signer = getSigner();
      if (!signer) {
        setIsClaiming(false);
        return;
      }

      try {
        const contractAddress = getCurrentContractAddress();
        const signedContract = new ethers.Contract(contractAddress, XENFT_ABI, signer);
        const gasPrice = parseUnits(customGasPriceGwei, 'gwei');

        for (let { tokenId } of claimableXENFTs) {
          setStatus(`Claiming XENFT ${tokenId}...`);
          const tx = await signedContract.bulkClaimMintReward(tokenId, claimToAddress, { gasPrice });
          await tx.wait();
          setStatus(`Claimed XENFT ${tokenId}. Tx: ${tx.hash}`);
        }

        setStatus('All claims completed.');
        setClaimableXENFTs([]);
        setTotalVMUs(0);
        setEstimatedTotalCost(0n);
      } catch (error) {
        setStatus('Error claiming: ' + error.message);
      } finally {
        setIsClaiming(false);
      }
    };

    // Modified wallet check with debug
    if (!wallet) {
      console.log('ClaimTab: Wallet is null');
      return <div className="tab-content text-white">Please set up your wallet first in the Wallet tab.</div>;
    }
    if (walletStep !== 'complete') {
      console.log('ClaimTab: walletStep is not complete', { walletStep });
      return <div className="tab-content text-white">Please complete wallet setup in the Wallet tab.</div>;
    }

    // Safe calculation for USD price display
    const getUsdPrice = () => {
      try {
        const ethAmount = parseFloat(formatEther(estimatedTotalCost));
        const usdPrice = typeof ethPrice === 'number' ? ethPrice : 0;
        return (ethAmount * usdPrice).toFixed(2);
      } catch (error) {
        console.error('Error calculating USD price:', error);
        return '0.00';
      }
    };

    return (
      <div className="tab-content p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">🔥 Claim Matured XENFTs</h2>
        <p className="mb-4">
          Network: {NETWORKS?.[selectedNetwork]?.name || 'Unknown'} |
          Wallet: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} |
          Contract: {typeof getCurrentContractAddress === 'function' ? getCurrentContractAddress() : 'N/A'}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Token ID</label>
          <input
            type="number"
            value={startTokenId}
            onChange={(e) => setStartTokenId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter start token ID"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Token ID</label>
          <input
            type="number"
            value={endTokenId}
            onChange={(e) => setEndTokenId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter end token ID"
          />
        </div>
        <button
          onClick={scanTokenRange}
          disabled={isScanning}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4`}
        >
          {isScanning ? 'Scanning...' : 'Scan Token ID Range'}
        </button>
        {isScanning && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${scanProgress}%` }}></div>
          </div>
        )}
        <div className="h-32 overflow-y-auto bg-gray-100 p-2 mb-4 border border-gray-300 rounded">
          {scanLogs.length > 0 ? (
            scanLogs.map((log, index) => (
              <p key={index} className="text-sm text-gray-700">{log}</p>
            ))
          ) : (
            <p className="text-sm text-gray-500">Scan logs will appear here...</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Gas Price (gwei)</label>
          <input
            type="number"
            value={customGasPriceGwei}
            onChange={(e) => setCustomGasPriceGwei(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter gas price in gwei (include 5% overhead)"
          />
          <p className="text-sm text-gray-400 mt-1">Note: Include 5% overhead on gas price to ensure successful claims.</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Claim To Address</label>
          <input
            type="text"
            value={claimToAddress}
            onChange={(e) => setClaimToAddress(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter address to receive XEN (defaults to wallet)"
          />
        </div>
        <p className="mb-2">Total Claimable VMUs: {totalVMUs}</p>
        {claimableXENFTs.length > 0 ? (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border text-gray-800">Token ID</th>
                  <th className="px-4 py-2 border text-gray-800">VMU Count</th>
                  <th className="px-4 py-2 border text-gray-800">Term (days)</th>
                  <th className="px-4 py-2 border text-gray-800">Maturity Date</th>
                  <th className="px-4 py-2 border text-gray-800">Rank</th>
                  <th className="px-4 py-2 border text-gray-800">AMP</th>
                  <th className="px-4 py-2 border text-gray-800">EAA</th>
                  <th className="px-4 py-2 border text-gray-800">Class Index</th>
                </tr>
              </thead>
              <tbody>
                {claimableXENFTs.map((ft) => (
                  <tr key={ft.tokenId} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border text-gray-800">{ft.tokenId}</td>
                    <td className="px-4 py-2 border text-gray-800">{ft.vmuCount}</td>
                    <td className="px-4 py-2 border text-gray-800">{ft.term}</td>
                    <td className="px-4 py-2 border text-gray-800">{new Date(ft.maturityTs * 1000).toLocaleString()}</td>
                    <td className="px-4 py-2 border text-gray-800">{ft.rank.toString()}</td>
                    <td className="px-4 py-2 border text-gray-800">{ft.amp}</td>
                    <td className="px-4 py-2 border text-gray-800">{ft.eaa}</td>
                    <td className="px-4 py-2 border text-gray-800">{ft.classIdx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mb-4">No claimable XENFTs found.</p>
        )}
        <button
          onClick={estimateCost}
          disabled={isEstimating || claimableXENFTs.length === 0}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4`}
        >
          {isEstimating ? 'Estimating...' : 'Estimate Claim Cost'}
        </button>
        <p className="mb-2">
          Estimated Cost: {estimatedTotalCost ? formatEther(estimatedTotalCost) : '0'} ETH (~${getUsdPrice()} USD at current ETH price)
        </p>
        <button
          onClick={startClaiming}
          disabled={isClaiming || !hasSufficientFunds}
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 mb-4`}
        >
          {isClaiming ? 'Claiming...' : 'Confirm & Start Claiming'}
        </button>
        <p className="text-sm text-gray-300">Status: {status}</p>
      </div>
    );
  };