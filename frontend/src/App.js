import { Routes, Route } from "react-router-dom";
import Header from "./NavbarComponent/Header";
import AdminRegisterForm from "./UserComponent/AdminRegisterForm";
import UserLoginForm from "./UserComponent/UserLoginForm";
import UserRegister from "./UserComponent/UserRegister";
import AboutUs from "./PageComponent/AboutUs";
import ContactUs from "./PageComponent/ContactUs";
import HomePage from "./PageComponent/HomePage";
import AddGradeForm from "./GradeComponent/AddGradeForm";
import UpdateGradeForm from "./GradeComponent/UpdateGradeForm";
import ViewAllGrades from "./GradeComponent/ViewAllGrades";
import ViewAllCourses from "./CourseComponent/ViewAllCourses";
import AddCourseForm from "./CourseComponent/AddCourseForm";
import UpdateCourseForm from "./CourseComponent/UpdateCourseForm";
import ViewAllTeachers from "./UserComponent/ViewAllTeachers";
import ViewAllStudents from "./UserComponent/ViewAllStudents";
import UserProfile from "./UserComponent/UserProfile";
import ViewStudentGradewise from "./UserComponent/ViewStudentGradewise";
import ViewExamQuestions from "./ExamQuestionComponent/ViewExamQuestions";
import AddExamForm from "./ExamComponent/AddExamForm";
import ViewGradeUpcomingExams from "./ExamComponent/ViewGradeUpcomingExams";
import ViewGradePreviousExams from "./ExamComponent/ViewGradePreviousExams";
import ViewStudentUpcomingExams from "./ExamComponent/ViewStudentUpcomingExams";
import ViewStudentPreviousExams from "./ExamComponent/ViewStudentPreviousExams";
import ViewStudentOngoingExams from "./ExamComponent/ViewStudentOngoingExams";
import StudentExamAttempt from "./ExamComponent/StudentExamAttempt";
import StudentDescriptiveExamAttempt from "./ExamComponent/StudentDescriptiveExamAttempt";
import SystemCheckingPage from "./ExamComponent/SystemCheckingPage";
import ViewStudentExamResults from "./ExamResultComponent/ViewStudentExamResults";
import ExamResult from "./ExamResultComponent/ExamResult";
import ViewGradeWiseStudentExamResults from "./ExamResultComponent/ViewGradeWiseStudentExamResults";
import ViewAllStudentExamResults from "./ExamResultComponent/ViewAllStudentExamResults";
import ViewAllExams from "./ExamComponent/ViewAllExams";
import StudentExamAttemptSpell from "./ExamComponent/StudentExamAttemptSpell";
import StudentExamAttemptBlanks from "./ExamComponent/StudentExamAttemptBlanks";
import UserregisterForm from "./UserComponent/UserregisterForm";
import Chatbot from "./ChatbotComponent/Chatbot";
import ChatingStudent from "./ChatComponent/ChatingStudent";
import ChatingTeacher from "./ChatComponent/ChatingTeacher";
import DescriptiveQuestion from "./ExamQuestionComponent/DescriptiveQuestion";
import EvaluateDescriptiveQuestion from "./ExamResultComponent/EvaluateDescriptiveQuestion";
import ExamListVerification from "./ExamComponent/ExamListVerification";
import VerifyStudent from "./ExamComponent/VerifyStudent";
import AnalyticsDashboard from "./AdminComponent/AnalyticsDashboard";
import ForgetPassword from "./UserComponent/ForgetPassword";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "./NavbarComponent/ProtectedRoute";
import { clearAuthSession, getAuthSession, isPublicRoute, roleNames } from "./utils/authSession";

const useSessionVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let tokenExpired = false;

    for (const role of roleNames) {
      const token = sessionStorage.getItem(`${role}-jwtToken`);
      if (token && !getAuthSession(role)) {
        tokenExpired = true;
        break;
      }
    }

    if (tokenExpired) {
      clearAuthSession();

      if (isPublicRoute(location.pathname)) {
        return;
      }
      
      toast.error("Your session is over. Please login again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      navigate("/user/login");
    }
  }, [location, navigate]); // Check each time the route changes
};

const protectedElement = (element, roles) => (
  <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
);

function App() {
  useSessionVerification();

  return (
      <div>
        <Header/>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/user/admin/register" element={<AdminRegisterForm/>}/>
          <Route path="/user/login" element={<UserLoginForm/>}/>
          <Route path="/user/forgetpassword" element={<ForgetPassword/>}/>
          <Route path="/user/student/register" element={protectedElement(<UserRegister/>, ["teacher"])}/>
          <Route path="/user/teacher/register" element={protectedElement(<UserRegister/>, ["admin"])}/>
          <Route path="/user/studentregister" element={<UserregisterForm/>}/>
          <Route path="/aboutus" element={<AboutUs/>}/>
          <Route path="/contactus" element={<ContactUs/>}/>
          <Route path="/admin/grade/add" element={protectedElement(<AddGradeForm/>, ["admin"])}/>
          <Route path="/admin/grade/all" element={protectedElement(<ViewAllGrades/>, ["admin"])}/>
          <Route path="/admin/grade/update" element={protectedElement(<UpdateGradeForm/>, ["admin"])}/>
          <Route path="/admin/course/add" element={protectedElement(<AddCourseForm/>, ["admin"])}/>
          <Route path="/admin/course/all" element={protectedElement(<ViewAllCourses/>, ["admin"])}/>
          <Route path="/admin/course/update" element={protectedElement(<UpdateCourseForm/>, ["admin"])}/>
          <Route
              path="/admin/grade/:gradeId/course/"
              element={protectedElement(<ViewAllCourses/>, ["admin", "teacher"])}
          />
          <Route path="/admin/student/all" element={protectedElement(<ViewAllStudents/>, ["admin"])}/>
          <Route path="/admin/teacher/all" element={protectedElement(<ViewAllTeachers/>, ["admin"])}/>
          <Route
              path="/teacher/grade/student/all"
              element={protectedElement(<ViewStudentGradewise/>, ["teacher"])}
          />
          <Route path="/user/profile/detail" element={protectedElement(<UserProfile/>, ["admin", "teacher", "student"])}/>
          <Route path="/exam/questions" element={protectedElement(<ViewExamQuestions/>, ["teacher"])}/>
          <Route path="/exam/descriptivequestion" element={protectedElement(<DescriptiveQuestion/>, ["teacher"])}/>

          <Route path="/exam/add" element={protectedElement(<AddExamForm/>, ["teacher"])}/>
          <Route
              path="/exam/grade-wise/upcoming"
              element={protectedElement(<ViewGradeUpcomingExams/>, ["teacher"])}
          />
          <Route
              path="/exam/grade-wise/previous"
              element={protectedElement(<ViewGradePreviousExams/>, ["teacher"])}
          />
          <Route
              path="/exam/student/grade-wise/upcoming"
              element={protectedElement(<ViewStudentUpcomingExams/>, ["student"])}
          />
          <Route
              path="/exam/student/grade-wise/previous"
              element={protectedElement(<ViewStudentPreviousExams/>, ["student"])}
          />
          <Route
              path="/exam/student/grade-wise/previous"
              element={protectedElement(<ViewStudentPreviousExams/>, ["student"])}
          />
          <Route
              // On clicking start Exam this is triggerd
              path="/exam/student/grade-wise/ongoing"
              element={protectedElement(<ViewStudentOngoingExams/>, ["student"])}
          />
          <Route path="/exam/student/system-check" element={protectedElement(<SystemCheckingPage/>, ["student"])}/>
          <Route path="/exam/student/attempt" element={protectedElement(<StudentExamAttempt/>, ["student"])}/>
          <Route path="/exam/student/descriptive/attempt" element={protectedElement(<StudentDescriptiveExamAttempt/>, ["student"])}/>
          <Route path="/exam/student/attemptSpell" element={protectedElement(<StudentExamAttemptSpell/>, ["student"])}/>
          <Route path="/exam/student/attemptBlanks" element={protectedElement(<StudentExamAttemptBlanks/>, ["student"])}/>
          <Route
              path="/exam/student/grade-wise/ask_doubt"
              element={protectedElement(<Chatbot/>, ["student"])}
          />
          <Route
              path="/exam/student/grade-wise/teacherchatting"
              element={protectedElement(<ChatingStudent/>, ["student"])}
          />
          <Route
              path="/exam/student/grade-wise/studentchatting"
              element={protectedElement(<ChatingTeacher/>, ["teacher"])}
          />
          <Route
              path="/exam/student/grade-wise/studentchatting/:studentId"
              element={protectedElement(<ChatingTeacher/>, ["teacher"])}
          />

          <Route
              path="/exam/student/result/all"
              element={protectedElement(<ViewStudentExamResults/>, ["student"])}
          />
          <Route path="/exam/student/result/" element={protectedElement(<ExamResult/>, ["student", "teacher", "admin"])}/>
          <Route
              path="/exam/grade/student/result/"
              element={protectedElement(<ViewGradeWiseStudentExamResults/>, ["teacher"])}
          />
          <Route
              path="/exam/grade/teacher/verify"
              element={protectedElement(<ExamListVerification/>, ["teacher"])}
          />
          <Route
              path="/exam/grade/student/teacher/result/verify"
              element={protectedElement(<VerifyStudent/>, ["teacher"])}
          />
          <Route
              path="/exam/grade-wise/evaluateexam"
              element={protectedElement(<EvaluateDescriptiveQuestion/>, ["teacher"])}
          />
          <Route
              path="/exam/all/student/result/"
              element={protectedElement(<ViewAllStudentExamResults/>, ["admin"])}
          />
          <Route path="/exam/all/" element={protectedElement(<ViewAllExams/>, ["admin"])}/>
          <Route path="/admin/Dashboard" element={protectedElement(<AnalyticsDashboard/>, ["admin"])}/>
        </Routes>
      </div>
  );
}

export default App;
