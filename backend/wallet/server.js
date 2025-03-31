import express from "express";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { resolveAddress, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Connect to Base Mainnet
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const sdk = ThirdwebSDK.fromProvider(provider);

// Middleware to parse JSON requests
app.use(express.json());

// Function 1: Resolve Base Name to Ethereum Address
async function resolveBaseName(baseName) {
    try {
        console.log(`Resolving Base Name: ${baseName}...`);
        const recipientAddress = await resolveAddress({
            client: sdk.getProvider(),
            name: baseName,
            resolverAddress: BASENAME_RESOLVER_ADDRESS,
            resolverChain: base,
        });

        if (!recipientAddress || recipientAddress === ethers.constants.AddressZero) {
            console.error("Error: Could not resolve Base Name.");
            return null;
        }

        console.log(`Resolved Address: ${recipientAddress}`);
        return recipientAddress;
    } catch (error) {
        console.error("Error resolving Base Name:", error);
        return null;
    }
}

// Function 2: Send ETH to an Ethereum Address
async function sendEth(toAddress, amountInEth, senderPrivateKey) {
    try {
        if (!toAddress) {
            console.error("Invalid recipient address.");
            return { success: false, message: "Invalid recipient address." };
        }

        // Set up a wallet to send the transaction
        const wallet = new ethers.Wallet(senderPrivateKey, provider);

        // Create a transaction
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.utils.parseEther(amountInEth),
        });

        console.log(`Transaction sent! Tx Hash: ${tx.hash}`);
        await tx.wait();
        console.log("Transaction confirmed!");

        return { success: true, txHash: tx.hash };
    } catch (error) {
        console.error("Error sending ETH:", error);
        return { success: false, message: error.message };
    }
}

// API Route: POST /send-eth
app.post("/send-eth", async (req, res) => {
    const { baseName, amountInEth, senderPrivateKey } = req.body;

    if (!baseName || !amountInEth || !senderPrivateKey) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        // Resolve Base Name first
        const recipientAddress = await resolveBaseName(baseName);

        if (!recipientAddress) {
            return res.status(400).json({ success: false, message: "Base Name resolution failed." });
        }

        // Send ETH
        const result = await sendEth(recipientAddress, amountInEth, senderPrivateKey);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
