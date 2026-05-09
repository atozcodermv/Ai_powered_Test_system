import { Link } from "react-router-dom";
import RoleNav from "./RoleNav";
import logo from "../images/e_logo.png";

const Header = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-white shadow-sm py-2">
        <div className="container-fluid px-4">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src={logo}
              height="45"
              width="auto"
              className="d-inline-block align-top me-2"
              alt="Logo"
            />
            <i>
              <b className="text-color-second fs-4" style={{ letterSpacing: '0.5px' }}>SMART EXAM PORTAL</b>
            </i>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div 
            className="collapse navbar-collapse" 
            id="navbarSupportedContent"
            onClick={(e) => {
              if (e.target.closest('a') || e.target.closest('.nav-link')) {
                const collapseEl = document.getElementById('navbarSupportedContent');
                if (collapseEl && collapseEl.classList.contains('show')) {
                  const toggler = document.querySelector('.navbar-toggler');
                  if (toggler) toggler.click();
                }
              }
            }}
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3">
              <li className="nav-item">
                <Link to="/aboutus" className="nav-link fw-semibold text-dark hover-effect" aria-current="page">
                  About Us
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/contactus"
                  className="nav-link fw-semibold text-dark hover-effect"
                  aria-current="page"
                >
                  Contact Us
                </Link>
              </li>
            </ul>

            <RoleNav />
          </div>
        </div>
      </nav>
      {/* Adding a small global style bump for nav-links to feel modern */}
      <style>{`
        .hover-effect { transition: color 0.2s ease-in-out, transform 0.2s ease; }
        .hover-effect:hover { color: #004a99 !important; transform: translateY(-1px); }
      `}</style>
    </div>
  );
};

export default Header;
