import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
import { showErrorToast } from "./registerValidation";

const url = config.url.BASE_URL;
const OTP_LENGTH = 6;

const RegistrationOtpModal = ({
  isOpen,
  registrationToken,
  initialOtpExpiresInSeconds,
  initialResendAvailableInSeconds,
  pendingUser,
  onClose,
  onVerified,
}) => {
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [otpExpiresInSeconds, setOtpExpiresInSeconds] = useState(
    initialOtpExpiresInSeconds || 0
  );
  const [resendAvailableInSeconds, setResendAvailableInSeconds] = useState(
    initialResendAvailableInSeconds || 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setOtpValues(Array(OTP_LENGTH).fill(""));
    setOtpExpiresInSeconds(initialOtpExpiresInSeconds || 0);
    setResendAvailableInSeconds(initialResendAvailableInSeconds || 0);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);

    return undefined;
  }, [isOpen, initialOtpExpiresInSeconds, initialResendAvailableInSeconds]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timer = setInterval(() => {
      setOtpExpiresInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setResendAvailableInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const otp = useMemo(() => otpValues.join(""), [otpValues]);

  if (!isOpen) {
    return null;
  }

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(seconds, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const clearOtp = () => {
    setOtpValues(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const updateOtpValue = (index, value) => {
    const sanitizedValue = value.replace(/\D/g, "");
    if (!sanitizedValue) {
      const updatedValues = [...otpValues];
      updatedValues[index] = "";
      setOtpValues(updatedValues);
      return;
    }

    const updatedValues = [...otpValues];
    sanitizedValue.split("").forEach((digit, digitIndex) => {
      const targetIndex = index + digitIndex;
      if (targetIndex < OTP_LENGTH) {
        updatedValues[targetIndex] = digit;
      }
    });

    setOtpValues(updatedValues);

    const nextIndex = Math.min(index + sanitizedValue.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedOtp) {
      return;
    }

    const updatedValues = Array(OTP_LENGTH)
      .fill("")
      .map((_, index) => pastedOtp[index] || "");
    setOtpValues(updatedValues);
    inputRefs.current[Math.min(pastedOtp.length - 1, OTP_LENGTH - 1)]?.focus();
  };

  const verifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      showErrorToast("Please enter the 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await fetch(url + "/user/register/verify-otp", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationToken,
          otp,
        }),
      });

      const res = await result.json();
      if (!res.success) {
        showErrorToast(res.responseMessage || "Invalid OTP, please try again.");
        setIsSubmitting(false);
        return;
      }

      toast.success(res.responseMessage || "Registration Successful", {
        position: "top-center",
        autoClose: 1400,
      });

      onVerified();
    } catch (error) {
      console.error(error);
      showErrorToast("It seems server is down.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (resendAvailableInSeconds > 0) {
      return;
    }

    setIsResending(true);

    try {
      const result = await fetch(url + "/user/register/resend-otp", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationToken }),
      });

      const res = await result.json();
      if (!res.success) {
        showErrorToast(res.responseMessage || "Unable to resend OTP.");
        if (typeof res.resendAvailableInSeconds === "number") {
          setResendAvailableInSeconds(res.resendAvailableInSeconds);
        }
        if (typeof res.otpExpiresInSeconds === "number") {
          setOtpExpiresInSeconds(res.otpExpiresInSeconds);
        }
        setIsResending(false);
        return;
      }

      setOtpExpiresInSeconds(res.otpExpiresInSeconds || 0);
      setResendAvailableInSeconds(res.resendAvailableInSeconds || 0);
      clearOtp();

      toast.success(res.responseMessage || "OTP resent successfully", {
        position: "top-center",
        autoClose: 1400,
      });
    } catch (error) {
      console.error(error);
      showErrorToast("It seems server is down.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        padding: "1rem",
      }}
    >
      <div
        className="card shadow-lg"
        style={{
          width: "100%",
          maxWidth: "34rem",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        <div className="card-header bg-color custom-bg-text d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Verify Email OTP</h5>
          <button type="button" className="btn btn-sm btn-light" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="card-body text-color">
          <p className="mb-2">
            Enter the 6-digit OTP sent to <b>{pendingUser?.emailId}</b>.
          </p>
          <p className="mb-4">
            OTP expires in <b>{formatTime(otpExpiresInSeconds)}</b>
          </p>

          <div className="d-flex justify-content-center gap-2 mb-4" onPaste={handlePaste}>
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(event) => updateOtpValue(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="form-control text-center"
                style={{
                  width: "2.9rem",
                  height: "3.2rem",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                }}
              />
            ))}
          </div>

          <div className="d-flex justify-content-center gap-2 mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={clearOtp}
              disabled={isSubmitting || isResending}
            >
              Clear OTP
            </button>
            <button
              type="button"
              className="btn bg-color custom-bg-text"
              onClick={verifyOtp}
              disabled={isSubmitting || otp.length !== OTP_LENGTH}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={resendOtp}
              disabled={isResending || resendAvailableInSeconds > 0}
            >
              {isResending
                ? "Resending..."
                : resendAvailableInSeconds > 0
                ? `Resend OTP in ${formatTime(resendAvailableInSeconds)}`
                : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationOtpModal;
