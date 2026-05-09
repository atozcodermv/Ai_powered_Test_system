import React from "react";
import { toast } from "react-toastify";

const nameRegex = /^[A-Za-z]{2,50}$/;
const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
export const allowedEmailDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
];
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
const phoneRegex = /^[6-9][0-9]{9}$/;
const streetRegex = /^[A-Za-z0-9 ,.-]{5,100}$/;
const cityRegex = /^[A-Za-z ]{2,50}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
export const allowedDomainsMessage =
  "Email Id must use one of these domains: @gmail.com, @outlook.com, @yahoo.com, @icloud.com, @proton.me, @zoho.com, or @yandex.com.";

const popupBaseStyle = {
  padding: "0.35rem 0.15rem",
};

const titleStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  marginBottom: "0.5rem",
};

const listStyle = {
  margin: 0,
  paddingLeft: "1rem",
  lineHeight: 1.5,
  fontSize: "0.92rem",
};

const toastOptions = {
  position: "top-center",
  autoClose: 3200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const ValidationToast = ({ title, messages }) => (
  <div style={popupBaseStyle}>
    <div style={titleStyle}>{title}</div>
    <ul style={listStyle}>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  </div>
);

export const successToastOptions = {
  ...toastOptions,
  autoClose: 1400,
};

export const showValidationToast = (errors) => {
  const messages = Object.values(errors);
  if (!messages.length) {
    return;
  }

  toast.dismiss();
  toast.error(
    <ValidationToast
      title="Please correct the highlighted fields"
      messages={messages}
    />,
    toastOptions
  );
};

export const showErrorToast = (message) => {
  toast.dismiss();
  toast.error(
    <ValidationToast
      title="Registration could not be completed"
      messages={[message]}
    />,
    toastOptions
  );
};

const hasAllowedEmailDomain = (emailId) => {
  const normalizedEmail = String(emailId || "").trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf("@");

  if (atIndex === -1) {
    return false;
  }

  const domain = normalizedEmail.slice(atIndex + 1);
  return allowedEmailDomains.includes(domain);
};

export const getRegistrationFieldErrorsFromMessage = (message) => {
  const normalizedMessage = String(message || "").toLowerCase();
  const errors = {};

  if (normalizedMessage.includes("email")) {
    errors.emailId = message;
  }

  if (
    normalizedMessage.includes("contact number") ||
    normalizedMessage.includes("mobile number") ||
    normalizedMessage.includes("phone")
  ) {
    errors.phoneNo = message;
  }

  return errors;
};

export const validateAdminRegistration = (form) => {
  const errors = {};

  if (!form.emailId?.trim()) {
    errors.emailId = "Email Id is required.";
  } else if (form.emailId.length > 254) {
    errors.emailId = "Email Id must not exceed 254 characters.";
  } else if (!emailRegex.test(form.emailId.trim())) {
    errors.emailId = "Enter a valid email address.";
  } else if (!hasAllowedEmailDomain(form.emailId)) {
    errors.emailId = allowedDomainsMessage;
  }

  if (!form.password?.trim()) {
    errors.password = "Password is required.";
  } else if (!passwordRegex.test(form.password)) {
    errors.password =
      "Password must be 8-16 characters and include uppercase, lowercase, number, and special character.";
  }

  if (!form.phoneNo?.trim()) {
    errors.phoneNo = "Contact Number is required.";
  } else if (!phoneRegex.test(form.phoneNo.trim())) {
    errors.phoneNo =
      "Contact Number must be a valid 10-digit Indian mobile number.";
  }

  return errors;
};

export const validateUserRegistration = (
  form,
  { requireGrade = false, requireAssignedTeacher = false } = {}
) => {
  const errors = {};

  if (!form.firstName?.trim()) {
    errors.firstName = "First Name is required.";
  } else if (!nameRegex.test(form.firstName.trim())) {
    errors.firstName =
      "First Name must contain only letters and be 2-50 characters long.";
  }

  if (!form.lastName?.trim()) {
    errors.lastName = "Last Name is required.";
  } else if (!nameRegex.test(form.lastName.trim())) {
    errors.lastName =
      "Last Name must contain only letters and be 2-50 characters long.";
  }

  if (!form.emailId?.trim()) {
    errors.emailId = "Email Id is required.";
  } else if (form.emailId.length > 254) {
    errors.emailId = "Email Id must not exceed 254 characters.";
  } else if (!emailRegex.test(form.emailId.trim())) {
    errors.emailId = "Enter a valid email address.";
  } else if (!hasAllowedEmailDomain(form.emailId)) {
    errors.emailId = allowedDomainsMessage;
  }

  if (!form.password?.trim()) {
    errors.password = "Password is required.";
  } else if (!passwordRegex.test(form.password)) {
    errors.password =
      "Password must be 8-16 characters and include uppercase, lowercase, number, and special character.";
  }

  if (!form.phoneNo?.trim()) {
    errors.phoneNo = "Contact Number is required.";
  } else if (!phoneRegex.test(form.phoneNo.trim())) {
    errors.phoneNo =
      "Contact Number must be a valid 10-digit Indian mobile number.";
  }

  if (!form.street?.trim()) {
    errors.street = "Street is required.";
  } else if (!streetRegex.test(form.street.trim())) {
    errors.street =
      "Street must be 5-100 characters and can include letters, numbers, spaces, commas, periods, and hyphens.";
  }

  if (!form.city?.trim()) {
    errors.city = "City is required.";
  } else if (!cityRegex.test(form.city.trim())) {
    errors.city = "City must contain only letters and spaces, 2-50 characters.";
  }

  if (!form.pincode?.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!pincodeRegex.test(form.pincode.trim())) {
    errors.pincode = "Pincode must be a valid 6-digit Indian postal code.";
  }

  if (requireGrade && !String(form.gradeId || "").trim()) {
    errors.gradeId = "Please select a grade.";
  }

  if (
    requireAssignedTeacher &&
    String(form.gradeId || "").trim() &&
    !String(form.teacherId || "").trim()
  ) {
    errors.gradeId = "The selected grade does not have an assigned teacher.";
  }

  return errors;
};
