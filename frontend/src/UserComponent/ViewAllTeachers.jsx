import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { toast } from "react-toastify";
import { config } from '../ConsantsFile/Constants';
const url = config.url.BASE_URL;

const ViewAllTeachers = () => {
  const [allTeacher, setAllTeacher] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherToDelete, setSelectedTeacherToDelete] = useState(null);
  const [alternativeTeachers, setAlternativeTeachers] = useState([]);
  const [selectedAlternativeTeacherId, setSelectedAlternativeTeacherId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  useEffect(() => {
    const getAllUsers = async () => {
      const { activeTeachers } = await retrieveAllUser();
      if (activeTeachers) {
        setAllTeacher(activeTeachers);
      }
      if (activeTeachers) {
        setAllTeacher(activeTeachers);
      }
    };

    getAllUsers();
  }, []);

  const retrieveAllUser = async () => {
    const [teacherResponse, gradeResponse] = await Promise.all([
      axios.get(url + "/user/fetch/role-wise?role=Teacher&status=Active"),
      axios.get(url + "/grade/fetch/all"),
    ]);

    const teachers = teacherResponse?.data?.users || [];
    const grades = gradeResponse?.data?.grades || [];

    const mapTeachersWithGrades = (teacherList) => teacherList.map((teacher) => {
      const associatedGrades = grades.filter(
        (grade) =>
          (grade?.teachers || []).some(
            (assignedTeacher) => String(assignedTeacher?.id) === String(teacher.id)
          ) || String(grade?.teacher?.id) === String(teacher.id)
      );

      return {
        ...teacher,
        associatedGrades,
      };
    });

    return {
      activeTeachers: mapTeachersWithGrades(teachers)
    };
  };

  const handleDeleteClick = async (teacher) => {
    setSelectedTeacherToDelete(teacher);
    setSelectedAlternativeTeacherId("");
    setShowModal(true);
    setModalLoading(true);
    try {
      const response = await axios.get(url + `/user/fetch/teacher/alternative?teacherId=${teacher.id}`);
      if (response.data.success) {
        setAlternativeTeachers(response.data.users || []);
      } else {
        setAlternativeTeachers([]);
      }
    } catch (error) {
      toast.error("Error fetching alternative teachers");
    } finally {
      setModalLoading(false);
    }
  };

  const isTeacherUnassigned = selectedTeacherToDelete && 
    (!selectedTeacherToDelete.associatedGrades || selectedTeacherToDelete.associatedGrades.length === 0) && 
    !selectedTeacherToDelete.grade;

  const confirmDelete = () => {
    if (!isTeacherUnassigned && alternativeTeachers.length > 0 && !selectedAlternativeTeacherId) {
      toast.error("Please select an alternative teacher for student reassignment.");
      return;
    }
    
    permanentlyDeleteUser(selectedTeacherToDelete.id, selectedAlternativeTeacherId);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSelectedTeacherToDelete(null);
    setSelectedAlternativeTeacherId("");
  };

  const permanentlyDeleteUser = (userId, newTeacherId) => {
    setIsDeleting(true);
    let deleteUrl = url + "/user/delete/permanent/user-id?userId=" + userId;
    if (newTeacherId) {
      deleteUrl += "&newTeacherId=" + newTeacherId;
    }
    fetch(deleteUrl, {
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
            });
            setAllTeacher((prevTeachers) =>
              prevTeachers.filter((teacher) => teacher.id !== userId)
            );
            closeDeleteModal();
          } else {
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
            });
          }
          setIsDeleting(false);
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
        });
        setIsDeleting(false);
      });
  };

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
          <h2>All Teachers</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
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
                {allTeacher.map((teacher, index) => {
                  const associatedGradeNames =
                    teacher.associatedGrades?.map((grade) => grade.name) || [];

                  return (
                    <tr key={teacher.id}>
                      <td>
                        <b>{index + 1}</b>
                      </td>
                      <td>
                        <b>{teacher.firstName}</b>
                      </td>
                      <td>
                        <b>{teacher.lastName}</b>
                      </td>
                      <td>
                        <b>{teacher.emailId}</b>
                      </td>
                      <td>
                        <b>{teacher.phoneNo}</b>
                      </td>
                      <td>
                        <b>
                          {teacher.address.street +
                            ", " +
                            teacher.address.city +
                            ", " +
                            teacher.address.pincode}
                        </b>
                      </td>
                      <td>
                        <b>
                          {associatedGradeNames.length > 0
                            ? associatedGradeNames.join(", ")
                            : teacher.grade
                            ? teacher.grade.name
                            : "-"}
                        </b>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteClick(teacher)}
                          className="btn btn-sm btn-danger ms-2"
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

      {showModal && (
        <div className="modal" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Teacher</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                {modalLoading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <p>Are you sure you want to permanently delete <b>{selectedTeacherToDelete?.firstName} {selectedTeacherToDelete?.lastName}</b>?</p>
                    {!isTeacherUnassigned && (
                      alternativeTeachers.length > 0 ? (
                        <div>
                          <hr />
                          <p className="text-danger">This teacher has students assigned. Please select an alternative teacher to reassign them to:</p>
                          <select 
                            className="form-select"
                            value={selectedAlternativeTeacherId}
                            onChange={(e) => setSelectedAlternativeTeacherId(e.target.value)}
                          >
                            <option value="">Select a teacher</option>
                            {alternativeTeachers.map(altTeacher => (
                              <option key={altTeacher.id} value={altTeacher.id}>
                                {altTeacher.firstName} {altTeacher.lastName} ({altTeacher.emailId})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="text-danger mt-3 fw-bold">No other active teachers found in the same grade. You cannot delete this teacher until another teacher is available to take their students.</p>
                      )
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={confirmDelete}
                  disabled={(!isTeacherUnassigned && alternativeTeachers.length === 0) || modalLoading || isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewAllTeachers;
