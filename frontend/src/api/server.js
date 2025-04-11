import express from "express";
import cors from "cors";
import speechToTextRouter from "./aiagents/speechToText.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route for speech to text
app.use("/api/aiagents", speechToTextRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
