import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { config } from '../ConsantsFile/Constants';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from "@mui/material";
import MenuBookIcon from '@mui/icons-material/MenuBook';
const url = config.url.BASE_URL;

const AddCourseForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [allGrades, setAllGrades] = useState([]);

  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  useEffect(() => {
    const getAllGrade = async () => {
      const allGrades = await retrieveAllGrade();
      if (allGrades) {
        setAllGrades(allGrades.grades);
      }
    };

    getAllGrade();
  }, []);

  const retrieveAllGrade = async () => {
    const response = await axios.get(
      url + "/grade/fetch/all"
    );
    console.log(response.data);
    return response.data;
  };

  const saveCourse = (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !gradeId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAdding(true);
    let data = { name, description, gradeId };

    fetch(url + "/course/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
      },
      body: JSON.stringify(data),
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
            }, 2000); // Redirect after 3 seconds
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
            }, 2000); // Redirect after 3 seconds
          } else {
            toast.error("It Seems Server is down!!!", {
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
            }, 2000); // Redirect after 3 seconds
          }
        });
      })
      .catch((error) => {
        setIsAdding(false);
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

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2, bgcolor: '#f8f9fc' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#6645eb', color: 'white', py: 3, px: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <MenuBookIcon /> Add Course
          </Typography>
        </Box>

        <Box component="form" onSubmit={saveCourse} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Course Name"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isAdding}
            placeholder="e.g. Mathematics"
          />

          <TextField
            label="Course Description"
            variant="outlined"
            fullWidth
            required
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isAdding}
            placeholder="Enter course details..."
          />

          <FormControl fullWidth required disabled={isAdding}>
            <InputLabel id="grade-select-label">Grade</InputLabel>
            <Select
              labelId="grade-select-label"
              value={gradeId}
              label="Grade"
              onChange={(e) => setGradeId(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Grade</em>
              </MenuItem>
              {allGrades.map((grade) => (
                <MenuItem key={grade.id} value={grade.id}>
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isAdding}
            sx={{
              mt: 2,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              backgroundImage: 'linear-gradient(135deg, #68ffa2ff  5%, #6645eb 100%)',
              color: 'white',
              borderRadius: '8px',
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #68ffa2ff  5%, #6645eb 100%)',
              }
            }}
          >
            {isAdding ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                Adding course...
              </>
            ) : (
              "Add Course"
            )}
          </Button>
        </Box>
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default AddCourseForm;
