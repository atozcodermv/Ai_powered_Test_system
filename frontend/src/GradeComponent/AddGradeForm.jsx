import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const url = config.url.BASE_URL;

const AddGradeForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allTeachers, setAllTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await axios.get(url + "/user/fetch/role-wise?role=Teacher");
        setAllTeachers(response?.data?.users || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadTeachers();
  }, []);

  const saveGrade = (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setIsAdding(true);
    const data = { name, description, teacherId };

    fetch(url + "/grade/add", {
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
            }, 2000);
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
            }, 2000);
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
            }, 2000);
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
        }, 1000);
      });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2, bgcolor: '#f8f9fc' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#6645eb', color: 'white', py: 3, px: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <AddCircleOutlineIcon /> Add Grade
          </Typography>
        </Box>

        <Box component="form" onSubmit={saveGrade} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Grade Name"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isAdding}
            placeholder="e.g., 10th Grade"
          />

          <TextField
            label="Grade Description"
            variant="outlined"
            fullWidth
            required
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isAdding}
            placeholder="Enter a brief description..."
          />

          <FormControl fullWidth disabled={isAdding}>
            <InputLabel id="teacher-select-label">Assigned Teacher (Optional)</InputLabel>
            <Select
              labelId="teacher-select-label"
              value={teacherId}
              label="Assigned Teacher (Optional)"
              onChange={(e) => setTeacherId(e.target.value)}
            >
              <MenuItem value="">
                <em>No teacher</em>
              </MenuItem>
              {allTeachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
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
              backgroundImage: 'linear-gradient(135deg, #68ffa2ff 5%, #6645eb 100%)',
              color: 'white',
              borderRadius: '8px',
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #68ffa2ff 5%, #6645eb 100%)',
              }
            }}
          >
            {isAdding ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                Adding grade...
              </>
            ) : (
              "Add Grade"
            )}
          </Button>
        </Box>
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default AddGradeForm;
