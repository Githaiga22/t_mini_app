package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	// "github.com/joho/godotenv"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

var transferData = make(map[int64]map[string]string) // Store data for each user by chat ID
type TransferIntent struct {
	Amount float64
	Token  string
	To     string
}

var pendingTransfers = make(map[int64]TransferIntent) // chatID → intent

func main() {
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			// Handle preflight requests (OPTIONS)
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			// Process the actual request
			next(w, r)
		}
	}
	// err := godotenv.Load()
	// if err != nil {
	// 	fmt.Printf("Error loading .env file: %v", err)
	// }

	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	publicURL := os.Getenv("PUBLIC_URL")
	// https://t-mini-app.onrender.com

	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Fatalf("Error creating bot: %v", err)
	}

	bot.Debug = true
	log.Printf("Authorized on account %s", bot.Self.UserName)

	webhookURL := publicURL + "/" // Telegram will POST updates here
	parsedURL, err := url.Parse(webhookURL)
	if err != nil {
		log.Fatalf("Invalid webhook URL: %v", err)
	}
	webhookConfig := tgbotapi.WebhookConfig{URL: parsedURL}
	_, err = bot.Request(webhookConfig)
	if err != nil {
		log.Fatalf("Failed to set webhook: %v", err)
	}

	updates := bot.ListenForWebhook("/")

	// Health check route for Render
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Bot is running.")
	})

	http.HandleFunc("/home", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Server is running.")
	})

	http.HandleFunc("/send-response", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		// Check if the request is a POST request
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Read the request body
		var requestData struct {
			ChatID string `json:"chatID"`
			Text   string `json:"text"`
		}

		err := json.NewDecoder(r.Body).Decode(&requestData)
		if err != nil {
			http.Error(w, "Failed to parse request body", http.StatusBadRequest)
			return
		}

		// Check for transfer command using the extracted function
		isTransfer, transferData := extractTransferInfo(requestData.Text)

		// Create response object
		response := map[string]interface{}{
			"success": false,
			"message": "No transfer command detected",
		}

		if isTransfer {
			response = map[string]interface{}{
				"success": true,
				"message": fmt.Sprintf("Transfer of %s %s to %s detected",
					transferData["amount"],
					transferData["token"],
					transferData["recipient"]),
				"transfer": transferData,
			}

			// Here you would trigger your sendCrypto function
			// sendCrypto(transferData["amount"], transferData["token"], transferData["recipient"])
		} else {
			// call ai response function

			message, err := getAIResponseGemini(requestData.Text)
			if err != nil {
				response = map[string]interface{}{
					"success": false,
					"message": "Error getting AI response",
				}
			} else {
				response = map[string]interface{}{
					"success": true,
					"message": message,
				}
			}
		}

		// Send response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))

	
	// Start server in background
	go func() {
		log.Println("Starting HTTP server on :10000")
		log.Fatal(http.ListenAndServe(":10000", nil))
	}()

	for update := range updates {
		if update.Message == nil || update.Message.From.ID == bot.Self.ID {
			continue
		}

		handleUpdate(bot, update)

		// }
	}
	// log.Println("Starting HTTP server on :9000")
	// log.Fatal(http.ListenAndServe(":9000", nil))
}

// Function to check and extract transfer information from text
func extractTransferInfo(text string) (bool, map[string]string) {
	// Define a regex pattern to capture the funds transfer information
	// Example: "Send 0.5 ETH to john.doe.base.eth"
	transferPattern := `(?i)send\s+([\d.]+)\s*(eth|token)?\s+to\s+([a-zA-Z0-9.-]+\.base\.eth)`

	// Use regex to match the pattern in the user message
	re := regexp.MustCompile(transferPattern)
	matches := re.FindStringSubmatch(text)

	// If we found a match, process the transfer command
	if len(matches) >= 4 {
		amount := matches[1]
		token := matches[2]
		if token == "" {
			token = "ETH" // Default to ETH if not specified
		}
		recipient := matches[3]

		// Return the transfer details
		transferData := map[string]string{
			"amount":    amount,
			"token":     strings.ToUpper(token),
			"recipient": recipient,
		}

		return true, transferData
	}

	return false, nil
}

func getContext(input string, chatId int64, userId int64) string {
	if strings.Contains(input, "send") && strings.Contains(input, "eth") {
		return handleSendingEthContext(input, chatId, userId)
	}
	if strings.Contains(input, "balance") {
		return "Check my balance."
	}

	if strings.Contains(input, "help") {
		return "I want to know about Zapbase."
	}
	return input
}

func handleSendingEthContext(userMessage string, chatID int64, userID int64) string {
	// Define a regex pattern to capture the funds transfer information
	// Example: "Send 0.5 ETH to john.doe.base.eth"
	transferPattern := `(?i)send\s+([\d.]+)\s*(eth|token)?\s+to\s+([a-zA-Z0-9.-]+\.base\.eth)`

	// Use regex to match the pattern in the user message
	re := regexp.MustCompile(transferPattern)
	matches := re.FindStringSubmatch(userMessage)

	if len(matches) > 0 {
		// Extract transfer details
		amount := matches[1]    // Amount to send
		token := matches[2]     // Token type (ETH or custom token)
		recipient := matches[3] // Recipient's Base name

		// Store the transfer details in a map for later use
		transferData[chatID] = map[string]string{
			"amount":    amount,
			"token":     token,
			"recipient": recipient,
		}

		// Customize response to reflect funds transfer
		response := fmt.Sprintf("I want to send %s %s to %s. ", amount, token, recipient)
		return response
	}

	// If no funds transfer pattern is found, return a generic response
	return "What details do you need for the transfer?"
}

func sendingETH(amount float64, token string, recipient string) string {
	apiURL := "https://ens-asset-sender.onrender.com/send-asset"

	isEth := false
	token = strings.ToLower(token)
	if token == "eth" {
		isEth = true
	}

	fmt.Println("Sending ETH to recipient:", recipient)
	fmt.Println("Amount to send:", amount)
	fmt.Println("Is ETH:", isEth)

	payload := map[string]interface{}{
		"recipient": recipient,
		"amount":    amount,
		"isEth":     isEth, // we're sending ETH here
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling payload: %v", err)
		return "Failed to prepare transaction"
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error creating request: %v", err)
		return "Failed to send transaction"
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending request: %v", err)
		return "Failed to reach transaction server"
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response: %v", err)
		return "Failed to read server response"
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("Non-200 response: %s", body)
		return fmt.Sprintf("Transaction failed: %s", body)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("Error parsing response JSON: %v", err)
		return "Invalid response from server"
	}

	txHash, ok := result["txHash"].(string)
	if !ok {
		return "Transfer failed due to insufficient funds. Top up your wallet here: https://zapbase-imara1.vercel.app/"
	}
	return fmt.Sprintf("Transfer succeeded! Check the Transaction hash https://sepolia.basescan.org/tx/%s", txHash)
}

func handleUpdate(bot *tgbotapi.BotAPI, update tgbotapi.Update) {
	userText := update.Message.Text
	chatID := update.Message.Chat.ID
	userID := update.Message.From.ID
	log.Printf("User (%d): %s", userID, userText)
	// if update.Message != nil { // If we receive a message
	if update.Message.Text != "" { // Handle text messages

		// Check if user confirmed a transfer
		if strings.ToLower(userText) == "yes" {
			intent, exists := pendingTransfers[chatID]
			if exists {
				result := sendingETH(intent.Amount, intent.Token, intent.To)
				delete(pendingTransfers, chatID)
				bot.Send(tgbotapi.NewMessage(chatID, result))
				return
			}
		}

		// Check if user wants to send ETH
		// Detect transfer command
		if strings.HasPrefix(strings.ToLower(userText), "send") && strings.Contains(userText, "eth") {
			handleSendingEthContext(userText, userID, chatID)
			// Extract transfer details

			amount, exists := transferData[chatID]["amount"]
			if !exists {
				bot.Send(tgbotapi.NewMessage(chatID, "I couldn't find the amount you want to send. Please specify it in the format 'send <amount> eth to <recipient>'"))
				return
			}
			// Convert amount to float
			amountFloat, err := strconv.ParseFloat(amount, 64)
			if err != nil {
				bot.Send(tgbotapi.NewMessage(chatID, "I couldn't parse the amount you provided. Please specify it in the format 'send <amount> <eth> to <recipient>'"))
				return
			}
			// Extract token and recipient
			token, exists := transferData[chatID]["token"]
			if !exists {
				bot.Send(tgbotapi.NewMessage(chatID, "I couldn't find the token you want to send. Please specify it in the format 'send <amount> eth to <recipient>'"))
				return
			}
			recipient, exists := transferData[chatID]["recipient"]
			if !exists {
				bot.Send(tgbotapi.NewMessage(chatID, "I couldn't find the recipient you want to send to. Please specify it in the format 'send <amount> eth to <recipient>'"))
				return
			}

			if amountFloat > 0 && recipient != "" {
				pendingTransfers[chatID] = TransferIntent{Amount: amountFloat, To: recipient, Token: token}
				response := fmt.Sprintf("Kindly confirm you want to send %f %s to %s. Reply with 'yes' to confirm.", amountFloat, token, recipient)
				bot.Send(tgbotapi.NewMessage(chatID, response))
				return
			}
		}

		response, err := getAIResponseGemini(getContext(update.Message.Text, update.Message.Chat.ID, update.Message.From.ID))
		if err != nil {
			log.Printf("Error getting AI response: %v", err)
			bot.Send(tgbotapi.NewMessage(update.Message.Chat.ID, "Oops! Something went wrong."))
			return
		}
		// Simple safeguard for repeated phrases
		if strings.Count(response, "I'm sorry") > 3 {
			response = "Hmm... I didn’t quite get that. Could you rephrase?"
		}

		msg := tgbotapi.NewMessage(update.Message.Chat.ID, response)
		bot.Send(msg)
	}
}
