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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* =========================
     🎤 RECORD MICROPHONE AUDIO
  ========================== */
  const recordAudio = async (duration = 5000) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      return new Promise((resolve, reject) => {
        const recorder = new MediaRecorder(stream);

        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });

          mediaRecorderRef.current = null;
          resolve(audioBlob);
        };

        recorder.onerror = (event) => {
          stream.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
          reject(event.error || new Error("Microphone recording failed."));
        };

        recorder.start();

        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, duration);
      });
    } catch (error) {
      console.error("Microphone error:", error);
      throw error;
    }
  };

  /* =========================
     🎤 SEND AUDIO FOR TRANSCRIPTION
  ========================== */
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();

    formData.append("audio", audioBlob, "aiva-recording.webm");

    const response = await fetch(
      "https://aiva-backend-tilu.onrender.com/transcribe/",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Transcription error: ${response.status}`);
    }

    const data = await response.json();

    return data.text;
  };

  /* =========================
     🎤 NORMAL VOICE INPUT
  ========================== */
  const startListening = async () => {
    if (isListening) return;

    try {
      setIsListening(true);

      const audioBlob = await recordAudio(5000);

      const transcript = await transcribeAudio(audioBlob);

      if (transcript && transcript.trim()) {
        setInput(transcript);
      }
    } catch (error) {
      console.error("Voice input error:", error);
    } finally {
      setIsListening(false);
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
     record → transcribe → AI → speak → repeat
  ========================== */
  const listenOnceForCall = async () => {
    if (!callActiveRef.current) return;

    try {
      setCallStatus("listening");

      const audioBlob = await recordAudio(5000);

      if (!callActiveRef.current) return;

      setCallStatus("thinking");

      const transcript = await transcribeAudio(audioBlob);

      if (!callActiveRef.current) return;

      if (!transcript || !transcript.trim()) {
        listenOnceForCall();
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: transcript,
        },
      ]);

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

      if (callActiveRef.current) {
        listenOnceForCall();
      }
    } catch (error) {
      console.error("📞 Call voice error:", error);

      if (callActiveRef.current) {
        setCallStatus("listening");

        setTimeout(() => {
          if (callActiveRef.current) {
            listenOnceForCall();
          }
        }, 500);
      }
    }
  };

  /* =========================
     📞 START CALL
  ========================== */
  const startCall = () => {
    setCallMode(true);
    callActiveRef.current = true;
    setMessages([]);

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

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.log("Recorder cleanup:", error);
      }

      mediaRecorderRef.current = null;
    }

    setCallMode(false);
    setCallStatus("idle");
    setIsListening(false);

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