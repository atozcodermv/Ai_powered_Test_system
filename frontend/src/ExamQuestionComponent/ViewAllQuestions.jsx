import QuestionCard from "./QuestionCard";
import QuestionSpellCard from "./QuestionSpellCard";
import DescriptiveResultReview from "../ExamResultComponent/DescriptiveResultReview";

const ViewAllQuestions = ({ exam }) => {
  const questions = exam?.examType === "Descriptive" ? [] : exam?.questions || [];

  return (
    <div className="container-fluid mt-2 px-0">
      <div className="form-card border-color">
        <div className="container-fluid">
          <div
            className="card-header bg-color custom-bg-text mt-2 d-flex justify-content-center align-items-center"
            style={{
              borderRadius: "1em",
              height: "38px",
            }}
          >
            <h5 className="card-title mb-0">Questions</h5>
          </div>
          <div className="card-body text-color mt-3">
            {exam?.examType === "Descriptive" ? (
              <DescriptiveResultReview exam={exam} />
            ) : null}

            {questions.length === 0 ? (
              <div className="text-center py-5">
                <h6 className="mb-2">No questions added yet</h6>
                <p className="text-muted mb-0">
                  Your MCQ list will appear here as soon as you add the first
                  question.
                </p>
              </div>
            ) : (
              <div className="col-md-12 mb-5">
                {questions.map((question, index) => (
                  <div key={question.id || `${question.question}-${index}`}>
                    {exam?.examType === "Objective" ? (
                      <QuestionCard question={question} serialNumber={index + 1} />
                    ) : (
                      <QuestionSpellCard
                        question={question}
                        serialNumber={index + 1}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllQuestions;
