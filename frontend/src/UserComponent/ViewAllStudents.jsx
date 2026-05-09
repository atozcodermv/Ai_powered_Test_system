import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { toast } from "react-toastify";

import { config } from '../ConsantsFile/Constants';
const url = config.url.BASE_URL;

const ViewAllStudents = () => {
  const [allStudent, setAllStudent] = useState([]);
  const [deactivatedStudents, setDeactivatedStudents] = useState([]);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  useEffect(() => {
    const getAllUsers = async () => {
      const { activeUsers, inactiveUsers } = await retrieveAllUser();
      if (activeUsers) {
        setAllStudent(activeUsers.users || []);
      }
      if (inactiveUsers) {
        setDeactivatedStudents(inactiveUsers.users || []);
      }
    };

    getAllUsers();
  }, []);

  const retrieveAllUser = async () => {
    const [activeUsers, inactiveUsers] = await Promise.all([
      axios.get(url + "/user/fetch/role-wise?role=Student&status=Active"),
      axios.get(url + "/user/fetch/role-wise?role=Student&status=Deactivated"),
    ]);
    return {
      activeUsers: activeUsers.data,
      inactiveUsers: inactiveUsers.data,
    };
  };

  const deactivateUser = (userId) => {
    fetch(url + "/user/delete/user-id?userId=" + userId, {
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
            setAllStudent((prevStudents) =>
              prevStudents.filter((student) => student.id !== userId)
            );
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
      });
  };

  const permanentlyDeleteUser = (userId) => {
    setDeletingStudentId(userId);
    fetch(url + "/user/delete/permanent/user-id?userId=" + userId, {
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
            setDeactivatedStudents((prevStudents) =>
              prevStudents.filter((student) => student.id !== userId)
            );
          } else {
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
            });
          }
          setDeletingStudentId(null);
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
        });
        setDeletingStudentId(null);
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
          <h2>All Students</h2>
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
                  <th scope="col">Teacher</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {allStudent.map((student, index) => {
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
                        <b>{student.grade ? student.grade.name : "-"}</b>
                      </td>
                      <td>
                        <b>
                          {student.teacher
                            ? `${student.teacher.firstName} ${student.teacher.lastName}`
                            : "-"}
                        </b>
                      </td>
                      <td>
                        <button
                          onClick={() => deactivateUser(student.id)}
                          className="btn btn-sm bg-color custom-bg-text ms-2"
                        >
                          Deactivate
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
      <div className="card form-card ms-2 me-2 mb-5 shadow-lg">
        <div
          className="card-header custom-bg-text text-center bg-color"
          style={{
            borderRadius: "1em",
            height: "50px",
          }}
        >
          <h2>Deactivated Students</h2>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">S.No.</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email Id</th>
                  <th scope="col">Phone No</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {deactivatedStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td><b>{index + 1}</b></td>
                    <td><b>{student.firstName}</b></td>
                    <td><b>{student.lastName}</b></td>
                    <td><b>{student.emailId}</b></td>
                    <td><b>{student.phoneNo}</b></td>
                    <td>
                      <button
                        onClick={() => permanentlyDeleteUser(student.id)}
                        disabled={deletingStudentId === student.id}
                        className={`btn btn-sm ms-2 ${deletingStudentId === student.id ? "btn-secondary" : "btn-danger"}`}
                      >
                        {deletingStudentId === student.id ? "Deleting..." : "Delete Permanently"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllStudents;
