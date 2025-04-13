import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import multer from "multer";
import express from "express";
import dotenv from "dotenv";
import FormData from "form-data";
import { sendEthToRecipient } from "./assetSender.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });
function parseCommand(text) {
    const lower = text.toLowerCase().replace(/,/g, "");// Remove punctuation
  
    // Convert common mishearing patterns (optional - you can expand this)
    const corrections = {
      "fregetongat baysteth": "fredgitonga dot base dot eth",
      "fred gitonga base eth": "fredgitonga dot base dot eth",
      "base death": "base dot eth",
      "base f": "base dot eth",
    };
  
    for (const wrong in corrections) {
      if (lower.includes(wrong)) {
        text = lower.replace(wrong, corrections[wrong]);
        break;
      }
    }
  
    const match = text.match(/send ([\d.]+|zero point \d+) (ethereum|eth) to ([\w\s.-]+(?: dot base dot eth| dot eth))/);
    if (!match) return null;
  
    let amountStr = match[1];
    let recipientRaw = match[3];
  
    amountStr = amountStr.replace(/zero point ([\d]+)/, "0.$1");
    const recipient = recipientRaw.trim().replace(/\s+/g, '').replace(/dot/g, '.');
  
    return {
      amount: parseFloat(amountStr),
      recipient
    };
  }
  
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname) || ".mp3";
    const tempPath = filePath + extension;
    fs.renameSync(filePath, tempPath);

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
    const command = parseCommand(fullText);

    let txResult = null;

    if (command) {
      console.log("Parsed send command:", command);
      txResult = await sendEthToRecipient(command.recipient, command.amount);
    }

    res.json({
      transcription,
      commandDetected: !!command,
      parsedCommand: command,
      transaction: txResult,
    });

  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
