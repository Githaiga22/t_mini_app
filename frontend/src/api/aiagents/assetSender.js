import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ResolveBaseName } from "./trial.js";

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Log environment variables status
console.log("assetSender.js - Environment variable status:");
console.log("- RPC_URL:", process.env.RPC_URL ? "✓ Set" : "✗ Not set");
console.log("- PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✓ Set" : "✗ Not set");

// Use explicit RPC_URL or fallback
const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";
console.log("Using RPC URL:", RPC_URL);

// Initialize provider with proper error handling
let provider;
try {
  provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  console.log("Provider initialized successfully");
} catch (error) {
  console.error("Failed to initialize provider:", error);
  // Create a fallback provider for Base Sepolia
  provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
  console.log("Fallback provider initialized");
}

// Initialize wallet only if provider and PRIVATE_KEY are available
let wallet;
try {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is not set");
  }
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Wallet initialized with address:", wallet.address);
} catch (error) {
  console.error("Failed to initialize wallet:", error);
}

// Enhanced sendEthToRecipient function with better error handling
export async function sendEthToRecipient(nameOrAddress, amountEth) {
  try {
    console.log(`Attempting to send ${amountEth} ETH to ${nameOrAddress}`);

    // Verify environment variables are set
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL environment variable not set. Check your .env file.");
    }
    
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY environment variable not set. Check your .env file.");
    }

    // Verify provider and wallet are initialized
    if (!provider) {
      throw new Error("Ethereum provider not initialized");
    }
    
    if (!wallet) {
      throw new Error("Ethereum wallet not initialized");
    }

    // Check provider connection before proceeding
    try {
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.name, "chainId:", network.chainId);
    } catch (networkError) {
      console.error("Network connection error:", networkError);
      throw new Error(`Provider network error: ${networkError.message}`);
    }

    // Validate the amount
    const amount = parseFloat(amountEth);
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid ETH amount: ${amountEth}`);
    }

    // Process the recipient address
    let recipient = nameOrAddress.trim();

    // Handle address resolution based on domain
    if (!ethers.utils.isAddress(recipient)) {
      console.log(`Resolving ENS name: ${recipient}`);
      
      try {
        // Handle base.eth domains
        if (recipient.endsWith('.base.eth')) {
          console.log("Resolving Base name");
          recipient = await ResolveBaseName(recipient);
          console.log(`Resolved to: ${recipient}`);
        } 
        // Handle regular .eth domains
        else if (recipient.endsWith('.eth')) {
          console.log("Resolving ENS name");
          recipient = await provider.resolveName(recipient);
          console.log(`Resolved to: ${recipient}`);
        }
        
        // Verify resolution was successful
        if (!recipient || !ethers.utils.isAddress(recipient)) {
          throw new Error(`Unable to resolve address for ${nameOrAddress}`);
        }
      } catch (resolutionError) {
        console.error("Name resolution error:", resolutionError);
        throw new Error(`Failed to resolve ${nameOrAddress}: ${resolutionError.message}`);
      }
    }

    // Prepare and send the transaction
    console.log(`Sending ${amountEth} ETH to resolved address: ${recipient}`);

    try {
      // Check wallet balance before sending
      const balance = await wallet.getBalance();
      const requiredWei = ethers.utils.parseEther(amount.toString());
      
      console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
      
      if (balance.lt(requiredWei)) {
        throw new Error(`Insufficient wallet balance. Current: ${ethers.utils.formatEther(balance)} ETH, Required: ${amount} ETH`);
      }
      
      // Build transaction with proper gas parameters
      const tx = {
        to: recipient,
        value: ethers.utils.parseEther(amount.toString()),
        // Using EIP-1559 parameters for reliable transactions
        type: 2,
        maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei"),
        gasLimit: 21000 * 2 // Standard gas limit with buffer
      };
      
      // Send transaction and wait for receipt
      const txResponse = await wallet.sendTransaction(tx);
      console.log("Transaction sent:", txResponse.hash);
      
      const receipt = await txResponse.wait(1); // Wait for 1 confirmation
      
      return { 
        success: true, 
        txHash: txResponse.hash, 
        to: recipient,
        amount: amount,
        confirmations: receipt.confirmations,
        blockNumber: receipt.blockNumber
      };
    } catch (txError) {
      console.error("Transaction failed:", txError);
      return { 
        success: false, 
        error: txError.message,
        to: recipient,
        amount: amount 
      };
    }
  } catch (err) {
    console.error("Sending ETH failed:", err);
    return {
      success: false,
      error: err.message,
      originalError: err
    };
  }
}