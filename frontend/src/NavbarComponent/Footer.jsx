import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="footer bg-light text-center py-4 mt-auto border-top shadow-sm">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 text-secondary">
            <h5 className="fw-bold mb-3 text-dark" style={{ letterSpacing: "1px" }}>SMART EXAM PORTAL</h5>
            <p className="mb-2" style={{ fontSize: "0.95rem" }}>
              Empowering education through seamless assessment and modern tracking tools. 
            </p>
            <div className="d-flex justify-content-center gap-4 mt-3 mb-3">
              <Link to="/aboutus" className="text-secondary text-decoration-none hover-effect fw-semibold">About Us</Link>
              <Link to="/contactus" className="text-secondary text-decoration-none hover-effect fw-semibold">Contact Us</Link>
            </div>
            <hr className="w-50 mx-auto" />
            <small className="d-block mt-3 mb-0">
               © {new Date().getFullYear()} Smart Exam Portal. All Rights Reserved.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
