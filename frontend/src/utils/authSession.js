const ROLE_CONFIG = {
  admin: {
    sessionKey: "active-admin",
    tokenKey: "admin-jwtToken",
    roleName: "Admin",
  },
  teacher: {
    sessionKey: "active-teacher",
    tokenKey: "teacher-jwtToken",
    roleName: "Teacher",
  },
  student: {
    sessionKey: "active-student",
    tokenKey: "student-jwtToken",
    roleName: "Student",
  },
};

export const roleNames = Object.keys(ROLE_CONFIG);

export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
    return JSON.parse(atob(paddedBase64));
  } catch (error) {
    return null;
  }
};

export const isTokenValid = (token) => {
  const decodedToken = parseJwt(token);
  return Boolean(decodedToken?.exp && decodedToken.exp * 1000 > Date.now());
};

export const clearAuthSession = () => {
  roleNames.forEach((role) => {
    sessionStorage.removeItem(ROLE_CONFIG[role].sessionKey);
    sessionStorage.removeItem(ROLE_CONFIG[role].tokenKey);
  });
  sessionStorage.removeItem("active-exam-session");
  window.dispatchEvent(new Event("auth-change"));
};

export const getAuthSession = (role) => {
  const config = ROLE_CONFIG[role];
  if (!config) {
    return null;
  }

  const token = sessionStorage.getItem(config.tokenKey);
  const userValue = sessionStorage.getItem(config.sessionKey);

  if (!token || !userValue || !isTokenValid(token)) {
    return null;
  }

  try {
    const user = JSON.parse(userValue);
    if (user?.role && user.role !== config.roleName) {
      return null;
    }

    return { role, token, user };
  } catch (error) {
    return null;
  }
};

export const getActiveAuthSession = () =>
  roleNames.map(getAuthSession).find(Boolean) || null;

export const isAuthenticatedForRoles = (allowedRoles = roleNames) =>
  allowedRoles.some((role) => Boolean(getAuthSession(role)));

export const getActiveJwtToken = () => getActiveAuthSession()?.token || "";

const PUBLIC_PATHS = [
  "/",
  "/home",
  "/user/admin/register",
  "/user/login",
  "/user/forgetpassword",
  "/user/studentregister",
  "/aboutus",
  "/contactus",
];

export const isPublicRoute = (pathname = window.location.pathname) =>
  PUBLIC_PATHS.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );
