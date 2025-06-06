import { http, createConfig } from 'wagmi'
import { optimism } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [optimism],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: 'your-walletconnect-project-id', // Get from walletconnect.com
    }),
  ],
  transports: {
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
})