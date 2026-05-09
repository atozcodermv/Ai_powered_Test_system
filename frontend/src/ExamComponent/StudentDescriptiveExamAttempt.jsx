import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import ExamProctoringMonitor from "./ExamProctoringMonitor";
import "./descriptive-exam.css";

const url = config.url.BASE_URL;

const StudentDescriptiveExamAttempt = () => {
  const location = useLocation();
  const storedExamSession = (() => {
    try {
      const sessionValue = sessionStorage.getItem("active-exam-session");
      return sessionValue ? JSON.parse(sessionValue) : null;
    } catch (error) {
      return null;
    }
  })();
  const exam =
    location.state ||
    (storedExamSession?.attemptRoute === "/exam/student/descriptive/attempt" ||
    storedExamSession?.examType === "Descriptive"
      ? storedExamSession
      : null);
  const student = JSON.parse(sessionStorage.getItem("active-student"));
  const [questions, setQuestions] = useState(exam?.descriptiveQuestions || []);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(Number(exam?.duration || 0) * 60);
  const [submitting, setSubmitting] = useState(false);
  const hasSubmitted = useRef(false);
  const answersRef = useRef({});

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + (Number(question.totalMarks) || 0), 0),
    [questions]
  );

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const updateAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  useEffect(() => {
    if (!exam?.id) {
      return;
    }

    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const response = await fetch(
          `${url}/descriptive/question/fetch/exam-wise?examId=${exam.id}&studentId=${student.id}`
        );
        const res = await response.json();
        if (!res.success) {
          toast.error(res.responseMessage || "Unable to load descriptive questions.");
          return;
        }

        setQuestions(res.questions || []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load descriptive questions right now.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [exam?.id, student.id]);

  const submitExam = useCallback(async (automatic = false, violationReason = null) => {
    if (hasSubmitted.current || !exam) {
      return;
    }

    const missingAnswers = questions.some(
      (question) => !String(answersRef.current[question.id] || "").trim()
    );
    if (missingAnswers && !automatic) {
      toast.error("Answer every descriptive question before submitting.");
      return;
    }

    hasSubmitted.current = true;
    setSubmitting(true);

    try {
      const response = await fetch(`${url}/descriptive/answer/submit`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId: exam.id,
          studentId: student.id,
          isAutoSubmit: automatic,
          violationReason: violationReason,
          studentImage: storedExamSession?.studentImage || "",
          answers: questions.map((question) => ({
            questionId: question.id,
            answerContent:
              String(answersRef.current[question.id] || "").trim() || "No response submitted.",
          })),
        }),
      });

      const res = await response.json();
      if (!res.success) {
        hasSubmitted.current = false;
        toast.error(res.responseMessage || "Unable to submit exam.");
        return;
      }

      sessionStorage.removeItem("active-exam-session");
      const successMessage = violationReason 
         ? "Cheating detected: Exam Auto-Submitted." 
         : (automatic ? "Time is up. Your descriptive exam was submitted automatically." : res.responseMessage);

      toast.success(successMessage);
      
      setTimeout(() => {
        window.location.href = "/exam/student/grade-wise/previous";
      }, 1500);
    } catch (error) {
      hasSubmitted.current = false;
      console.error(error);
      toast.error("It seems server is down");
    } finally {
      setSubmitting(false);
    }
  }, [exam, questions, student.id]);

  useEffect(() => {
    if (!exam) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          if (!hasSubmitted.current) {
            submitExam(true, null); // Time up, no cheating
          }
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, submitExam]);

  // Anti-cheating listeners (tab switch, window leave)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmitted.current) {
         console.warn("Tab switch detected. Auto-submitting exam.");
         submitExam(true, "Tab switch detected");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitExam]);

  const handleProctoringViolation = useCallback((reason) => {
    if (hasSubmitted.current) {
      return;
    }
    toast.error(reason);
    submitExam(true, reason);
  }, [submitExam]);

  if (!exam) {
    return <div className="container mt-4">Exam details were not provided.</div>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const monitorKey = `descriptive-${exam.id}-${student?.id || "student"}`;

  return (
    <div className="descriptive-shell">
      <div className="container-fluid">
        <div className="descriptive-panel p-3 p-md-4">
          <div className="descriptive-hero mb-4">
            <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 align-items-xl-center">
              <div>
                <div className="descriptive-chip mb-3">Live Descriptive Exam</div>
                <h2 className="mb-2">{exam.name}</h2>
                <p className="mb-0 opacity-75">
                  Answer every prompt clearly. The timer is active and the exam auto-submits when it reaches zero.
                </p>
              </div>
              <div className="d-flex flex-column gap-2 align-items-xl-end">
                <span className="descriptive-chip">{exam.course?.name}</span>
                <span className="descriptive-chip">Total Marks: {totalMarks}</span>
                <span className="descriptive-chip">Time Left: {minutes}:{seconds}</span>
                <span className="descriptive-chip">Face verification every 1 minute</span>
                <span className="descriptive-chip">Multiple-face detection every 1 minute</span>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {loadingQuestions ? (
              <div className="col-12">
                <div className="descriptive-card p-4">Loading descriptive questions...</div>
              </div>
            ) : null}
            {questions.map((question, index) => (
              <div className="col-12" key={question.id}>
                <div className="descriptive-card p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
                    <h5 className="mb-0">Question {index + 1}</h5>
                    <div className="descriptive-score fw-bold">Max Marks: {question.totalMarks}</div>
                  </div>
                  <p className="descriptive-muted fs-5">{question.questionContent}</p>
                  <label className="form-label fw-bold mt-3">Your Answer</label>
                  <textarea
                    className="form-control descriptive-textarea"
                    value={answers[question.id] || ""}
                    onChange={(event) => updateAnswer(question.id, event.target.value)}
                    placeholder="Write your answer here..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button className="btn bg-color custom-bg-text px-4 d-flex align-items-center gap-2" onClick={() => submitExam(false)} disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                "Submit Exam"
              )}
            </button>
          </div>
        </div>
      </div>
      {student?.id ? (
        <ExamProctoringMonitor
          key={monitorKey}
          studentId={student.id}
          onViolation={handleProctoringViolation}
          disabled={hasSubmitted.current}
        />
      ) : null}
      <ToastContainer />
    </div>
  );
};

export default StudentDescriptiveExamAttempt;
