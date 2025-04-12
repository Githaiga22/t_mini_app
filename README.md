# Virtuals Hackathon Project

## Overview

This repository contains our submission for the **Virtuals Hackathon**, where we aim to build an innovative solution aligned with the theme of **Next Generation of Autonomous Businesses**. Our focus is on leveraging AI and blockchain technologies to create impactful and scalable solutions.

---

## Getting Started

###
Access the Telegram bot [here](https://t.me/myUXCrushbot)

To check the app is running, you can ping: you will get the response *Bot is running.*

[*https://t-mini-app.onrender.com/health*](https://t-mini-app.onrender.com/health)


### Project Goals
- Develop an **AI-powered autonomous agent** as the core of our solution.
- Ensure deployment on **Base** with on-chain execution where applicable.
- Align with one or more clusters from the [**Virtuals AI Clusters**](https://hack.virtuals.io/).

### Key Clusters of Interest
- **Autonomous Hedge Fund & Trading DAO**
- **Autonomous Game Studio**
- **Autonomous Marketing Agency**

---

## Plan of Action

1. **Research & Ideation**: Explore the problem space and finalize our project idea.
2. **Development**: Build the AI agent and integrate it with blockchain components.
3. **Testing & Deployment**: Ensure functionality and deploy on Base.
4. **Submission**: Prepare the required materials (demo, repository, pitch deck).

---

## Repository Structure

- `/src`: Source code for the project.
- `/docs`: Documentation and pitch deck.
- `/demo`: Any demo files or links.

---
## Speech-to-Text Backend API

### Overview
This backend service provides audio transcription capabilities using the Groq AI platform. It accepts audio file uploads and returns text transcriptions along with timestamps for segments and individual words.

### Prerequisites
- Node.js (v14 or higher)
- npm
- A Groq API key (sign up at https://console.groq.com/)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
```
   GROQ_API_KEY=your_groq_api_key_here
```

3. **Start the API server**
```
cd frontend
npm run start:api
```
Using the API
Endpoint: Transcribe Audio
``POST /api/aiagents/transcribe``


Example using cURL:

```
curl -X POST http://localhost:3000/api/aiagents/transcribe   -H "Content-Type: multipart/form-data"   
-F "audio=@/home/ken/Projects/t_mini_app/frontend/uploads/voicemail.mp3"
```

## Deadlines

- **Final Submission Deadline:** April 14, 2025
- **Demo Day:** April 17, 2025

Let’s collaborate and make this project a success!
