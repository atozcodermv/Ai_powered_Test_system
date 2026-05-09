import { useState, useEffect } from "react";
import AdminHeader from "./AdminHeader";
import HeaderStudent from "./HeaderStudent";
import HeaderTeacher from "./HeaderTeacher";
import NormalHeader from "./NormalHeader";
import { getAuthSession } from "../utils/authSession";

const RoleNav = () => {
  const [authTrigger, setAuthTrigger] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => setAuthTrigger((prev) => prev + 1);
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const teacher = getAuthSession("teacher");
  const admin = getAuthSession("admin");
  const student = getAuthSession("student");

  if (teacher != null) {
    return <HeaderTeacher />;
  } else if (admin != null) {
    return <AdminHeader />;
  } else if (student != null) {
    return <HeaderStudent />;
  } else {
    return <NormalHeader />;
  }
};

export default RoleNav;
