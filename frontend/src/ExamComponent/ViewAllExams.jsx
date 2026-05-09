import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from '../ConsantsFile/Constants';
const url = config.url.BASE_URL;

const ViewAllExams = () => {
  const [exams, setExams] = useState([]);
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  const admin = JSON.parse(sessionStorage.getItem("active-admin"));

  let navigate = useNavigate();

  useEffect(() => {
    const getAllExams = async () => {
      const allExams = await retrieveAllExams();
      if (allExams) {
        setExams(allExams.exams);
      }
    };

    getAllExams();
  }, []);

  const retrieveAllExams = async (gradeId) => {
    const response = await axios.get(
      url + "/exam/fetch/all"
    );
    console.log(response.data);
    return response.data;
  };

  const viewQuestions = (exam) => {
    navigate("/exam/questions", { state: exam });
  };

  const formatDateFromEpoch = (epochTime) => {
    const date = new Date(Number(epochTime));
    const formattedDate = date.toLocaleString(); // Adjust the format as needed

    return formattedDate;
  };

  const exportToExcel = async (examId, examName) => {
    try {
      const response = await axios.get(url + "/exam/result/fetch/all");
      const allResults = response.data.results;
      if (allResults) {
        const examResults = allResults.filter(r => r.exam && r.exam.id === examId);
        if (examResults.length === 0) {
          toast.info("No students have taken this exam yet.");
          return;
        }
        
        let csvContent = "Student Name,Marks in Exam,Percentage Score,Is Cheated\n";
        examResults.forEach(r => {
          const studentName = r.student ? (r.student.firstName + " " + (r.student.lastName || "")).trim() : "Unknown";
          const marks = r.score;
          const percentage = r.totalMarks ? ((r.score / r.totalMarks) * 100).toFixed(2) + "%" : "0.00%";
          const isCheated = r.cheated ? "Yes" : "No";
          
          csvContent += `"${studentName}","${marks}","${percentage}","${isCheated}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const urlObject = URL.createObjectURL(blob);
        link.setAttribute("href", urlObject);
        link.setAttribute("download", `Exam_Results_${examName.replace(/ /g, "_")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Results exported successfully!");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export results. Please try again.");
    }
  };

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
          <h2>All Exams</h2>
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
                  <th scope="col">S.No.</th>
                  <th scope="col">Exam</th>
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
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            onClick={() => viewQuestions(exam)}
                            className="btn btn-sm bg-color custom-bg-text"
                          >
                            View Questions
                          </button>
                          <button
                            onClick={() => exportToExcel(exam.id, exam.name)}
                            className="btn btn-sm btn-success"
                          >
                            Export Results
                          </button>
                        </div>
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

export default ViewAllExams;
