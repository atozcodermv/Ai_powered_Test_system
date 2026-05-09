import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from '../ConsantsFile/Constants';
import { ToastContainer, toast } from "react-toastify";
import PageStateMessage from "../CommonComponent/PageStateMessage";
import { getActiveTeacher, getTeacherGradeGuardMessage } from "../utils/teacherSession";
const url = config.url.BASE_URL;

const ViewGradeWiseStudentExamResults = () => {
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [pageError, setPageError] = useState("");
  const teacher = getActiveTeacher();

  let navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      const guardMessage = getTeacherGradeGuardMessage(teacher);
      if (guardMessage) {
        setPageError(guardMessage);
        return;
      }
      try {
        const response = await axios.get(url + "/grade/fetch/teacher?teacherId=" + teacher.id);
        if (response.data?.success) {
          const fetchedGrades = response.data.grades || [];
          setGrades(fetchedGrades);
          if (fetchedGrades.length > 0) {
            setSelectedGradeId(fetchedGrades[0].id);
          } else {
            setPageError("No grades assigned to this teacher.");
          }
        } else {
          setPageError(response.data?.responseMessage || "Failed to fetch grades.");
        }
      } catch (error) {
        console.error(error);
        setPageError("Unable to load grades right now.");
      }
    };
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getAllResults = async () => {
      if (!selectedGradeId) return;
      try {
        const response = await axios.get(
          url + "/exam/result/fetch/grade-wise?gradeId=" +
            selectedGradeId
        );
        const allResults = response.data;
        if (allResults?.success) {
          setResults(allResults.results || []);
        } else {
          setResults([]);
          if (allResults?.responseMessage !== "No Exam Result Found" && allResults?.responseMessage !== "No Students Found") {
            toast.error(allResults?.responseMessage || "Unable to fetch exam results.", {
              position: "top-center",
              autoClose: 2000,
            });
          }
        }
        setPageError("");
      } catch (error) {
        console.error(error);
        toast.error("Unable to load exam results right now. Please try again later.", {
          position: "top-center",
          autoClose: 2000,
        });
        setResults([]);
      }
    };

    getAllResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGradeId]);

  const viewExamResult = (result) => {
    navigate("/exam/student/result", { state: result });
  };

  const formatDateFromEpoch = (epochTime) => {
    const date = new Date(Number(epochTime));
    const formattedDate = date.toLocaleString(); // Adjust the format as needed

    return formattedDate;
  };

  // sending added exam object

  if (pageError) {
    return (
      <PageStateMessage
        title="Student Results Unavailable"
        message={pageError}
      />
    );
  }

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
          <h2>Student Exam Results</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          {grades.length > 0 && (
            <div className="mb-4 d-flex align-items-center justify-content-between p-3 bg-light rounded shadow-sm border">
               <h5 className="mb-0 text-color fw-bold">Filter By Grade</h5>
               <select
                 className="form-select border-color text-color fw-bold shadow-sm"
                 style={{ width: "250px", cursor: "pointer", appearance: "auto" }}
                 value={selectedGradeId}
                 onChange={(e) => setSelectedGradeId(e.target.value)}
               >
                 {grades.map((g) => (
                   <option key={g.id} value={g.id}>
                     {g.name}
                   </option>
                 ))}
               </select>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">S.No.</th>
                  <th scope="col">Exam</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Course</th>
                  <th scope="col">Timing</th>
                  <th scope="col">Student</th>
                  <th scope="col">Result</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <b className="text-secondary">No Exam Results Found for this Grade</b>
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => {
                    return (
                      <tr key={result.id}>
                        <td>
                          <b>{index + 1}</b>
                        </td>
                        <td>
                          <b>{result.exam.name}</b>
                        </td>
                        <td>
                          <b>{result.exam.grade.name}</b>
                        </td>
                        <td>
                          <b>{result.exam.course.name}</b>
                        </td>
                        <td>
                          <b>
                            {formatDateFromEpoch(result.exam.startTime) 
                            // +  "-" +  formatDateFromEpoch(result.exam.endTime)
                            }
                          </b>
                        </td>
                        <td>
                          <b>
                            {result.student.firstName +
                              " " +
                              result.student.lastName}
                          </b>
                        </td>
                        <td>
                          {(() => {
                            if (result.resultStatus === "Pass") {
                              return (
                                <div>
                                  <b className="text-success">
                                    {result.resultStatus}
                                  </b>
                                </div>
                              );
                            } else if (result.resultStatus === "Pending") {
                              return (
                                <div>
                                  <b className="text-warning">
                                    {result.resultStatus}
                                  </b>
                                </div>
                              );
                            } else {
                              return (
                                <div>
                                  <b className="text-danger">
                                    {result.resultStatus}
                                  </b>
                                </div>
                              );
                            }
                          })()}
                        </td>
                        <td>
                          <div>
                            <button
                              onClick={(e) => viewExamResult(result)}
                              className="btn btn-sm bg-color custom-bg-text ms-2"
                            >
                              View Result
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ViewGradeWiseStudentExamResults;
