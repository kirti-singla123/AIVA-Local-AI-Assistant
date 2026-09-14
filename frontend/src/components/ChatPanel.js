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
     📞 CALL MODE (voice conversation)
  ========================== */
  const [callMode, setCallMode] = useState(false);
  const [callStatus, setCallStatus] = useState("idle"); // idle | listening | thinking | speaking
  const callActiveRef = useRef(false); // tracks whether call is still on (avoids stale state in callbacks)

  /* =========================
     🎤 VOICE INPUT (speech-to-text) - used by normal mic button
  ========================== */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  /* =========================
     🔊 TEXT TO SPEECH (AIVA speaks)
  ========================== */
  const speakText = (text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) {
        resolve();
        return;
      }

      synth.cancel(); // stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setCallStatus("speaking");
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      synth.speak(utterance);
    });
  };

  /* =========================
     🚀 CORE: send a message, get AI reply (reused by typing AND call mode)
  ========================== */
  const getAIReply = async (messageText) => {
    const response = await fetch("https://aiva-backend-tilu.onrender.com/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText }),
    });
    const data = await response.json();
    return data.response;
  };

  /* =========================
     🚀 SEND MESSAGE (normal typing/mic flow)
  ========================== */
  const sendMessage = useCallback(async () => {
    const messageText = input;
    if (!messageText.trim()) return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await getAIReply(messageText);
      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Error connecting to AI." },
      ]);
    }

    setLoading(false);
  }, [input]);

  /* =========================
     📞 CALL MODE LOOP: listen -> send -> speak -> listen again
  ========================== */
  const listenOnceForCall = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      endCall();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setCallStatus("listening");
    };

    recognition.onresult = async (event) => {
      if (!callActiveRef.current) return;

      const transcript = event.results[0][0].transcript;
      setMessages((prev) => [...prev, { sender: "user", text: transcript }]);
      setCallStatus("thinking");

      try {
        const aiReply = await getAIReply(transcript);
        setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);

        if (callActiveRef.current) {
          await speakText(aiReply);
        }
      } catch (error) {
        if (callActiveRef.current) {
          await speakText("Sorry, I had trouble connecting.");
        }
      }

      // loop: listen again if call is still active
      if (callActiveRef.current) {
        listenOnceForCall();
      }
    };

    recognition.onerror = () => {
      // if there's silence/no speech, just try listening again
      if (callActiveRef.current) {
        listenOnceForCall();
      }
    };

    recognition.start();
  };

  const startCall = () => {
    setCallMode(true);
    callActiveRef.current = true;
    setMessages([]); // fresh conversation for the call, optional
    listenOnceForCall();
  };

  const endCall = () => {
    callActiveRef.current = false;
    setCallMode(false);
    setCallStatus("idle");
    window.speechSynthesis.cancel();
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
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="message ai">Thinking...</div>}
          </div>
        )}

        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            className="mic-btn"
            onClick={startListening}
            style={{ color: isListening ? "red" : "inherit" }}
            title="Speak your message"
          >
            🎤
          </button>

          <button className="call-btn" onClick={startCall} title="Start voice call">
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

          <button className="send-btn" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;