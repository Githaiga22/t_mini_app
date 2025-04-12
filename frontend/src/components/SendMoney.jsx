import { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

function SendMoney({ onBack, onSend }) {
  const [isRecording, setIsRecording] = useState(false);
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
    
    return new Promise(resolve => {
      mediaRecorder.onstop = async () => {
        // Clean up audio stream
        if (audioStream.current) {
          audioStream.current.getTracks().forEach(track => track.stop());
          audioStream.current = null;
        }
        
        // Create blob from audio chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Only process if we actually got some audio data
        if (audioBlob.size > 0) {
          // Add user message first (transcript)
          const userMessage = { 
            type: 'user', 
            text: `What's the weather like today?` 
          };
          setConversations(prev => [...prev, userMessage]);
          
          // Simulate sending to endpoint and getting response
          setTimeout(() => {
            // Mock response - in a real app, this would be from your API
            const assistantResponse = {
              type: 'assistant',
              text: "Today's forecast shows partly cloudy skies with a high of 72°F and a low of 58°F. There's a 20% chance of rain in the evening."
            };
            
            setConversations(prev => [...prev, assistantResponse]);
            resolve(assistantResponse);
          }, 1000);
        }
      };
      
      mediaRecorder.stop();
      setIsRecording(false);
    });
  };

  // Event handlers for mouse/touch interactions
  const handlePointerDown = (e) => {
    e.preventDefault(); // Prevent default behavior
    startRecording();
  };

  const handlePointerUp = (e) => {
    e.preventDefault(); // Prevent default behavior
    stopRecording();
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
            className={`relative flex items-center justify-center rounded-full bg-gray-800 border-2 transition-all duration-300 ${
              isRecording 
                ? 'border-green-400 scale-150 shadow-lg shadow-green-500/20' 
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
            <Mic className={`w-8 h-8 ${isRecording ? 'text-green-400' : 'text-white/80'}`} />
            
            {/* Audio waves effect */}
            {isRecording && renderWaves()}
          </button>
          
          {/* Instructions */}
          <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-center text-sm whitespace-nowrap">
            {isRecording ? "Release to send" : "Press and hold to speak"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SendMoney