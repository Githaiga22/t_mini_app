package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
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
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Fatalf("Error loading .env file: %v", err)
	// }

	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")

	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Fatalf("Error creating bot: %v", err)
	}

	bot.Debug = true

	log.Printf("Authorized on account %s", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	// Set up Telegram updates
	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message == nil || update.Message.From.ID == bot.Self.ID {
			continue
		}

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
					continue
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
					continue
				}
				// Convert amount to float
				amountFloat, err := strconv.ParseFloat(amount, 64)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "I couldn't parse the amount you provided. Please specify it in the format 'send <amount> <eth> to <recipient>'"))
					continue
				}
				// Extract token and recipient
				token, exists := transferData[chatID]["token"]
				if !exists {
					bot.Send(tgbotapi.NewMessage(chatID, "I couldn't find the token you want to send. Please specify it in the format 'send <amount> eth to <recipient>'"))
					continue
				}
				recipient, exists := transferData[chatID]["recipient"]
				if !exists {
					bot.Send(tgbotapi.NewMessage(chatID, "I couldn't find the recipient you want to send to. Please specify it in the format 'send <amount> eth to <recipient>'"))
					continue
				}

				if amountFloat > 0 && recipient != "" {
					pendingTransfers[chatID] = TransferIntent{Amount: amountFloat, To: recipient, Token: token}
					response := fmt.Sprintf("Kindly confirm you want to send %f %s to %s. Reply with 'yes' to confirm.", amountFloat, token, recipient)
					bot.Send(tgbotapi.NewMessage(chatID, response))
					continue
				}
			}

			response, err := getAIResponseGemini(getContext(update.Message.Text, update.Message.Chat.ID, update.Message.From.ID))
			if err != nil {
				log.Printf("Error getting AI response: %v", err)
				bot.Send(tgbotapi.NewMessage(update.Message.Chat.ID, "Oops! Something went wrong."))
				continue
			}
			// Simple safeguard for repeated phrases
			if strings.Count(response, "I'm sorry") > 3 {
				response = "Hmm... I didn’t quite get that. Could you rephrase?"
			}

			msg := tgbotapi.NewMessage(update.Message.Chat.ID, response)
			bot.Send(msg)
		}
		// }
	}

	// run a server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, world!")
	})
	log.Fatal(http.ListenAndServe(":8080", nil))

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
		amount := matches[1]                  // Amount to send
		token := matches[2]                   // Token type (ETH or custom token)
		recipient := matches[3]  // Recipient's Base name

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
