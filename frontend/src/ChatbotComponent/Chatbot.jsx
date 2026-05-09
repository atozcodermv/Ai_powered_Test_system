import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";

const url = config.url.BASE_URL;

const chatbotStyles = {
  page: {
    minHeight: "calc(100vh - 96px)",
    padding: "2rem 1rem",
    background:
      "radial-gradient(circle at top left, rgba(255, 196, 88, 0.22), transparent 30%), linear-gradient(135deg, #fff8ef 0%, #f4f8ff 100%)",
  },
  shell: {
    maxWidth: "1080px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "1.25rem",
  },
  panel: {
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(26, 54, 93, 0.08)",
    borderRadius: "24px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    backdropFilter: "blur(8px)",
  },
  sidebar: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.85rem",
    borderRadius: "999px",
    background: "#fff1d7",
    color: "#8a4b08",
    fontWeight: 700,
    fontSize: "0.9rem",
    width: "fit-content",
  },
  title: {
    fontSize: "2rem",
    lineHeight: 1.1,
    color: "#112240",
    margin: 0,
  },
  copy: {
    color: "#4a5b76",
    margin: 0,
    lineHeight: 1.6,
  },
  tips: {
    margin: 0,
    paddingLeft: "1rem",
    color: "#36506c",
    lineHeight: 1.8,
  },
  chatPanel: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    height: "75vh",
  },
  chatHeader: {
    padding: "1rem 1rem 0.75rem",
    borderBottom: "1px solid rgba(26, 54, 93, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  chatBody: {
    flex: 1,
    overflowY: "auto",
    padding: "1.25rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  row: (sender) => ({
    display: "flex",
    justifyContent: sender === "user" ? "flex-end" : "flex-start",
  }),
  bubble: (sender) => ({
    maxWidth: "78%",
    padding: "0.95rem 1rem",
    borderRadius: sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    background:
      sender === "user"
        ? "linear-gradient(135deg, #143d6b 0%, #1c5fa8 100%)"
        : "#f8fbff",
    color: sender === "user" ? "#ffffff" : "#16324f",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
    border: sender === "user" ? "none" : "1px solid rgba(26, 54, 93, 0.08)",
    whiteSpace: "pre-wrap",
    lineHeight: 1.65,
  }),
  composer: {
    borderTop: "1px solid rgba(26, 54, 93, 0.08)",
    padding: "1rem",
    display: "flex",
    gap: "0.8rem",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    border: "1px solid rgba(17, 34, 64, 0.15)",
    borderRadius: "18px",
    padding: "0.95rem 1rem",
    resize: "none",
    outline: "none",
    minHeight: "58px",
    maxHeight: "140px",
    fontSize: "0.98rem",
    lineHeight: 1.5,
    background: "#ffffff",
  },
  sendButton: (disabled) => ({
    border: "none",
    borderRadius: "16px",
    padding: "0.95rem 1.25rem",
    background: disabled
      ? "linear-gradient(135deg, #b7c3d2 0%, #c7d2de 100%)"
      : "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    color: "#ffffff",
    fontWeight: 700,
    minWidth: "110px",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 14px 26px rgba(234, 88, 12, 0.26)",
  }),
};

const initialMessages = [
  {
    id: 1,
    sender: "assistant",
    text:
      "Ask any academic doubt here. I can help explain concepts, summarize topics, and guide you step by step.",
  },
];

const Chatbot = () => {
  const navigate = useNavigate();
  const student = JSON.parse(sessionStorage.getItem("active-student"));
  const studentJwtToken = sessionStorage.getItem("student-jwtToken");

  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!student || !studentJwtToken) {
      toast.error("Please log in as a student to access Ask Doubt.", {
        position: "top-center",
        autoClose: 1200,
      });
      navigate("/user/login");
    }
  }, [navigate, student, studentJwtToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedQuestion,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setQuestion("");
    setIsSending(true);

    try {
      const response = await axios.post(
        `${url}/chatbot/student/ask-doubt`,
        { question: trimmedQuestion },
        {
          headers: {
            Authorization: `Bearer ${studentJwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const answer = response?.data?.answer?.trim();

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text:
            answer ||
            "I could not generate a useful response right now. Please try again.",
        },
      ]);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.responseMessage ||
        "The AI doubt solver is unavailable right now. Please try again.";

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 1600,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 2,
          sender: "assistant",
          text:
            "I could not process that doubt right now. Please retry in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div style={chatbotStyles.page}>
      <div style={chatbotStyles.shell}>
        <aside style={{ ...chatbotStyles.panel, ...chatbotStyles.sidebar }}>
          <span style={chatbotStyles.badge}>AI Doubt Solver</span>
          <h1 style={chatbotStyles.title}>Ask academic questions anytime.</h1>
          <p style={chatbotStyles.copy}>
            Type your doubt and get an instant explanation from the AI assistant.
          </p>
          <div
            style={{
              background: "#eef5ff",
              borderRadius: "18px",
              padding: "1rem",
            }}
          >
            <p style={{ ...chatbotStyles.copy, fontWeight: 700, marginBottom: "0.5rem" }}>
              Better questions get better answers
            </p>
            <ul style={chatbotStyles.tips}>
              <li>Mention the subject or topic</li>
              <li>Add the exact concept you do not understand</li>
              <li>Ask for steps, examples, or a short summary</li>
            </ul>
          </div>
          {student && (
            <div
              style={{
                marginTop: "auto",
                background: "#112240",
                color: "#ffffff",
                borderRadius: "18px",
                padding: "1rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Logged in as</div>
              <div style={{ fontWeight: 700, marginTop: "0.2rem" }}>
                {student.firstName} {student.lastName}
              </div>
            </div>
          )}
        </aside>

        <section style={{ ...chatbotStyles.panel, ...chatbotStyles.chatPanel }}>
          <div style={chatbotStyles.chatHeader}>
            <div>
              <h2 style={{ margin: 0, color: "#112240" }}>Student Chat</h2>
              <small style={{ color: "#5c718b" }}>
                Get concept explanations, summaries, and guidance
              </small>
            </div>
          </div>

          <div style={chatbotStyles.chatBody}>
            {messages.map((message) => (
              <div key={message.id} style={chatbotStyles.row(message.sender)}>
                <div style={chatbotStyles.bubble(message.sender)}>
                  {message.text}
                </div>
              </div>
            ))}

            {isSending && (
              <div style={chatbotStyles.row("assistant")}>
                <div style={chatbotStyles.bubble("assistant")}>
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={chatbotStyles.composer}>
            <textarea
              style={chatbotStyles.textarea}
              placeholder="Type your doubt here. Example: Explain Newton's second law with a simple example."
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
            <button
              type="button"
              style={chatbotStyles.sendButton(!question.trim() || isSending)}
              onClick={sendQuestion}
              disabled={!question.trim() || isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Chatbot;
