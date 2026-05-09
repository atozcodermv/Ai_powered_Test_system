import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "../ConsantsFile/Constants";
import { isBrowserSupportedForExam, resolveExamAttemptRoute } from "./examRouting";
import "./proctoring.css";

const url = config.url.BASE_URL;

const initialChecks = {
  browser: { status: "pending", message: "Checking browser compatibility..." },
  camera: { status: "pending", message: "Waiting for camera permission..." },
  microphone: { status: "pending", message: "Waiting for microphone permission..." },
  profileFace: { status: "pending", message: "Validating profile picture..." },
};

const SystemCheckingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const student = JSON.parse(sessionStorage.getItem("active-student"));
  const exam = location.state?.exam || location.state;
  const targetRoute = location.state?.targetRoute || resolveExamAttemptRoute(exam);
  const [checks, setChecks] = useState(initialChecks);
  const [isRunningChecks, setIsRunningChecks] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [previewStreamActive, setPreviewStreamActive] = useState(false);
  const previewVideoRef = useRef(null);
  const previewStreamRef = useRef(null);

  useEffect(() => {
    if (!exam || !student?.id) {
      navigate("/exam/student/grade-wise/ongoing");
    }
  }, [exam, navigate, student?.id]);

  useEffect(() => {
    let active = true;

    const updateCheck = (key, status, message) => {
      if (!active) {
        return;
      }
      setChecks((prev) => ({
        ...prev,
        [key]: { status, message },
      }));
    };

    const stopPreview = () => {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((track) => track.stop());
        previewStreamRef.current = null;
      }
      setPreviewStreamActive(false);
    };

    const runChecks = async () => {
      setIsRunningChecks(true);

      const browserStatus = isBrowserSupportedForExam();
      if (!browserStatus.supported) {
        updateCheck("browser", "error", "Only Google Chrome and Microsoft Edge are allowed.");
      } else {
        updateCheck("browser", "success", `${browserStatus.browserName} is supported.`);
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (!active) {
          cameraStream.getTracks().forEach((track) => track.stop());
          return;
        }

        previewStreamRef.current = cameraStream;
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = cameraStream;
        }
        setPreviewStreamActive(true);
        updateCheck("camera", "success", "Camera permission granted.");
      } catch (error) {
        console.error(error);
        updateCheck("camera", "error", "Camera access is required to start the exam.");
      }

      try {
        const microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        microphoneStream.getTracks().forEach((track) => track.stop());
        updateCheck("microphone", "success", "Microphone permission granted.");
      } catch (error) {
        console.error(error);
        updateCheck("microphone", "error", "Microphone access is required to start the exam.");
      }

      try {
        const response = await fetch(`${url}/proctoring/profile/validate?studentId=${student.id}`);
        const res = await response.json();
        if (!response.ok || !res.success || !res.profileFaceDetected) {
          updateCheck(
            "profileFace",
            "error",
            res.responseMessage || "A detectable face is required in the student's profile picture."
          );
        } else {
          updateCheck("profileFace", "success", "Profile image face verification passed.");
        }
      } catch (error) {
        console.error(error);
        updateCheck("profileFace", "error", "Unable to validate the profile picture right now.");
      }

      if (active) {
        setIsRunningChecks(false);
      }
    };

    runChecks();

    return () => {
      active = false;
      stopPreview();
    };
  }, [student?.id]);

  const failedChecks = useMemo(
    () => Object.values(checks).filter((check) => check.status === "error"),
    [checks]
  );
  const allChecksPassed = useMemo(
    () => Object.values(checks).every((check) => check.status === "success"),
    [checks]
  );

  const startExam = async () => {
    let publicId = "";
    if (previewVideoRef.current && previewVideoRef.current.videoWidth) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = previewVideoRef.current.videoWidth;
        canvas.height = previewVideoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(previewVideoRef.current, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.92)
        );
        
        if (blob) {
          const file = new File([blob], "live-capture.jpg", {
            type: "image/jpeg",
          });
          const formData = new FormData();
          formData.append("file", file);
          
          const uploadRes = await fetch(`${url}/user/upload-profile-picture`, {
            method: "POST",
            body: formData,
          });
          
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            publicId = uploadData.publicId;
          }
        }
      } catch (err) {
        console.error("Error capturing/uploading image:", err);
      }
    }

    const examSession = {
      ...exam,
      proctoringEnabled: true,
      attemptRoute: targetRoute,
      studentImage: publicId,
    };

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error(error);
    } finally {
      sessionStorage.setItem("active-exam-session", JSON.stringify(examSession));
      navigate(targetRoute, {
        state: examSession,
      });
    }
  };

  const renderStateClass = (status) => {
    if (status === "success") return "system-check-state success";
    if (status === "error") return "system-check-state error";
    return "system-check-state pending";
  };

  return (
    <div className="system-check-shell">
      <div className="container">
        <div className="system-check-card card">
          <div className="system-check-banner">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
              <div>
                <div className="text-uppercase fw-semibold opacity-75 mb-2">Exam Readiness</div>
                <h2 className="mb-2">System Checking Page</h2>
                <p className="mb-0 opacity-75">
                  We are validating your device, browser permissions, and profile face before the exam begins.
                </p>
              </div>
              <div className="text-lg-end">
                <div className="fw-bold">{exam?.name}</div>
                <div className="opacity-75">{exam?.course?.name}</div>
              </div>
            </div>
          </div>

          <div className="card-body p-4 p-lg-5">
            <div className="row g-4 align-items-start">
              <div className="col-lg-8">
                <div className="system-check-grid">
                  {Object.entries(checks).map(([key, value]) => (
                    <div className="system-check-item" key={key}>
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <h5 className="mb-2 text-capitalize">
                            {key === "profileFace" ? "Face Detection" : key}
                          </h5>
                          <p className="mb-0 text-muted">{value.message}</p>
                        </div>
                        <span className={renderStateClass(value.status)}>
                          {value.status === "success"
                            ? "Passed"
                            : value.status === "error"
                            ? "Failed"
                            : "Checking"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="system-check-item h-100">
                  <h5 className="mb-3">Camera preview</h5>
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="system-check-camera-preview"
                  />
                  <p className="text-muted mb-0 mt-3">
                    {previewStreamActive
                      ? "Camera access is active and ready for live monitoring."
                      : "The preview will appear here after camera permission is granted."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-top">
              {allChecksPassed ? (
                <div className="alert alert-success mb-3">All set, you can start exam</div>
              ) : failedChecks.length > 0 ? (
                <div className="alert alert-danger mb-3">
                  One or more checks failed. Please go back, fix the issue, and try again.
                </div>
              ) : isRunningChecks ? (
                <div className="alert alert-info mb-3">System checks are in progress...</div>
              ) : null}

              {failedChecks.length > 0 ? (
                <button
                  className="btn btn-danger"
                  onClick={() => navigate("/exam/student/grade-wise/ongoing")}
                >
                  Go back and try again
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  disabled={!allChecksPassed}
                  onClick={() => setShowConfirmation(true)}
                >
                  Ready to start exam
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmation ? (
        <div className="exam-confirm-overlay">
          <div className="exam-confirm-card">
            <h4 className="mb-3">Start Exam</h4>
            <p className="text-muted mb-3">
              Please review these instructions before beginning the exam.
            </p>
            <ol className="mb-4">
              <li>Make sure no other person comes in front of the camera, otherwise the exam will be auto submitted.</li>
              <li>Make sure the student giving the exam is the same as the profile picture, otherwise the exam will be auto submitted.</li>
            </ol>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={startExam}>
                Start Exam
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SystemCheckingPage;
