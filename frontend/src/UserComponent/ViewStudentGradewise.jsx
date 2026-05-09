import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { config } from '../ConsantsFile/Constants';
import PageStateMessage from "../CommonComponent/PageStateMessage";
import { getActiveTeacher, getTeacherGradeGuardMessage } from "../utils/teacherSession";
const url = config.url.BASE_URL;

const ViewStudentGradewise = () => {
  const [allStudent, setAllStudent] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [pageError, setPageError] = useState("");
  const teacher = getActiveTeacher();

  useEffect(() => {
    const fetchGrades = async () => {
      const guardMessage = getTeacherGradeGuardMessage(teacher);
      if (guardMessage) {
        setPageError(guardMessage);
        return;
      }
      try {
        const response = await axios.get(url + "/grade/fetch/teacher?teacherId=" + teacher.id);
        if (response.data?.success) {
          const fetchedGrades = response.data.grades || [];
          setGrades(fetchedGrades);
          if (fetchedGrades.length > 0) {
            setSelectedGradeId(fetchedGrades[0].id);
          } else {
            setPageError("No grades assigned to this teacher.");
          }
        } else {
          setPageError(response.data?.responseMessage || "Failed to fetch grades.");
        }
      } catch (error) {
        console.error(error);
        setPageError("Unable to load grades right now.");
      }
    };
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getAllUsers = async () => {
      if (!selectedGradeId) return;
      try {
        const response = await axios.get(
          url + "/user/fetch/student/grade-wise?gradeId=" +
            selectedGradeId +
            "&teacherId=" +
            teacher.id
        );
        const allUsers = response.data;
        if (allUsers?.success) {
          setAllStudent(allUsers.users || []);
        } else {
          setAllStudent([]);
          if (allUsers?.responseMessage !== "No Students Found" && allUsers?.responseMessage !== "No Students Found") {
            toast.error(allUsers?.responseMessage || "Unable to fetch students right now.", {
              position: "top-center",
              autoClose: 2000,
            });
          }
        }
        setPageError("");
      } catch (error) {
        console.error(error);
        toast.error("Unable to load students right now. Please try again later.", {
          position: "top-center",
          autoClose: 2000,
        });
        setAllStudent([]);
      }
    };

    getAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGradeId]);

  const deleteUser = (userId, e) => {
    fetch(url + "/user/delete/user-id?userId=" + userId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        //    Authorization: "Bearer " + seller_jwtToken,
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

  if (pageError) {
    return (
      <PageStateMessage
        title="Students Unavailable"
        message={pageError}
      />
    );
  }

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
          <h2>All Students</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          {grades.length > 0 && (
            <div className="mb-4 d-flex align-items-center justify-content-between p-3 bg-light rounded shadow-sm border">
               <h5 className="mb-0 text-color fw-bold">Filter By Grade</h5>
               <select
                 className="form-select border-color text-color fw-bold shadow-sm"
                 style={{ width: "250px", cursor: "pointer", appearance: "auto" }}
                 value={selectedGradeId}
                 onChange={(e) => setSelectedGradeId(e.target.value)}
               >
                 {grades.map((g) => (
                   <option key={g.id} value={g.id}>
                     {g.name}
                   </option>
                 ))}
               </select>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">S.No.</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email Id</th>
                  <th scope="col">Phone No</th>
                  <th scope="col">Address</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {allStudent.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <b className="text-secondary">No Students Found for this Grade</b>
                    </td>
                  </tr>
                ) : (
                  allStudent.map((student, index) => {
                    return (
                      <tr key={student.id}>
                        <td>
                          <b>{index + 1}</b>
                        </td>
                        <td>
                          <b>{student.firstName}</b>
                        </td>
                        <td>
                          <b>{student.lastName}</b>
                        </td>
                        <td>
                          <b>{student.emailId}</b>
                        </td>
                        <td>
                          <b>{student.phoneNo}</b>
                        </td>
                        <td>
                          <b>
                            {student.address.street +
                              ", " +
                              student.address.city +
                              ", " +
                              student.address.pincode}
                          </b>
                        </td>
                        <td>
                          <b>{student.grade.name}</b>
                        </td>
                        <td>
                          <button
                            onClick={() => deleteUser(student.id)}
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ViewStudentGradewise;
