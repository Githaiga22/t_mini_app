import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThirdwebProvider } from "@thirdweb-dev/react";

// Base Sepolia chain config
// RPC endpoint comes from the environment so no provider key is committed.
// Falls back to the public Base Sepolia RPC when VITE_BASE_SEPOLIA_RPC_URL is unset.
const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

const activeChain = {
  chainId: 84532, // Base Sepolia
  rpc: [rpcUrl],
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
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
    >
      <App />
    </ThirdwebProvider>
  </StrictMode>
);
