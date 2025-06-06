// src/components/RainbowMode.jsx
import React, { useState, useEffect } from 'react';
import { Rainbow, Zap, Settings, Info } from 'lucide-react';
import { generateRainbowTerms, calculateEstimatedDuration } from '../utils/xenft-utils';

const RainbowMode = ({ onStartMinting, isDisabled = false }) => {
  const [config, setConfig] = useState({
    vmu: 128,
    gasPrice: '0.00003',
    delay: 60000, // 1 minute
    reverse: false,
    skipTest: false
  });

  const [termsPreview, setTermsPreview] = useState([]);
  const [estimatedDuration, setEstimatedDuration] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    // Update preview when config changes
    const terms = generateRainbowTerms(config.vmu, config.reverse);
    setTermsPreview(terms);
    
    const duration = calculateEstimatedDuration(terms.length, config.delay);
    setEstimatedDuration(duration);
  }, [config.vmu, config.reverse, config.delay]);

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

  return (
    <div className="rainbow-mode-container">
      {/* Header */}
      <div className="hero-container">
        <h1 className="mode-title">Rainbow Mode</h1>
        <p className="mode-subtitle">
          Create a rainbow of Common Class XENFTs with different power groups (0-7)
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="config-panel">
        <h2 className="config-title">
          <Rainbow className="inline w-6 h-6 mr-2" />
          Configuration
        </h2>
        
        <div className="config-grid">
          <div className="config-item">
            <label className="config-label" htmlFor="vmu">VMUs per Transaction</label>
            <input
              id="vmu"
              type="number"
              min="1"
              max="1000"
              value={config.vmu}
              onChange={(e) => handleConfigChange('vmu', parseInt(e.target.value) || 128)}
              className="config-input"
            />
            <p className="config-hint">
              Higher VMUs = Higher power groups with longer terms
            </p>
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="gasPrice">Gas Price (gwei)</label>
            <input
              id="gasPrice"
              type="text"
              value={config.gasPrice}
              onChange={(e) => handleConfigChange('gasPrice', e.target.value)}
              className="config-input"
              placeholder="0.00003"
            />
            <p className="config-hint">
              Lower gas = Slower confirmation but cheaper
            </p>
          </div>

          <div className="config-item">
            <label className="config-label" htmlFor="delay">Delay Between Transactions (seconds)</label>
            <input
              id="delay"
              type="number"
              min="5"
              max="3600"
              value={config.delay / 1000}
              onChange={(e) => handleConfigChange('delay', (parseInt(e.target.value) || 60) * 1000)}
              className="config-input"
            />
            <p className="config-hint">
              Recommended: 60-120 seconds to avoid rate limiting
            </p>
          </div>

          <div className="config-item">
            <label className="config-label">Estimated Duration</label>
            <div className="config-input" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {estimatedDuration.hours} hours ({estimatedDuration.minutes} minutes)
            </div>
            <p className="config-hint">
              Total time for all {termsPreview.length} transactions
            </p>
          </div>
        </div>
      </div>

      {/* Power Groups Preview */}
      <div className="power-groups-panel">
        <h2 className="panel-title">
          Power Groups Preview ({termsPreview.length} XENFTs)
        </h2>
        
        <div className="power-groups-grid">
          {termsPreview.map((group, index) => (
            <div 
              key={group.powerGroup} 
              className="power-group-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="power-group-icon">
                <div 
                  className={`w-12 h-12 ${group.bgClass} rounded-full mx-auto flex items-center justify-center`}
                  style={{ 
                    background: group.bgClass?.includes('purple') ? '#8b5cf6' :
                               group.bgClass?.includes('blue') ? '#3b82f6' :
                               group.bgClass?.includes('cyan') ? '#06b6d4' :
                               group.bgClass?.includes('green') ? '#10b981' :
                               group.bgClass?.includes('yellow') ? '#eab308' :
                               group.bgClass?.includes('orange') ? '#f97316' :
                               group.bgClass?.includes('red') ? '#ef4444' :
                               '#6b7280'
                  }}
                >
                  <span className="text-white font-bold text-lg">
                    {group.powerGroup}
                  </span>
                </div>
              </div>
              <div className="power-group-info">
                <p className="power-group-name">{group.name}</p>
                <p className="power-group-days">{group.term} days</p>
                <p className="power-group-vmu">{config.vmu} VMUs</p>
              </div>
              <div 
                className="power-group-indicator"
                style={{ 
                  background: `linear-gradient(90deg, ${
                    group.bgClass?.includes('purple') ? '#8b5cf6' :
                    group.bgClass?.includes('blue') ? '#3b82f6' :
                    group.bgClass?.includes('cyan') ? '#06b6d4' :
                    group.bgClass?.includes('green') ? '#10b981' :
                    group.bgClass?.includes('yellow') ? '#eab308' :
                    group.bgClass?.includes('orange') ? '#f97316' :
                    group.bgClass?.includes('red') ? '#ef4444' :
                    '#6b7280'
                  }, transparent)`
                }}
              />
            </div>
          ))}
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
              checked={config.reverse}
              onChange={(e) => handleConfigChange('reverse', e.target.checked)}
              className="option-checkbox"
            />
            <span className="option-label">
              <span className="option-icon">🔄</span>
              Reverse order (mint from Power Group 0 to 7)
            </span>
          </label>
          
          <label className="option-item">
            <input
              type="checkbox"
              checked={config.skipTest}
              onChange={(e) => handleConfigChange('skipTest', e.target.checked)}
              className="option-checkbox"
            />
            <span className="option-label">
              <span className="option-icon">⚡</span>
              Skip test transactions (faster but riskier)
            </span>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="status-panel success">
        <div className="status-icon">
          <Info />
        </div>
        <div className="status-content">
          <h3 className="status-title">Rainbow Minting Summary</h3>
          <div className="status-features">
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span className="feature-text">Creates {termsPreview.length} XENFTs with different power groups</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Each XENFT will have {config.vmu} VMUs</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span className="feature-text">
                Terms range from {Math.min(...termsPreview.map(t => t.term))} to {Math.max(...termsPreview.map(t => t.term))} days
              </span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">
                Estimated total cost: ~${(termsPreview.length * 0.15).toFixed(2)} in gas fees
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <div className="launch-section">
        <button 
          onClick={handleStartMinting}
          className={`launch-mint-button ${isDisabled ? 'disabled' : ''}`}
          disabled={isDisabled}
        >
          <span className="button-icon">
            <Rainbow />
          </span>
          <span className="button-text">Start Rainbow Minting</span>
        </button>
        
        <div className="launch-hint">
          <p>Click to begin the rainbow minting process. Each power group will be minted sequentially.</p>
        </div>
      </div>
    </div>
  );
};

export default RainbowMode;