import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { config } from "../ConsantsFile/Constants";

const url = config.url.BASE_URL;

const ViewAllGrades = () => {
  const [allGrades, setAllGrades] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);
  const [deletingGradeId, setDeletingGradeId] = useState(null);
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const navigate = useNavigate();

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [gradeResponse, teacherResponse] = await Promise.all([
          axios.get(url + "/grade/fetch/all"),
          axios.get(url + "/user/fetch/role-wise?role=Teacher"),
        ]);

        setAllGrades(gradeResponse?.data?.grades || []);
        setAllTeachers(teacherResponse?.data?.users || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load grades and teachers", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    };

    loadPageData();
  }, []);

  const getGradeTeachers = (grade) => {
    const mappedTeachers = Array.isArray(grade?.teachers) ? grade.teachers : [];

    if (
      grade?.teacher &&
      !mappedTeachers.some(
        (teacher) => String(teacher.id) === String(grade.teacher.id)
      )
    ) {
      return [...mappedTeachers, grade.teacher];
    }

    return mappedTeachers;
  };

  const deleteGrade = (gradeId) => {
    setDeletingGradeId(gradeId);
    fetch(url + "/grade/delete?gradeId=" + gradeId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
      },
    })
      .then((result) => result.json())
      .then((res) => {
        if (res.success) {
          toast.success(res.responseMessage, {
            position: "top-center",
            autoClose: 1000,
          });

          setAllGrades((prevGrades) =>
            prevGrades.filter((grade) => grade.id !== gradeId)
          );
        } else {
          toast.error(res.responseMessage, {
            position: "top-center",
            autoClose: 1000,
          });
        }
        setDeletingGradeId(null);
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
        });
        setDeletingGradeId(null);
      });
  };

  const updateGrade = (grade) => {
    navigate("/admin/grade/update", { state: grade });
  };

  const viewCourses = (gradeId) => {
    navigate(`/admin/grade/${gradeId}/course/`);
  };

  const openAddTeacherModal = (grade) => {
    setSelectedGrade(grade);
    setSelectedTeacherId("");
  };

  const closeAddTeacherModal = () => {
    setSelectedGrade(null);
    setSelectedTeacherId("");
    setIsAssigningTeacher(false);
  };

  const availableTeachers = useMemo(() => {
    if (!selectedGrade) {
      return [];
    }

    const assignedTeacherIds = new Set(
      getGradeTeachers(selectedGrade).map((teacher) => String(teacher.id))
    );

    return allTeachers.filter(
      (teacher) => !assignedTeacherIds.has(String(teacher.id))
    );
  }, [allTeachers, selectedGrade]);

  const assignTeacherToGrade = () => {
    if (!selectedGrade || !selectedTeacherId) {
      toast.error("Select a teacher first", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    setIsAssigningTeacher(true);

    fetch(url + "/grade/teacher/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
      },
      body: JSON.stringify({
        gradeId: selectedGrade.id,
        teacherId: selectedTeacherId,
      }),
    })
      .then((result) => result.json())
      .then((res) => {
        if (!res.success) {
          toast.error(res.responseMessage || "Unable to assign teacher", {
            position: "top-center",
            autoClose: 1000,
          });
          setIsAssigningTeacher(false);
          return;
        }

        const assignedTeacher = allTeachers.find(
          (teacher) => String(teacher.id) === String(selectedTeacherId)
        );

        setAllGrades((prevGrades) =>
          prevGrades.map((grade) =>
            grade.id === selectedGrade.id
              ? {
                  ...grade,
                  teacher: grade.teacher || assignedTeacher || null,
                  teachers: [
                    ...getGradeTeachers(grade),
                    ...(assignedTeacher ? [assignedTeacher] : []),
                  ].filter(
                    (teacher, index, teachers) =>
                      teachers.findIndex(
                        (currentTeacher) =>
                          String(currentTeacher.id) === String(teacher.id)
                      ) === index
                  ),
                }
              : grade
          )
        );

        toast.success(res.responseMessage || "Teacher assigned successfully", {
          position: "top-center",
          autoClose: 1000,
        });

        setSelectedGrade((prevGrade) =>
          prevGrade
            ? {
                ...prevGrade,
                teacher: prevGrade.teacher || assignedTeacher || null,
                teachers: [
                  ...getGradeTeachers(prevGrade),
                  ...(assignedTeacher ? [assignedTeacher] : []),
                ].filter(
                  (teacher, index, teachers) =>
                    teachers.findIndex(
                      (currentTeacher) =>
                        String(currentTeacher.id) === String(teacher.id)
                    ) === index
                ),
              }
            : null
        );

        setSelectedTeacherId("");
        setIsAssigningTeacher(false);
        closeAddTeacherModal();
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
        });
        setIsAssigningTeacher(false);
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
          <h2>All Grades</h2>
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
                  <th scope="col">Grade Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Teacher</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {allGrades.map((grade, index) => {
                  return (
                    <tr key={grade.id}>
                      <td>
                        <b>{index + 1}</b>
                      </td>
                      <td>
                        <b>{grade.name}</b>
                      </td>
                      <td>
                        <b>{grade.description}</b>
                      </td>
                      <td>
                        <b>
                          {getGradeTeachers(grade).length > 0
                            ? getGradeTeachers(grade)
                                .map(
                                  (teacher) =>
                                    `${teacher.firstName} ${teacher.lastName}`
                                )
                                .join(", ")
                            : "-"}
                        </b>
                      </td>
                      <td>
                        <button
                          onClick={() => updateGrade(grade)}
                          className="btn btn-sm bg-color custom-bg-text ms-2"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => deleteGrade(grade.id)}
                          disabled={deletingGradeId === grade.id}
                          className={`btn btn-sm ms-2 ${deletingGradeId === grade.id ? "btn-secondary" : "bg-color custom-bg-text"}`}
                        >
                          {deletingGradeId === grade.id ? "Deleting..." : "Delete"}
                        </button>

                        <button
                          onClick={() => viewCourses(grade.id)}
                          className="btn btn-sm bg-color custom-bg-text ms-2"
                        >
                          Courses
                        </button>

                        <button
                          onClick={() => openAddTeacherModal(grade)}
                          className="btn btn-sm bg-color custom-bg-text ms-2"
                        >
                          Add Teacher
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

      {selectedGrade && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            padding: "1rem",
          }}
        >
          <div
            className="card shadow-lg"
            style={{
              width: "100%",
              maxWidth: "36rem",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: "1rem",
            }}
          >
            <div className="card-header bg-color custom-bg-text d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Add Teacher to {selectedGrade.name}</h5>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={closeAddTeacherModal}
              >
                Close
              </button>
            </div>
            <div className="card-body">
              {getGradeTeachers(selectedGrade).length > 0 && (
                <p className="mb-3">
                  <b>Current Teachers:</b>{" "}
                  {getGradeTeachers(selectedGrade)
                    .map(
                      (teacher) => `${teacher.firstName} ${teacher.lastName}`
                    )
                    .join(", ")}
                </p>
              )}

              {availableTeachers.length === 0 ? (
                <p className="mb-0">No additional teachers available for this grade.</p>
              ) : (
                <>
                  <div className="list-group">
                    {availableTeachers.map((teacher) => (
                      <label
                        key={teacher.id}
                        className="list-group-item d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name="teacherSelection"
                          value={teacher.id}
                          checked={String(selectedTeacherId) === String(teacher.id)}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                        />
                        <span>
                          <b>
                            {teacher.firstName} {teacher.lastName}
                          </b>
                          <br />
                          <small>{teacher.emailId}</small>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={closeAddTeacherModal}
                      disabled={isAssigningTeacher}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn bg-color custom-bg-text"
                      onClick={assignTeacherToGrade}
                      disabled={!selectedTeacherId || isAssigningTeacher}
                    >
                      {isAssigningTeacher ? "Adding..." : "Add"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ViewAllGrades;
