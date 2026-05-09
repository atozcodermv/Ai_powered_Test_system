import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveTeacher } from "../utils/teacherSession";
import { clearAuthSession } from "../utils/authSession";

const HeaderTeacher = () => {
  let navigate = useNavigate();

  const teacher = getActiveTeacher();

  const userLogout = () => {
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
  const viewProfile = () => {
    navigate("/user/profile/detail", { state: teacher });
  };

  return (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
      <li className="nav-item">
        <Link to="/user/student/register" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Register Student
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/teacher/grade/student/all" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          View Students
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/add" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Add Exam
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/grade-wise/upcoming" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Upcoming Exams
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/grade-wise/previous" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Previous Exams
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/exam/grade/teacher/verify" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Verify Student
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/grade/student/result/" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Student Results
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/grade-wise/evaluateexam" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Mark Descriptive Exam
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/student/grade-wise/studentchatting" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Student Chat
        </Link>
      </li>
      {teacher && teacher.grade && (
        <li className="nav-item">
          <Link to={`/admin/grade/${teacher.grade.id}/course/`} className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
            View Courses
          </Link>
        </li>
      )}
      <li className="nav-item">
        <div className="nav-link fw-semibold hover-effect text-dark" aria-current="page" style={{ cursor: "pointer" }} onClick={viewProfile}>
          My Profile
        </div>
      </li>
      <li className="nav-item">
        <Link to="" className="nav-link fw-bold text-danger hover-effect" aria-current="page" onClick={userLogout}>
          Logout
        </Link>
      </li>
    </ul>
  );
};

export default HeaderTeacher;
