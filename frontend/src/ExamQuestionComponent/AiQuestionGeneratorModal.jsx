import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import "./AiQuestionGeneratorModal.css";

const url = config.url.BASE_URL;

const AiQuestionGeneratorModal = ({ show, onHide, examTopic, isDescriptive, onQuestionsGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    resourceLink: "",
    numberOfQuestions: 5,
    difficulty: "Medium",
    marksPerQuestion: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (formData.numberOfQuestions <= 0 || formData.numberOfQuestions > 20) {
      toast.error("Please enter a valid number of questions (1-20).");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isDescriptive ? "/ai/generate/descriptive" : "/ai/generate/mcq";
      const payload = {
        resourceLink: formData.resourceLink.trim(),
        topic: examTopic || "General Topic",
        numberOfQuestions: Number(formData.numberOfQuestions),
        difficulty: formData.difficulty,
        marksPerQuestion: formData.marksPerQuestion ? Number(formData.marksPerQuestion) : null,
      };

      const response = await fetch(`${url}${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (res.success && res.questions) {
        toast.success("Questions generated successfully!");
        onQuestionsGenerated(res.questions, formData.marksPerQuestion);
        onHide();
      } else {
        toast.error(res.responseMessage || "Failed to generate questions. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="ai-modal-glassmorphism">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          ✨ Generate {isDescriptive ? "Descriptive" : "MCQ"} Questions with AI
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleGenerate}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Resource Link or Topic (Optional)</Form.Label>
            <Form.Control
              type="text"
              name="resourceLink"
              placeholder={`e.g., YouTube link or topic (default: ${examTopic})`}
              value={formData.resourceLink}
              onChange={handleChange}
              className="ai-modal-input"
            />
            <Form.Text className="text-muted">
              Provide a link or detailed topic string to base the questions on.
            </Form.Text>
          </Form.Group>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Number of Questions</Form.Label>
                <Form.Control
                  type="number"
                  name="numberOfQuestions"
                  min="1"
                  max="20"
                  value={formData.numberOfQuestions}
                  onChange={handleChange}
                  className="ai-modal-input"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Difficulty Level</Form.Label>
                <Form.Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="ai-modal-input"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Marks per Question (Optional)</Form.Label>
            <Form.Control
              type="number"
              name="marksPerQuestion"
              min="1"
              value={formData.marksPerQuestion}
              onChange={handleChange}
              className="ai-modal-input"
              placeholder="Leave empty to specify manually later"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="outline-secondary" onClick={onHide} disabled={loading} className="px-4 rounded-pill">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="px-4 rounded-pill ai-generate-btn">
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Generating...
                </>
              ) : (
                "Generate Questions"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AiQuestionGeneratorModal;
