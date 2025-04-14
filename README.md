# ZapBase

## Overview

[ZapBase](https://zapbase.onrender.com) enables users to **initiate Ethereum transactions** using **voice commands**. The system integrates a smart contract that maps **basenames** (e.g., `alice.base.eth`) to wallet addresses, enabling secure and seamless voice-triggered asset transfers aligned with the theme of **Next Generation of Autonomous Businesses**. Our focus is on leveraging AI and blockchain technologies to create impactful and scalable solutions.
This application enables users to:

- 🎤 **Use voice commands** like “Send 0.01 ETH to jane.base.eth”  
- 💸 **Trigger on-chain ETH transactions**  
- 🔗 Interact with a smart contract for name-to-address resolution  


---

## Getting Started

###
Access the Telegram bot [here](https://t.me/myUXCrushbot)

To check the app is running, you can ping: you will get the response `Bot is running.`

[*https://t-mini-app.onrender.com/health*](https://t-mini-app.onrender.com/health)


### Basename Resolution Smart Contract

A Solidity smart contract that stores and resolves basenames to Ethereum addresses.

### 

```solidity
mapping(string => address) public nameToAddress;

function getAddress(string memory name) public view returns (address);
```

### Voice-Driven Transaction Flow

1. User speaks:  
   “Send 0.02 ETH to jane”

2. Frontend captures and sends:

   ```
   {
     "basename": "jane.base.eth",
     "amount": "0.02"
   }
   ```
3. Backend (`/send` endpoint):
   - Uses `web.js` to interact with` SC` to resolve `jane.base.eth → 0xReceiver`
   - Calls `sendAsset("0xReceiver", "0.02")`
   - Responds with transaction hash

Voice recognition is handled externally (e.g., browser or mobile), with text commands sent to this backend for blockchain execution.
### Project Goals
- Develop an **AI-powered autonomous agent** as the core of our solution.
- Ensure deployment on **Base** with on-chain execution where applicable.


### Steps of Action

1. **Research & Ideation**: Explore the problem space and finalize our project idea.
2. **Development**: Build the AI agent and integrate it with blockchain components.
3. **Testing & Deployment**: Ensure functionality and deploy on Base.
4. **Submission**: Prepare the required materials (demo, repository, pitch deck).

---

### Repository Structure

- `/backend`: Source code for website.
- `/frontend`: Documentation and pitch deck.
- `/frontend/src/api`: Source code for AI agent.
- [`ens-asset-sender`](https://github.com/kenkomu/ens-asset-sender) : Source code for Smart contracts.
---
## Front-end

### How to run
**Start the server**
   ```
   cd frontend
   npm run dev
   ```

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
Using the API Endpoint: 

- Transcribe Audio

   ``POST /api/aiagents/transcribe``


Example using cURL:

```
curl -X POST http://localhost:3000/api/aiagents/transcribe   -H "Content-Type: multipart/form-data"   
-F "audio=@/path/to/your/audio/file.mp3"
```

## Telegram Bot Backend API

### Overview
This backend service provide telegram bot. It 

### Prerequisites
- Go 1.23.4
- A Gemini API key (sign up at [here](https://aistudio.google.com/app/apikey))

### Setup

1. **Install dependencies**
   ```bash
   go tidy
   ```
2. **Configure environment variables**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   TELEGRAM_BOT_TOKEN=your_bot_token_api_key_here
   PUBLIC_URL=hosted_website_url
   ```

3. **Start the API server**
   ```
   cd backend
   go run main.go
   ```

To check bot is running well, run:

```
curl -X GET http://localhost:9000/health
```


### Team
-  [Blessing Chika](https://www.linkedin.com/in/blessingchika) - Product Manager
- [Allan Robinson K G](https://github.com/Githaiga22)  - Frontend Dev
- [Kenneth Njoroge](https://github.com/kenkomu/) - AI Dev
- [Fred Gitonga](https://github.com/FredMunene) - Backend Dev
- [Marreyharm]() - Designer

