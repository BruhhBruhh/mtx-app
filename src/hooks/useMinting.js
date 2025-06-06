// src/hooks/useMinting.js
import { useState, useCallback } from 'react';
import { calculateTermForPowerGroup, calculateEstimatedDuration } from '../utils/xenft-utils';
import { COMMON_POWER_GROUPS } from '../lib/xenft-contracts';

export const useMinting = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [mintingLogs, setMintingLogs] = useState([]);
  const [error, setError] = useState('');

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setMintingLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  const startRainbowMinting = async (config) => {
    setIsMinting(true);
    setMintingProgress(0);
    setMintingLogs([]);
    setError('');
    
    try {
      addLog('Starting Rainbow Minting...', 'info');
      
      const { vmu, gasPrice, delay, reverse, skipTest } = config;
      
      // Calculate terms for each power group
      const termsToMint = COMMON_POWER_GROUPS.map(group => ({
        ...group,
        term: calculateTermForPowerGroup(group.powerGroup, vmu)
      }));
      
      if (reverse) {
        termsToMint.reverse();
      }
      
      addLog(`Minting ${termsToMint.length} power groups with ${vmu} VMUs each`, 'info');
      
      // Simulate minting process
      for (let i = 0; i < termsToMint.length; i++) {
        const group = termsToMint[i];
        setCurrentTransaction({
          index: i + 1,
          total: termsToMint.length,
          group: group.name,
          term: group.term,
          powerGroup: group.powerGroup
        });
        
        addLog(`Minting ${group.name} (${group.term} days)...`, 'info');
        
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLog(`✓ ${group.name} minted successfully`, 'success');
        setMintingProgress(((i + 1) / termsToMint.length) * 100);
        
        // Add delay between transactions (except for the last one)
        if (i < termsToMint.length - 1) {
          addLog(`Waiting ${delay / 1000} seconds before next transaction...`, 'info');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      addLog('🎉 Rainbow minting completed successfully!', 'success');
      setCurrentTransaction(null);
      
    } catch (err) {
      setError('Minting failed: ' + err.message);
      addLog(`✗ Minting failed: ${err.message}`, 'error');
    } finally {
      setIsMinting(false);
    }
  };

  const startLadderMinting = async (config) => {
    setIsMinting(true);
    setMintingProgress(0);
    setMintingLogs([]);
    setError('');
    
    try {
      addLog('Starting Ladder Minting...', 'info');
      
      const { vmu, gasPrice, delay, startTerm, endTerm, batches, skipTest } = config;
      
      const totalTerms = endTerm - startTerm + 1;
      const totalTransactions = totalTerms * batches;
      
      addLog(`Minting ${totalTerms} terms (${startTerm}-${endTerm} days) with ${batches} batches each`, 'info');
      
      let currentTx = 0;
      
      // Simulate ladder minting
      for (let term = startTerm; term <= endTerm; term++) {
        for (let batch = 1; batch <= batches; batch++) {
          currentTx++;
          
          setCurrentTransaction({
            index: currentTx,
            total: totalTransactions,
            term: term,
            batch: batch,
            batches: batches
          });
          
          addLog(`Minting Term ${term} days, Batch ${batch}/${batches}...`, 'info');
          
          // Simulate transaction delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          addLog(`✓ Term ${term}, Batch ${batch} minted successfully`, 'success');
          setMintingProgress((currentTx / totalTransactions) * 100);
          
          // Add delay between transactions (except for the last one)
          if (currentTx < totalTransactions) {
            addLog(`Waiting ${delay / 1000} seconds before next transaction...`, 'info');
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      addLog('🎉 Ladder minting completed successfully!', 'success');
      setCurrentTransaction(null);
      
    } catch (err) {
      setError('Minting failed: ' + err.message);
      addLog(`✗ Minting failed: ${err.message}`, 'error');
    } finally {
      setIsMinting(false);
    }
  };

  const stopMinting = () => {
    setIsMinting(false);
    setCurrentTransaction(null);
    addLog('Minting stopped by user', 'warning');
  };

  return {
    isMinting,
    mintingProgress,
    currentTransaction,
    mintingLogs,
    error,
    startRainbowMinting,
    startLadderMinting,
    stopMinting
  };
};