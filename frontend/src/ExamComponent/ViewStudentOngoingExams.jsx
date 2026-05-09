import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from '../ConsantsFile/Constants';
import { resolveExamAttemptRoute } from "./examRouting";
const url = config.url.BASE_URL;

const ViewStudentOngoingExams = () => {
  const [exams, setExams] = useState([]);
  const student_jwtToken = sessionStorage.getItem("student-jwtToken");
  const student = JSON.parse(sessionStorage.getItem("active-student"));

  let navigate = useNavigate();

  useEffect(() => {
    const getAllExams = async () => {
      const allExams = await retrieveAllExams(student.grade.id);
      if (allExams) {
        setExams(allExams.exams || []);
      }
    };

    getAllExams();
    const intervalId = setInterval(getAllExams, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const retrieveAllExams = async (gradeId) => {
    const response = await axios.get(
      url + "/exam/fetch/grade-wise/ongoing?gradeId=" +
        student.grade.id +
        "&role=Student&studentId=" +
        student.id
    );
    console.log(response.data);
    return response.data;
  };

  const attemptExam = (exam) => {
    navigate("/exam/student/system-check", {
      state: {
        exam,
        targetRoute: resolveExamAttemptRoute(exam),
      },
    });
  };

  const formatDateFromEpoch = (epochTime) => {
    const date = new Date(Number(epochTime));
    const formattedDate = date.toLocaleString(); // Adjust the format as needed

    return formattedDate;
  };

  // sending added exam object

  return (
    <div className="mt-3">
      <div
        className="card form-card ms-2 me-2 mb-5 shadow-lg"
        style={{
          height: "45rem",
        }}
      >
        <div
          className="card-header custom-bg-text text-center bg-color"
          style={{
            borderRadius: "1em",
            height: "50px",
          }}
        >
          <h2>Ongoing Exams</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">Exam</th>
                  <th scope="col">Course</th>
                  <th scope="col">Duration (mins)</th>
                  <th scope="col">Exam Type</th>
                  
                  {/* <th scope="col">Exam Scheduled</th> */}
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  return (
                    <tr>
                      <td>
                        <b>{exam.name}</b>
                      </td>
                      <td>
                        <b>{exam.course.name}</b>
                      </td>

                      <td>
                        <b>{exam.duration}</b>
                      </td>
                      
                      <td>
                        <b>{exam.examType === "Objective" ? "MCQ Exam" : exam.examType}</b>
                      </td>
                      <td>
                        {(() => {
                          if (exam.message === "Submitted") {
                            return (
                              <div>
                                <b className="text-success">Submitted</b>
                              </div>
                            );
                          } else {
                            return (
                              <div>
                                <button
                                  onClick={() => attemptExam(exam)}
                                  className="btn btn-sm bg-color custom-bg-text ms-2"
                                >
                                  Check System
                                </button>
                              </div>
                            );
                          }
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentOngoingExams;
