package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// Structs for parsing the Gemini response JSON
type Response struct {
	Result struct {
		Message struct {
			Text string `json:"text"`
		} `json:"message"`
	} `json:"result"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

// Function to get AI response from Gemini
func getAIResponseGemini(input string) (string, error) {
	context := "You are a helpful assistant called Frechi for a crypto application called ZapBase. Be empathetic and respond with clear, concise instructions. The user can ask for their balance, transfer ETH using a wallet address or basename i.e username.base.eth, check token prices, or tip the app Zapbase'. If the request is outside these actions, inform them of what they can do.. Please respond to the following message:"
	// Gemini API URL
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + os.Getenv("GEMINI_API_KEY")

	// Construct the request body (matching your cURL)
	reqBody := fmt.Sprintf(`{
		"contents": [{
			"parts": [{
				"text": "%s %s"
			}]
		}]
	}`, context, input)

	// Create an HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(reqBody)))
	if err != nil {
		return "", err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Read the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// Parse the Gemini response into the GeminiResponse struct
	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return "", err
	}

	// Extract the generated text from the response
	if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
		return geminiResp.Candidates[0].Content.Parts[0].Text, nil
	}

	return "No response generated", nil
}
