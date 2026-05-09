import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  useTheme,
  CircularProgress
} from "@mui/material";
import login from "../images/login.png";
// Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';

import { config } from "../ConsantsFile/Constants";
import { normalizeTeacherSession } from "../utils/teacherSession";
import { clearAuthSession } from "../utils/authSession";
import { showErrorToast } from "./registerValidation";

const url = config.url.BASE_URL;

const UserLoginForm = () => {
  const theme = useTheme();
  let navigate = useNavigate();
  const [loginRequest, setLoginRequest] = useState({
    emailId: "",
    password: "",
    role: "",
  });

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  // Is submitting login state (for UI feedback)
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUserInput = (e) => {
    setLoginRequest({ ...loginRequest, [e.target.name]: e.target.value });
  };

  const loginAction = (e) => {
    e.preventDefault();

    if (
      !loginRequest.emailId.trim() ||
      !loginRequest.password.trim() ||
      !loginRequest.role.trim() ||
      loginRequest.role === "0"
    ) {
      showErrorToast("Please enter email, password, and select a role.");
      return;
    }

    setIsLoggingIn(true);
    console.log("loginRequest", loginRequest);
    fetch(url + "/user/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginRequest),
    })
      .then((result) => {
        setIsLoggingIn(false);
        console.log("result", result);
        result.json().then((res) => {
          if (res.success) {
            console.log("Got the success response");

            if (res.jwtToken !== null) {
              clearAuthSession();

              if (res.user.role === "Admin") {
                sessionStorage.setItem(
                  "active-admin",
                  JSON.stringify(res.user)
                );
                sessionStorage.setItem("admin-jwtToken", res.jwtToken);
              } else if (res.user.role === "Teacher") {
                sessionStorage.setItem(
                  "active-teacher",
                  JSON.stringify(normalizeTeacherSession(res.user))
                );
                sessionStorage.setItem("teacher-jwtToken", res.jwtToken);
              } else if (res.user.role === "Student") {
                sessionStorage.setItem(
                  "active-student",
                  JSON.stringify(res.user)
                );
                sessionStorage.setItem("student-jwtToken", res.jwtToken);
              }
            }

            if (res.jwtToken !== null) {
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
            } else {
              toast.error(res.responseMessage, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          } else {
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        });
      })
      .catch((error) => {
        setIsLoggingIn(false);
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
      });
  };

  const openForgotModal = (e) => {
    e.preventDefault();
    setForgotEmail(loginRequest.emailId);
    setForgotStep(1);
    setForgotOtp("");
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showErrorToast("Please enter an email address.");
      return;
    }

    setIsSubmittingForgot(true);
    try {
      const response = await fetch(`${url}/user/forgot-password/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.responseMessage);
        setForgotStep(2); // Move to OTP step
      } else {
        toast.error(data.responseMessage || "Failed to generate OTP.", {
          style: { minWidth: "350px" }
        });
      }
    } catch (err) {
      toast.error("Server is down or unreachable.");
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      showErrorToast("Please enter the OTP.");
      return;
    }

    setIsSubmittingForgot(true);
    try {
      const response = await fetch(`${url}/user/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.responseMessage);
        closeForgotModal();
        setTimeout(() => {
          navigate("/user/forgetpassword", { state: { email: forgotEmail, otp: forgotOtp } });
        }, 500);
      } else {
        toast.error(data.responseMessage || "Invalid OTP.");
      }
    } catch (err) {
      toast.error("Server is down or unreachable.");
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f8f9fc", minHeight: "90vh", display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={0} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: theme.shadows[8], bgcolor: 'white' }}>

          {/* Left Side: Illustration & Branding (Hidden on Small Screens) */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Welcome Back!
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 4, lineHeight: 1.6 }}>
                  Log in to access your dashboard, securely track your examination progress, and leverage AI-powered educational tools tailored just for you.
                </Typography>

                <Box
                  sx={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={login}
                    alt="AI secure login illustration"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                  />
                </Box>
              </Box>

              {/* Decorative shapes */}
              <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
              <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
            </Box>
          </Grid>

          {/* Right Side: Login Form */}
          <Grid item xs={12} md={6} sx={{ ml: { xs: 0, md: 13 } }}>
            <Box sx={{ p: { xs: 4, sm: 6, md: 8 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="#102a43" gutterBottom align="center">
                User Login
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 5 }}>
                Enter your credentials to manage your account.
              </Typography>

              <form onSubmit={loginAction}>
                {/* Role Selection */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="role-select-label">User Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    name="role"
                    value={loginRequest.role}
                    label="User Role"
                    onChange={handleUserInput}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Select Role</em>
                    </MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                  </Select>
                </FormControl>

                {/* Email Field */}
                <TextField
                  fullWidth
                  label="Email Address / User Name"
                  name="emailId"
                  type="email"
                  value={loginRequest.emailId}
                  onChange={handleUserInput}
                  variant="outlined"
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={loginRequest.password}
                  onChange={handleUserInput}
                  variant="outlined"
                  required
                  autoComplete="current-password"
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoggingIn}
                  endIcon={isLoggingIn ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '30px',
                    textTransform: 'none',
                    boxShadow: '0 8px 16px rgba(79,172,254,0.3)',
                    mb: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>

                {/* Forgot Password Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="text"
                    onClick={openForgotModal}
                    sx={{
                      color: '#2a5298',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Container>


      {/* Forgot Password Modal (MUI Dialog) */}
      <Dialog
        open={showForgotModal}
        onClose={closeForgotModal}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            maxWidth: '450px',
            width: '100%',
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} color="#102a43">
            {forgotStep === 1 ? "Reset Password" : "Enter Verification OTP"}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={closeForgotModal}
            sx={{ color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          <DialogContentText sx={{ mb: 3 }}>
            {forgotStep === 1
              ? "Enter your registered email address and we'll send you an OTP to reset your password."
              : <span>We've sent a 6-digit OTP to <strong>{forgotEmail}</strong>. Please enter it below.</span>
            }
          </DialogContentText>

          {forgotStep === 1 ? (
            <form onSubmit={handleSendOtp}>
              <TextField
                autoFocus
                margin="dense"
                id="forgotEmail"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <DialogActions sx={{ p: 0, mt: 4 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmittingForgot}
                  sx={{
                    bgcolor: '#2a5298',
                    color: 'white',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#1e3c72' }
                  }}
                >
                  {isSubmittingForgot ? <CircularProgress size={24} color="inherit" /> : "Send Reset Password OTP"}
                </Button>
              </DialogActions>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <TextField
                autoFocus
                margin="dense"
                id="forgotOtp"
                label="6-Digit OTP"
                type="text"
                fullWidth
                variant="outlined"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                required
                inputProps={{ maxLength: 6, style: { letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' } }}
              />
              <DialogActions sx={{ p: 0, mt: 4, flexDirection: 'column', gap: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmittingForgot}
                  sx={{
                    bgcolor: '#2a5298',
                    color: 'white',
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    margin: '0 !important',
                    '&:hover': { bgcolor: '#1e3c72' }
                  }}
                >
                  {isSubmittingForgot ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
                </Button>

                <Button
                  variant="text"
                  onClick={() => setForgotStep(1)}
                  sx={{ color: '#666', textTransform: 'none' }}
                >
                  &larr; Back to Email
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </Box>
  );
};

export default UserLoginForm;
