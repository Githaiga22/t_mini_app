import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import multer from "multer";
import express from "express";
import dotenv from "dotenv";
import FormData from "form-data";
import { sendEthToRecipient } from "./assetSender.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 60000  });
const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });
function parseCommand(text) {
  let lower = text.toLowerCase().replace(/,/g, "");

  console.log(process.env.GROQ_API_KEY)
  // Apply corrections
  const corrections = {
    "fregetongat baysteth": "fredgitonga dot base dot eth",
    "fred gitonga base eth": "fredgitonga dot base dot eth",
    "base death": "base dot eth",
    "base f": "base dot eth",
    "base.f": "base dot eth",
    "fred gitonga base": "fredgitonga dot base dot eth",
    "fredgitonga.base.f": "fredgitonga dot base dot eth",
    "fredgitonga.base.f.": "fredgitonga dot base dot eth",
    "earth": "eth",
    "0.0005 earth": "0.0005 eth",
    "0.005 earth": "0.005 eth",
    "0.05 earth": "0.05 eth",
    " 0.0005F ": "0.005 eth",
    "fredgitonga.base.f": "fredgitonga dot base dot eth"
  };

  for (const wrong in corrections) {
    if (lower.includes(wrong)) {
      lower = lower.replace(wrong, corrections[wrong]);
    }
  }

  console.log(lower)
  const match = lower.match(
    /send\s+([\d.]+|zero point \d+)\s+(ethereum|eth)\s+to\s+([\w\s.-]+(?: dot base dot eth| dot eth))/
  );

  if (!match) return null;

  let amountStr = match[1];
  let recipientRaw = match[3];

  amountStr = amountStr.replace(/zero point ([\d]+)/, "0.$1");
  const recipient = recipientRaw.trim().replace(/\s+/g, "").replace(/dot/g, ".");

  return {
    amount: parseFloat(amountStr),
    recipient,
  };
}

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname) || ".mp3";
    const tempPath = filePath + extension;
    fs.renameSync(filePath, tempPath);

    console.log("before transcription, reaches here")
    console.log(process.env.GROQ_API_KEY)
    
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment", "word"],
      language: "en",
      temperature: 0.0,
    });

    console.log("reaches here")
    fs.unlinkSync(tempPath);

    const fullText = transcription.text;
    const command = parseCommand(fullText);

    let txResult = null;
    

    if (command) {
      console.log("Parsed send command:", command);
      transcription.text = `Send ${command.amount} Eth to ${command.recipient}`;
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
