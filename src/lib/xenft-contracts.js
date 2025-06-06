export const XENFT_CONTRACT_ADDRESS = '0xAF18644083151cf57F914CCCc23c42A1892C218e';

export const XENFT_ABI = [
  'function bulkClaimRank(uint256 count, uint256 term) returns (uint256)',
  'function getGlobalRank() view returns (uint256)',
  'function getCurrentAMP() view returns (uint256)',
  'function getUserMint() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getTokenData(uint256 tokenId) view returns (tuple(uint256 term, uint256 maturityTs, uint256 rank, uint256 amp, uint256 eaa))'
];

export const POWER_GROUP_SIZE = 7500;

export const COMMON_POWER_GROUPS = [
  { name: "Power Group 7", color: "purple", powerGroup: 7, bgClass: "bg-purple-500", textClass: "text-purple-100" },
  { name: "Power Group 6", color: "blue", powerGroup: 6, bgClass: "bg-blue-500", textClass: "text-blue-100" },
  { name: "Power Group 5", color: "cyan", powerGroup: 5, bgClass: "bg-cyan-500", textClass: "text-cyan-100" },
  { name: "Power Group 4", color: "green", powerGroup: 4, bgClass: "bg-green-500", textClass: "text-green-100" },
  { name: "Power Group 3", color: "yellow", powerGroup: 3, bgClass: "bg-yellow-500", textClass: "text-yellow-100" },
  { name: "Power Group 2", color: "red", powerGroup: 2, bgClass: "bg-red-500", textClass: "text-red-100" },
  { name: "Power Group 1", color: "gray", powerGroup: 1, bgClass: "bg-gray-500", textClass: "text-gray-100" },
  { name: "Power Group 0", color: "white", powerGroup: 0, bgClass: "bg-gray-400", textClass: "text-gray-100" }
];

export const OPTIMISM_CHAIN_CONFIG = {
  id: 10,
  name: 'Optimism',
  network: 'optimism',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.optimism.io'] },
    default: { http: ['https://mainnet.optimism.io'] },
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: 'https://optimistic.etherscan.io' },
    default: { name: 'Etherscan', url: 'https://optimistic.etherscan.io' },
  },
};