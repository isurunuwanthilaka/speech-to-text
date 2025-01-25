import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [gptResponse, setGptResponse] = useState('');
  const recognition = useRef(new window.webkitSpeechRecognition());
  const wsRef = useRef(null);

  useEffect(() => {
    // Configure WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:8000/ws');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    wsRef.current.onmessage = (event) => {
      setGptResponse(event.data);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Configure speech recognition
    recognition.current.continuous = true;
    recognition.current.interimResults = true;

    recognition.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      // Send transcript to backend via WebSocket if connection is open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(transcript);
      }
    };

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleListening = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Speech to Text Converter</h1>
        <div className="controls">
          <button 
            onClick={handleListening}
            className={isListening ? 'stop' : 'start'}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
        </div>
        <div className="transcript-container">
          <h2>Transcript:</h2>
          <div className="transcript">
            {transcript || 'Start speaking...'}
          </div>
        </div>
        <div className="gpt-response-container">
          <h2>GPT Response:</h2>
          <div className="gpt-response">
            {gptResponse || 'Waiting for response...'}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
