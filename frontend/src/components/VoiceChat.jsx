import { useState, useEffect, useRef } from 'react';
import { Mic , ArrowLeft} from 'lucide-react';

function VoiceChat({ onBack, onSend }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState([
    // Initial examples to show the chat layout
    { type: 'user', text: "How do I reset my password?" },
    { type: 'assistant', text: "To reset your password, go to the login page and click on 'Forgot Password'. You'll receive an email with instructions." }
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
      setAudioChunks([]);
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.current = stream;
      
      // Create new media recorder
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      // Set up recorder event handlers
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      // Start recording
      recorder.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access your microphone. Please check permissions.");
    }
  };
  
  // Function to stop recording when button is released
  const stopRecording = async () => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
    
    mediaRecorder.stop();
    setIsRecording(false);
    setIsProcessing(true);
    
    mediaRecorder.onstop = async () => {
      // Clean up audio stream
      if (audioStream.current) {
        audioStream.current.getTracks().forEach(track => track.stop());
        audioStream.current = null;
      }
      
      // Create blob from audio chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
      
      console.log("Audio blob created, size:", audioBlob.size, "bytes");
      
      // Only process if we actually got some audio data
      if (audioBlob.size > 0) {
        try {
          // Create FormData and append the audio blob
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          // Send to the transcription API
          console.log("Sending request to: http://localhost:3000/api/aiagents/transcribe");
          
          // Send to the transcription API
          const response = await fetch('http://localhost:3000/api/aiagents/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          const data = await response.json();

          console.log("API Response:", JSON.stringify(data, null, 2));
          console.log("Transcribed text:", data.text);
          
          // Extract the transcribed text
          const transcribedText = data.text.trim();
          
          // Add user message with transcribed text
          if (transcribedText) {
            const userMessage = { 
              type: 'user', 
              text: transcribedText
            };
            setConversations(prev => [...prev, userMessage]);
            
            // Simulate assistant response
            setTimeout(() => {
              const assistantResponse = {
                type: 'assistant',
                text: "I've received your message. How can I help you with that?"
              };
              
              setConversations(prev => [...prev, assistantResponse]);
            }, 1000);
          }
        } catch (error) {
          console.error("Error sending audio for transcription:", error);
          alert("Failed to transcribe audio. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    };
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
          width: `${100 + (i+1) * 30}%`,
          height: `${100 + (i+1) * 30}%`,
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
                className={`max-w-xs p-3 rounded-lg ${
                  message.type === 'user' 
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
            className={`relative flex items-center justify-center rounded-full bg-gray-800 border-2 transition-all duration-300 ${
              isRecording 
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
            <Mic className={`w-8 h-8 ${
              isRecording 
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
export default VoiceChat