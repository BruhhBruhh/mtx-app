import React from 'react';

const DisclaimerPopup = ({ isOpen, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="disclaimer-overlay">
            <div className="disclaimer-modal">
                <div className="disclaimer-header">
                    <div className="warning-icon">⚠️</div>
                    <h2>Security Disclaimer & Terms of Use</h2>
                </div>

                <div className="disclaimer-content">
                    <div className="security-alert">
                        <div className="alert-icon">🛡️</div>
                        <p><strong>Your private key is temporarily stored in your browser session for minting operations. You are 100% responsible for your security and interactions with this site.</strong></p>
                    </div>

                    <div className="security-section">
                        <h3>🔑 Important Security Information</h3>
                        <ul>
                            <li>• Your private key is stored locally in your browser session only</li>
                            <li>• mintxen.com has implemented security measures to protect your key during use</li>
                            <li>• We cannot control external threats like social engineering attacks</li>
                            <li>• We cannot prevent RPC endpoint spoofing or system compromises</li>
                            <li>• Always verify transaction details before signing</li>
                        </ul>
                    </div>

                    <div className="liability-section">
                        <h3>⚠️ Terms & Liability</h3>
                        <p><strong>By using mintxen.com, you acknowledge and agree that:</strong></p>
                        <ul>
                            <li>• You are solely responsible for the security of your private keys and funds</li>
                            <li>• mintxen.com is not liable for any losses due to user error or external attacks</li>
                            <li>• You understand the risks of interacting with blockchain applications</li>
                            <li>• You will not hold mintxen.com responsible for lost assets, failed transactions, or security breaches</li>
                            <li>• You are using this service at your own risk and discretion</li>
                        </ul>
                        <p className="liability-emphasis">
                            <strong>mintxen.com has gone above and beyond to protect your private key during your session, but you own 100% of your interaction with this site and any consequences thereof.</strong>
                        </p>
                    </div>

                    <div className="warning-notice">
                        <p>⚠️ <strong>Only proceed if you understand and accept these terms and risks</strong></p>
                    </div>
                </div>

                <div className="disclaimer-actions">
                    <button
                        onClick={() => {
                            // Clear any stored data and reload to exit
                            sessionStorage.clear();
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="btn-decline"
                    >
                        I Do Not Agree - Leave Site
                    </button>
                    <button
                        onClick={onAccept}
                        className="btn-accept"
                    >
                        I Understand & Accept Terms
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerPopup;