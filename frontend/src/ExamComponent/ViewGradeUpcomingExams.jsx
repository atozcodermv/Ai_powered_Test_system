import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import PageStateMessage from "../CommonComponent/PageStateMessage";
import {
  getActiveTeacher,
  getTeacherAssignedGrades,
  getTeacherGradeGuardMessage,
  getTeacherPrimaryGrade,
} from "../utils/teacherSession";

const url = config.url.BASE_URL;

const ViewGradeUpcomingExams = () => {
  const [exams, setExams] = useState([]);
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const teacher = getActiveTeacher();
  const teacherId = teacher?.id;
  const assignedGrades = getTeacherAssignedGrades(teacher);
  const primaryGrade = getTeacherPrimaryGrade(teacher);
  const guardMessage = getTeacherGradeGuardMessage(teacher);
  const [selectedGradeId, setSelectedGradeId] = useState(primaryGrade?.id || "");

  const navigate = useNavigate();

  const selectedGrade = useMemo(
    () => assignedGrades.find((grade) => String(grade.id) === String(selectedGradeId)) || null,
    [assignedGrades, selectedGradeId]
  );

  useEffect(() => {
    if (!selectedGradeId && primaryGrade?.id) {
      setSelectedGradeId(primaryGrade.id);
    }
  }, [primaryGrade?.id, selectedGradeId]);

  useEffect(() => {
    const getAllExams = async () => {
      if (guardMessage) {
        setPageError(guardMessage);
        return;
      }

      if (!selectedGradeId) {
        setExams([]);
        setPageError("");
        return;
      }

      setIsLoading(true);

      try {
        const response = await axios.get(
          `${url}/exam/fetch/upcoming/grade-wise?gradeId=${selectedGradeId}&role=`
        );
        const allExams = response.data;
        if (allExams?.success) {
          setExams(allExams.exams || []);
          setPageError("");
          return;
        }

        if (allExams?.responseMessage === "No Exams found") {
          setExams([]);
          setPageError("");
          return;
        }

        setPageError(allExams?.responseMessage || "Unable to fetch upcoming exams.");
      } catch (error) {
        console.error(error);
        setPageError("Unable to load upcoming exams right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    getAllExams();
    const intervalId = setInterval(getAllExams, 30000);

    return () => clearInterval(intervalId);
  }, [guardMessage, selectedGradeId, teacherId]);

  const deleteExam = (examId) => {
    fetch(url + "/exam/delete?examId=" + examId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((result) => {
        result.json().then((res) => {
          if (res.success) {
            toast.success(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            setTimeout(() => {
              window.location.href = "/home";
            }, 1000);
          } else if (!res.success) {
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              window.location.href = "/home";
            }, 1000);
          }
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
      });
  };

  const viewQuestions = (exam) => {
    const nextRoute =
      exam.examType === "Descriptive"
        ? "/exam/descriptivequestion"
        : "/exam/questions";
    navigate(nextRoute, { state: exam });
  };

  const formatDateFromEpoch = (epochTime) => {
    const date = new Date(Number(epochTime));
    return date.toLocaleString();
  };

  if (pageError) {
    return (
      <PageStateMessage
        title="Upcoming Exams Unavailable"
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
          <h2>Upcoming Exams</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              <b className="text-color">Filter by grade</b>
            </div>
            <div style={{ minWidth: "260px" }}>
              <select
                className="form-control"
                value={selectedGradeId}
                onChange={(event) => setSelectedGradeId(event.target.value)}
              >
                {assignedGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted py-4">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="text-center text-muted py-4">
              No upcoming exams found for {selectedGrade?.name || "the selected grade"}.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover text-color text-center">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                    <th scope="col">S.No.</th>
                    <th scope="col">Exam</th>
                    <th scope="col">Grade</th>
                    <th scope="col">Course</th>
                    <th scope="col">Exam Scheduled</th>
                    <th scope="col">Added Time</th>
                    <th scope="col">Added By</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, index) => {
                    return (
                      <tr key={exam.id}>
                        <td>
                          <b>{index + 1}</b>
                        </td>
                        <td>
                          <b>{exam.name}</b>
                        </td>
                        <td>
                          <b>{exam.grade?.name}</b>
                        </td>
                        <td>
                          <b>{exam.course.name}</b>
                        </td>
                        <td>
                          <b>
                            {formatDateFromEpoch(exam.startTime) +
                              "-" +
                              formatDateFromEpoch(exam.endTime)}
                          </b>
                        </td>
                        <td>
                          <b>{formatDateFromEpoch(exam.addedDateTime)}</b>
                        </td>
                        <td>
                          <b>{exam.teacher.firstName}</b>
                        </td>
                        <td>
                          <button
                            onClick={() => deleteExam(exam.id)}
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => viewQuestions(exam)}
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                          >
                            View Questions
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGradeUpcomingExams;


