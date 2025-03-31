package main

import (
	"log"
	"os"
	"github.com/joho/godotenv"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func main() {

	err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }



	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")


	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Fatalf("Error creating bot: %v", err)
	}

	bot.Debug = true

	log.Printf("Authorized on account %s", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60



	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message != nil { // If we receive a message
			if update.Message.Text != "" { // Handle text messages
				msg := tgbotapi.NewMessage(update.Message.Chat.ID, "You sent: "+update.Message.Text)
				bot.Send(msg)
			}
		}
	}
}
