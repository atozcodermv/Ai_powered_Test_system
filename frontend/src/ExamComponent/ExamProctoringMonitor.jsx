import { useEffect, useRef, useState } from "react";
import { config } from "../ConsantsFile/Constants";
import "./proctoring.css";

const url = config.url.BASE_URL;

const ExamProctoringMonitor = ({ studentId, onViolation, disabled = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const violationRef = useRef(false);
  const onViolationRef = useRef(onViolation);
  const [statusText, setStatusText] = useState("Connecting camera...");

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    violationRef.current = false;
  }, [studentId]);

  useEffect(() => {
    if (!studentId || disabled) {
      return undefined;
    }

    let isMounted = true;

    const startMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatusText("Monitoring every 60 seconds");

        intervalRef.current = setInterval(async () => {
          if (violationRef.current) {
            return;
          }

          const capturedImageBase64 = captureFrame();
          if (!capturedImageBase64) {
            setStatusText("Waiting for camera frame...");
            return;
          }

          try {
            const response = await fetch(`${url}/proctoring/monitor/verify`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                studentId,
                capturedImageBase64,
              }),
            });

            const res = await response.json();
            if (!response.ok || !res.success) {
              setStatusText(res.responseMessage || "Monitoring unavailable");
              return;
            }

            if (res.multipleFacesDetected) {
              violationRef.current = true;
              onViolationRef.current?.("Multiple faces detected");
              return;
            }

            if (!res.faceMatched) {
              violationRef.current = true;
              onViolationRef.current?.("FACE VERIFICATION");
              return;
            }

            const similarityLabel =
              typeof res.similarity === "number"
                ? `Verified ${res.similarity.toFixed(1)}%`
                : "Face verified";
            setStatusText(similarityLabel);
          } catch (error) {
            console.error(error);
            setStatusText("Monitoring check failed, retrying...");
          }
        }, 60000);
      } catch (error) {
        console.error(error);
        setStatusText("Camera unavailable during exam");
      }
    };

    startMonitoring();

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [disabled, studentId]);

  const captureFrame = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (!videoElement || !canvasElement || !videoElement.videoWidth || !videoElement.videoHeight) {
      return null;
    }

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const context = canvasElement.getContext("2d");
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    return canvasElement.toDataURL("image/jpeg", 0.9);
  };

  return (
    <div className="exam-floating-monitor">
      <div className="exam-floating-monitor-bar">
        <div>
          <div className="fw-bold">Live monitoring</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>{statusText}</div>
        </div>
        <span className="exam-floating-monitor-pill">Live</span>
      </div>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default ExamProctoringMonitor;
