import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from "../ConsantsFile/Constants";

const url = config.url.BASE_URL;

const UpdateGradeForm = () => {
  const location = useLocation();
  const grade = location.state;
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const [id] = useState(grade.id);
  const [name, setName] = useState(grade.name);
  const [description, setDescription] = useState(grade.description);
  const [teacherId, setTeacherId] = useState(grade?.teacher?.id || "");
  const [allTeachers, setAllTeachers] = useState([]);

  const navigate = useNavigate();

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

    const data = { id, name, description, teacherId };

    fetch(url + "/grade/update", {
      method: "PUT",
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
              navigate("/admin/grade/all");
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
    <div>
      <div className="mt-2 d-flex aligns-items-center justify-content-center">
        <div className="form-card border-color" style={{ width: "25rem" }}>
          <div className="container-fluid">
            <div
              className="card-header bg-color custom-bg-text mt-2 d-flex justify-content-center align-items-center"
              style={{
                borderRadius: "1em",
                height: "38px",
              }}
            >
              <h5 className="card-title">Update Grade</h5>
            </div>
            <div className="card-body text-color mt-3">
              <form>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    <b>Grade Name</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    placeholder="enter title.."
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    value={name}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    <b>Grade Description</b>
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    placeholder="enter description.."
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    value={description}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="teacherId" className="form-label">
                    <b>Assigned Teacher</b>
                  </label>
                  <select
                    id="teacherId"
                    className="form-control"
                    value={teacherId}
                    onChange={(e) => {
                      setTeacherId(e.target.value);
                    }}
                  >
                    <option value="">No teacher</option>
                    {allTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex aligns-items-center justify-content-center mb-2">
                  <button
                    type="submit"
                    onClick={saveGrade}
                    className="btn bg-color custom-bg-text"
                  >
                    Update Grade
                  </button>
                </div>

                <ToastContainer />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateGradeForm;
