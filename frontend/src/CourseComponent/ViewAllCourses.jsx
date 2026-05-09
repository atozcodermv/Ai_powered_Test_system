import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from '../ConsantsFile/Constants';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Zoom
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { getActiveTeacher } from "../utils/teacherSession";
const url = config.url.BASE_URL;

const ViewAllCourses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [assignedGrades, setAssignedGrades] = useState([]);
  const [requestModal, setRequestModal] = useState({
    open: false,
    type: "",
    course: null,
  });
  const [requestReason, setRequestReason] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  const teacherJwtToken = sessionStorage.getItem("teacher-jwtToken");
  const teacher = getActiveTeacher();
  const isTeacherView = Boolean(teacher?.id);

  const { gradeId } = useParams();

  let navigate = useNavigate();

  useEffect(() => {
    const getAllCourse = async () => {
      const allCourse = await retrieveAllCourses(gradeId);
      if (allCourse) {
        setAllCourses(allCourse.courses);
      }
    };

    if (teacher) {
      setAssignedGrades(teacher.grades || []);
    }

    getAllCourse();
  }, [gradeId]);

  const handleGradeChange = (event) => {
    const newGradeId = event.target.value;
    if (newGradeId) {
       navigate(`/admin/grade/${newGradeId}/course/`);
    }
  };

  const retrieveAllCourses = async (gradeId) => {
    if (gradeId === "all") {
      const response = await axios.get(
        url + "/course/fetch/all"
      );
      console.log(response.data);
      return response.data;
    } else {
      const response = await axios.get(
        url + "/course/fetch/all/grade-wise?gradeId=" +
          gradeId
      );
      console.log(response.data);
      return response.data;
    }
  };

  const deleteCourse = (courseId, e) => {
    fetch(url + "/course/delete?courseId=" + courseId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
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
            }, 1000); // Redirect after 3 seconds
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
            }, 1000); // Redirect after 3 seconds
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
        }, 1000); // Redirect after 3 seconds
      });
  };

  const updateGrade = (course) => {
    if (isTeacherView) {
      openRequestModal("update", course);
      return;
    }

    navigate("/admin/course/update", { state: course });
  };

  const handleDeleteCourse = (course) => {
    if (isTeacherView) {
      openRequestModal("delete", course);
      return;
    }

    deleteCourse(course.id);
  };

  const openRequestModal = (type, course) => {
    setRequestModal({
      open: true,
      type,
      course,
    });
    setRequestReason("");
  };

  const closeRequestModal = () => {
    if (sendingRequest) {
      return;
    }

    setRequestModal({
      open: false,
      type: "",
      course: null,
    });
    setRequestReason("");
  };

  const submitCourseChangeRequest = async () => {
    const reason = requestReason.trim();

    if (!reason) {
      toast.error("Please enter a valid reason.", {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    if (!teacherJwtToken) {
      toast.error("Teacher session expired. Please login again.", {
        position: "top-center",
        autoClose: 1800,
      });
      return;
    }

    setSendingRequest(true);

    try {
      const response = await axios.post(
        url + "/course/request-change",
        {
          courseId: requestModal.course.id,
          requestType: requestModal.type,
          reason,
        },
        {
          headers: {
            Authorization: "Bearer " + teacherJwtToken,
          },
        }
      );

      if (response.data?.success) {
        toast.success(response.data.responseMessage || "Request sent successfully", {
          position: "top-center",
          autoClose: 1500,
        });
        setRequestModal({
          open: false,
          type: "",
          course: null,
        });
        setRequestReason("");
      } else {
        toast.error(response.data?.responseMessage || "Unable to send request", {
          position: "top-center",
          autoClose: 1800,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.responseMessage || "Unable to send request right now",
        {
          position: "top-center",
          autoClose: 1800,
        }
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const modalTitle =
    requestModal.type === "delete" ? "Request Course Deletion" : "Request Course Update";
  const modalLabel =
    requestModal.type === "delete"
      ? "Enter a valid reason for deletion"
      : "Enter the reason and what needs to be updated";

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
          <h2>All Courses</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          {teacher && assignedGrades.length > 0 && (
            <Box sx={{ mb: 4, px: 2 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: '16px', 
                  background: 'rgba(255, 255, 255, 0.6)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(224, 224, 224, 0.5)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" sx={{ color: '#1e3c72', fontWeight: 700, mb: 0.5 }}>
                      Switch Grade
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select a grade to view its specific courses
                    </Typography>
                  </Box>
                  
                  <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel id="grade-select-label" sx={{ color: '#2a5298' }}>Select Grade</InputLabel>
                    <Select
                      labelId="grade-select-label"
                      id="grade-select"
                      value={gradeId}
                      label="Select Grade"
                      onChange={handleGradeChange}
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(42, 82, 152, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2a5298',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2a5298',
                          borderWidth: '2px'
                        },
                        bgcolor: 'white'
                      }}
                      startAdornment={
                        <SchoolIcon sx={{ color: '#2a5298', mr: 1 }} />
                      }
                    >
                      {assignedGrades.map((grade) => (
                        <MenuItem key={grade.id} value={grade.id.toString()}>
                          {grade.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>
            </Box>
          )}

          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">S.No.</th>
                  <th scope="col">Category Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {allCourses.map((course, index) => {
                  return (
                    <tr key={course.id}>
                      <td>
                        <b>{index + 1}</b>
                      </td>
                      <td>
                        <b>{course.name}</b>
                      </td>
                      <td>
                        <b>{course.description}</b>
                      </td>
                      <td>
                        <b>{course.grade.name}</b>
                      </td>
                      <td>
                        <button
                          onClick={() => updateGrade(course)}
                          className="btn btn-sm bg-color custom-bg-text ms-2"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="btn btn-sm bg-color custom-bg-text ms-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog
        open={requestModal.open}
        onClose={closeRequestModal}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
            overflow: "hidden",
            transformOrigin: "center",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(5px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            color: "#ffffff",
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {modalTitle}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.86 }}>
                {requestModal.course?.name || "Course request"}
              </Typography>
            </Box>
            <IconButton
              aria-label="Close request modal"
              onClick={closeRequestModal}
              disabled={sendingRequest}
              sx={{
                color: "#ffffff",
                bgcolor: "rgba(255,255,255,0.12)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Box
            sx={{
              border: "1px solid #dbe3ef",
              borderRadius: "16px",
              p: 2,
              mb: 2.5,
              bgcolor: "#f8fafc",
            }}
          >
            <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
              Teacher
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {`${teacher?.firstName || ""} ${teacher?.lastName || ""}`.trim() || "Teacher"}
            </Typography>
          </Box>

          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={5}
            label={modalLabel}
            value={requestReason}
            onChange={(event) => setRequestReason(event.target.value)}
            disabled={sendingRequest}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                bgcolor: "#ffffff",
                "&:hover fieldset": { borderColor: "#2a5298" },
                "&.Mui-focused fieldset": { borderColor: "#2a5298" },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#2a5298",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pt: 1, pb: 3 }}>
          <Button
            onClick={closeRequestModal}
            disabled={sendingRequest}
            sx={{
              color: "#475569",
              borderRadius: "999px",
              px: 2.5,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            endIcon={sendingRequest ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            onClick={submitCourseChangeRequest}
            disabled={sendingRequest}
            sx={{
              borderRadius: "999px",
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              boxShadow: "0 10px 24px rgba(42, 82, 152, 0.28)",
              "&:hover": {
                background: "linear-gradient(135deg, #18335f 0%, #244a89 100%)",
                boxShadow: "0 12px 28px rgba(42, 82, 152, 0.35)",
              },
            }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewAllCourses;
