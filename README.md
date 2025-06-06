📋 Table of Contents

Features
Supported Networks
Quick Start
Installation
Configuration
Usage
Minting Modes
API Keys Setup
Deployment
Security
Contributing
License

✨ Features

🌈 Rainbow Mode - Create XENFTs across all 8 power groups for maximum variety
📊 Ladder Mode - Custom term ranges with precise batching control
🤖 Automated Minting - No MetaMask popups, runs in background
⛽ Real-time Gas Prices - Live gas tracking across all supported networks
🔐 Secure Wallet Management - Session-only key storage with mandatory backup
📱 Mobile Optimized - Responsive design for all devices
⚡ Multi-chain Support - Optimism, Ethereum, and Base networks
🎯 Power Group Calculator - Visual power group preview and calculations

🌐 Supported Networks
NetworkGas CostsBest ForContract AddressOptimism 🚀~$0.0001-0.001Large batches, low cost0xAF18644083151cf57F914CCCc23c42A1892C218eBase ⚡~$0.30-2.50Balanced cost/speed0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6Ethereum 💎~$5-100Single high-value mints0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8
🚀 Quick Start

Visit the app → Create or import wallet → Backup private key
Select network → Choose gas price tier → Configure minting mode
Rainbow Mode: 8 XENFTs across all power groups
Ladder Mode: Custom term ranges with batch control
Start minting → Monitor progress → View your XENFTs

🛠 Installation
Prerequisites

Node.js 18+ and npm/yarn
Modern web browser with MetaMask (optional for viewing, required for manual transactions)

Local Development
bash# Clone the repository
git clone https://github.com/yourusername/mintxen-app.git
cd mintxen-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
Build for Production
bash# Create production build
npm run build

# Preview production build
npm run preview
⚙️ Configuration
Environment Variables
Create a .env file in your project root:
env# Alchemy API Keys (get from https://alchemy.com)
VITE_ALCHEMY_ETHEREUM_KEY=your-ethereum-api-key
VITE_ALCHEMY_OPTIMISM_KEY=your-optimism-api-key
VITE_ALCHEMY_BASE_KEY=your-base-api-key
Network Configuration
Networks are pre-configured in App.jsx:
javascriptconst NETWORKS = {
  optimism: {
    name: 'Optimism',
    chainId: 10,
    defaultRpc: 'https://mainnet.optimism.io',
    contracts: { xenft: '0xAF18644083151cf57F914CCCc23c42A1892C218e' }
  },
  // ... other networks
}
📚 Usage
Wallet Setup

Generate New Wallet: Creates a fresh wallet with mnemonic phrase
Import Private Key: Use existing wallet via private key import
Backup Required: Mandatory private key backup before proceeding
Session Storage: Keys deleted when browser closes for security

Gas Price Monitoring

Real-time Updates: Gas prices refresh every 30 seconds
Three Tiers: Safe 🐢, Standard 🚗, Fast 🚀
Color Coded: Green (cheap), Yellow (moderate), Red (expensive)
Network Specific: Optimized display for each chain's typical ranges

Power Group System
XENFTs are classified into power groups (0-7) based on:
Power Group = (VMUs × Term Length) ÷ 7500
Examples:

128 VMUs × 50 days = 6,400 ÷ 7500 = Power Group 0
128 VMUs × 200 days = 25,600 ÷ 7500 = Power Group 3
128 VMUs × 400 days = 51,200 ÷ 7500 = Power Group 6

🎨 Minting Modes
🌈 Rainbow Mode
Creates one XENFT for each power group (0-7) using calculated optimal terms.
Configuration:

VMUs: Virtual Mining Units per transaction (default: 128)
Gas Price: Custom gas price in gwei
Delay: Time between transactions (default: 60 seconds)
Reverse: Mint from PG 0→7 instead of 7→0

Output: 8 XENFTs with maximum visual variety
📊 Ladder Mode
Creates XENFTs across a custom range of term lengths.
Configuration:

Start Term: Beginning day length (e.g., 100 days)
End Term: Final day length (e.g., 250 days)
Batches: Number of identical XENFTs per term
VMUs: Virtual Mining Units per transaction

Output: Scalable for large operations, precise term control
Example Configurations
Small Rainbow (64 VMUs):

8 transactions, ~$1-8 total cost
Power Groups 0-3, shorter terms
Good for beginners

Large Ladder (200-300 days, 2 batches):

202 transactions, higher investment
Consistent power group range
Ideal for serious collectors

🔑 API Keys Setup
Alchemy (Recommended)

Visit alchemy.com and create account
Create apps for each network:

Ethereum Mainnet
Optimism Mainnet
Base Mainnet


Copy API keys to environment variables
Free tier: 300M compute units/month

Alternative Providers

Infura: 100k requests/day free
Ankr: Rate-limited free tier
QuickNode: Various paid plans

🚀 Deployment
Vercel (Recommended)
bash# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
Manual Deployment
bash# Build the project
npm run build

# Upload dist/ folder to your hosting provider
Docker
dockerfileFROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
🔒 Security
Private Key Handling

Session Only: Keys stored in sessionStorage only
No Server Storage: Never transmitted to servers
Mandatory Backup: Forces user backup before proceeding
Browser Deletion: Automatically cleared on browser close

Best Practices

✅ Always backup private keys securely
✅ Use hardware wallets for large amounts
✅ Test with small amounts first
✅ Verify contract addresses
❌ Never share private keys
❌ Don't use on public computers

Smart Contract Security
All contracts are verified and audited:

Optimism Contract
Ethereum Contract
Base Contract

🎯 Power Group Visual Guide
Power GroupColorTerm RangeRarityExample (128 VMUs)PG 7🟣 Purple400-500+ daysUltra Rare468+ daysPG 6🔵 Blue350-399 daysVery Rare410-467 daysPG 5🟡 Cyan300-349 daysRare352-409 daysPG 4🟢 Green250-299 daysUncommon293-351 daysPG 3🟡 Yellow200-249 daysCommon235-292 daysPG 2🟠 Orange150-199 daysCommon176-234 daysPG 1🔴 Red100-149 daysCommon118-175 daysPG 0⚪ Gray1-99 daysMost Common1-117 days
📈 Cost Estimates
Rainbow Mode (8 XENFTs)
NetworkGas CostUSD EstimateOptimism~$0.008$0.01Base~$2.40$2.50Ethereum~$160$200+
Ladder Mode (100-250 days, 1 batch)
NetworkGas CostUSD EstimateOptimism~$0.15$0.20Base~$363$400Ethereum~$24,200$30,000+
Estimates based on typical gas prices and ETH at $2,500
🛠 Tech Stack

Frontend: React 18 + Vite
Web3: ethers.js v6
Styling: Custom CSS with glassmorphism
APIs: Alchemy for gas prices and RPC
Deployment: Vercel
Storage: Browser sessionStorage (temporary)

🤝 Contributing
Contributions welcome! Please read our Contributing Guide.
Development Workflow
bash# Fork the repo and clone
git clone https://github.com/yourusername/mintxen-app.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run dev

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
Reporting Issues

Use GitHub Issues
Include browser, network, and steps to reproduce
Attach screenshots for UI issues

📄 License
MIT License - see LICENSE file for details.
🔗 Links

Live App: mintxen-app.vercel.app
XEN Network: xen.network
XENFT Docs: docs.xen.network
Community: Discord | Twitter

⚡ Quick Commands
bash# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production

# Maintenance
npm update           # Update dependencies
npm audit            # Check for vulnerabilities

Built with ❤️ for the XEN community