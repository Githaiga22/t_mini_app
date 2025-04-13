import { ethers } from "ethers";
import dotenv from "dotenv";
import { ResolveBaseName } from "./trial.js";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export async function sendEthToRecipient(nameOrAddress, amountEth) {
  try {
    let recipient = nameOrAddress.trim();

    if (!ethers.utils.isAddress(recipient)) {
      if (recipient.endsWith('.base.eth')) {
        recipient = await ResolveBaseName(recipient);
      } else if (recipient.endsWith('.eth')) {
        recipient = await provider.resolveName(recipient);
      }

      if (!recipient || !ethers.utils.isAddress(recipient)) {
        throw new Error("Unable to resolve recipient address");
      }
    }

    const tx = await wallet.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther(amountEth.toString())
    });

    await tx.wait();
    return { success: true, txHash: tx.hash, to: recipient };
  } catch (err) {
    console.error("Sending ETH failed:", err);
    return { success: false, error: err.message };
  }
}
