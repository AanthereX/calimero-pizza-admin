import { toast } from "react-toastify";

const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const validateEmailAddress = (val) => {
  if (val && !emailRegex.test(val)) {
    return "Invalid email address";
  }
  return null;
};

const validateText = (val) => {
  if (!val) {
    return "Please fill this field";
  }
  return null;
};

const validateOnlySpace = (val) => {
  if (val.trim() === "") {
    return "Can't be only spaces";
  }
  return null;
};

function validateLatitude(val) {
  const regex = /^-?\d+(\.\d+)?$/;
  if (regex.test(val)) {
    return null;
  } else {
    return "The latitude value is incorrect";
  }
}

function validateLongitude(val) {
  const regex = /^-?\d+(\.\d+)?$/;
  if (regex.test(val)) {
    return null;
  } else {
    return "The longitude value is incorrect";
  }
}

const validateLength = (val) => {
  const trimmedVal = val.trim();

  if (trimmedVal.length < 3) {
    return "Minimum 3 (three) characters required";
  }
  return null;
};

const checkInternetConnection = () => {
  if (!navigator.onLine) {
    toast?.error("No Internet Connection Found!");
  }
  return navigator.onLine;
};

export {
  validateEmailAddress,
  validateText,
  validateLength,
  validateOnlySpace,
  checkInternetConnection,
  validateLatitude,
  validateLongitude,
};
