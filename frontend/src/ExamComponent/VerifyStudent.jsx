import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import { getActiveTeacher } from "../utils/teacherSession";
import PageStateMessage from "../CommonComponent/PageStateMessage";

const url = config.url.BASE_URL;

const VerifyStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;
  const teacher = getActiveTeacher();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!result || !result.exam || !result.student) {
    return <PageStateMessage title="Invalid Data" message="No exam result data found. Please navigate from the verification list." />;
  }

  const markCheated = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a violation reason.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(url + "/proctoring/cheating/mark", {
        examId: result.exam.id,
        studentId: result.student.id,
        teacherId: teacher.id,
        violationReason: reason,
      });

      if (response.data?.success) {
        toast.success("Student marked as cheated successfully!");
        setTimeout(() => {
          navigate("/exam/grade/teacher/verify");
        }, 1500);
      } else {
        toast.error(response.data?.responseMessage || "Failed to mark as cheated");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while marking the student.");
    } finally {
      setSubmitting(false);
    }
  };

  const imageSrc = result.studentImage 
      ? `https://res.cloudinary.com/dh4hw20gp/image/upload/${result.studentImage}`
      : "";

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-lg mx-auto" style={{ maxWidth: "800px", borderRadius: "1em" }}>
        <div className="card-header custom-bg-text text-center bg-color py-3" style={{ borderTopLeftRadius: "1em", borderTopRightRadius: "1em" }}>
          <h3 className="mb-0">Verify Student Identity</h3>
        </div>
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
              <h5 className="text-color fw-bold mb-3">Captured Image</h5>
              <div 
                className="rounded shadow-sm overflow-hidden d-flex align-items-center justify-content-center border"
                style={{ width: "100%", height: "250px", backgroundColor: "#f8f9fa" }}
              >
                {imageSrc ? (
                  <img 
                    src={imageSrc} 
                    alt="Captured during exam" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : (
                  <span className="text-muted fw-bold">No Image Captured</span>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <h5 className="text-color fw-bold mb-3">Exam Details</h5>
              <div className="bg-light p-3 rounded border shadow-sm h-100">
                <p className="mb-2"><strong>Student Name:</strong> {result.student.firstName} {result.student.lastName}</p>
                <p className="mb-2"><strong>Email ID:</strong> {result.student.emailId}</p>
                <p className="mb-2"><strong>Exam:</strong> {result.exam.name}</p>
                <p className="mb-2"><strong>Course:</strong> {result.exam.course.name}</p>
                <p className="mb-2"><strong>Grade:</strong> {result.exam.grade.name}</p>
                <p className="mb-0"><strong>Timing:</strong> {new Date(Number(result.exam.startTime)).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="mb-4">
            <label className="form-label text-color fw-bold">Violation Reason <span className="text-danger">*</span></label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="E.g., Face mismatch, multiple people, no face detected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary px-4 fw-bold shadow-sm"
              disabled={submitting}
            >
              Back
            </button>
            <button
              onClick={markCheated}
              className="btn btn-danger px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              {submitting ? "Marking..." : "Mark Cheated"}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyStudent;
