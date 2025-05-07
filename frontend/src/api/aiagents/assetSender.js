//frontend/src/api/aiagents/assetSender.js
import { ethers } from "ethers";
import dotenv from "dotenv";
import { ResolveBaseName } from "./trial.js";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Enhanced sendEthToRecipient function with better error handling
export async function sendEthToRecipient(nameOrAddress, amountEth) {
  try {
    console.log(`Attempting to send ${amountEth} ETH to ${nameOrAddress}`);
    
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