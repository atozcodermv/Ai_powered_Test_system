import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from '../ConsantsFile/Constants';
import { ToastContainer, toast } from "react-toastify";
import PageStateMessage from "../CommonComponent/PageStateMessage";
import { getActiveTeacher, getTeacherGradeGuardMessage } from "../utils/teacherSession";
const url = config.url.BASE_URL;

const ExamListVerification = () => {
  const [allResults, setAllResults] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [pageError, setPageError] = useState("");
  const teacher = getActiveTeacher();

  let navigate = useNavigate();

  useEffect(() => {
    const fetchGradesAndResults = async () => {
      const guardMessage = getTeacherGradeGuardMessage(teacher);
      if (guardMessage) {
        setPageError(guardMessage);
        return;
      }
      try {
        // Fetch grades
        const gradeRes = await axios.get(url + "/grade/fetch/teacher?teacherId=" + teacher.id);
        let fetchedGrades = [];
        if (gradeRes.data?.success) {
          fetchedGrades = gradeRes.data.grades || [];
          setGrades(fetchedGrades);
          if (fetchedGrades.length > 0) {
            setSelectedGradeId(fetchedGrades[0].id);
          } else {
            setPageError("No grades assigned to this teacher.");
            return;
          }
        } else {
          setPageError(gradeRes.data?.responseMessage || "Failed to fetch grades.");
          return;
        }

        // Fetch unverified results
        const resultRes = await axios.get(url + "/proctoring/verify/list?teacherId=" + teacher.id);
        if (resultRes.data?.success) {
          setAllResults(resultRes.data.results || []);
        } else {
          toast.error(resultRes.data?.responseMessage || "Unable to fetch exam results.");
        }
      } catch (error) {
        console.error(error);
        setPageError("Unable to load verification data right now.");
      }
    };
    
    fetchGradesAndResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedGradeId) return;
    const filtered = allResults.filter(
      (r) => r.exam && r.exam.grade && String(r.exam.grade.id) === String(selectedGradeId)
    );
    setResults(filtered);
  }, [selectedGradeId, allResults]);

  const verifyStudent = (result) => {
    navigate("/exam/grade/student/teacher/result/verify", { state: result });
  };

  const formatDateFromEpoch = (epochTime) => {
    const date = new Date(Number(epochTime));
    return date.toLocaleString();
  };

  if (pageError) {
    return (
      <PageStateMessage
        title="Student Verification Unavailable"
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
          <h2>Verify Student Identity</h2>
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
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <b className="text-secondary">No unverified students found for this grade</b>
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
                          <b>{formatDateFromEpoch(result.exam.startTime)}</b>
                        </td>
                        <td>
                          <b>
                            {result.student.firstName +
                              " " +
                              result.student.lastName}
                          </b>
                        </td>
                        <td>
                          <div>
                            <button
                              onClick={(e) => verifyStudent(result)}
                              className="btn btn-sm bg-color custom-bg-text ms-2"
                            >
                              Verify Student
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

export default ExamListVerification;
