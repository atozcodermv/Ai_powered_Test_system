import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import AiQuestionGeneratorModal from "./AiQuestionGeneratorModal";
import "../ExamComponent/descriptive-exam.css";

const url = config.url.BASE_URL;

const createEmptyQuestion = () => ({ questionContent: "", totalMarks: "" });

const DescriptiveQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state;
  const existingQuestions = useMemo(() => exam?.descriptiveQuestions || [], [exam]);

  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleAiQuestionsGenerated = (aiQuestions, marks) => {
    const defaultMarks = marks || "";
    const newQuestions = aiQuestions.map((q) => ({
      questionContent: q.questionText || "",
      totalMarks: defaultMarks,
    }));
    
    // If the first question is empty, replace it, otherwise append.
    setQuestions((prev) => {
      if (prev.length === 1 && prev[0].questionContent === "" && prev[0].totalMarks === "") {
        return newQuestions;
      }
      return [...prev, ...newQuestions];
    });
  };

  const totalMarks = useMemo(
    () =>
      existingQuestions.reduce((sum, question) => sum + (Number(question.totalMarks) || 0), 0) +
      questions.reduce((sum, question) => sum + (Number(question.totalMarks) || 0), 0),
    [existingQuestions, questions]
  );

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      )
    );
  };

  const addQuestionBlock = () => setQuestions((prev) => [...prev, createEmptyQuestion()]);

  const removeQuestionBlock = (index) => {
    if (questions.length === 1) {
      return;
    }
    setQuestions((prev) => prev.filter((_, questionIndex) => questionIndex !== index));
  };

  const validateQuestions = () => {
    for (const question of questions) {
      if (!question.questionContent.trim()) {
        toast.error("Enter question content for all descriptive questions.");
        return false;
      }
      if (!Number(question.totalMarks) || Number(question.totalMarks) <= 0) {
        toast.error("Enter valid marks for all descriptive questions.");
        return false;
      }
    }
    return true;
  };

  const saveQuestions = async (event) => {
    event.preventDefault();
    if (!validateQuestions()) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${url}/descriptive/question/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId: exam.id,
          questions: questions.map((question) => ({
            questionContent: question.questionContent.trim(),
            totalMarks: Number(question.totalMarks),
          })),
        }),
      });

      const res = await response.json();
      if (!res.success) {
        toast.error(res.responseMessage || "Unable to save descriptive questions.");
        return;
      }

      toast.success(res.responseMessage || "Descriptive questions saved.");
      setQuestions([createEmptyQuestion()]);
      setTimeout(() => {
        navigate("/exam/grade-wise/upcoming");
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error("It seems server is down");
    } finally {
      setSaving(false);
    }
  };

  if (!exam) {
    return <div className="container mt-4">Exam details were not provided.</div>;
  }

  return (
    <div className="descriptive-shell">
      <div className="container-fluid">
        <div className="descriptive-panel p-3 p-md-4">
          <div className="descriptive-hero mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
              <div>
                <div className="descriptive-chip mb-3">Descriptive Exam Builder</div>
                <h2 className="mb-2">{exam.name}</h2>
                <p className="mb-0 opacity-75">
                  Add long-form questions with flexible marks. Existing descriptive questions stay visible below.
                </p>
              </div>
              <div className="d-flex flex-column align-items-lg-end gap-2">
                <span className="descriptive-chip">{exam.course?.name}</span>
                <span className="descriptive-chip">{exam.grade?.name}</span>
                <span className="descriptive-chip">Total Marks: {totalMarks}</span>
              </div>
            </div>
            <div className="d-flex mb-2">
              <button 
                type="button" 
                className="btn btn-primary rounded-pill px-4 fw-bold" 
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', border: 'none' }}
                onClick={() => setShowAiModal(true)}
              >
                ✨ Add Descriptive Questions (AI)
              </button>
            </div>
          </div>

          <AiQuestionGeneratorModal
            show={showAiModal}
            onHide={() => setShowAiModal(false)}
            examTopic={exam?.name}
            isDescriptive={true}
            onQuestionsGenerated={handleAiQuestionsGenerated}
          />

          {existingQuestions.length > 0 ? (
            <div className="descriptive-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Existing Questions</h5>
                <span className="descriptive-score">{existingQuestions.length} Saved</span>
              </div>
              <div className="d-flex flex-column gap-3">
                {existingQuestions.map((question, index) => (
                  <div key={question.id} className="descriptive-card p-3">
                    <div className="d-flex justify-content-between gap-3">
                      <strong>Question {index + 1}</strong>
                      <span className="descriptive-score">{question.totalMarks} Marks</span>
                    </div>
                    <p className="mt-2 mb-0">{question.questionContent}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <form onSubmit={saveQuestions}>
            <div className="row g-4">
              {questions.map((question, index) => (
                <div className="col-12" key={`descriptive-question-${index}`}>
                  <div className="descriptive-card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">New Question {index + 1}</h5>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeQuestionBlock(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Question Content</label>
                      <textarea
                        className="form-control descriptive-textarea"
                        value={question.questionContent}
                        onChange={(event) =>
                          handleQuestionChange(index, "questionContent", event.target.value)
                        }
                        placeholder="Write the descriptive prompt, case study, or theory question here..."
                      />
                    </div>
                    <div className="row align-items-end g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-bold">Marks</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control descriptive-input"
                          value={question.totalMarks}
                          onChange={(event) =>
                            handleQuestionChange(index, "totalMarks", event.target.value)
                          }
                          placeholder="Enter marks"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
              <button type="button" className="btn btn-outline-primary" onClick={addQuestionBlock}>
                Add Another Question
              </button>
              <button type="submit" className="btn bg-color custom-bg-text px-4" disabled={saving}>
                {saving ? "Saving..." : "Save Descriptive Questions"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DescriptiveQuestion;
