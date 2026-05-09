import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import "../ExamComponent/descriptive-exam.css";
import { getActiveTeacher } from "../utils/teacherSession";

const url = config.url.BASE_URL;

const EvaluateDescriptiveQuestion = () => {
  const teacher = getActiveTeacher();
  const [exams, setExams] = useState([]);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [selectedExam, setSelectedExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examListLoading, setExamListLoading] = useState(false);
  
  // AI Evaluation state
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);

  // Plagiarism states
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState([]);

  const fetchSubmissionData = useCallback(async (examId) => {
    const response = await axios.get(`${url}/descriptive/evaluation/fetch?examId=${examId}`);
    return response.data.submissions || [];
  }, []);

  const loadSubmissions = useCallback(async (exam) => {
    setSelectedExam(exam);
    setSelectedSubmission(null);
    setScores({});
    setLoading(true);

    try {
      const response = await axios.get(`${url}/descriptive/evaluation/fetch?examId=${exam.id}`);
      const fetchedSubmissions = response.data.submissions || [];
      setSubmissions(fetchedSubmissions);
      if (fetchedSubmissions.length > 0) {
        selectSubmission(fetchedSubmissions[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExams = useCallback(async () => {
    if (!teacher?.id) {
      toast.error("Teacher details are missing.");
      return;
    }

    setExamListLoading(true);
    try {
      const response = await axios.get(`${url}/descriptive/teacher/exams?teacherId=${teacher.id}`);
      const fetchedExams = response.data.exams || [];
      const sortedExams = [...fetchedExams].sort((left, right) => Number(right.startTime || 0) - Number(left.startTime || 0));
      setExams(sortedExams);

      if (sortedExams.length === 0) {
        setSubmissionCounts({});
        setSelectedExam(null);
        setSelectedSubmission(null);
        setSubmissions([]);
        return;
      }

      const submissionEntries = await Promise.all(
        sortedExams.map(async (exam) => {
          try {
            const examSubmissions = await fetchSubmissionData(exam.id);
            const pendingSubmissions = examSubmissions.filter((submission) =>
              (submission.questionEvaluations || []).some(
                (item) => (item.evaluationStatus || "").toLowerCase() !== "evaluated"
              )
            );
            return [exam.id, pendingSubmissions.length];
          } catch (submissionError) {
            console.error(submissionError);
            return [exam.id, 0];
          }
        })
      );

      const nextSubmissionCounts = Object.fromEntries(submissionEntries);
      setSubmissionCounts(nextSubmissionCounts);

      const examWithSubmission = sortedExams.find((exam) => nextSubmissionCounts[exam.id] > 0);
      if (examWithSubmission) {
        await loadSubmissions(examWithSubmission);
      } else {
        setSelectedExam(null);
        setSelectedSubmission(null);
        setSubmissions([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load descriptive exams.");
    } finally {
      setExamListLoading(false);
    }
  }, [fetchSubmissionData, loadSubmissions, teacher?.id]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const selectSubmission = (submission) => {
    setSelectedSubmission(submission);
    const initialScores = {};
    (submission.questionEvaluations || []).forEach((item) => {
      initialScores[item.questionId] = item.score ?? 0;
    });
    setScores(initialScores);
  };

  const updateScore = (questionId, value) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
  };

  const submissionSummary = useMemo(() => {
    if (!selectedSubmission) {
      return { totalAwarded: 0, totalMarks: 0 };
    }
    const totalMarks = selectedSubmission.questionEvaluations.reduce(
      (sum, item) => sum + Number(item.totalMarks || 0),
      0
    );
    const totalAwarded = selectedSubmission.questionEvaluations.reduce(
      (sum, item) => sum + Number(scores[item.questionId] || 0),
      0
    );
    return { totalAwarded, totalMarks };
  }, [scores, selectedSubmission]);

  const submitEvaluation = async () => {
    if (!selectedExam || !selectedSubmission) {
      return;
    }

    for (const item of selectedSubmission.questionEvaluations) {
      const score = Number(scores[item.questionId]);
      if (Number.isNaN(score) || score < 0 || score > Number(item.totalMarks)) {
        toast.error(`Score for question ${item.questionId} must be between 0 and ${item.totalMarks}.`);
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch(`${url}/descriptive/evaluation/submit`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: selectedSubmission.student.id,
          evaluations: selectedSubmission.questionEvaluations.map((item) => ({
            questionId: item.questionId,
            score: Number(scores[item.questionId]),
          })),
        }),
      });

      const res = await response.json();
      if (!res.success) {
        toast.error(res.responseMessage || "Unable to submit evaluation.");
        return;
      }

      toast.success(res.responseMessage || "Evaluation submitted successfully.");
      await loadExams();
    } catch (error) {
      console.error(error);
      toast.error("It seems server is down");
    } finally {
      setSaving(false);
    }
  };

  const handleAiEvaluation = async () => {
    if (!selectedExam || !selectedSubmission) {
      toast.warning("Select a submission to evaluate.");
      return;
    }

    setIsAiEvaluating(true);
    try {
      const response = await axios.post(`${url}/descriptive/evaluation/ai-grade`, {
        examId: selectedExam.id,
        studentId: selectedSubmission.student.id,
      });

      const aiScores = response.data || [];
      if (aiScores.length === 0) {
        toast.warning("AI Evaluation didn't return any scores.");
        return;
      }

      const newScores = { ...scores };
      let updatedCount = 0;
      aiScores.forEach((aiScore) => {
        if (aiScore.questionId && aiScore.awardedMarks !== undefined) {
          newScores[aiScore.questionId] = aiScore.awardedMarks;
          updatedCount++;
        }
      });

      setScores(newScores);
      toast.success(`Successfully populated ${updatedCount} AI-graded scores.`);
    } catch (error) {
      console.error("AI Evaluation Error:", error);
      toast.error("Failed to execute AI Descriptive Answer Evaluation.");
    } finally {
      setIsAiEvaluating(false);
    }
  };

  const handleCheckPlagiarism = async () => {
    if (!selectedExam || submissions.length === 0) {
      toast.warning("No submissions available to check.");
      return;
    }

    setIsCheckingPlagiarism(true);
    setPlagiarismResults([]);
    
    try {
      // Map frontend state to DTO format
      const requestPayload = {
        examId: selectedExam.id,
        submissions: submissions.map(sub => ({
          studentId: sub.student.id,
          studentName: `${sub.student.firstName} ${sub.student.lastName}`,
          answers: sub.questionEvaluations.map(q => ({
            questionContent: q.questionContent,
            answerContent: q.answerContent
          }))
        }))
      };

      const response = await axios.post(`${url}/descriptive/plagiarism/check`, requestPayload);
      if (response.data && response.data.success) {
        setPlagiarismResults(response.data.results || []);
        setShowPlagiarismModal(true);
      } else {
        toast.error(response.data?.responseMessage || "Failed to check plagiarism.");
      }
    } catch (error) {
      console.error("Plagiarism Check Error:", error);
      toast.error("Failed to execute AI Plagiarism check. Please try again.");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  return (
    <div className="descriptive-shell">
      <div className="container-fluid">
        <div className="descriptive-panel p-3 p-md-4">
          <div className="descriptive-hero mb-4">
            <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 align-items-xl-center">
              <div>
                <div className="descriptive-chip mb-3">Teacher Evaluation Desk</div>
                <h2 className="mb-2">Mark Descriptive Exams</h2>
                <p className="mb-0 opacity-75">
                  Select an exam, review each student's answer sheet, and award marks question by question.
                </p>
              </div>
              <div className="d-flex flex-column gap-2 align-items-xl-end">
                <span className="descriptive-chip">Teacher: {teacher.firstName}</span>
                {selectedExam ? <span className="descriptive-chip">Exam: {selectedExam.name}</span> : null}
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="descriptive-card p-3">
                <h5 className="mb-3">Descriptive Exams</h5>
                <div className="d-flex flex-column gap-3">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className={`descriptive-sidebar-item ${selectedExam?.id === exam.id ? "active" : ""}`}
                      onClick={() => loadSubmissions(exam)}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="fw-bold">{exam.name}</div>
                        <span className="descriptive-chip">
                          {submissionCounts[exam.id] || 0} submitted
                        </span>
                      </div>
                      <div className="descriptive-muted small mt-1">{exam.course?.name}</div>
                      <div className="descriptive-muted small">{exam.grade?.name}</div>
                    </div>
                  ))}
                  {examListLoading ? <div className="descriptive-muted">Loading descriptive exams...</div> : null}
                  {exams.length === 0 ? <div className="descriptive-muted">No descriptive exams pending evaluation.</div> : null}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="descriptive-card p-3 p-md-4">
                {!selectedExam ? <div className="descriptive-muted">Choose an exam to view pending submissions.</div> : null}
                {selectedExam && loading ? <div className="descriptive-muted">Loading submissions...</div> : null}
                {selectedExam && !loading && submissions.length === 0 ? (
                  <div className="descriptive-muted">No student submissions available for this exam yet.</div>
                ) : null}

                {selectedExam && !loading && submissions.length > 0 ? (
                  <>
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                          <h5 className="mb-0">Student Submissions</h5>
                          <button 
                            className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm"
                            onClick={handleAiEvaluation}
                            disabled={isAiEvaluating}
                          >
                            {isAiEvaluating ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                AI Evaluating...
                              </>
                            ) : (
                              "✨ AI Descriptive Answer Evaluation"
                            )}
                          </button>
                          <button 
                            className="btn btn-sm btn-danger d-flex align-items-center gap-2 shadow-sm"
                            onClick={handleCheckPlagiarism}
                            disabled={isCheckingPlagiarism}
                          >
                            {isCheckingPlagiarism ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                AI Checking...
                              </>
                            ) : (
                              "🤖 Check Plagiarism"
                            )}
                          </button>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {submissions.map((submission) => (
                            <button
                              key={submission.student.id}
                              className={`btn btn-sm ${
                                selectedSubmission?.student.id === submission.student.id
                                  ? "bg-color custom-bg-text"
                                  : "btn-outline-secondary"
                              }`}
                              onClick={() => selectSubmission(submission)}
                            >
                              {submission.student.firstName} {submission.student.lastName}
                            </button>
                          ))}
                        </div>
                      </div>
                      {selectedSubmission ? (
                        <div className="descriptive-score">
                          Awarded: {submissionSummary.totalAwarded} / {submissionSummary.totalMarks}
                        </div>
                      ) : null}
                    </div>

                    {selectedSubmission ? (
                      <div className="d-flex flex-column gap-4">
                        {selectedSubmission.questionEvaluations.map((item, index) => (
                          <div className="descriptive-card p-4" key={item.questionId}>
                            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
                              <h5 className="mb-0">Question {index + 1}</h5>
                              <div className="descriptive-score">Max Marks: {item.totalMarks}</div>
                            </div>
                            <p className="fw-bold">{item.questionContent}</p>
                            <div className="mb-3">
                              <label className="form-label fw-bold">Student Answer</label>
                              <div className="descriptive-textarea bg-light">{item.answerContent}</div>
                            </div>
                            <div className="row align-items-end g-3">
                              <div className="col-md-4">
                                <label className="form-label fw-bold">Award Score</label>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.totalMarks}
                                  className="form-control descriptive-input"
                                  value={scores[item.questionId] ?? 0}
                                  onChange={(event) => updateScore(item.questionId, event.target.value)}
                                />
                              </div>
                              <div className="col-md-4">
                                <div className="descriptive-score">
                                  Status: {item.evaluationStatus || "Pending"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="d-flex justify-content-end">
                          <button className="btn bg-color custom-bg-text px-4 d-flex align-items-center gap-2" onClick={submitEvaluation} disabled={saving}>
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Submitting Evaluation...
                              </>
                            ) : (
                              "Submit Evaluation"
                            )}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plagiarism Results Modal */}
      {showPlagiarismModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: "1em" }}>
              <div className="modal-header bg-danger text-white" style={{ borderRadius: "1em 1em 0 0" }}>
                <h5 className="modal-title d-flex align-items-center gap-2">
                   🤖 AI Plagiarism Report
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPlagiarismModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted mb-4">
                  The AI has evaluated the answers across all students for <b>{selectedExam?.name}</b> and verified against web sources.
                </p>
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th className="text-start">Student Name</th>
                        <th>Similarity</th>
                        <th>Plagiarism Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plagiarismResults.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-muted py-3">No results to display.</td>
                        </tr>
                      ) : (
                        plagiarismResults.map((res, i) => (
                          <tr key={i}>
                            <td className="text-start fw-bold">{res.studentName}</td>
                            <td>
                              <div className="d-flex flex-column align-items-center justify-content-center">
                                <span className={`fw-bold ${res.similarityPercentage >= 90 ? 'text-danger' : 'text-success'}`}>
                                  {res.similarityPercentage}%
                                </span>
                                <div className="progress mt-1" style={{ width: "80px", height: "5px" }}>
                                  <div 
                                    className={`progress-bar ${res.similarityPercentage >= 90 ? 'bg-danger' : 'bg-success'}`} 
                                    role="progressbar" 
                                    style={{ width: `${res.similarityPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {res.plagiarismStatus ? (
                                <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm">Detected</span>
                              ) : (
                                <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm">Clear</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowPlagiarismModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default EvaluateDescriptiveQuestion;
