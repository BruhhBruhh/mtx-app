// src/components/LadderMode.jsx
import React, { useState, useEffect } from 'react';
import { Layers, Calculator, Settings, Info, TrendingUp } from 'lucide-react';
import { generateLadderTerms, calculateEstimatedDuration, calculatePowerGroup } from '../utils/xenft-utils';

const LadderMode = ({ onStartMinting, isDisabled = false }) => {
  const [config, setConfig] = useState({
    vmu: 128,
    gasPrice: '0.00003',
    delay: 60000, // 1 minute
    startTerm: 100,
    endTerm: 250,
    batches: 1,
    skipTest: false,
    dryRun: false
  });

  const [ladderPreview, setLadderPreview] = useState({
    totalTerms: 0,
    totalTransactions: 0,
    totalVMUs: 0,
    estimatedDuration: { hours: 0, minutes: 0 },
    powerGroupRange: { min: 0, max: 0 }
  });

  useEffect(() => {
    // Calculate ladder preview
    const totalTerms = Math.max(0, config.endTerm - config.startTerm + 1);
    const totalTransactions = totalTerms * config.batches;
    const totalVMUs = totalTransactions * config.vmu;
    const estimatedDuration = calculateEstimatedDuration(totalTransactions, config.delay);
    
    const minPowerGroup = calculatePowerGroup(config.vmu, config.startTerm);
    const maxPowerGroup = calculatePowerGroup(config.vmu, config.endTerm);
    
    setLadderPreview({
      totalTerms,
      totalTransactions,
      totalVMUs,
      estimatedDuration,
      powerGroupRange: { min: minPowerGroup, max: maxPowerGroup }
    });
  }, [config]);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartMinting = () => {
    if (onStartMinting) {
      onStartMinting(config);
    }
  };

  const isValidConfig = () => {
    return config.startTerm > 0 && 
           config.endTerm > config.startTerm && 
           config.batches > 0 && 
           config.vmu > 0;
  };

  return (
    <div className="rainbow-mode-container">
      {/* Header */}
      <div className="hero-container">
        <h1 className="mode-title">Ladder Mode</h1>
        <p className="mode-subtitle">
          Create custom laddered XENFT terms with precise control over ranges and batching
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="config-panel">
        <h2 className="config-title">
          <Layers className="inline w-6 h-6 mr-2" />
          Basic Configuration
        </h2>
        
        <div className="config-grid">
          <div className="config-item">
            <label className="config-label" htmlFor="ladder-vmu">VMUs per Transaction</label>
            <input
              id="ladder-vmu"
              type="number"
              min="1"
              max="1000"
              value={config.vmu}
              onChange={(e) => handleConfigChange('vmu', parseInt(e.target.value) || 128)}
              className="config-input"
            />
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="ladder-gasPrice">Gas Price (gwei)</label>
            <input
              id="ladder-gasPrice"
              type="text"
              value={config.gasPrice}
              onChange={(e) => handleConfigChange('gasPrice', e.target.value)}
              className="config-input"
              placeholder="0.00003"
            />
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="start-term">Start Term (days)</label>
            <input
              id="start-term"
              type="number"
              min="1"
              max="1000"
              value={config.startTerm}
              onChange={(e) => handleConfigChange('startTerm', parseInt(e.target.value) || 100)}
              className="config-input"
            />
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="end-term">End Term (days)</label>
            <input
              id="end-term"
              type="number"
              min="1"
              max="1000"
              value={config.endTerm}
              onChange={(e) => handleConfigChange('endTerm', parseInt(e.target.value) || 250)}
              className="config-input"
            />
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="batches">Batches per Term</label>
            <input
              id="batches"
              type="number"
              min="1"
              max="10"
              value={config.batches}
              onChange={(e) => handleConfigChange('batches', parseInt(e.target.value) || 1)}
              className="config-input"
            />
            <p className="config-hint">
              Number of identical transactions per term
            </p>
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="ladder-delay">Delay Between Transactions (seconds)</label>
            <input
              id="ladder-delay"
              type="number"
              min="5"
              max="3600"
              value={config.delay / 1000}
              onChange={(e) => handleConfigChange('delay', (parseInt(e.target.value) || 60) * 1000)}
              className="config-input"
            />
          </div>
        </div>
      </div>

      {/* Ladder Summary Panel */}
      <div className="power-groups-panel">
        <h2 className="panel-title">
          <Calculator className="inline w-5 h-5 mr-2" />
          Ladder Summary
        </h2>
        
        <div className="power-groups-grid">
          <div className="power-group-card">
            <div className="power-group-icon">
              <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-white font-bold text-lg">{ladderPreview.totalTerms}</span>
              </div>
            </div>
            <div className="power-group-info">
              <p className="power-group-name">Total Terms</p>
              <p className="power-group-days">Days Range: {config.startTerm}-{config.endTerm}</p>
            </div>
          </div>
          
          <div className="power-group-card">
            <div className="power-group-icon">
              <div className="w-12 h-12 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-white font-bold text-lg">{ladderPreview.totalTransactions}</span>
              </div>
            </div>
            <div className="power-group-info">
              <p className="power-group-name">Total Transactions</p>
              <p className="power-group-days">{config.batches} per term</p>
            </div>
          </div>
          
          <div className="power-group-card">
            <div className="power-group-icon">
              <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-white font-bold text-sm">{ladderPreview.totalVMUs.toLocaleString()}</span>
              </div>
            </div>
            <div className="power-group-info">
              <p className="power-group-name">Total VMUs</p>
              <p className="power-group-days">{config.vmu} per transaction</p>
            </div>
          </div>
          
          <div className="power-group-card">
            <div className="power-group-icon">
              <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-white font-bold text-sm">{ladderPreview.estimatedDuration.hours}h</span>
              </div>
            </div>
            <div className="power-group-info">
              <p className="power-group-name">Est. Duration</p>
              <p className="power-group-days">{ladderPreview.estimatedDuration.minutes} minutes</p>
            </div>
          </div>
        </div>

        <div className="power-group-card" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <div className="power-group-info">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="power-group-name">Power Group Range</span>
            </div>
            <p className="power-group-days">
              Power Group {ladderPreview.powerGroupRange.min} to {ladderPreview.powerGroupRange.max}
              <span className="power-group-vmu">
                ({config.startTerm}-{config.endTerm} days × {config.vmu} VMUs)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="options-panel">
        <h2 className="panel-title">
          <Settings className="inline w-5 h-5 mr-2" />
          Advanced Options
        </h2>
        
        <div className="options-grid">
          <label className="option-item">
            <input
              type="checkbox"
              checked={config.skipTest}
              onChange={(e) => handleConfigChange('skipTest', e.target.checked)}
              className="option-checkbox"
            />
            <span className="option-label">
              <span className="option-icon">⚡</span>
              Skip test transactions
            </span>
          </label>
          
          <label className="option-item">
            <input
              type="checkbox"
              checked={config.dryRun}
              onChange={(e) => handleConfigChange('dryRun', e.target.checked)}
              className="option-checkbox"
            />
            <span className="option-label">
              <span className="option-icon">👁️</span>
              Dry run (show commands without executing)
            </span>
          </label>
        </div>
      </div>

      {/* Validation Warning */}
      {!isValidConfig() && (
        <div className="status-panel error">
          <div className="status-icon">⚠️</div>
          <div className="status-content">
            <h3 className="status-title">Configuration Error</h3>
            <p className="status-message">
              Please check your configuration: End term must be greater than start term, and all values must be positive.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="status-panel success">
        <div className="status-icon">
          <Info />
        </div>
        <div className="status-content">
          <h3 className="status-title">Ladder Minting Summary</h3>
          <div className="status-features">
            <div className="feature-item">
              <span className="feature-icon">🪜</span>
              <span className="feature-text">Creates {ladderPreview.totalTransactions} XENFTs across {ladderPreview.totalTerms} different terms</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Each XENFT will have {config.vmu} VMUs</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span className="feature-text">Terms increment from {config.startTerm} to {config.endTerm} days</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">
                Estimated total cost: ~${(ladderPreview.totalTransactions * 0.15).toFixed(2)} in gas fees
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <div className="launch-section">
        <button 
          onClick={handleStartMinting}
          className={`launch-mint-button ${(isDisabled || !isValidConfig()) ? 'disabled' : ''}`}
          disabled={isDisabled || !isValidConfig()}
        >
          <span className="button-icon">
            <Layers />
          </span>
          <span className="button-text">
            {config.dryRun ? 'Preview Ladder Minting' : 'Start Ladder Minting'}
          </span>
        </button>
        
        <div className="launch-hint">
          <p>Click to begin the ladder minting process. Each term will be minted sequentially.</p>
        </div>
      </div>
    </div>
  );
};

export default LadderMode;