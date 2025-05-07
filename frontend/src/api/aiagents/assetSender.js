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

// Enhanced sendEthToRecipient function with gas fee calculation and display
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
    let recipientAddress = null;

    // Handle address resolution based on domain
    if (!ethers.utils.isAddress(recipient)) {
      console.log(`Resolving ENS name: ${recipient}`);
      
      try {
        // Handle base.eth domains
        if (recipient.endsWith('.base.eth')) {
          console.log("Resolving Base name");
          recipientAddress = await ResolveBaseName(recipient);
          console.log(`Resolved to: ${recipientAddress}`);
        } 
        // Handle regular .eth domains
        else if (recipient.endsWith('.eth')) {
          console.log("Resolving ENS name");
          recipientAddress = await provider.resolveName(recipient);
          console.log(`Resolved to: ${recipientAddress}`);
        }
        
        // Verify resolution was successful
        if (!recipientAddress || !ethers.utils.isAddress(recipientAddress)) {
          throw new Error(`Unable to resolve address for ${nameOrAddress}`);
        }
      } catch (resolutionError) {
        console.error("Name resolution error:", resolutionError);
        throw new Error(`Failed to resolve ${nameOrAddress}: ${resolutionError.message}`);
      }
    } else {
      recipientAddress = recipient;
    }

    // Prepare and send the transaction
    console.log(`Sending ${amountEth} ETH to resolved address: ${recipientAddress}`);

    try {
      // Check wallet balance before sending
      const balance = await wallet.getBalance();
      const requiredWei = ethers.utils.parseEther(amount.toString());
      
      console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasLimit = 21000; // Standard gas limit for ETH transfers
      
      // Calculate gas cost
      const maxFeePerGas = feeData.maxFeePerGas || ethers.utils.parseUnits('10', 'gwei');
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.utils.parseUnits('1.5', 'gwei');
      
      const estimatedGasCost = gasLimit * maxFeePerGas;
      const totalTransactionCost = requiredWei.add(estimatedGasCost);
      
      console.log(`Transaction details:`);
      console.log(`- ETH amount: ${ethers.utils.formatEther(requiredWei)} ETH`);
      console.log(`- Estimated gas cost: ${ethers.utils.formatEther(estimatedGasCost)} ETH`);
      console.log(`- Total cost (including gas): ${ethers.utils.formatEther(totalTransactionCost)} ETH`);
      
      if (balance.lt(totalTransactionCost)) {
        throw new Error(`Insufficient wallet balance. Current: ${ethers.utils.formatEther(balance)} ETH, Required (with gas): ${ethers.utils.formatEther(totalTransactionCost)} ETH`);
      }
      
      // Build transaction with proper gas parameters
      const tx = {
        to: recipientAddress,
        value: requiredWei,
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
      };
      
      // Send transaction and wait for receipt
      const txResponse = await wallet.sendTransaction(tx);
      console.log("Transaction sent:", txResponse.hash);
      
      const receipt = await txResponse.wait(1); // Wait for 1 confirmation
      
      // Calculate actual gas used and cost
      const actualGasUsed = receipt.gasUsed;
      const actualGasCost = receipt.effectiveGasPrice.mul(actualGasUsed);
      
      console.log(`Actual gas used: ${actualGasUsed.toString()}`);
      console.log(`Actual gas cost: ${ethers.utils.formatEther(actualGasCost)} ETH`);
      console.log(`Total transaction cost: ${ethers.utils.formatEther(requiredWei.add(actualGasCost))} ETH`);
      
      return { 
        success: true, 
        txHash: txResponse.hash, 
        to: recipientAddress,
        amount: amount,
        confirmations: receipt.confirmations,
        blockNumber: receipt.blockNumber,
        gasCost: ethers.utils.formatEther(actualGasCost),
        totalCost: ethers.utils.formatEther(requiredWei.add(actualGasCost))
      };
    } catch (txError) {
      console.error("Transaction failed:", txError);
      return { 
        success: false, 
        error: txError.message,
        to: recipientAddress,
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