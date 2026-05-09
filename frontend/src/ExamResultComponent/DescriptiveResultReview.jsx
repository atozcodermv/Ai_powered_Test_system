import "../ExamComponent/descriptive-exam.css";

const DescriptiveResultReview = ({ exam }) => {
  const questions = exam?.descriptiveQuestions || [];

  return (
    <div className="container-fluid mt-2">
      <div className="descriptive-card p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Descriptive Responses</h5>
          <span className="descriptive-chip text-dark bg-light">{questions.length} Questions</span>
        </div>
        <div className="d-flex flex-column gap-3">
          {questions.map((question, index) => (
            <div className="descriptive-card p-3" key={question.id}>
              <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                <strong>Question {index + 1}</strong>
                <span className="descriptive-score">Marks: {question.awardedScore ?? 0} / {question.totalMarks}</span>
              </div>
              <p className="fw-bold mb-2">{question.questionContent}</p>
              <div className="mb-2">
                <span className="fw-bold">Submitted Answer</span>
                <div className="descriptive-textarea bg-light mt-2">{question.answerContent || "No answer recorded."}</div>
              </div>
              <div className="descriptive-muted">Evaluation Status: {question.evaluationStatus || "Pending"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DescriptiveResultReview;
