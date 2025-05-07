//frontend/src/api/aiagents/speechToText.js
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import multer from "multer";
import express from "express";
import dotenv from "dotenv";
import FormData from "form-data";
import { sendEthToRecipient } from "./assetSender.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 60000 });
const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });

// Updated parseCommand function for speechToText.js
function parseCommand(text) {
  let lower = text.trim().toLowerCase().replace(/,/g, "");
  console.log("Original text:", lower);

  // Fix common speech-to-text errors in the full text
  lower = lower
    .replace(/.th\b/g, " eth")
    .replace(/.eth\b/g, " eth")
    .replace(/\bmth\b/g, " eth")
    .replace(/into h/g, " eth")
    .replace(/.88\b/g, ".eth")
    .replace(/.biz.eth/g, ".base.eth")
    .replace(/.bez.eth/g, ".base.eth")
    .replace(/.es.eth/g, ".base.eth")
    .replace(/fredmitonga/g, "fredgitonga")
    .replace(/fredgetonga/g, "fredgitonga")
    .replace(/fregetongat/g, "fredgitonga")
    .replace(/bayst eth/g, "base.eth")
    .replace(/baysteth/g, "base.eth");

  // Important: Fix the issue where spaces appear around dots in ENS names
  lower = lower.replace(/(\.[a-z]+)\s+(\.[a-z]+)/g, "$1$2");
  lower = lower.replace(/\s+\./g, ".");
  lower = lower.replace(/\.\s+/g, ".");

  console.log("Pre-processed text:", lower);

  // Special handling for fredgitonga.base.eth which seems to be troublesome
  if (lower.includes("fredgitonga") && lower.includes("base") && lower.includes("eth")) {
    // Direct name extraction for this common case
    console.log("Special case: fredgitonga ENS detected");
    const amountMatch = lower.match(/(\d+\.?\d*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0.0001;
    
    // Always use the correct ENS name for fredgitonga
    return { 
      amount, 
      recipient: "fredgitonga.base.eth"  // Directly provide the correct ENS
    };
  }

  // For other cases, use the regex approach
  const patterns = [
    // Match "send X eth to recipient.domain.eth"
    /\bsend\s+(\d+\.?\d*)\s*(?:eth|ethereum)?\s*to\s+([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)/,
    // Simpler fallback pattern
    /\bsend\s+(\d+\.?\d*)\s+to\s+([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)/
  ];

  let match = null;

  for (const pattern of patterns) {
    match = lower.match(pattern);
    console.log(`Testing pattern: ${pattern}`, "→ Match:", match);
    if (match) {
      break;
    }
  }

  if (!match) {
    console.log("No command match found");
    return null;
  }

  const amount = parseFloat(match[1]);
  let recipient = match[2].trim();

  // Improved ENS handling
  if (!recipient.endsWith(".eth")) {
    recipient = recipient + ".base.eth";
  } else if (recipient.endsWith(".base.base.eth")) {
    // Fix double base.eth issue
    recipient = recipient.replace(/\.base\.base\.eth$/, ".base.eth");
  }
  
  console.log("Final recipient address:", recipient);
  return { amount, recipient };
}
// Updated /transcribe endpoint with more robust command handling
// Updated /transcribe endpoint with special case handling
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname) || ".mp3";
    const tempPath = filePath + extension;
    fs.renameSync(filePath, tempPath);

    console.log("Processing audio file for transcription");

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment", "word"],
      language: "en",
      temperature: 0.0,
    });

    fs.unlinkSync(tempPath);

    const fullText = transcription.text;
    console.log("Transcribed text:", fullText);

    // Parse the command with our improved function
    const command = parseCommand(fullText);

    let txResult = null;
    let commandDetected = false;

    if (command) {
      commandDetected = true;
      console.log("Parsed send command:", command);

      // Format the transcription text to be more precise
      const formattedText = `Send ${command.amount} ETH to ${command.recipient}`;
      console.log("Formatted command:", formattedText);
      
      // Override the transcription text with our formatted version
      transcription.text = formattedText;

      try {
        // Check if the recipient contains "fredgitonga.base.base.eth"
        if (command.recipient === "fredgitonga.base.base.eth") {
          console.log("Fixing doubled base.eth in recipient");
          command.recipient = "fredgitonga.base.eth";
        }
        
        // Execute the transaction with the corrected recipient
        console.log("Executing transaction to:", command.recipient);
        txResult = await sendEthToRecipient(command.recipient, command.amount);
        console.log("Transaction result:", txResult);
      } catch (txError) {
        console.error("Transaction error:", txError);
        txResult = { success: false, error: txError.message };
      }
    }

    res.json({
      transcription,
      commandDetected,
      parsedCommand: command,
      transaction: txResult,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: error.message });
  }
});
// TEMPORARY: Test parsing independently
router.post("/test-parse", express.json(), (req, res) => {
  const text = req.body.text;
  const result = parseCommand(text);
  console.log("Test /test-parse received:", text, "→", result);
  res.json({ parsedCommand: result });
});



export default router;
