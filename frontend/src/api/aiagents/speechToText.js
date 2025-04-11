import fs from "fs";              // For file system operations
import path from "path";          // For handling file paths
import Groq from "groq-sdk";      // Groq API client for AI services
import multer from "multer";      // Middleware for handling multipart/form-data
import express from "express";    // Web framework
import dotenv from "dotenv";      // For loading environment variables
import FormData from "form-data"; // For creating multipart form data

// Load environment variables from .env file
dotenv.config();

// Initialize Groq client with API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Create an Express router to handle API routes
const router = express.Router();

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });

// POST endpoint for audio transcription
// Uses multer middleware to handle the file upload named "audio"
router.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        // Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        // Get the path where multer saved the uploaded file (without extension)
        const filePath = req.file.path;
        
        // Extract the original file extension or default to .mp3
        const extension = path.extname(req.file.originalname) || ".mp3";
        
        // Create a new path with the proper extension
        const tempPath = filePath + extension;

        // Rename the file to include the extension
        // This is needed because multer stores files without extensions
        fs.renameSync(filePath, tempPath);

        // Log information about the uploaded file for debugging
        console.log("Uploaded file:", req.file);

        // Call the Groq API to transcribe the audio file
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),  // Create a readable stream from the file
            model: "whisper-large-v3-turbo",      // Use Whisper large model
            response_format: "verbose_json",       // Get detailed JSON response
            timestamp_granularities: ["segment", "word"], // Include timestamps at segment and word level
            language: "en",                        // Specify English language
            temperature: 0.0,                      // Use deterministic output (no randomness)
        });

        // Remove the temporary file after processing
        fs.unlinkSync(tempPath);

        // Return the transcription result to the client
        res.json(transcription);
    } catch (error) {
        // Log any errors that occur during transcription
        console.error("Transcription error:", error);
        
        // If there's API response data in the error, log that too
        if (error.response?.data) {
            console.error("API Error Details:", error.response.data);
        }
        
        // Return an error response to the client
        res.status(500).json({ error: error.message });
    }
});

// Export the router for use in the main server file
export default router;