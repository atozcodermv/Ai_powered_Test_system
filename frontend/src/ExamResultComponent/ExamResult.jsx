import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { config } from "../ConsantsFile/Constants";
import StudentExamMarks from "./StudentExamMarks";
import ViewAllQuestions from "../ExamQuestionComponent/ViewAllQuestions";
import DescriptiveResultReview from "./DescriptiveResultReview";

const url = config.url.BASE_URL;

const ExamResult = () => {
  const location = useLocation();

  var [examResult, setExamResult] = useState(location.state);
  const [cheatingRecords, setCheatingRecords] = useState([]);

  useEffect(() => {
    if (examResult?.student?.id && examResult?.exam?.id) {
      axios.get(`${url}/proctoring/cheating/record?studentId=${examResult.student.id}&examId=${examResult.exam.id}`)
        .then(response => {
          if (response.data?.success && response.data.cheatings) {
            setCheatingRecords(response.data.cheatings);
          }
        })
        .catch(error => {
          console.error("Error fetching cheating records", error);
        });
    }
  }, [examResult]);

  return (
    <div className="container-fluid mb-5">
      {cheatingRecords.length > 0 && (
        <div className="row mt-4 mb-2 mx-1">
          <div className="col-12">
            <div className="card shadow-sm border-danger" style={{ borderRadius: "1em" }}>
              <div className="card-header bg-danger text-white text-center" style={{ borderTopLeftRadius: "1em", borderTopRightRadius: "1em" }}>
                <h4 className="mb-0 fw-bold">Cheating Violation Detected</h4>
              </div>
              <div className="card-body bg-light">
                {cheatingRecords.map((record, index) => (
                  <div key={record.id} className="mb-3 p-3 rounded" style={{ backgroundColor: "#ffebeb", borderLeft: "4px solid #dc3545" }}>
                    <h5 className="text-danger fw-bold mb-2">Report #{index + 1}</h5>
                    <p className="mb-1"><strong>Reason:</strong> {record.violationReason}</p>
                    <p className="mb-1"><strong>Reported By:</strong> {record.teacher ? `${record.teacher.firstName} ${record.teacher.lastName}` : "System Auto-Detection"}</p>
                    <p className="mb-0 text-muted"><strong>Timestamp:</strong> {new Date(Number(record.timestamp)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div class="col-sm-6 mt-2">
          <StudentExamMarks examResult={examResult} />
        </div>

        <div class="col-sm-6 mt-2">
          {examResult?.exam?.examType === "Descriptive" ? (
            <DescriptiveResultReview exam={examResult.exam} />
          ) : (
            <ViewAllQuestions exam={examResult.exam} />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ExamResult;
