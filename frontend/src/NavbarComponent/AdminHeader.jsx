import { React } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearAuthSession } from "../utils/authSession";

const AdminHeader = () => {
  let navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("active-admin"));
  console.log(user);

  const adminLogout = () => {
    clearAuthSession();
    navigate("/home");
    toast.success("Logged out!!!", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
      <li className="nav-item">
        <Link to="/admin/grade/add" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Add Grade
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/admin/grade/all" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          View Grades
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/admin/course/add" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Add Course
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/admin/grade/all/course/" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          View Courses
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/user/teacher/register" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Register Teacher
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/exam/all/" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          All Exams
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/exam/all/student/result/" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Exam Results
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/admin/teacher/all" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          View Teachers
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/admin/student/all" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          View Students
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/admin/Dashboard" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Analytics
        </Link>
      </li>

      <li className="nav-item">
        <Link to="" className="nav-link fw-bold text-danger hover-effect" aria-current="page" onClick={adminLogout}>
          Logout
        </Link>
      </li>
    </ul>
  );
};

export default AdminHeader;
