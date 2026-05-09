export const getTeacherAssignedGrades = (teacher) => {
  if (!teacher) {
    return [];
  }

  const gradeMap = new Map();
  const candidateGrades = [];

  if (Array.isArray(teacher.grades)) {
    candidateGrades.push(...teacher.grades);
  }

  if (teacher.grade) {
    candidateGrades.push(teacher.grade);
  }

  candidateGrades.forEach((grade) => {
    if (grade?.id && !gradeMap.has(grade.id)) {
      gradeMap.set(grade.id, grade);
    }
  });

  return Array.from(gradeMap.values());
};

export const getTeacherPrimaryGrade = (teacher) =>
  getTeacherAssignedGrades(teacher)[0] || null;

export const normalizeTeacherSession = (teacher) => {
  if (!teacher) {
    return null;
  }

  const grades = getTeacherAssignedGrades(teacher);

  return {
    ...teacher,
    grades,
    grade: teacher.grade?.id ? teacher.grade : grades[0] || null,
  };
};

export const getActiveTeacher = () => {
  try {
    const storedTeacher = sessionStorage.getItem("active-teacher");
    return storedTeacher ? normalizeTeacherSession(JSON.parse(storedTeacher)) : null;
  } catch (error) {
    return null;
  }
};

export const getTeacherGradeGuardMessage = (teacher) => {
  if (!teacher?.id) {
    return "Your teacher session is not available. Please log in again.";
  }

  if (!getTeacherAssignedGrades(teacher).length) {
    return "No grade is assigned to your teacher account yet. Assign a grade first, then this page will become available.";
  }

  return "";
};
