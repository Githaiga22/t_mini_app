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

// Improved command parser for ETH transfers
function parseCommand(text) {
  let lower = text.trim().toLowerCase().replace(/,/g, "");
  console.log("Original text:", lower);

  // Fix common speech-to-text errors in the full text
  lower = lower
    .replace(/\.th\b/g, " eth")
    .replace(/\.eth\b/g, " eth")
    .replace(/\bmth\b/g, " eth")
    .replace(/into h/g, " eth")
    .replace(/\.88\b/g, ".eth")
    .replace(/\.biz\.eth/g, ".base.eth")
    .replace(/\.bez\.eth/g, ".base.eth")
    .replace(/\.es\.eth/g, ".base.eth")
    .replace(/fredmitonga/g, "fredgitonga")
    .replace(/fredgetonga/g, "fredgitonga");

  console.log("Pre-processed text:", lower);

  // Regex patterns to match various speech-to-text variations
  const patterns = [
    /send\s+([\d.]+)\s+eth\s+to\s+([\w.-]+)/i,
    /send\s+([\d.]+)\s+to\s+([\w.-]+)/i,
    /send\s+([\d.]+)(?:\s+\w+)?\s+(?:eth)?\s+to\s+([\w.-]+)/i
  ];

  let match = null; // ✅ THIS MUST BE OUTSIDE THE LOOP

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

  if (!recipient.endsWith(".eth")) {
    recipient = recipient + ".base.eth";
  }

  return { amount, recipient };
}

// Updated /transcribe endpoint with more robust command handling
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
      transcription.text = `Send ${command.amount} ETH to ${command.recipient}`;

      try {
        // Execute the transaction
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
