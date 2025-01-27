import logo from "../assets/images/logo.png";
import labels from "../configs/Label/index.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../configs/firebase/index.js";
import { validateEmailAddress, validateText } from "../utils/validate.js";
import useAuth from "../hooks/useAuth.js";
import { getDocById } from "../utils/firestore.js";
import PasswordHideIcon from "../assets/images/PassWordHideIcon.jsx";
import PasswordShowIcon from "../assets/images/PassWordShowIcon.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [cookieValue, setCookieValue] = useState("");
  const [values, setValues] = useState({
    email: "",
    password: "",
    rememberMe: "",
  });
  const [errors, setErrors] = useState({
    email: null,
    password: null,
  });
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setValues((prevState) => ({
      ...prevState,
      rememberMe: isChecked,
    }));
  };

  const handleLogin = useCallback(() => {
    if (!values.email) {
      const textError = validateText(values.email);
      setErrors((prevState) => ({
        ...prevState,
        email: textError,
      }));
    }
    if (!values.password) {
      const textError = validateText(values.password);
      setErrors((prevState) => ({
        ...prevState,
        password: textError,
      }));
    }
    if (values.email) {
      const emailError = validateEmailAddress(values.email);
      setErrors((prevState) => ({
        ...prevState,
        email: emailError,
      }));
      if (emailError) return;
    }
    if (validateEmailAddress(values.email) === null && values.password) {
      setLoading(true);
      signInWithEmailAndPassword(
        auth,
        values.email.toLocaleLowerCase(),
        values.password
      )
        .then(async (userCredentail) => {
          const user = userCredentail.user;
          const response = await getDocById("users", user?.uid);
          setCookieValue(response);
          localStorage.setItem("user", JSON.stringify(user));
          Cookies.set("loginCookie", JSON.stringify(cookieValue), {
            expires: 7,
          });
          setAuth({ user: response });
          setTimeout(() => {
            setLoading(false);
            navigate("/dashboard");
            toast.success(labels.loginSuccess);
          }, 500);
        })
        .catch((error) => {
          setLoading(false);
          if (error.code === "auth/user-not-found") {
            toast.error("User Not Found.");
            return;
          }
          if (error.code === "auth/too-many-requests") {
            toast.error("Too Many Request.");
            return;
          }
          if (error.code === "auth/wrong-password") {
            toast.error("Invalid Password.");
            return;
          }
          if (error.code === "auth/invalid-email") {
            toast.error("Email address invalid.");
            return;
          }
        });
    }
  }, [values, setErrors, navigate, setLoading]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };
  return (
    <div className="w-full min-h-screen grid place-content-center">
      <div className="flex flex-col gap-y-16 items-center justify-between">
        <div className="image_container text-center">
          <img src={logo} alt="calimero-pizza-logo" className="w-64 h-32" />
        </div>
        <div className="text_container text-center flex flex-col gap-y-1">
          <p className="text-c_000 text-[32px] font-generalSansSemiBold">
            {labels.welcomeBackAdmin}
          </p>
          <p className="text-c_0E1014/50 text-[13px] font-generalSansRegular">
            {labels.enterTheEmail}
          </p>
        </div>
      </div>
      <div className="form_container flex flex-col gap-y-4 mt-8 mb-8">
        <Input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => {
            setErrors((prevState) => ({
              ...prevState,
              email: null,
            }));
            setValues((prevState) => ({
              ...prevState,
              email: e.target.value.replace(/\s/g, ""),
            }));
          }}
          error={Boolean(errors.email)}
          errorText={errors.email}
          onKeyDown={handleKeyDown}
          className={`w-full border border-c_E2E2E2 rounded-[12px] py-2 px-4 text-[13px] font-generalSansRegular text-c_0E1014 outline-none placeholder:!text-c_0E1014/50`}
          placeholder={labels.enterEmail}
        />
        <div className="flex flex-col w-full justify-center relative">
          <Input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            value={values.password}
            onChange={(e) => {
              setErrors((prevState) => ({
                ...prevState,
                password: null,
              }));
              setValues((prevState) => ({
                ...prevState,
                password: e.target.value.replace(/\s/g, ""),
              }));
            }}
            error={Boolean(errors.password)}
            errorText={errors.password}
            onKeyDown={handleKeyDown}
            className={`w-full border border-c_E2E2E2 rounded-[12px] py-2 pr-10 text-[13px] font-generalSansRegular text-c_0E1014 outline-none px-4 placeholder:!text-c_0E1014/50`}
            placeholder={labels.enterPassword}
          />
          {isPasswordVisible ? (
            <button onClick={() => setIsPasswordVisible(false)}>
              <PasswordShowIcon className="absolute right-4 top-3 cursor-pointer" />
            </button>
          ) : (
            <button onClick={() => setIsPasswordVisible(true)}>
              <PasswordHideIcon className="absolute right-4 top-2.5 cursor-pointer" />
            </button>
          )}
        </div>
        <div className="md:flex md:items-center">
          <label className="flex items-center">
            <input
              onChange={handleCheckboxChange}
              checked={values.rememberMe}
              className="mr-2 leading-tight"
              type="checkbox"
            />
            <span className="text-[13px] font-generalSansRegular select-none">
              {labels.rememberMe}
            </span>
          </label>
        </div>
        <Button
          label={labels.login}
          disabled={loading}
          loading={loading}
          onClick={handleLogin}
          className="bg-c_ED3237 text-c_fff rounded-[12px] py-2 font-generalSansRegular"
        />
      </div>
    </div>
  );
};

export default Login;
