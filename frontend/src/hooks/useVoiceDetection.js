import { useEffect, useState, useRef } from 'react';

export function useVoiceDetection(codeWords = ['pineapple', 'angela'], onTrigger) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            console.log('Heard voice:', transcript);
            for (const word of codeWords) {
              if (transcript.includes(word.toLowerCase())) {
                if (onTrigger) onTrigger(word);
                break;
              }
            }
          }
        }
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            // ignore
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, [codeWords, onTrigger]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return { supported, isListening, toggleListening };
}
