import { useState, useCallback, useRef } from "react";
import PlanetOrb from "./PlanetOrb";
import "../ChatPanel.css";
import CallOrb from "./CallOrb";

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  /* =========================
     📞 CALL MODE
  ========================== */
  const [callMode, setCallMode] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");

  const callActiveRef = useRef(false);
  const recognitionRef = useRef(null);
  const recognitionTimeoutRef = useRef(null);

  /* =========================
     🎤 GET SPEECH RECOGNITION
  ========================== */
  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  };

  /* =========================
     🧹 CLEAN UP RECOGNITION
  ========================== */
  const stopRecognition = () => {
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.log("Recognition cleanup:", error);
      }

      recognitionRef.current = null;
    }
  };

  /* =========================
     🎤 NORMAL VOICE INPUT
  ========================== */
  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported on this browser. Please try Chrome."
      );
      return;
    }

    // Stop any previous recognition session
    stopRecognition();

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log("🎤 Speech result received");

      const transcript = event.results[0][0].transcript;

      console.log("Transcript:", transcript);

      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access for AIVA."
        );
      } else if (event.error === "network") {
        alert(
          "Speech recognition could not connect. Please check your internet connection and try again."
        );
      } else if (event.error === "no-speech") {
        console.log("No speech detected.");
      }
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ended");

      setIsListening(false);

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
    };

    // Prevent mobile from staying stuck forever
    recognitionTimeoutRef.current = setTimeout(() => {
      console.log("🎤 Speech recognition timeout");

      if (recognitionRef.current === recognition) {
        try {
          recognition.abort();
        } catch (error) {
          console.log("Timeout cleanup:", error);
        }

        recognitionRef.current = null;
        setIsListening(false);

        alert("Voice recognition took too long. Please try again.");
      }
    }, 10000);

    try {
      console.log("🎤 Starting speech recognition...");
      recognition.start();
    } catch (error) {
      console.error("🎤 Could not start recognition:", error);

      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  /* =========================
     🔊 TEXT TO SPEECH
  ========================== */
  const speakText = (text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;

      if (!synth) {
        resolve();
        return;
      }

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setCallStatus("speaking");
      };

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve();
      };

      synth.speak(utterance);
    });
  };

  /* =========================
     🚀 GET AI REPLY
  ========================== */
  const getAIReply = async (messageText) => {
    const response = await fetch(
      "https://aiva-backend-tilu.onrender.com/chat/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    return data.response;
  };

  /* =========================
     🚀 SEND MESSAGE
  ========================== */
  const sendMessage = useCallback(async () => {
    const messageText = input;

    if (!messageText.trim()) return;

    const userMessage = {
      sender: "user",
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await getAIReply(messageText);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
        },
      ]);
    } catch (error) {
      console.error("AI request error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Error connecting to AI.",
        },
      ]);
    }

    setLoading(false);
  }, [input]);

  /* =========================
     📞 CALL MODE
     listen → AI → speak → listen
  ========================== */
  const listenOnceForCall = () => {
    if (!callActiveRef.current) return;

    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported on this browser. Please try Chrome."
      );
      endCall();
      return;
    }

    // Make sure an old recognition session is not still running
    stopRecognition();

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("📞 Call listening started");

      if (callActiveRef.current) {
        setCallStatus("listening");
      }
    };

    recognition.onresult = async (event) => {
      if (!callActiveRef.current) return;

      const transcript = event.results[0][0].transcript;

      console.log("📞 Call transcript:", transcript);

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: transcript,
        },
      ]);

      setCallStatus("thinking");

      try {
        const aiReply = await getAIReply(transcript);

        if (!callActiveRef.current) return;

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: aiReply,
          },
        ]);

        await speakText(aiReply);
      } catch (error) {
        console.error("📞 Call AI error:", error);

        if (callActiveRef.current) {
          await speakText("Sorry, I had trouble connecting.");
        }
      }

      // Start a fresh listening session
      if (callActiveRef.current) {
        setTimeout(() => {
          if (callActiveRef.current) {
            listenOnceForCall();
          }
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      console.error("📞 Call speech error:", event.error);

      if (!callActiveRef.current) return;

      // Stop infinite retry loops for permission/network errors
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        alert(
          "Microphone permission is required for the call. Please allow microphone access for AIVA."
        );
        endCall();
        return;
      }

      if (event.error === "network") {
        alert(
          "Voice connection failed. Please check your internet connection and try again."
        );
        endCall();
        return;
      }

      // For temporary errors/no speech, try again
      setTimeout(() => {
        if (callActiveRef.current) {
          listenOnceForCall();
        }
      }, 500);
    };

    recognition.onend = () => {
      console.log("📞 Call recognition ended");

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
    };

    // Prevent "Starting..." from remaining forever
    recognitionTimeoutRef.current = setTimeout(() => {
      if (!callActiveRef.current) return;

      console.log("📞 Call recognition timeout");

      try {
        recognition.abort();
      } catch (error) {
        console.log("Call timeout cleanup:", error);
      }

      recognitionRef.current = null;

      alert("Voice recognition took too long. Please try the call again.");

      endCall();
    }, 10000);

    try {
      console.log("📞 Starting call speech recognition...");
      recognition.start();
    } catch (error) {
      console.error("📞 Could not start call recognition:", error);

      if (callActiveRef.current) {
        endCall();
      }
    }
  };

  /* =========================
     📞 START CALL
  ========================== */
  const startCall = () => {
    stopRecognition();

    setCallMode(true);
    callActiveRef.current = true;
    setMessages([]);

    // Give React a moment to render call mode
    setTimeout(() => {
      if (callActiveRef.current) {
        listenOnceForCall();
      }
    }, 300);
  };

  /* =========================
     📞 END CALL
  ========================== */
  const endCall = () => {
    callActiveRef.current = false;

    stopRecognition();

    setCallMode(false);
    setCallStatus("idle");

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  /* =========================
     UI
  ========================== */
  if (callMode) {
    return (
      <div className="call-container">
        <CallOrb status={callStatus} />

        <p className="call-status-text">
          {callStatus === "listening" && "Listening..."}
          {callStatus === "thinking" && "Thinking..."}
          {callStatus === "speaking" && "Speaking..."}
          {callStatus === "idle" && "Starting..."}
        </p>

        <button className="end-call-btn" onClick={endCall}>
          ✖ End Call
        </button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="chat-container">
        {messages.length === 0 && (
          <div className="hero-section">
            <PlanetOrb />
            <h1 className="hero-text">How can I help you today?</h1>
          </div>
        )}

        {messages.length > 0 && (
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="message ai">
                Thinking...
              </div>
            )}
          </div>
        )}

        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button
            className="mic-btn"
            onClick={startListening}
            style={{
              color: isListening ? "red" : "inherit",
            }}
            title="Speak your message"
          >
            🎤
          </button>

          <button
            className="call-btn"
            onClick={startCall}
            title="Start voice call"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.81 16.44 14.93C17.59 15.31 18.82 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.18 8.69 6.41 9.07 7.56C9.19 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                fill="white"
              />
            </svg>
          </button>

          <button
            className="send-btn"
            onClick={sendMessage}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
