import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getTeacherAssignedGrades } from "../utils/teacherSession";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { config } from "../ConsantsFile/Constants";

const url = config.url.BASE_URL;

const UserProfile = () => {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    if (location.state) return location.state;
    // Fallback to session storage if state is lost on refresh
    const student = JSON.parse(sessionStorage.getItem("active-student"));
    const teacher = JSON.parse(sessionStorage.getItem("active-teacher"));
    const admin = JSON.parse(sessionStorage.getItem("active-admin"));
    return student || teacher || admin;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(false);

  const teacherGrades = user?.role === "Teacher" ? getTeacherAssignedGrades(user) : [];
  const gradeLabel =
    user?.role === "Teacher"
      ? teacherGrades.length
        ? teacherGrades.map((grade) => grade.name).join(", ")
        : "-"
      : user?.grade
      ? user.grade.name
      : "-";

  useEffect(() => {
    let isActive = true;

    const loadOngoingExamState = async () => {
      if (user?.role !== "Student" || !user?.id || !user?.grade?.id) {
        if (isActive) {
          setIsProfileLocked(false);
        }
        return;
      }

      try {
        const response = await axios.get(
          url +
            "/exam/fetch/grade-wise/ongoing?gradeId=" +
            user.grade.id +
            "&role=Student&studentId=" +
            user.id
        );

        const ongoingExams = response?.data?.exams || [];
        if (isActive) {
          setIsProfileLocked(ongoingExams.length > 0);
        }
      } catch (error) {
        console.error(error);
        if (isActive) {
          setIsProfileLocked(false);
        }
      }
    };

    loadOngoingExamState();

    return () => {
      isActive = false;
    };
  }, [user?.grade?.id, user?.id, user?.role]);

  const uploadAndPersistProfileImage = async (file) => {
    if (!file) return false;
    if (user?.role === "Student" && isProfileLocked) {
      toast.error("Profile picture changes are disabled during ongoing exams.", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

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
        const publicId = response.data.publicId;
        
        // Update user record in database
        const updateResponse = await axios.put(url + "/user/update-profile-picture", {
          userId: user.id,
          publicId: publicId
        });

        if (updateResponse.data.success) {
          toast.success("Profile picture updated!");
          
          const updatedUser = { ...user, publicId: publicId };
          setUser(updatedUser);
          
          // Try to update session storage so it persists if the header is using it
          if (user.role === "Student") sessionStorage.setItem("active-student", JSON.stringify(updatedUser));
          if (user.role === "Teacher") sessionStorage.setItem("active-teacher", JSON.stringify(updatedUser));
          if (user.role === "Admin") sessionStorage.setItem("active-admin", JSON.stringify(updatedUser));
          return true;
        } else {
          toast.error("Failed to update profile: " + updateResponse.data.responseMessage);
          return false;
        }
      } else {
        toast.error("Upload failed: " + response.data.responseMessage);
        return false;
      }
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
    await uploadAndPersistProfileImage(file);
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex align-items-center justify-content-center">
        <div className="card rounded-card shadow-lg" style={{ width: "900px", borderRadius: "1em" }}>
          <div className="card-body p-5">
            <h3 className="card-title text-color-second text-center fw-bold mb-4">
              User Profile
            </h3>
            
            <div className="row align-items-center mb-5 pb-4 border-bottom">
              <div className="col-md-4 text-center">
                <div 
                  className="mx-auto" 
                  style={{
                    width: "180px",
                    height: "180px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "4px solid #3f51b5",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    position: "relative",
                    background: user?.publicId 
                      ? "#f5f5f5" 
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  }}
                >
                  {user?.publicId ? (
                    <img 
                      src={`https://res.cloudinary.com/dh4hw20gp/image/upload/w_400,h_400,c_fill,q_auto/${user.publicId}`} 
                      alt="Profile" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <div className="text-white text-center">
                      <i className="fa fa-user" style={{ fontSize: "60px", opacity: "0.8" }}></i>
                      <div style={{ fontSize: "12px", fontWeight: "600", marginTop: "5px", textTransform: "uppercase" }}>No Avatar</div>
                    </div>
                  )}
                  {isUploading && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                    </div>
                  )}
                </div>
                <label className="btn btn-sm text-color mt-3 px-4 py-2" style={{ backgroundColor: "#e0eaff", fontWeight: "600", borderRadius: "20px", cursor: (isUploading || isProfileLocked) ? "not-allowed" : "pointer", opacity: (isUploading || isProfileLocked) ? 0.8 : 1 }}>
                  {isUploading ? "Uploading..." : user?.publicId ? "Change Picture" : "Upload Profile Picture"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileImageUpload} disabled={isUploading || isProfileLocked} />
                </label>
                {user?.role === "Student" && isProfileLocked && (
                  <div
                    className="mt-3 px-3 py-2 rounded-3 text-start"
                    style={{
                      background: "linear-gradient(135deg, #fff6d8 0%, #ffe69c 100%)",
                      border: "1px solid #f0c36d",
                      color: "#6b4f00",
                      fontWeight: 600,
                      maxWidth: "320px",
                      margin: "0 auto",
                    }}
                  >
                    Profile photo changes are temporarily disabled while your exam session is active.
                  </div>
                )}
              </div>
              <div className="col-md-8">
                <h2 className="fw-bold mb-1">{user?.firstName} {user?.lastName}</h2>
                <p className="text-muted fs-5 mb-3">{user?.role}</p>
                <div className="d-flex flex-wrap gap-4">
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Email</span>
                    <span className="fw-medium">{user?.emailId}</span>
                  </div>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Contact</span>
                    <span className="fw-medium">{user?.phoneNo}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row px-3">
              <div className="col-md-6 mb-4">
                <div className="p-4 rounded" style={{ backgroundColor: "#f8f9fa", height: "100%" }}>
                  <h5 className="fw-bold text-color-second mb-3">Location Details</h5>
                  <p className="mb-2"><b>Street:</b> {user?.address?.street || "-"}</p>
                  <p className="mb-2"><b>City:</b> {user?.address?.city || "-"}</p>
                  <p className="mb-0"><b>Pincode:</b> {user?.address?.pincode || "-"}</p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="p-4 rounded" style={{ backgroundColor: "#f8f9fa", height: "100%" }}>
                  <h5 className="fw-bold text-color-second mb-3">Academic Details</h5>
                  <p className="mb-2"><b>Role:</b> {user?.role}</p>
                  <p className="mb-0"><b>{user?.role === "Teacher" ? "Grades Assigned" : "Enrolled Grade"}:</b> {gradeLabel}</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserProfile;
