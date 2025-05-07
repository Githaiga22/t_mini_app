import { useState, useEffect, useRef } from 'react';
import { Mic, ArrowLeft } from 'lucide-react';

function SendMoney({ onBack, onSend }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState([
    // Initial examples to show the chat layout
    { type: 'user', text: "Hi" },
    { type: 'assistant', text: "Hello, how can I help you" }
  ]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioStream = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of chat when conversations update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations]);

  // Function to start recording when button is pressed down
  const startRecording = async () => {
    try {
      console.log("recording starting");
      setAudioChunks([]);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.current = stream;

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      // In your React component, update the recorder.onstop handler:

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        console.log("Audio blob created, size:", audioBlob.size, "bytes");

        if (audioBlob.size === 0) {
          console.warn("Recorded blob is empty.");
          return;
        }

        setIsProcessing(true);

        try {
          // Send the audio blob to your transcription API
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('https://zapbasevoicetotext.onrender.com/api/aiagents/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          const data = await response.json();
          console.log("Full API response:", data);

          const transcribedText = data.transcription.text;

          // Add the user message to the chat
          if (transcribedText) {
            const userMessage = {
              type: 'user',
              text: transcribedText
            };
            setConversations(prev => [...prev, userMessage]);

            // Check if a transaction was detected and attempted
            if (data.commandDetected) {
              // Add a processing message
              const processingMessage = {
                type: 'assistant',
                text: `Transfer of ${data.parsedCommand.amount} ETH to ${data.parsedCommand.recipient} detected`
              };
              setConversations(prev => [...prev, processingMessage]);

              // Generate a unique chatID
              const chatID = "session-" + Date.now();

              // Send to backend for AI response
              const sendResponse = await fetch('https://t-mini-app.onrender.com/send-response', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  chatID: chatID,
                  text: transcribedText,
                  transaction: data.transaction // Pass transaction result to backend
                }),
              });

              if (!sendResponse.ok) {
                throw new Error(`Response endpoint error: ${sendResponse.status}`);
              }

              const responseData = await sendResponse.json();

              // Add the final assistant response with transaction details
              setTimeout(() => {
                let finalMessage;

                if (data.transaction && data.transaction.success) {
                  finalMessage = `${responseData.message}\n\nTransaction successful! Hash: ${data.transaction.txHash}`;
                } else if (data.transaction) {
                  finalMessage = `${responseData.message}\n\nTransaction failed: ${data.transaction.error}`;
                } else {
                  finalMessage = responseData.message;
                }

                const assistantResponse = {
                  type: 'assistant',
                  text: finalMessage
                };
                setConversations(prev => [...prev, assistantResponse]);
              }, 1000);
            } else {
              // No transaction command detected, just get a normal response
              const chatID = "session-" + Date.now();
              const sendResponse = await fetch('https://t-mini-app.onrender.com/send-response', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  chatID: chatID,
                  text: transcribedText
                }),
              });

              if (!sendResponse.ok) {
                throw new Error(`Response endpoint error: ${sendResponse.status}`);
              }

              const responseData = await sendResponse.json();

              setTimeout(() => {
                const assistantResponse = {
                  type: 'assistant',
                  text: responseData.message
                };
                setConversations(prev => [...prev, assistantResponse]);
              }, 1000);
            }
          }
        } catch (error) {
          console.error("Error processing voice command:", error);

          // Add error message to chat
          const errorMessage = {
            type: 'assistant',
            text: "Sorry, I encountered an error processing your request. Please try again."
          };
          setConversations(prev => [...prev, errorMessage]);
        } finally {
          setIsProcessing(false);
        }
      };
      
      recorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access your microphone. Please check permissions.");
    }
  };


  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }

    if (audioStream.current) {
      audioStream.current.getTracks().forEach(track => track.stop());
    }


  };

  // Event handlers for mouse/touch interactions
  const handlePointerDown = (e) => {
    e.preventDefault(); // Prevent default behavior
    if (!isProcessing) {
      startRecording();
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault(); // Prevent default behavior
    if (isRecording) {
      stopRecording();
    }
  };

  const handlePointerLeave = (e) => {
    // Stop recording if pointer leaves the button while recording
    if (isRecording) {
      stopRecording();
    }
  };

  // Audio wave effect around the button when recording
  const renderWaves = () => {
    return Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className={`absolute rounded-full border border-green-400 opacity-80 animate-ping`}
        style={{
          width: `${100 + (i + 1) * 30}%`,
          height: `${100 + (i + 1) * 30}%`,
          animationDelay: `${i * 0.2}s`,
          animationDuration: `${1 + i * 0.5}s`
        }}
      />
    ));
  };

  return (
    <div className={`flex flex-col h-screen ${isRecording ? 'bg-gray-950' : 'bg-gray-900'} transition-colors duration-300`}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      {/* Chat conversation area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 mb-4"
      >
        <div className="max-w-md mx-auto space-y-4">
          {conversations.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                  }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record button section - positioned at bottom */}
      <div className="p-6 flex items-center justify-center">
        <div className="relative mb-10">
          <button
            disabled={isProcessing}
            className={`relative flex items-center justify-center rounded-full bg-gray-800 border-2 transition-all duration-300 ${isRecording
                ? 'border-green-400 scale-150 shadow-lg shadow-green-500/20'
                : isProcessing
                  ? 'border-yellow-400 opacity-70'
                  : 'border-white/20'
              }`}
            style={{ width: '70px', height: '70px' }}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerLeave}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerLeave}
          >
            {/* Mic icon */}
            <Mic className={`w-8 h-8 ${isRecording
                ? 'text-green-400'
                : isProcessing
                  ? 'text-yellow-400 animate-pulse'
                  : 'text-white/80'
              }`} />

            {/* Audio waves effect */}
            {isRecording && renderWaves()}
          </button>

          {/* Instructions */}
          <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-center text-sm whitespace-nowrap">
            {isRecording
              ? "Release to send"
              : isProcessing
                ? "Processing..."
                : "Press and hold to speak"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
export default SendMoney
