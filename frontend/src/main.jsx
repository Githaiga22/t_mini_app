import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThirdwebProvider } from "@thirdweb-dev/react";

// Base Sepolia chain config
const activeChain = {
  chainId: 84532, // Base Sepolia
  rpc: ["https://base-sepolia.infura.io/v3/5b44508b90054bc2a316745f3dbe6a37"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  shortName: "bsep",
  slug: "base-sepolia",
  testnet: true,
  chain: "Base Sepolia",
  name: "Base Sepolia Testnet",
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThirdwebProvider 
      activeChain={activeChain}
      clientId="YOUR_CLIENT_ID_HERE" // Optional: Replace with your ThirdWeb client ID
    >
      <App />
    </ThirdwebProvider>
  </StrictMode>
);
