import { Link } from "react-router-dom";

const NormalHeader = () => {
  return (
      <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
          <li className="nav-item">
              <Link to="/user/login" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
                  Login User
              </Link>
          </li>
          <li className="nav-item">
              <Link to="/user/studentregister" className="nav-link fw-semibold hover-effect text-dark" aria-current="page">
                  Student Register
              </Link>
          </li>
      </ul>
  );
};

export default NormalHeader;
