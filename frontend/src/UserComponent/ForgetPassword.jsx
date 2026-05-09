import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "../ConsantsFile/Constants";

const url = config.url.BASE_URL;

const ForgetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const [passwordForm, setPasswordForm] = useState({
    email: email || "",
    otp: otp || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

  // We removed the auto-redirect here to allow users coming from the email link to enter their details.

  const handleInput = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!passwordForm.email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    setIsGeneratingOtp(true);
    try {
      const response = await fetch(`${url}/user/forgot-password/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: passwordForm.email }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.responseMessage || "OTP sent successfully.");
      } else {
        toast.error(data.responseMessage || "Failed to generate OTP.");
      }
    } catch (err) {
      toast.error("Server is down or unreachable.");
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const validatePassword = (password) => {
    // Length 8-64
    if (password.length < 8 || password.length > 64) return "Password must be betwen 8 and 64 characters.";
    
    // Uppercase
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter (A-Z).";
    
    // Lowercase
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter (a-z).";
    
    // Numeric digit
    if (!/[0-9]/.test(password)) return "Password must contain at least one numeric digit (0-9).";
    
    // Special character
    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]/.test(password)) return "Password must contain at least one special character.";
    
    // Common weak passwords
    const weakPasswords = ["password", "123456", "12345678", "admin", "admin123", "password123"];
    if (weakPasswords.includes(password.toLowerCase())) return "This password is too common or weak.";
    
    // Username/email
    if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
        return "Password must not contain your email username.";
    }

    // Leading/trailing spaces
    if (password.trim() !== password) return "Password must not contain leading or trailing spaces.";

    return null; 
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.email || !passwordForm.otp || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Confirm password does not match new password.");
      return;
    }

    const validationError = validatePassword(passwordForm.newPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${url}/user/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           email: passwordForm.email, 
           otp: passwordForm.otp, 
           newPassword: passwordForm.newPassword 
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Your password has been updated.");
        setTimeout(() => {
          navigate("/user/login");
        }, 2000);
      } else {
        toast.error(data.responseMessage || "Failed to reset password.");
      }
    } catch (err) {
      toast.error("Server is down or unreachable.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div>
      <div className="mt-4 d-flex aligns-items-center justify-content-center">
        <div className="form-card border-color" style={{ width: "28rem", borderRadius: "1em" }}>
          <div className="container-fluid">
            <div
              className="card-header bg-color custom-bg-text mt-2 d-flex justify-content-center align-items-center"
              style={{
                borderRadius: "1em",
                height: "45px",
              }}
            >
              <h4 className="card-title mb-0">Set New Password</h4>
            </div>
            <div className="card-body mt-3">
              <form onSubmit={handleResetPassword}>
                <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  Please enter your email, OTP, and a strong new password.
                </p>

                {(!email || !otp) && (
                  <>
                    <div className="mb-3 text-color">
                      <label htmlFor="email" className="form-label" style={{ fontWeight: "600" }}>
                        Email Address
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          onChange={handleInput}
                          value={passwordForm.email}
                          placeholder="Enter your email"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn"
                          style={{ backgroundColor: "#004a99", color: "white", fontWeight: "600" }}
                          onClick={handleSendOtp}
                          disabled={isGeneratingOtp}
                        >
                          {isGeneratingOtp ? "Sending..." : "Send OTP"}
                        </button>
                      </div>
                    </div>
                    <div className="mb-3 text-color">
                      <label htmlFor="otp" className="form-label" style={{ fontWeight: "600" }}>
                        6-Digit OTP
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="otp"
                        name="otp"
                        onChange={handleInput}
                        value={passwordForm.otp}
                        placeholder="Enter OTP"
                        maxLength={6}
                      />
                    </div>
                  </>
                )}

                <div className="mb-3 text-color">
                  <label htmlFor="newPassword" className="form-label" style={{ fontWeight: "600" }}>
                    Enter New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    onChange={handleInput}
                    value={passwordForm.newPassword}
                    placeholder="Enter new password"
                    autoFocus
                  />
                  <small className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                     Requires 8-64 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.
                  </small>
                </div>
                <div className="mb-4 text-color">
                  <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: "600" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    onChange={handleInput}
                    value={passwordForm.confirmPassword}
                    placeholder="Re-enter new password"
                  />
                </div>
                <div className="d-flex aligns-items-center justify-content-center mb-2">
                  <button
                    type="submit"
                    className="btn bg-color custom-bg-text w-100 py-2"
                    style={{ fontWeight: "600", borderRadius: "8px" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                  <ToastContainer />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
