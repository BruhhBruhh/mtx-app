// src/components/XENFTPortfolio.jsx
// This is the portfolio component we created earlier
// Make sure to save the XENFTPortfolio component we built in the previous artifact
// as src/components/XENFTPortfolio.jsx

// Alternative: If you want to keep it in the same file, you can use this inline version:

const XENFTPortfolioInline = ({ walletAddress }) => {
  if (!walletAddress) {
    return (
      <Card className="bg-gray-900/50 border-gray-600">
        <CardContent className="p-8 text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Portfolio Coming Soon</h3>
          <p className="text-gray-400">
            XENFT portfolio viewer will be available here. Connect your wallet to see your XENFTs.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Power Groups</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Value Tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-600">
      <CardContent className="p-8 text-center">
        <Eye className="w-16 h-16 mx-auto mb-4 text-blue-400" />
        <h3 className="text-xl font-semibold mb-2">Loading Portfolio...</h3>
        <p className="text-gray-400 mb-4">
          Fetching XENFTs for wallet: 
        </p>
        <code className="bg-gray-800 px-2 py-1 rounded text-sm break-all">
          {walletAddress}
        </code>
        <div className="mt-6">
          <div className="animate-pulse grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};