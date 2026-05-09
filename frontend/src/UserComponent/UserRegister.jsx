import { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { config } from '../ConsantsFile/Constants';
import {
  getActiveTeacher,
  getTeacherAssignedGrades,
  getTeacherGradeGuardMessage,
} from "../utils/teacherSession";
import {
  allowedDomainsMessage,
  getRegistrationFieldErrorsFromMessage,
  showErrorToast,
  showValidationToast,
  validateUserRegistration,
} from "./registerValidation";
import RegistrationOtpModal from "./RegistrationOtpModal";
const url = config.url.BASE_URL;

const UserRegister = () => {
  const navigate = useNavigate();
  const teacher = getActiveTeacher();
  const currentUrl = document.URL;
  const isStudentRoute = currentUrl.indexOf("student") !== -1;
  const assignedGrades = useMemo(
    () => getTeacherAssignedGrades(teacher),
    [teacher]
  );
  const gradeGuardMessage = useMemo(
    () => (isStudentRoute ? getTeacherGradeGuardMessage(teacher) : ""),
    [isStudentRoute, teacher]
  );

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    phoneNo: "",
    street: "",
    city: "",
    pincode: "",
    role: "",
    gradeId: "",
    teacherId: "",
    publicId: "",
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const profileVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const stopCameraStream = () => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (profileVideoRef.current) {
      profileVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    if (isCameraOpen && profileVideoRef.current && cameraStreamRef.current) {
      profileVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraOpen]);

  const uploadProfileImageFile = async (file) => {
    if (!file) return false;

    // Validation: File Type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, or WEBP.", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    // Validation: File Size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 2MB limit.", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await axios.post(url + "/user/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        toast.success("Profile picture uploaded!");
        setUser((prev) => ({ ...prev, publicId: response.data.publicId }));
        return true;
      }

      toast.error("Upload failed: " + response.data.responseMessage);
      return false;
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image to server.");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    await uploadProfileImageFile(file);
  };

  const startLiveCapture = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera access is not supported in this browser.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setCameraError("");

    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (profileVideoRef.current) {
        profileVideoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error(error);
      setCameraError("Camera access was denied or is unavailable.");
      toast.error("Unable to access the camera.");
    }
  };

  const closeLiveCapture = () => {
    setIsCameraOpen(false);
    setCameraError("");
    stopCameraStream();
  };

  const captureLiveImage = async () => {
    const video = profileVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Unable to capture image.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );

    if (!blob) {
      toast.error("Unable to capture image.");
      return;
    }

    const file = new File([blob], "live-capture.jpg", {
      type: "image/jpeg",
    });

    const uploaded = await uploadProfileImageFile(file);
    if (uploaded) {
      closeLiveCapture();
    }
  };
  const [otpSession, setOtpSession] = useState({
    isOpen: false,
    registrationToken: "",
    otpExpiresInSeconds: 0,
    resendAvailableInSeconds: 0,
  });

  useEffect(() => {
    setUser((prevUser) => {
      if (isStudentRoute) {
        return {
          ...prevUser,
          role: "Student",
          teacherId: teacher?.id ?? "",
        };
      }

      if (currentUrl.indexOf("teacher") !== -1) {
        return {
          ...prevUser,
          role: "Teacher",
        };
      }

      return prevUser;
    });
  }, [currentUrl, isStudentRoute, teacher?.id]);

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "emailId") {
      nextValue = value.trimStart().toLowerCase();
    }

    if (name === "phoneNo") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setUser({ ...user, [name]: nextValue });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const saveUser = (e) => {
    e.preventDefault();

    const validationErrors = validateUserRegistration(user, {
      requireGrade: isStudentRoute,
      requireAssignedTeacher: false,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showValidationToast(validationErrors);
      return;
    }

    setIsSubmitting(true);
    fetch(url + "/user/register/request-otp", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
        .then((result) => {
          result.json().then((res) => {
            if (res.success) {
              toast.success(res.responseMessage, {
                position: "top-center",
                autoClose: 1400,
              });
              setOtpSession({
                isOpen: true,
                registrationToken: res.registrationToken,
                otpExpiresInSeconds: res.otpExpiresInSeconds || 0,
                resendAvailableInSeconds: res.resendAvailableInSeconds || 0,
              });
            } else {
              const serverErrors = getRegistrationFieldErrorsFromMessage(
                res.responseMessage
              );
              if (Object.keys(serverErrors).length > 0) {
                setErrors((prev) => ({ ...prev, ...serverErrors }));
              }
              showErrorToast(res.responseMessage || "It seems server is down.");
            }
          });
        })
        .catch((error) => {
          console.error(error);
          showErrorToast("It seems server is down.");
        })
        .finally(() => setIsSubmitting(false));
  };

  return (
      <div>
        <div className="mt-2 d-flex aligns-items-center justify-content-center ms-2 me-2 mb-2">
          <div
              className="form-card border-color text-color"
              style={{ width: "50rem" }}
          >
            <div className="container-fluid">
              <div
                  className="card-header bg-color custom-bg-text mt-2 d-flex justify-content-center align-items-center"
                  style={{
                    borderRadius: "1em",
                    height: "45px",
                  }}
              >
                <h5 className="card-title">Register Here!!!</h5>
              </div>
              <div className="card-body mt-3">
                <form className="row g-3" onSubmit={saveUser} noValidate>
                  <div className="col-12 d-flex justify-content-center mb-4">
                    <div className="text-center">
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          backgroundColor: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          overflow: "hidden",
                          border: "3px solid #3f51b5",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                        }}
                      >
                        {user.publicId ? (
                           <img src={`https://res.cloudinary.com/dh4hw20gp/image/upload/${user.publicId}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                           <span style={{ color: "#aaa", fontSize: "14px", fontWeight: "bold" }}>Avatar</span>
                        )}
                      </div>
                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                      <label className="btn btn-sm text-color px-4 py-2" style={{ backgroundColor: "#e0eaff", fontWeight: "600", borderRadius: "20px", cursor: isUploading ? "not-allowed" : "pointer" }}>
                        {isUploading ? "Uploading..." : "Upload Picture"}
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileImageUpload} disabled={isUploading} />
                      </label>
                      {isStudentRoute && (
                        <button
                          type="button"
                          className="btn btn-sm px-4 py-2"
                          onClick={startLiveCapture}
                          disabled={isUploading || isCameraOpen}
                          style={{
                            backgroundColor: "#2c7be5",
                            color: "#fff",
                            fontWeight: "600",
                            borderRadius: "20px",
                            boxShadow: "0 3px 10px rgba(44,123,229,0.25)",
                          }}
                        >
                          Capture Live
                        </button>
                      )}
                    </div>
                    {isStudentRoute && (
                      <div
                        className="mt-3 px-3 py-2 text-start"
                        style={{
                          maxWidth: "420px",
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, #fff6d8 0%, #ffe69c 100%)",
                          border: "1px solid #f0c36d",
                          color: "#6b4f00",
                          fontWeight: 600,
                          boxShadow: "0 4px 10px rgba(240,195,109,0.25)",
                        }}
                      >
                        Important: Ensure your face is clearly visible, as this image will be used for exam verification.
                      </div>
                    )}
                    {isStudentRoute && isCameraOpen && (
                      <div
                        className="mt-3 p-3 rounded-4 border"
                        style={{
                          backgroundColor: "#f8fbff",
                          borderColor: "#b7d3ff",
                          maxWidth: "420px",
                          margin: "0 auto",
                        }}
                      >
                        <video
                          ref={profileVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-100 rounded-4"
                          style={{
                            maxHeight: "260px",
                            objectFit: "cover",
                            backgroundColor: "#000",
                          }}
                        />
                        {cameraError && (
                          <div className="text-danger mt-2 small fw-semibold">
                            {cameraError}
                          </div>
                        )}
                        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                          <button
                            type="button"
                            className="btn btn-success btn-sm px-4"
                            onClick={captureLiveImage}
                            disabled={isUploading}
                          >
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-4"
                            onClick={closeLiveCapture}
                          >
                            Close Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>

                  <div className="col-md-6 mb-3 text-color">
                    <label htmlFor="title" className="form-label">
                      <b>First Name</b>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.firstName ? "validation-input" : ""}`}
                        id="firstName"
                        name="firstName"
                        onChange={handleUserInput}
                        value={user.firstName}
                    />
                    {errors.firstName && (
                      <div className="validation-feedback">{errors.firstName}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3 text-color">
                    <label htmlFor="title" className="form-label">
                      <b>Last Name</b>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.lastName ? "validation-input" : ""}`}
                        id="lastName"
                        name="lastName"
                        onChange={handleUserInput}
                        value={user.lastName}
                    />
                    {errors.lastName && (
                      <div className="validation-feedback">{errors.lastName}</div>
                    )}
                  </div>

                  {isStudentRoute && (
                    <div className="col-md-6 mb-3 text-color">
                      <label htmlFor="gradeId" className="form-label">
                        <b>Select Grade</b>
                      </label>
                      <select
                        className={`form-control ${errors.gradeId ? "validation-input" : ""}`}
                        id="gradeId"
                        name="gradeId"
                        onChange={handleUserInput}
                        value={user.gradeId}
                        disabled={assignedGrades.length === 0}
                      >
                        <option value="">Select Grade</option>
                        {assignedGrades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                      {gradeGuardMessage && (
                        <div className="form-text text-danger">
                          {gradeGuardMessage}
                        </div>
                      )}
                      {errors.gradeId && (
                        <div className="validation-feedback">{errors.gradeId}</div>
                      )}
                    </div>
                  )}

                  <div className="col-md-6 mb-3 text-color">
                    <b>
                      <label className="form-label">Email Id</label>
                    </b>
                    <input
                        type="email"
                        className={`form-control ${errors.emailId ? "validation-input" : ""}`}
                        id="emailId"
                        name="emailId"
                        onChange={handleUserInput}
                        value={user.emailId}
                        maxLength={254}
                    />
                    <div className="form-text">
                      Allowed domains: {allowedDomainsMessage.replace("Email Id must use one of these domains: ", "")}
                    </div>
                    {errors.emailId && (
                      <div className="validation-feedback">{errors.emailId}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="quantity" className="form-label">
                      <b>Password</b>
                    </label>
                    <input
                        type="password"
                        className={`form-control ${errors.password ? "validation-input" : ""}`}
                        id="password"
                        name="password"
                        onChange={handleUserInput}
                        value={user.password}
                    />
                    {errors.password && (
                      <div className="validation-feedback">{errors.password}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="contact" className="form-label">
                      <b>Contact No</b>
                    </label>
                    <input
                        type="tel"
                        className={`form-control ${errors.phoneNo ? "validation-input" : ""}`}
                        id="phoneNo"
                        name="phoneNo"
                        onChange={handleUserInput}
                        value={user.phoneNo}
                        maxLength={10}
                    />
                    {errors.phoneNo && (
                      <div className="validation-feedback">{errors.phoneNo}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="description" className="form-label">
                      <b> Street</b>
                    </label>
                    <textarea
                        className={`form-control ${errors.street ? "validation-input" : ""}`}
                        id="street"
                        name="street"
                        rows="3"
                        onChange={handleUserInput}
                        value={user.street}
                    />
                    {errors.street && (
                      <div className="validation-feedback">{errors.street}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="price" className="form-label">
                      <b>City</b>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.city ? "validation-input" : ""}`}
                        id="city"
                        name="city"
                        onChange={handleUserInput}
                        value={user.city}
                    />
                    {errors.city && (
                      <div className="validation-feedback">{errors.city}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="pincode" className="form-label">
                      <b>Pincode</b>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.pincode ? "validation-input" : ""}`}
                        id="pincode"
                        name="pincode"
                        onChange={handleUserInput}
                        value={user.pincode}
                    />
                    {errors.pincode && (
                      <div className="validation-feedback">{errors.pincode}</div>
                    )}
                  </div>

                  <div className="d-flex aligns-items-center justify-content-center">
                    <input
                        type="submit"
                        className="btn bg-color custom-bg-text"
                        value={isSubmitting ? "Registering..." : "Register User"}
                        disabled={isSubmitting || isUploading}
                    />
                  </div>
                  <ToastContainer />
                </form>
              </div>
            </div>
          </div>
        </div>
        <RegistrationOtpModal
          isOpen={otpSession.isOpen}
          registrationToken={otpSession.registrationToken}
          initialOtpExpiresInSeconds={otpSession.otpExpiresInSeconds}
          initialResendAvailableInSeconds={otpSession.resendAvailableInSeconds}
          pendingUser={user}
          onClose={() =>
            setOtpSession({
              isOpen: false,
              registrationToken: "",
              otpExpiresInSeconds: 0,
              resendAvailableInSeconds: 0,
            })
          }
          onVerified={() => {
            setOtpSession({
              isOpen: false,
              registrationToken: "",
              otpExpiresInSeconds: 0,
              resendAvailableInSeconds: 0,
            });
            setTimeout(() => {
              navigate("/aboutus");
            }, 1400);
          }}
        />
      </div>
  );
};

export default UserRegister;
