import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearAuthSession } from "../utils/authSession";

const HeaderStudent = () => {
  let navigate = useNavigate();

  const student = JSON.parse(sessionStorage.getItem("active-student"));

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
  const viewStudentProfile = () => {
    navigate("/user/profile/detail", { state: student });
  };

  return (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
      <li className="nav-item">
        <Link to="/exam/student/grade-wise/ongoing" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Ongoing Exam
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/exam/student/grade-wise/previous" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Previous Exams
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/student/grade-wise/upcoming" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Upcoming Exams
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/student/result/all" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Exam Results
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/student/grade-wise/teacherchatting" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Teacher Chat
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam/student/grade-wise/ask_doubt" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
          Ask Doubt
        </Link>
      </li>
      <li className="nav-item">
        <div className="nav-link fw-semibold hover-effect text-dark cursor-pointer" aria-current="page" style={{ cursor: "pointer" }} onClick={viewStudentProfile}>
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

export default HeaderStudent;
