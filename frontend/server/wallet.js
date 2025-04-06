// server/index.js
import express from 'express';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors middleware

dotenv.config();

// Initialize Thirdweb SDK
const sdk = new ThirdwebSDK({
  clientId: process.env.THIRDWEB_CLIENT_ID,
});

const app = express();
const port = 3001; // Choose a different port from your Vite dev server

// Enable CORS
app.use(cors());
app.use(express.json());

// Function to resolve ENS name to address
async function resolveEnsAddress(basename) {
  try {
    const address = await sdk.resolveAddress(basename);
    return address;
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    throw new Error(`Failed to resolve ENS name: ${error.message}`);
  }
}

// Function to send ETH
async function sendEth(toAddress, amount) {
  try {
    const amountInEth = parseFloat(amount);
    if (isNaN(amountInEth) || amountInEth <= 0) {
      throw new Error("Invalid ETH amount. Must be a positive number.");
    }

    const amountInWei = ethers.utils.parseEther(amountInEth.toString());
    const signer = sdk.getSigner();

    if (!signer) {
      throw new Error("Signer (wallet) not available. Ensure you have a connected wallet.");
    }

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountInWei,
    });

    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error sending ETH:", error);
    throw new Error(`Failed to send ETH: ${error.message}`);
  }
}

// API endpoint
app.post('/api/sendEth', async (req, res) => {
  const { basename, amount } = req.body;

  if (!basename || !amount) {
    return res.status(400).json({ error: "Basename and amount are required." });
  }

  try {
    const toAddress = await resolveEnsAddress(basename);
    const transactionHash = await sendEth(toAddress, amount);

    res.json({
      success: true,
      toAddress,
      amount,
      transactionHash,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
