import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { config } from '../ConsantsFile/Constants';
import {
  allowedDomainsMessage,
  getRegistrationFieldErrorsFromMessage,
  showErrorToast,
  showValidationToast,
  successToastOptions,
  validateAdminRegistration,
} from "./registerValidation";
const url = config.url.BASE_URL;

const AdminRegisterForm = () => {
  let navigate = useNavigate();
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const [registerRequest, setRegisterRequest] = useState({
    emailId: "",
    password: "",
    phoneNo: "",
  });
  const [errors, setErrors] = useState({});

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "emailId") {
      nextValue = value.trimStart().toLowerCase();
    }

    if (name === "phoneNo") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setRegisterRequest((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const registerAdmin = (e) => {
    e.preventDefault();

    const validationErrors = validateAdminRegistration(registerRequest);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showValidationToast(validationErrors);
      return;
    }

    fetch(url + "/user/admin/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
      },
      body: JSON.stringify(registerRequest),
    })
      .then((result) => {
        result.json().then((res) => {
          if (res.success) {
            toast.success(res.responseMessage, successToastOptions);

            setTimeout(() => {
              navigate("/home");
            }, 1400);
          } else {
            const serverErrors = getRegistrationFieldErrorsFromMessage(
              res.responseMessage
            );
            if (Object.keys(serverErrors).length > 0) {
              setErrors((prev) => ({ ...prev, ...serverErrors }));
            }
            showErrorToast(res.responseMessage || "It seems server is down.");
          }
        });
      })
      .catch((error) => {
        console.error(error);
        showErrorToast("It seems server is down.");
      });
  };

  return (
    <div>
      <div className="mt-2 d-flex aligns-items-center justify-content-center">
        <div className="form-card border-color mb-2" style={{ width: "25rem" }}>
          <div className="container-fluid">
            <div
              className="card-header bg-color custom-bg-text mt-2 d-flex justify-content-center align-items-center"
              style={{
                borderRadius: "1em",
                height: "38px",
              }}
            >
              <h4 className="card-title">Admin Register</h4>
            </div>
            <div className="card-body mt-3">
              <form noValidate>
                <div className="mb-3 text-color">
                  <label htmlFor="emailId" className="form-label">
                    <b>Email Id</b>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.emailId ? "validation-input" : ""}`}
                    id="emailId"
                    name="emailId"
                    onChange={handleUserInput}
                    value={registerRequest.emailId}
                    maxLength={254}
                  />
                  <div className="form-text">
                    Allowed domains: {allowedDomainsMessage.replace("Email Id must use one of these domains: ", "")}
                  </div>
                  {errors.emailId && (
                    <div className="validation-feedback">{errors.emailId}</div>
                  )}
                </div>
                <div className="mb-3 text-color">
                  <label htmlFor="phoneNo" className="form-label">
                    <b>Contact Number</b>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phoneNo ? "validation-input" : ""}`}
                    id="phoneNo"
                    name="phoneNo"
                    onChange={handleUserInput}
                    value={registerRequest.phoneNo}
                    maxLength={10}
                  />
                  {errors.phoneNo && (
                    <div className="validation-feedback">{errors.phoneNo}</div>
                  )}
                </div>
                <div className="mb-3 text-color">
                  <label htmlFor="password" className="form-label">
                    <b>Password</b>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "validation-input" : ""}`}
                    id="password"
                    name="password"
                    onChange={handleUserInput}
                    value={registerRequest.password}
                    autoComplete="on"
                  />
                  {errors.password && (
                    <div className="validation-feedback">{errors.password}</div>
                  )}
                </div>
                <div className="d-flex aligns-items-center justify-content-center">
                  <button
                    type="submit"
                    className="btn bg-color custom-bg-text mb-2"
                    onClick={registerAdmin}
                  >
                    Register
                  </button>
                </div>

                <ToastContainer />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterForm;
