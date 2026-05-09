import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import {
  createChatClient,
  disconnectChatClient,
  publishChatMessage,
  publishDeliveredReceipt,
  publishReadReceipt,
} from "./chatSocket";
import "./chat.css";

const url = config.url.BASE_URL;

const appendUniqueMessage = (messages, incomingMessage) => {
  if (messages.some((message) => message.messageId === incomingMessage.messageId)) {
    return messages.map((message) =>
      message.messageId === incomingMessage.messageId ? { ...message, ...incomingMessage } : message
    );
  }

  return [...messages, incomingMessage].sort((firstMessage, secondMessage) => {
    return Number(firstMessage.timestamp || 0) - Number(secondMessage.timestamp || 0);
  });
};

const updateMessageStatus = (messages, statusEvent) =>
  messages.map((message) =>
    message.messageId === statusEvent.messageId ? { ...message, status: statusEvent.status } : message
  );

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(Number(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const ChatingStudent = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const clientRef = useRef(null);

  const student = JSON.parse(sessionStorage.getItem("active-student"));
  const studentJwtToken = sessionStorage.getItem("student-jwtToken");
  const teacher = student?.teacher || student?.grade?.teacher;

  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [teacherOnline, setTeacherOnline] = useState(false);

  const teacherName = useMemo(() => {
    if (!teacher) {
      return "Assigned Teacher";
    }

    return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
  }, [teacher]);

  useEffect(() => {
    if (!student || !studentJwtToken) {
      toast.error("Please log in as a student to access Teacher Chat.", {
        position: "top-center",
        autoClose: 1200,
      });
      navigate("/user/login");
      return;
    }

    if (!teacher?.id) {
      toast.error("No teacher is assigned to your account yet.", {
        position: "top-center",
        autoClose: 1500,
      });
    }
  }, [navigate, student, studentJwtToken, teacher]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!student?.id || !teacher?.id || !studentJwtToken) {
      return undefined;
    }

    const loadChatData = async () => {
      try {
        const [historyResponse, presenceResponse] = await Promise.all([
          axios.get(`${url}/chat/history?teacherId=${teacher.id}&studentId=${student.id}`, {
            headers: {
              Authorization: `Bearer ${studentJwtToken}`,
            },
          }),
          axios.get(`${url}/chat/presence?userIds=${teacher.id}`, {
            headers: {
              Authorization: `Bearer ${studentJwtToken}`,
            },
          }),
        ]);

        const historyMessages = historyResponse?.data?.messages || [];
        setMessages(historyMessages);
        setTeacherOnline(Boolean(presenceResponse?.data?.presenceMap?.[teacher.id]));

        historyMessages
          .filter(
            (message) =>
              message.receiverId === student.id && message.senderId === teacher.id && message.status !== "READ"
          )
          .forEach((message) => {
            publishDeliveredReceipt(clientRef.current, message.messageId);
            publishReadReceipt(clientRef.current, message.messageId);
          });
      } catch (error) {
        console.error(error);
      }
    };

    loadChatData();
    return undefined;
  }, [student?.id, teacher?.id, studentJwtToken]);

  useEffect(() => {
    if (!student?.id || !teacher?.id || !studentJwtToken) {
      return undefined;
    }

    const client = createChatClient({
      token: studentJwtToken,
      userId: student.id,
      role: "Student",
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: () => setIsConnected(false),
      onPresence: (presenceEvent) => {
        if (Number(presenceEvent.userId) === Number(teacher.id)) {
          setTeacherOnline(Boolean(presenceEvent.online));
        }
      },
      onMessage: (eventPayload) => {
        if (eventPayload.eventType === "STATUS") {
          setMessages((previousMessages) => updateMessageStatus(previousMessages, eventPayload));
          return;
        }

        if (
          eventPayload.eventType !== "MESSAGE" ||
          Number(eventPayload.studentId) !== Number(student.id) ||
          Number(eventPayload.teacherId) !== Number(teacher.id)
        ) {
          return;
        }

        setMessages((previousMessages) => appendUniqueMessage(previousMessages, eventPayload));

        if (Number(eventPayload.receiverId) === Number(student.id)) {
          publishDeliveredReceipt(client, eventPayload.messageId);
          publishReadReceipt(client, eventPayload.messageId);
        }
      },
    });

    clientRef.current = client;

    return () => {
      disconnectChatClient(client);
    };
  }, [student?.id, teacher?.id, studentJwtToken]);

  const sendMessage = () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!clientRef.current?.connected) {
      toast.error("Chat connection is offline. Please wait a moment and try again.", {
        position: "top-center",
        autoClose: 1400,
      });
      return;
    }

    publishChatMessage(clientRef.current, {
      senderId: student.id,
      teacherId: teacher.id,
      studentId: student.id,
      messageContent: trimmedMessage,
    });

    setDraftMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <aside className="chat-card chat-sidebar">
          <span className="chat-badge">Teacher Chat</span>
          <h1 className="chat-hero-title">Stay connected with your teacher.</h1>
          <p className="chat-hero-copy">
            Ask questions, clarify tasks, and continue the conversation in real time.
          </p>
          <div className="chat-presence-chip">
            <span className={`chat-dot ${teacherOnline ? "online" : "offline"}`} />
            {teacherOnline ? "Teacher is online" : "Teacher is offline"}
          </div>
          <div
            style={{
              padding: "16px",
              borderRadius: "18px",
              background: "#eef5ff",
              color: "#17304e",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>{teacherName}</div>
            <div style={{ fontSize: "0.92rem", color: "#5c718b" }}>
              {teacher?.emailId || "Assigned teacher"}
            </div>
          </div>
        </aside>

        <section className="chat-card chat-main">
          <div className="chat-main-header">
            <div>
              <h2 className="chat-main-title">{teacherName}</h2>
              <div className="chat-main-subtitle">
                Real-time conversation between student and teacher
              </div>
            </div>
            <div className={`chat-connection ${isConnected ? "online" : "offline"}`}>
              {isConnected ? "Connected" : "Reconnecting..."}
            </div>
          </div>

          <div className="chat-thread">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <h4>No messages yet</h4>
                <p>Start the conversation with your teacher from the message box below.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = Number(message.senderId) === Number(student.id);
                return (
                  <div
                    key={message.messageId}
                    className={`chat-row ${isMine ? "mine" : "theirs"}`}
                  >
                    <div className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
                      <div className="chat-text">{message.messageContent}</div>
                      <div className="chat-meta">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {isMine && <span>{message.status}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-compose">
            <textarea
              className="chat-input"
              placeholder="Type your message to the teacher..."
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="chat-send"
              onClick={sendMessage}
              disabled={!draftMessage.trim()}
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatingStudent;
