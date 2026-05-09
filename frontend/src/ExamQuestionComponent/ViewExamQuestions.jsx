import { useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import PageStateMessage from "../CommonComponent/PageStateMessage";
import AddExamQuestion from "./AddExamQuestion";
import ViewAllQuestions from "./ViewAllQuestions";
import "./ExamQuestionsWorkspace.css";

const ViewExamQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(location.state || null);

  const handleQuestionAdded = (questions) => {
    setExam((prev) =>
      prev
        ? {
            ...prev,
            questions,
          }
        : prev
    );
  };

  if (!exam) {
    return (
      <PageStateMessage
        title="Exam Not Found"
        message="We could not load the exam details for question creation. Please create the exam again."
      />
    );
  }

  return (
    <section className="exam-questions-page py-4 py-md-5">
      <div className="container">
        <Card className="exam-questions-shell border-0 overflow-hidden">
          <Card.Body className="p-0">
            <div className="exam-questions-header">
              <div>
                <span className="exam-questions-kicker">MCQ Workflow</span>
                <h2 className="exam-questions-title">{exam.name}</h2>
                <p className="exam-questions-copy mb-0">
                  Add questions on the left, review the growing list on the right,
                  and return to exam setup whenever you are ready to create another
                  MCQ test.
                </p>
              </div>

              <div className="exam-questions-actions">
                <div className="exam-questions-badges">
                  <Badge pill bg="light" text="dark">
                    Exam Type {exam.examType}
                  </Badge>
                  <Badge pill bg="light" text="dark">
                    {exam.questions?.length || 0} questions
                  </Badge>
                </div>
                <Button
                  type="button"
                  className="exam-questions-cta"
                  onClick={() => navigate("/exam/add")}
                >
                  Create MCQ Test
                </Button>
              </div>
            </div>

            <div className="exam-questions-body">
              <Row className="g-4">
                <Col xl={5} lg={6}>
                  <AddExamQuestion
                    exam={exam}
                    onQuestionAdded={handleQuestionAdded}
                  />
                </Col>

                <Col xl={7} lg={6}>
                  <ViewAllQuestions exam={exam} />
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    </section>
  );
};

export default ViewExamQuestions;
