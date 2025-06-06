import { POWER_GROUP_SIZE, COMMON_POWER_GROUPS } from '../lib/xenft-contracts.js';

export const calculateTermForPowerGroup = (powerGroup, vmu) => {
  // Calculate term to achieve the desired power group: term = (powerGroup * POWER_GROUP_SIZE) / vmu
  const term = Math.ceil((powerGroup * POWER_GROUP_SIZE) / vmu);
  return Math.max(1, term); // Ensure term is at least 1 day
};

export const calculatePowerGroup = (vmu, term) => {
  return Math.floor((vmu * term) / POWER_GROUP_SIZE);
};

export const formatGasPrice = (gasPrice) => {
  if (typeof gasPrice === 'string') {
    return gasPrice;
  }
  return gasPrice.toString();
};

export const calculateEstimatedDuration = (totalTransactions, delayMs) => {
  const totalSeconds = (totalTransactions - 1) * (delayMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = (minutes / 60).toFixed(2);
  return { totalSeconds, minutes, hours };
};

export const validatePrivateKey = (privateKey) => {
  if (!privateKey || typeof privateKey !== 'string') {
    return { valid: false, error: 'Private key is required' };
  }
  
  if (!privateKey.startsWith('0x')) {
    return { valid: false, error: 'Private key must start with 0x' };
  }
  
  if (privateKey.length !== 66) {
    return { valid: false, error: 'Private key must be 64 characters (plus 0x prefix)' };
  }
  
  const hexPattern = /^0x[a-fA-F0-9]{64}$/;
  if (!hexPattern.test(privateKey)) {
    return { valid: false, error: 'Private key contains invalid characters' };
  }
  
  return { valid: true };
};

export const formatAddress = (address, length = 4) => {
  if (!address) return '';
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
};

export const formatTokenId = (tokenId) => {
  return `#${tokenId.toString().padStart(5, '0')}`;
};

export const formatVMU = (vmu) => {
  return vmu.toLocaleString();
};

export const formatTerm = (term) => {
  return `${term} day${term !== 1 ? 's' : ''}`;
};

export const calculateMaturityDate = (mintDate, term) => {
  const maturity = new Date(mintDate);
  maturity.setDate(maturity.getDate() + term);
  return maturity;
};

export const isMatured = (maturityDate) => {
  return new Date() >= maturityDate;
};

export const getDaysUntilMaturity = (maturityDate) => {
  const now = new Date();
  const diffTime = maturityDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const getPowerGroupInfo = (powerGroup) => {
  return COMMON_POWER_GROUPS.find(group => group.powerGroup === powerGroup) || COMMON_POWER_GROUPS[0];
};

export const generateRainbowTerms = (vmu, reverse = false) => {
  let terms = COMMON_POWER_GROUPS.map(group => ({
    ...group,
    term: calculateTermForPowerGroup(group.powerGroup, vmu),
    vmu: vmu
  }));
  
  if (reverse) {
    terms.reverse();
  }
  
  return terms;
};

export const generateLadderTerms = (startTerm, endTerm, batches, vmu) => {
  const terms = [];
  
  for (let term = startTerm; term <= endTerm; term++) {
    for (let batch = 1; batch <= batches; batch++) {
      terms.push({
        term: term,
        batch: batch,
        totalBatches: batches,
        vmu: vmu,
        powerGroup: calculatePowerGroup(vmu, term)
      });
    }
  }
  
  return terms;
};

export const estimateGasCost = (gasPrice, gasLimit = 200000) => {
  // Convert gwei to wei, then to ETH
  const gasPriceWei = parseFloat(gasPrice) * 1e9;
  const totalWei = gasPriceWei * gasLimit;
  const totalETH = totalWei / 1e18;
  return totalETH;
};

export const formatETH = (amount, decimals = 6) => {
  return parseFloat(amount).toFixed(decimals);
};

export const formatUSD = (ethAmount, ethPrice = 2500) => {
  const usdAmount = parseFloat(ethAmount) * ethPrice;
  return usdAmount.toFixed(2);
};