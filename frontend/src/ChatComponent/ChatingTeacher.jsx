import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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

const ensureThreadMessage = (threads, studentId, incomingMessage) => {
  const existingMessages = threads[studentId] || [];
  const alreadyExists = existingMessages.some((message) => message.messageId === incomingMessage.messageId);

  const updatedMessages = alreadyExists
    ? existingMessages.map((message) =>
        message.messageId === incomingMessage.messageId ? { ...message, ...incomingMessage } : message
      )
    : [...existingMessages, incomingMessage].sort((firstMessage, secondMessage) => {
        return Number(firstMessage.timestamp || 0) - Number(secondMessage.timestamp || 0);
      });

  return {
    ...threads,
    [studentId]: updatedMessages,
  };
};

const updateThreadStatus = (threads, statusEvent) => {
  const threadStudentId = String(statusEvent.studentId);
  const existingMessages = threads[threadStudentId] || [];

  return {
    ...threads,
    [threadStudentId]: existingMessages.map((message) =>
      message.messageId === statusEvent.messageId ? { ...message, status: statusEvent.status } : message
    ),
  };
};

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(Number(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const truncatePreview = (text) => {
  if (!text) {
    return "No messages yet";
  }

  return text.length > 38 ? `${text.substring(0, 38)}...` : text;
};

const ChatingTeacher = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const messagesEndRef = useRef(null);
  const clientRef = useRef(null);
  const selectedStudentIdRef = useRef("");

  const teacher = JSON.parse(sessionStorage.getItem("active-teacher"));
  const teacherJwtToken = sessionStorage.getItem("teacher-jwtToken");

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || "");
  const [threads, setThreads] = useState({});
  const [presenceMap, setPresenceMap] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const selectedStudent = useMemo(
    () => students.find((studentItem) => String(studentItem.id) === String(selectedStudentId)),
    [students, selectedStudentId]
  );

  const selectedMessages = useMemo(() => threads[selectedStudentId] || [], [threads, selectedStudentId]);

  useEffect(() => {
    selectedStudentIdRef.current = String(selectedStudentId || "");
  }, [selectedStudentId]);

  useEffect(() => {
    if (!teacher || !teacherJwtToken) {
      toast.error("Please log in as a teacher to access Student Chat.", {
        position: "top-center",
        autoClose: 1200,
      });
      navigate("/user/login");
    }
  }, [navigate, teacher, teacherJwtToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  useEffect(() => {
    if (!teacher?.id || !teacher?.grade?.id || !teacherJwtToken) {
      return undefined;
    }

    const loadStudents = async () => {
      try {
        const studentResponse = await axios.get(
          `${url}/user/fetch/student/teacher-wise?teacherId=${teacher.id}`,
          {
            headers: {
              Authorization: `Bearer ${teacherJwtToken}`,
            },
          }
        );

        const fetchedStudents = studentResponse?.data?.users || [];
        setStudents(fetchedStudents);

        if (fetchedStudents.length > 0) {
          const preferredStudentId =
            studentId && fetchedStudents.some((studentItem) => String(studentItem.id) === String(studentId))
              ? String(studentId)
              : String(fetchedStudents[0].id);

          setSelectedStudentId(preferredStudentId);
        }

        if (fetchedStudents.length > 0) {
          const presenceResponse = await axios.get(
            `${url}/chat/presence?userIds=${fetchedStudents.map((studentItem) => studentItem.id).join(",")}`,
            {
              headers: {
                Authorization: `Bearer ${teacherJwtToken}`,
              },
            }
          );

          setPresenceMap(presenceResponse?.data?.presenceMap || {});
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load students for chat.", {
          position: "top-center",
          autoClose: 1400,
        });
      }
    };

    loadStudents();
    return undefined;
  }, [teacher?.id, teacher?.grade?.id, teacherJwtToken, studentId]);

  useEffect(() => {
    if (!selectedStudentId || !teacher?.id || !teacherJwtToken) {
      return undefined;
    }

    const loadThread = async () => {
      try {
        const response = await axios.get(
          `${url}/chat/history?teacherId=${teacher.id}&studentId=${selectedStudentId}`,
          {
            headers: {
              Authorization: `Bearer ${teacherJwtToken}`,
            },
          }
        );

        const historyMessages = response?.data?.messages || [];
        setThreads((previousThreads) => ({
          ...previousThreads,
          [selectedStudentId]: historyMessages,
        }));

        setUnreadCounts((previousUnreadCounts) => ({
          ...previousUnreadCounts,
          [selectedStudentId]: 0,
        }));

        historyMessages
          .filter(
            (message) =>
              Number(message.receiverId) === Number(teacher.id) &&
              Number(message.studentId) === Number(selectedStudentId) &&
              message.status !== "READ"
          )
          .forEach((message) => {
            publishDeliveredReceipt(clientRef.current, message.messageId);
            publishReadReceipt(clientRef.current, message.messageId);
          });
      } catch (error) {
        console.error(error);
      }
    };

    loadThread();
    return undefined;
  }, [selectedStudentId, teacher?.id, teacherJwtToken]);

  useEffect(() => {
    if (!teacher?.id || !teacherJwtToken) {
      return undefined;
    }

    const client = createChatClient({
      token: teacherJwtToken,
      userId: teacher.id,
      role: "Teacher",
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: () => setIsConnected(false),
      onPresence: (presenceEvent) => {
        setPresenceMap((previousPresenceMap) => ({
          ...previousPresenceMap,
          [presenceEvent.userId]: Boolean(presenceEvent.online),
        }));
      },
      onMessage: (eventPayload) => {
        if (Number(eventPayload.teacherId) !== Number(teacher.id)) {
          return;
        }

        if (eventPayload.eventType === "STATUS") {
          setThreads((previousThreads) => updateThreadStatus(previousThreads, eventPayload));
          return;
        }

        if (eventPayload.eventType !== "MESSAGE") {
          return;
        }

        const threadStudentId = String(eventPayload.studentId);
        setThreads((previousThreads) => ensureThreadMessage(previousThreads, threadStudentId, eventPayload));

        if (Number(eventPayload.receiverId) === Number(teacher.id)) {
          publishDeliveredReceipt(client, eventPayload.messageId);

          if (selectedStudentIdRef.current === threadStudentId) {
            publishReadReceipt(client, eventPayload.messageId);
            setUnreadCounts((previousUnreadCounts) => ({
              ...previousUnreadCounts,
              [threadStudentId]: 0,
            }));
          } else {
            setUnreadCounts((previousUnreadCounts) => ({
              ...previousUnreadCounts,
              [threadStudentId]: (previousUnreadCounts[threadStudentId] || 0) + 1,
            }));
          }
        }
      },
    });

    clientRef.current = client;

    return () => {
      disconnectChatClient(client);
    };
  }, [teacher?.id, teacherJwtToken]);

  const handleStudentSelection = (nextStudentId) => {
    setSelectedStudentId(String(nextStudentId));
    setUnreadCounts((previousUnreadCounts) => ({
      ...previousUnreadCounts,
      [nextStudentId]: 0,
    }));
    navigate(`/exam/student/grade-wise/studentchatting/${nextStudentId}`);
  };

  const sendMessage = () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage || !selectedStudentId) {
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
      senderId: teacher.id,
      teacherId: teacher.id,
      studentId: Number(selectedStudentId),
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
          <span className="chat-badge">Student Chat</span>
          <h1 className="chat-hero-title">Handle multiple student conversations.</h1>
          <p className="chat-hero-copy">
            Switch between students from the panel and reply in real time.
          </p>
          <div className={`chat-connection ${isConnected ? "online" : "offline"}`}>
            {isConnected ? "WebSocket connected" : "WebSocket reconnecting..."}
          </div>
          <div className="teacher-student-list">
            {students.map((studentItem) => {
              const threadMessages = threads[String(studentItem.id)] || [];
              const lastMessage = threadMessages[threadMessages.length - 1];
              const isSelected = String(selectedStudentId) === String(studentItem.id);

              return (
                <div
                  key={studentItem.id}
                  className={`teacher-student-item ${isSelected ? "active" : ""}`}
                  onClick={() => handleStudentSelection(studentItem.id)}
                >
                  <div className="teacher-student-head">
                    <div className="teacher-student-name">
                      {studentItem.firstName} {studentItem.lastName}
                    </div>
                    {unreadCounts[String(studentItem.id)] > 0 && (
                      <span className="teacher-unread">
                        {unreadCounts[String(studentItem.id)]}
                      </span>
                    )}
                  </div>
                  <div className="text-secondary mb-1" style={{ fontSize: "0.80rem", fontWeight: "600" }}>
                    Grade: {studentItem.grade?.name || "Unassigned"}
                  </div>
                  <div className="chat-presence-chip" style={{ marginBottom: "6px" }}>
                    <span
                      className={`chat-dot ${
                        presenceMap[studentItem.id] ? "online" : "offline"
                      }`}
                    />
                    {presenceMap[studentItem.id] ? "Online" : "Offline"}
                  </div>
                  <div className="teacher-student-preview">
                    {truncatePreview(lastMessage?.messageContent)}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="chat-card chat-main">
          <div className="chat-main-header">
            <div>
              <h2 className="chat-main-title">
                {selectedStudent
                  ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                  : "Select a student"}
              </h2>
              <div className="chat-main-subtitle">
                {selectedStudent
                  ? `${selectedStudent.emailId} | Grade: ${selectedStudent.grade?.name || "Unassigned"}`
                  : "Choose a student from the left panel to open a conversation"}
              </div>
            </div>
            {selectedStudent && (
              <div className="chat-presence-chip">
                <span
                  className={`chat-dot ${
                    presenceMap[selectedStudent.id] ? "online" : "offline"
                  }`}
                />
                {presenceMap[selectedStudent.id] ? "Online" : "Offline"}
              </div>
            )}
          </div>

          <div className="chat-thread">
            {!selectedStudent ? (
              <div className="chat-empty">
                <h4>No student selected</h4>
                <p>Choose a student from the left panel to load the conversation thread.</p>
              </div>
            ) : selectedMessages.length === 0 ? (
              <div className="chat-empty">
                <h4>No messages yet</h4>
                <p>Send the first message to start the conversation with this student.</p>
              </div>
            ) : (
              selectedMessages.map((message) => {
                const isMine = Number(message.senderId) === Number(teacher.id);
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
              placeholder={
                selectedStudent
                  ? `Message ${selectedStudent.firstName}...`
                  : "Select a student to start chatting"
              }
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedStudent}
            />
            <button
              type="button"
              className="chat-send"
              onClick={sendMessage}
              disabled={!selectedStudent || !draftMessage.trim()}
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatingTeacher;
