import { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import AiQuestionGeneratorModal from "./AiQuestionGeneratorModal";
import "./AddExamQuestion.css";

const url = config.url.BASE_URL;

const createInitialQuestionRequest = (examId) => ({
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correctAnswer: "",
  marks: "",
  examId: examId || "",
});

const AddExamQuestion = ({ exam, onQuestionAdded }) => {
  const [questionRequest, setQuestionRequest] = useState(
    createInitialQuestionRequest(exam?.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Generation State
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isSavingAi, setIsSavingAi] = useState(false);

  useEffect(() => {
    setQuestionRequest(createInitialQuestionRequest(exam?.id));
  }, [exam?.id]);

  const handleUserInput = (event) => {
    const { name, value } = event.target;
    setQuestionRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetQuestionForm = () => {
    setQuestionRequest(createInitialQuestionRequest(exam?.id));
  };

  const saveExamQuestion = async (event) => {
    event.preventDefault();

    const optionValues = [
      questionRequest.option1,
      questionRequest.option2,
      questionRequest.option3,
      questionRequest.option4,
    ];

    if (!questionRequest.question.trim()) {
      toast.error("Please enter the question text.", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    if (optionValues.some((option) => !option.trim())) {
      toast.error("Please fill in all four options before adding the question.", {
        position: "top-center",
        autoClose: 1200,
      });
      return;
    }

    if (questionRequest.correctAnswer === "") {
      toast.error("Please select the correct answer.", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    if (Number(questionRequest.marks) <= 0) {
      toast.error("Please enter valid marks greater than zero.", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    const optionPayload = JSON.stringify(optionValues);

    setIsSubmitting(true);

    try {
      const result = await fetch(`${url}/exam/question/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionRequest.question.trim(),
          correctAnswer: questionRequest.correctAnswer,
          options: optionPayload,
          examId: questionRequest.examId,
          marks: questionRequest.marks,
        }),
      });

      const res = await result.json();

      if (res.success) {
        toast.success(res.responseMessage, {
          position: "top-center",
          autoClose: 1000,
        });

        onQuestionAdded?.(res.questions || []);
        resetQuestionForm();
        return;
      }

      toast.error(res.responseMessage || "Unable to add the question.", {
        position: "top-center",
        autoClose: 1200,
      });

      setTimeout(() => {
        window.location.href = "/home";
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("It seems server is down", {
        position: "top-center",
        autoClose: 1000,
      });

      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- AI Workflow Methods ---
  const handleAiQuestionsGenerated = (questions, marks) => {
    const formatted = questions.map((q) => ({
      question: q.questionText || "",
      option1: q.options?.option1 || "",
      option2: q.options?.option2 || "",
      option3: q.options?.option3 || "",
      option4: q.options?.option4 || "",
      correctAnswer: q.correctAnswer ? q.correctAnswer.replace('option', '') : "",
      marks: marks || "",
      examId: exam?.id || "",
    }));
    // adjust correctAnswer from 'option1'/'option2' to '0'/'1'
    formatted.forEach(f => {
       if (f.correctAnswer === "1") f.correctAnswer = "0";
       else if (f.correctAnswer === "2") f.correctAnswer = "1";
       else if (f.correctAnswer === "3") f.correctAnswer = "2";
       else if (f.correctAnswer === "4") f.correctAnswer = "3";
    });
    setGeneratedQuestions((prev) => [...prev, ...formatted]);
  };

  const handleAiQuestionChange = (index, field, value) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const removeAiQuestion = (index) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAiQuestions = async () => {
    if (generatedQuestions.length === 0) return;

    // Validation
    for (const q of generatedQuestions) {
      if (!q.question.trim() || !q.option1.trim() || !q.option2.trim() || !q.option3.trim() || !q.option4.trim()) {
        toast.error("All questions and 4 options must be filled.");
        return;
      }
      if (q.correctAnswer === "") {
        toast.error("All questions must have a correct answer selected.");
        return;
      }
      if (Number(q.marks) <= 0) {
        toast.error("All questions must have valid marks greater than zero.");
        return;
      }
    }

    setIsSavingAi(true);
    let latestQuestions = [];

    try {
      for (const q of generatedQuestions) {
        const optionPayload = JSON.stringify([q.option1, q.option2, q.option3, q.option4]);
        const result = await fetch(`${url}/exam/question/add`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: q.question.trim(),
            correctAnswer: q.correctAnswer,
            options: optionPayload,
            examId: q.examId,
            marks: q.marks,
          }),
        });

        const res = await result.json();
        if (res.success && res.questions) {
          latestQuestions = res.questions;
        } else {
          toast.error(`Failed to add question: ${q.question.substring(0, 20)}...`);
        }
      }

      toast.success("AI Generated Questions Saved Successfully!");
      onQuestionAdded?.(latestQuestions);
      setGeneratedQuestions([]);
    } catch (error) {
      console.error(error);
      toast.error("It seems server is down");
    } finally {
      setIsSavingAi(false);
    }
  };

  return (
    <>
      {/* AI Modals */}
      <AiQuestionGeneratorModal
        show={showAiModal}
        onHide={() => setShowAiModal(false)}
        examTopic={exam?.name}
        isDescriptive={false}
        onQuestionsGenerated={handleAiQuestionsGenerated}
      />

      <Card className="mcq-builder-card border-0 mb-4">
        <Card.Body className="p-0">
          <div className="mcq-builder-hero d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="mcq-builder-kicker">Question Builder</span>
              <h3 className="mcq-builder-title">Add a fresh MCQ</h3>
              <p className="mcq-builder-copy mb-0">
                Manually add a question below or use AI to generate multiple.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge pill bg="light" text="dark" className="mcq-builder-badge">
                Exam ID {exam?.id}
              </Badge>
              <Button
                variant="primary"
                className="ai-generate-btn ms-2 rounded-pill px-3 py-2 fw-semibold d-flex align-items-center"
                onClick={() => setShowAiModal(true)}
              >
                ✨ Add MCQ Questions
              </Button>
            </div>
          </div>

          <div className="mcq-builder-content">
            <div className="mcq-builder-summary">
              <div>
                <span className="mcq-builder-summary__label">Exam</span>
                <h5 className="mb-1">{exam?.name || "Untitled Exam"}</h5>
              </div>
              <Badge className="mcq-builder-summary__badge">
                {exam?.questions?.length || 0} questions added
              </Badge>
            </div>

            {/* AI Generated Questions Preview */}
            {generatedQuestions.length > 0 && (
              <div className="ai-preview-section mb-5 p-4 rounded-4" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold m-0 text-primary">✨ AI Generated Questions</h4>
                  <span className="badge bg-primary rounded-pill fs-6">{generatedQuestions.length} Ready</span>
                </div>
                
                {generatedQuestions.map((q, index) => (
                  <Card key={`ai-q-${index}`} className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                      <h5 className="m-0 fw-bold">Question {index + 1}</h5>
                      <Button variant="outline-danger" size="sm" onClick={() => removeAiQuestion(index)}>
                        Remove
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Question Text</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleAiQuestionChange(index, "question", e.target.value)}
                        />
                      </Form.Group>
                      
                      <Row className="g-3 mb-3">
                        {[1, 2, 3, 4].map((optNum) => (
                          <Col md={6} key={optNum}>
                            <Form.Group>
                              <Form.Label className="fw-semibold small">Option {optNum}</Form.Label>
                              <Form.Control
                                type="text"
                                value={q[`option${optNum}`]}
                                onChange={(e) => handleAiQuestionChange(index, `option${optNum}`, e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                      
                      <Row className="g-3">
                        <Col md={8}>
                          <Form.Label className="fw-semibold d-block">Correct Answer</Form.Label>
                          <div className="d-flex gap-3 flex-wrap">
                            {[1, 2, 3, 4].map((optNum) => {
                              const val = String(optNum - 1);
                              return (
                                <Form.Check
                                  type="radio"
                                  id={`ai-${index}-ans-${val}`}
                                  key={optNum}
                                  label={`Option ${optNum}`}
                                  name={`ai-correct-${index}`}
                                  value={val}
                                  checked={q.correctAnswer === val}
                                  onChange={(e) => handleAiQuestionChange(index, "correctAnswer", e.target.value)}
                                  inline
                                />
                              );
                            })}
                          </div>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Marks</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              value={q.marks}
                              onChange={(e) => handleAiQuestionChange(index, "marks", e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="outline-secondary" onClick={() => setGeneratedQuestions([])}>
                    Discard All
                  </Button>
                  <Button variant="primary" onClick={saveAiQuestions} disabled={isSavingAi} className="px-4 fw-semibold ai-generate-btn">
                    {isSavingAi ? "Saving..." : "Save All Generated Questions"}
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Form */}
            <hr className="my-5" />
            <h5 className="mb-4">Manual Entry</h5>
            <Form onSubmit={saveExamQuestion}>
              <Form.Group className="mb-4" controlId="question">
                <Form.Label className="mcq-builder-label">Question Text</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="question"
                  placeholder="Enter the question prompt here"
                  onChange={handleUserInput}
                  value={questionRequest.question}
                />
              </Form.Group>

              <div className="mcq-builder-option-block">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <h5 className="mb-1">Answer Options</h5>
                    <p className="text-muted mb-0">
                      Fill all four options and pick the one correct answer.
                    </p>
                  </div>
                  <span className="mcq-builder-option-count">4 options required</span>
                </div>

                <Row className="g-3">
                  {[1, 2, 3, 4].map((optionNumber) => (
                    <Col md={6} key={optionNumber}>
                      <Form.Group controlId={`option${optionNumber}`}>
                        <Form.Label className="mcq-builder-label">
                          Option {optionNumber}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name={`option${optionNumber}`}
                          placeholder={`Enter option ${optionNumber}`}
                          onChange={handleUserInput}
                          value={questionRequest[`option${optionNumber}`]}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </div>

              <Row className="g-4 mt-1">
                <Col lg={8}>
                  <div className="mcq-builder-answer-panel">
                    <h5 className="mb-1">Correct Answer</h5>
                    <p className="text-muted mb-3">
                      Select the option that should be stored as the right answer.
                    </p>
                    <div className="mcq-builder-answer-grid">
                      {[1, 2, 3, 4].map((optionNumber) => {
                        const optionValue = String(optionNumber - 1);
                        return (
                          <label
                            className="mcq-builder-answer-choice"
                            htmlFor={`correct-answer-${optionNumber}`}
                            key={optionNumber}
                          >
                            <input
                              id={`correct-answer-${optionNumber}`}
                              type="radio"
                              name="correctAnswer"
                              value={optionValue}
                              onChange={handleUserInput}
                              checked={questionRequest.correctAnswer === optionValue}
                            />
                            <span>Option {optionNumber}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </Col>

                <Col lg={4}>
                  <div className="mcq-builder-marks-panel">
                    <Form.Group controlId="marks">
                      <Form.Label className="mcq-builder-label">Marks</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        step="1"
                        name="marks"
                        placeholder="Enter marks"
                        onChange={handleUserInput}
                        value={questionRequest.marks}
                      />
                    </Form.Group>
                    <p className="text-muted mb-0 small mt-3">
                      Use positive marks only.
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="mcq-builder-actions mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={resetQuestionForm}
                  disabled={isSubmitting}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  className="mcq-builder-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Question (Manual)"}
                </Button>
              </div>
            </Form>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default AddExamQuestion;
