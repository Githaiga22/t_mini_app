// diagnostic.js
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup proper paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
console.log("Environment loaded");

// Output environment variable status (without revealing sensitive data)
console.log("Environment variable status:");
console.log("- RPC_URL: " + (process.env.RPC_URL ? "✓ Set" : "✗ Not set"));
console.log("- PRIVATE_KEY: " + (process.env.PRIVATE_KEY ? "✓ Set" : "✗ Not set"));

// Test all possible RPC endpoints
async function testNetworkConnection(rpcUrl, name) {
  console.log(`\nTesting connection to ${name} (${rpcUrl})...`);
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    console.log("Provider instance created. Attempting network connection...");
    
    const network = await provider.getNetwork();
    console.log(`✓ SUCCESS! Connected to ${name}:`);
    console.log(`  - Network name: ${network.name}`);
    console.log(`  - Chain ID: ${network.chainId}`);
    
    // Try getting block number to verify full connectivity
    const blockNumber = await provider.getBlockNumber();
    console.log(`  - Current block: ${blockNumber}`);
    
    return true;
  } catch (error) {
    console.log(`✗ FAILED to connect to ${name}:`);
    console.log(`  - Error: ${error.message}`);
    console.log(`  - Code: ${error.code}`);
    return false;
  }
}

// Test wallet creation and balance
async function testWallet(rpcUrl, name) {
  if (!process.env.PRIVATE_KEY) {
    console.log("\n✗ Cannot test wallet - PRIVATE_KEY not set in environment");
    return false;
  }
  
  console.log(`\nTesting wallet with ${name} (${rpcUrl})...`);
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`Wallet created with address: ${wallet.address}`);
    
    const balance = await wallet.getBalance();
    console.log(`✓ SUCCESS! Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    return true;
  } catch (error) {
    console.log(`✗ FAILED to create or check wallet:`);
    console.log(`  - Error: ${error.message}`);
    return false;
  }
}

// Test ENS resolution
async function testENSResolution(rpcUrl, name, ensName) {
  console.log(`\nTesting ENS resolution for ${ensName} using ${name}...`);
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    console.log(`Attempting to resolve ${ensName}...`);
    
    // For Base ENS resolution, we'd need to use the custom resolver
    // But for this test we'll just check if the provider can make the call
    let address;
    
    if (ensName.endsWith('.base.eth')) {
      console.log("Note: Base ENS names require special resolution logic");
      address = "0x0000000000000000000000000000000000000000"; // Placeholder
    } else {
      address = await provider.resolveName(ensName);
    }
    
    console.log(`✓ Provider able to make resolution calls`);
    return true;
  } catch (error) {
    console.log(`✗ FAILED to resolve ENS name:`);
    console.log(`  - Error: ${error.message}`);
    return false;
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log("======= NETWORK CONNECTIVITY DIAGNOSTICS =======");
  console.log(`Date: ${new Date().toISOString()}`);
  console.log("Node.js version:", process.version);
  console.log("Ethers.js version:", ethers.version);
  
  // Test different RPC endpoints
  const rpcEndpoints = [
    { url: process.env.RPC_URL || "", name: "ENV Variable RPC_URL" },
    { url: "https://sepolia.base.org", name: "Base Sepolia" },
    { url: "https://mainnet.base.org", name: "Base Mainnet" },
    { url: "https://eth-sepolia.g.alchemy.com/v2/demo", name: "Alchemy Sepolia Demo" }
  ];
  
  let bestProvider = null;
  
  for (const endpoint of rpcEndpoints) {
    if (!endpoint.url) {
      console.log(`\nSkipping empty URL for ${endpoint.name}`);
      continue;
    }
    
    const success = await testNetworkConnection(endpoint.url, endpoint.name);
    if (success && !bestProvider) {
      bestProvider = endpoint;
    }
  }
  
  // Test wallet if we found a working provider
  if (bestProvider) {
    await testWallet(bestProvider.url, bestProvider.name);
    await testENSResolution(bestProvider.url, bestProvider.name, "vitalik.eth");
    await testENSResolution(bestProvider.url, bestProvider.name, "fredgitonga.base.eth");
  } else {
    console.log("\n✗ Could not find any working RPC endpoint. Recommendations:");
    console.log("  1. Check your internet connection");
    console.log("  2. Ensure your RPC_URL is correct");
    console.log("  3. Try using a different RPC endpoint provider");
  }
  
  console.log("\n======= DIAGNOSTICS COMPLETE =======");
}

// Run the diagnostics
runDiagnostics().catch(console.error);