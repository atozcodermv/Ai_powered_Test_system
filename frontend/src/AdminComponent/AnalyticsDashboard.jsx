import React, { useState, useEffect } from "react";
import axios from "axios";
import { config } from "../ConsantsFile/Constants";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const url = config.url.BASE_URL;

const AnalyticsDashboard = () => {
  // Student State
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [studentExams, setStudentExams] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [plagiarismWarning, setPlagiarismWarning] = useState(false);

  // Teacher State
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [grades, setGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [gradeExams, setGradeExams] = useState([]);
  const [gradeResults, setGradeResults] = useState([]);

  // Independent Overall State
  const [allExams, setAllExams] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchAllExams();
  }, []);

  const fetchAllExams = async () => {
    try {
      const resp = await axios.get(`${url}/exam/fetch/all`);
      if (resp.data && resp.data.exams) {
        setAllExams(resp.data.exams);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const resp = await axios.get(`${url}/user/fetch/role-wise?role=Student&status=Active`);
      if (resp.data && resp.data.users) {
        setStudents(resp.data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeachers = async () => {
    try {
      const resp = await axios.get(`${url}/user/fetch/role-wise?role=Teacher&status=Active`);
      if (resp.data && resp.data.users) {
        setTeachers(resp.data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ---------------- STUDENT PERFORMANCE ---------------- //
  const handleStudentSelect = async (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    setStudentResults([]);
    setStudentExams([]);
    setPerformanceData([]);
    setPlagiarismWarning(false);

    if (sId) {
      try {
        const studentObj = students.find((s) => s.id === parseInt(sId));
        if (studentObj && studentObj.grade) {
          const exRes = await axios.get(`${url}/exam/fetch/all/grade-wise?gradeId=${studentObj.grade.id}`);
          if (exRes.data && exRes.data.exams) {
            setStudentExams(exRes.data.exams);
          }
        }

        const resRes = await axios.get(`${url}/exam/result/fetch/student-wise?studentId=${sId}`);
        if (resRes.data && resRes.data.results) {
          const sorted = resRes.data.results.sort((a,b) => a.id - b.id);
          setStudentResults(sorted);
        }

        // Fetch specialized performance data (labels and percentages)
        const perfRes = await axios.get(`${url}/exam/result/fetch/performance?studentId=${sId}`);
        if (perfRes.data) {
          setPerformanceData(perfRes.data);
        }

        const plagRes = await axios.get(`${url}/descriptive/plagiarism/student?studentId=${sId}`);
        if (plagRes.data && plagRes.data.results) {
          const hasCheat = plagRes.data.results.some((r) => r.plagiarismStatus === true);
          setPlagiarismWarning(hasCheat);
        }

      } catch (err) {
        console.error("Error fetching student data", err);
      }
    }
  };

  // Student Chart 1: Exam Performance (Pie Chart) - Uses backend-calculated percentages
  const chart1Data = {
    labels: performanceData.map(item => item[0]), // Exam Names
    datasets: [{
      label: 'Performance (%)',
      data: performanceData.map(item => parseFloat(item[1]).toFixed(2)), // Percentages
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
      ],
      borderWidth: 1
    }]
  };

  // Student Chart 2: Participation
  const attemptedCount = studentResults.length;
  // Exams assigned to student (via grade) but no result
  const assignedExamIds = studentExams.map(ex => ex.id);
  const attemptedExamIds = studentResults.map(r => r.exam.id);
  const notAttemptedCount = assignedExamIds.filter(id => !attemptedExamIds.includes(id)).length;
  
  const totalAssigned = assignedExamIds.length;
  const attemptedPercentage = totalAssigned === 0 ? 0 : ((attemptedCount / totalAssigned) * 100).toFixed(1);
  const notAttemptedPercentage = totalAssigned === 0 ? 0 : ((notAttemptedCount / totalAssigned) * 100).toFixed(1);

  const chart2Data = {
    labels: ['Attempted (%)', 'Not Attempted (%)'],
    datasets: [{
      data: [attemptedPercentage, notAttemptedPercentage],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)']
    }]
  };

  // Student Chart 3: Progress Line
  const studentExamLabels = studentResults.map((r) => r.exam.name);
  const studentMarks = studentResults.map((r) => r.score);
  const chart3Data = {
    labels: studentExamLabels,
    datasets: [{
      label: 'Marks Obtained',
      data: studentMarks,
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: 'rgba(153, 102, 255, 1)'
    }]
  };


  // ---------------- TEACHER PERFORMANCE ---------------- //
  const handleTeacherSelect = async (e) => {
    const tId = e.target.value;
    setSelectedTeacherId(tId);
    setGrades([]);
    setSelectedGradeId("");
    setGradeExams([]);
    setGradeResults([]);

    if (tId) {
      try {
        const grdRes = await axios.get(`${url}/grade/fetch/teacher?teacherId=${tId}`);
        if (grdRes.data && grdRes.data.grades) {
          setGrades(grdRes.data.grades);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGradeSelect = async (e) => {
    const gId = e.target.value;
    setSelectedGradeId(gId);
    setGradeExams([]);
    setGradeResults([]);

    if (gId) {
      try {
        const exRes = await axios.get(`${url}/exam/fetch/all/grade-wise?gradeId=${gId}`);
        if (exRes.data && exRes.data.exams) {
          setGradeExams(exRes.data.exams);
        }
        const resRes = await axios.get(`${url}/exam/result/fetch/grade-wise?gradeId=${gId}`);
        if (resRes.data && resRes.data.results) {
          setGradeResults(resRes.data.results);
        }
      } catch (err) {
         console.error(err);
      }
    }
  };

  // Teacher Chart 1: Pass vs Fail
  let passedCount = 0;
  let failedCount = 0;
  gradeResults.forEach((r) => {
      // Assuming 40% is pass threshold
      const percentage = (r.marksObtained / (r.exam.totalMarks || 1)) * 100;
      if (percentage >= 40) passedCount++;
      else failedCount++;
  });
  const totalStudentsAttempted = passedCount + failedCount;
  const passedPercentage = totalStudentsAttempted === 0 ? 0 : ((passedCount / totalStudentsAttempted) * 100).toFixed(1);
  const failedPercentage = totalStudentsAttempted === 0 ? 0 : ((failedCount / totalStudentsAttempted) * 100).toFixed(1);

  const tChart1Data = {
    labels: ['Passed (%)', 'Failed (%)'],
    datasets: [{
      data: [passedPercentage, failedPercentage],
      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
    }]
  };

  // Teacher Chart 2: Performance Progress
  // Group results by exam
  const examResultMap = {};
  gradeExams.forEach(ex => { examResultMap[ex.id] = { name: ex.name, passed: 0, total: 0 }; });
  
  gradeResults.forEach(r => {
      if (examResultMap[r.exam.id]) {
          examResultMap[r.exam.id].total++;
          const percentage = (r.marksObtained / (r.exam.totalMarks || 1)) * 100;
          if (percentage >= 40) examResultMap[r.exam.id].passed++;
      }
  });

  const tExamsWithResults = Object.values(examResultMap).filter(x => x.total > 0);
  const tProgressLabels = tExamsWithResults.map(x => x.name); // Using exam names or we can use passed counts as X as requested
  // Requested: "x-axis represents number of students who passed, y represents total students"
  // Usually line graph is X=Exam, Y1=Passed, Y2=Total. We will plot X=Exam Name to make it readable.
  const tPassedData = tExamsWithResults.map(x => x.passed);
  const tTotalData = tExamsWithResults.map(x => x.total);

  const tChart2Data = {
    labels: tProgressLabels,
    datasets: [
      {
        label: 'Passed Students',
        data: tPassedData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Total Students Attempted',
        data: tTotalData,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
      }
    ]
  };

  // Overall Chart 3: Independent Scheduled Exams (Pie Chart)
  // Shows MCQ vs Descriptive stats for ALL exams in the system
  let totalMcq = 0;
  let totalDesc = 0;
  allExams.forEach(ex => {
    if (ex.examType === "MCQ" || ex.examType === "mcq" || ex.examType === "Mcq" || ex.examType === "Objective") totalMcq++;
    else totalDesc++;
  });

  const overallExamChartData = {
    labels: ['Objective (MCQ)', 'Descriptive'],
    datasets: [{
      data: [totalMcq, totalDesc],
      backgroundColor: ['rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)'],
      borderWidth: 1
    }]
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center text-color mb-4">Analytics Dashboard</h2>

      {/* ----------- STUDENT SECTION ----------- */}
      <div className="card shadow mb-5">
        <div className="card-header custom-bg-text bg-color">
          <h4 className="mb-0">Student Performance</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label text-color"><b>Select Student</b></label>
              <select className="form-select" onChange={handleStudentSelect} value={selectedStudentId}>
                <option value="">Select Student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          {!selectedStudentId ? (
             <div className="text-center text-muted">Please select a student to view analytics.</div>
          ) : studentResults.length === 0 ? (
             <div className="text-center text-danger"><h5>Student did not give any test yet.</h5></div>
          ) : (
             <div className="row mt-4">
                {plagiarismWarning && (
                   <div className="alert alert-danger text-center">
                     <h5><b>Warning: Cheating detected in exam.</b></h5>
                   </div>
                )}
                <div className="col-md-4">
                  <h6 className="text-center text-color">Exam Performance (%)</h6>
                  <Pie data={chart1Data} options={{ maintainAspectRatio: true }} />
                </div>
                <div className="col-md-4">
                  <h6 className="text-center text-color">Exam Participation</h6>
                  <Pie data={chart2Data} options={{ maintainAspectRatio: true }} />
                </div>
                <div className="col-md-4">
                  <h6 className="text-center text-color">Progress (Marks)</h6>
                  <Line data={chart3Data} options={{ maintainAspectRatio: true }} />
                </div>
             </div>
          )}
        </div>
      </div>

      {/* ----------- TEACHER SECTION ----------- */}
      <div className="card shadow">
        <div className="card-header custom-bg-text bg-color">
          <h4 className="mb-0">Teacher Performance</h4>
        </div>
        <div className="card-body">
          {teachers.length === 0 ? (
            <div className="text-center text-danger"><h5>No teachers available in the portal.</h5></div>
          ) : (
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label text-color"><b>Select Teacher</b></label>
                <select className="form-select" onChange={handleTeacherSelect} value={selectedTeacherId}>
                  <option value="">Select Teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label text-color"><b>Select Grade</b></label>
                <select className="form-select" onChange={handleGradeSelect} value={selectedGradeId} disabled={!selectedTeacherId}>
                  <option value="">Select Grade...</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedTeacherId && grades.length === 0 && (
             <div className="text-center text-danger"><h5>No grade assigned to this teacher yet.</h5></div>
          )}

          {selectedGradeId && gradeExams.length === 0 && (
             <div className="text-center text-danger"><h5>No exams available for this grade.</h5></div>
          )}

          {selectedGradeId && gradeExams.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-6">
                 <h6 className="text-center text-color">Pass vs Fail (%)</h6>
                 {gradeResults.length > 0 ? (
                    <Pie data={tChart1Data} options={{ maintainAspectRatio: true }} />
                 ) : (
                    <div className="text-center text-muted">No student results found for these exams.</div>
                 )}
              </div>
              <div className="col-md-6">
                 <h6 className="text-center text-color">Teacher Performance Progress</h6>
                 {gradeResults.length > 0 ? (
                    <Line data={tChart2Data} options={{ maintainAspectRatio: true }} />
                 ) : (
                    <div className="text-center text-muted">No student results yet.</div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ----------- OVERALL EXAM STATS SECTION ----------- */}
      <div className="card shadow mt-5">
        <div className="card-header custom-bg-text bg-color">
          <h4 className="mb-0">Overall Exam Statistics</h4>
        </div>
        <div className="card-body">
           <div className="row justify-content-center">
              <div className="col-md-6">
                 <h6 className="text-center text-color">Scheduled Exams (Distribution)</h6>
                 {allExams.length > 0 ? (
                    <div style={{ maxHeight: '350px' }}>
                       <Pie data={overallExamChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                 ) : (
                    <div className="text-center text-danger"><h5>No exams are scheduled yet.</h5></div>
                 )}
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
