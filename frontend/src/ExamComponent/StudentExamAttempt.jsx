import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CountdownTimer from "./CountdownTimer";
import ExamProctoringMonitor from "./ExamProctoringMonitor";
import { config } from '../ConsantsFile/Constants';
const url = config.url.BASE_URL;

const StudentExamAttempt = () => {
  const location = useLocation();
  const exam = location.state;

  const [calculatedTime, setCalculatedTime] = useState(null);

  const handleCalculateTime = () => {
    const currentTime = new Date().getTime();
   // const now = new Date().getTime();
    //const newTime = new Date(currentTime.getTime() + 20 * 60000); // Adding 10 minutes in milliseconds
    const newTime = currentTime + (20 * 60000) ; 

    setCalculatedTime(newTime);
    exam.endTime = newTime ; 
  };


  var questions = exam.questions;
  const student = JSON.parse(sessionStorage.getItem("active-student"));
  const hasSubmitted = useRef(false);
  const answersRef = useRef({});
  const questionRefs = useRef({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleCheckboxChange = (questionId, optionIndex) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setIsSubmitting(true);

    // Create an array of question objects with student answers
    const studentResponses = questions.map(
      ({ id, question, options, marks, status }, index) => ({
        id,
        question,
        options,
        marks,
        status,
        answer: answers[id] !== undefined ? answers[id] : 4,
      })
    );

    // Log the array of question objects with student answers
    console.log("Student Responses:", studentResponses);

    fetch(url + "/student/answer/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        //    Authorization: "Bearer " + admin_jwtToken,
      },
      body: JSON.stringify({
        examId: exam.id,
        studentId: student.id,
        questions: studentResponses,
        studentImage: JSON.parse(sessionStorage.getItem("active-exam-session"))?.studentImage || "",
      }),
    })
      .then((result) => {
        result.json().then((res) => {
          if (res.success) {
            sessionStorage.removeItem("active-exam-session");
            toast.success(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            setTimeout(() => {
              window.location.href = "/home"; // sending added exam object
            }, 2000); // Redirect after 3 seconds
          } else if (!res.success) {
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 2000); // Redirect after 3 seconds
          } else {
            toast.error("It Seems Server is down!!!", {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 2000); // Redirect after 3 seconds
          }
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000); // Redirect after 3 seconds
      })
      .finally(() => setIsSubmitting(false));
  };

  const autoSubmitExam = useCallback((reason, currentAnswers = answers) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    // Create an array of question objects with student answers
    const studentResponses = questions.map(
      ({ id, question, options, marks, status }, index) => ({
        id,
        question,
        options,
        marks,
        status,
        answer: currentAnswers[id] !== undefined ? currentAnswers[id] : 4, // 4 means unattempted
      })
    );

    console.log("Auto Submitting Responses:", studentResponses);

    fetch(url + "/student/answer/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examId: exam.id,
        studentId: student.id,
        questions: studentResponses,
        isAutoSubmit: true,
        violationReason: reason,
        studentImage: JSON.parse(sessionStorage.getItem("active-exam-session"))?.studentImage || "",
      }),
    })
      .then((result) => {
        result.json().then((res) => {
          if (res.success) {
            sessionStorage.removeItem("active-exam-session");
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 3000,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 3000);
          } else {
             toast.error("Auto Submit Failed: " + res.responseMessage, {
               position: "top-center",
               autoClose: 3000,
             });
             setTimeout(() => {
               window.location.href = "/home";
             }, 3000);
          }
        });
      })
      .catch((error) => {
        console.error("Auto-submit error:", error);
        window.location.href = "/home";
      });
  }, [answers, exam.id, questions, student?.id]);

  useEffect(() => {
    console.log("Updated Exam in Child Component:", exam);
    console.log('End Time starting ', exam.endTime); 
    console.log('Duration of the Exam ', exam.duration); 
    handleCalculateTime() ; 

    console.log('End time calculated one : '+ calculatedTime); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  // Anti-cheating listeners (tab switch, window leave)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmitted.current) {
         console.warn("Tab switch detected. Auto-submitting exam.");
         autoSubmitExam("Tab switch detected", answers);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]); // Bind answers so the autoSubmit function captures the latest state

  const handleProctoringViolation = useCallback((reason) => {
    if (hasSubmitted.current) {
      return;
    }
    toast.error(reason, {
      position: "top-center",
      autoClose: 2000,
    });
    autoSubmitExam(reason, answersRef.current);
  }, [autoSubmitExam]);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const totalQuestions = questions?.length || 0;
  const attemptedCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );
  const progressValue = totalQuestions
    ? Math.round((attemptedCount / totalQuestions) * 100)
    : 0;

  const handleScrollToQuestion = (questionId) => {
    const target = questionRefs.current[questionId];
    if (target?.scrollIntoView) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f9ff 0%, #ffffff 45%, #f0f4ff 100%)",
        pb: 6,
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                {exam.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {exam.grade.name} · {exam.course.name}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={`${attemptedCount}/${totalQuestions} Attempted`}
                sx={{
                  bgcolor: "#e0f2fe",
                  color: "#0369a1",
                  fontWeight: 600,
                }}
              />
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid rgba(14, 116, 144, 0.2)",
                  bgcolor: "#f8fafc",
                }}
              >
                <Typography variant="caption" sx={{ color: "#0f172a", fontWeight: 600 }}>
                  Time Remaining
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0ea5e9" }}>
                  <CountdownTimer endTime={exam.duration} onComplete={() => autoSubmitExam(null, answers)} />
                </Typography>
              </Paper>
            </Stack>
          </Stack>
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 6,
                bgcolor: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 6,
                  bgcolor: "#2563eb",
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
            <Box component="form" onSubmit={(e) => handleSubmit(e)}>
              <Grid container spacing={3}>
                {questions.map(({ id, question, options, marks }, index) => (
                  <Grid item xs={12} md={6} key={id}>
                    <Card
                      ref={(node) => {
                        questionRefs.current[id] = node;
                      }}
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 24px rgba(37, 99, 235, 0.15)",
                        },
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                          <Chip
                            label={`Q${index + 1}`}
                            size="small"
                            sx={{
                              bgcolor: "#dbeafe",
                              color: "#1d4ed8",
                              fontWeight: 700,
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ color: "#64748b" }}>
                            {marks} Marks
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}>
                          {question}
                        </Typography>
                        <RadioGroup
                          name={`question-${id}`}
                          value={answers[id] !== undefined ? String(answers[id]) : ""}
                          onChange={(event) =>
                            handleCheckboxChange(id, Number(event.target.value))
                          }
                        >
                          {options
                            .replace(/[[\]]/g, "")
                            .split(",")
                            .map((option, optionIndex) => (
                              <FormControlLabel
                                key={optionIndex}
                                value={String(optionIndex)}
                                control={<Radio />}
                                label={option.trim()}
                                sx={{
                                  alignItems: "flex-start",
                                  mb: 0.5,
                                  "& .MuiFormControlLabel-label": {
                                    color: "#334155",
                                  },
                                }}
                              />
                            ))}
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    px: 5,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "0 12px 20px rgba(37, 99, 235, 0.3)",
                    bgcolor: "#2563eb",
                    "&:hover": {
                      bgcolor: "#1d4ed8",
                      boxShadow: "0 14px 24px rgba(37, 99, 235, 0.4)",
                    },
                  }}
                >
                  {isSubmitting ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                      <span>Submitting...</span>
                    </Stack>
                  ) : (
                    "Submit Exam"
                  )}
                </Button>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} lg={3}>
            <Box
              sx={{
                position: isMdUp ? "sticky" : "static",
                top: isMdUp ? 120 : "auto",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Question Navigator
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Jump to any question instantly.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1}>
                  {questions.map(({ id }, index) => {
                    const isAttempted = answers[id] !== undefined;
                    return (
                      <Grid item xs={3} sm={2} md={3} key={id}>
                        <Button
                          onClick={() => handleScrollToQuestion(id)}
                          variant={isAttempted ? "contained" : "outlined"}
                          size="small"
                          sx={{
                            minWidth: 0,
                            width: "100%",
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: "none",
                            bgcolor: isAttempted ? "#2563eb" : "transparent",
                            borderColor: isAttempted ? "#2563eb" : "#cbd5f5",
                            color: isAttempted ? "#ffffff" : "#1e293b",
                            "&:hover": {
                              bgcolor: isAttempted ? "#1d4ed8" : "#e2e8f0",
                            },
                          }}
                        >
                          {index + 1}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                  <Chip
                    size="small"
                    label="Attempted"
                    sx={{ bgcolor: "#2563eb", color: "#fff", fontWeight: 600 }}
                  />
                  <Chip
                    size="small"
                    label="Unattempted"
                    variant="outlined"
                    sx={{ borderColor: "#cbd5f5", color: "#475569", fontWeight: 600 }}
                  />
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
      {student?.id ? (
        <ExamProctoringMonitor
          studentId={student.id}
          onViolation={handleProctoringViolation}
          disabled={hasSubmitted.current}
        />
      ) : null}
    </Box>
  );
};

export default StudentExamAttempt;
