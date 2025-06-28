"use client";

import Link from "next/link";
import loginSt from "../login/login.module.css";
import rgstrSt from "./register.module.css";
import BirthDropdown from "../components/BirthDropdown";
import { GoCheck } from "react-icons/go";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { register } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const [isNameFocus, setIsNameFocus] = useState(false);
  const [isPwFocus, setIsPwFocus] = useState(false);
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 유효성 검사 상태
  const [emailPhoneError, setEmailPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const nameRef = useRef(null);
  const pwRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const verifyTokenAndRedirect = async () => {
      try {
        await checkToken();
        router.push("/channels/@me");
      } catch (err) {
      }
    };

    verifyTokenAndRedirect();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        nameRef.current &&
        !nameRef.current.contains(event.target) &&
        pwRef.current &&
        !pwRef.current.contains(event.target)
      ) {
        setIsNameFocus(false);
        setIsPwFocus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const inputClick = (event) => {
    const type = event.target.type;
    if (type === "text") {
      setIsNameFocus(true);
      setIsPwFocus(false);
    } else if (type === "password") {
      setIsPwFocus(true);
      setIsNameFocus(false);
    }
  };

  const getFormClasses = () => {
    if (isNameFocus) {
      return `${rgstrSt.loginForm} ${rgstrSt.formHeightName}`;
    } else if (isPwFocus) {
      return `${rgstrSt.loginForm} ${rgstrSt.formHeightPW}`;
    }
    return rgstrSt.loginForm;
  };

  const moveUp = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const moveDown = (y) => ({
    initial: { y: 0 },
    animate: { y },
  });

  // 이메일 또는 전화번호 유효성 검사
  const validateEmailOrPhone = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;

    if (!value) {
      return "이메일 또는 전화번호를 입력해주세요.";
    }

    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return "올바른 이메일 또는 전화번호 형식을 입력해주세요.";
    }

    return "";
  };

  // 비밀번호 유효성 검사
  const validatePassword = (value) => {
    if (!value) {
      return "비밀번호를 입력해주세요.";
    }

    if (value.length < 6) {
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    return "";
  };

  // 비밀번호 확인 유효성 검사
  const validateConfirmPassword = (value, passwordValue) => {
    if (!value) {
      return "비밀번호 확인을 입력해주세요.";
    }

    if (value !== passwordValue) {
      return "비밀번호가 일치하지 않습니다.";
    }

    return "";
  };

  // 이름 유효성 검사
  const validateName = (value) => {
    if (!value) {
      return "이름을 입력해주세요.";
    }

    if (value.length > 10) {
      return "이름은 10자 이하로 입력해주세요.";
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharRegex.test(value)) {
      return "특수 문자는 사용할 수 없습니다.";
    }

    return "";
  };

  // 입력값 변경 핸들러
  const handleEmailOrPhoneChange = (value) => {
    setEmailOrPhone(value);
    setEmailPhoneError(validateEmailOrPhone(value));
    setGeneralError("");
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, value));
    }
    setGeneralError("");
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(value, password));
    setGeneralError("");
  };

  const handleNameChange = (value) => {
    setName(value);
    setNameError(validateName(value));
    setGeneralError("");
  };

  const submit = async () => {
    // 모든 필드 유효성 검사
    const emailPhoneErr = validateEmailOrPhone(emailOrPhone);
    const nameErr = validateName(name);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);

    setEmailPhoneError(emailPhoneErr);
    setNameError(nameErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    // 오류가 있으면 제출하지 않음
    if (emailPhoneErr || nameErr || passwordErr || confirmPasswordErr) {
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      const response = await register(name, emailOrPhone, password);
      if (response) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Register error:", error);

      // 서버 에러 메시지 처리
      if (error.message.includes("이미 가입된")) {
        setEmailPhoneError("이미 가입된 이메일 또는 전화번호입니다.");
      } else if (error.message.includes("이미 사용중인")) {
        setNameError("이미 사용중인 이름입니다.");
      } else if (error.message.includes("500")) {
        setGeneralError("서버 내부 오류가 발생했습니다. (500)");
      } else if (error.message.includes("fetch")) {
        setGeneralError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setGeneralError(error.message || "회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={loginSt.background}>
      <div className={loginSt.logo}></div>
      <motion.div
        className={`${getFormClasses()} ${rgstrSt.loginForm}`}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.1,
          type: "spring",
          stiffness: 600,
          damping: 30,
        }}
      >
        <div className={loginSt.formWrap}>
          <motion.div
            className={rgstrSt.inputUpWrap}
            initial="initial"
            animate={isNameFocus ? "animate" : "initial"}
            variants={moveUp}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div
              className={loginSt.welcomeWrap}
              style={{ marginBottom: "13px" }}
            >
              <p className={loginSt.welcome}>계정 만들기</p>
            </div>

            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={emailPhoneError ? loginSt.inputErrTxt : loginSt.inputTxt}>
                  이메일 또는 전화번호{" "}
                  {!emailPhoneError && <span className={loginSt.required}>*</span>}
                  {emailPhoneError && (
                    <span className={loginSt.inputErrSubTxt}>
                      {" - " + emailPhoneError}
                    </span>
                  )}
                </p>
                <input
                  type="text"
                  className={`${loginSt.input} ${rgstrSt.input}`}
                  required
                  value={emailOrPhone}
                  onChange={(e) => handleEmailOrPhoneChange(e.target.value)}
                />
              </div>
            </div>

            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={nameError ? loginSt.inputErrTxt : loginSt.inputTxt}>
                  이름 {!nameError && <span className={loginSt.required}>*</span>}
                  {nameError && (
                    <span className={loginSt.inputErrSubTxt}>
                      {" - " + nameError}
                    </span>
                  )}
                </p>
                <input
                  type="text"
                  className={`${loginSt.input} ${rgstrSt.input}`}
                  ref={nameRef}
                  onClick={inputClick}
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          <p
            className={`${isNameFocus
              ? `${rgstrSt.inputInfo} ${rgstrSt.showInputInfo}`
              : rgstrSt.inputInfo
              }`}
          >
            다른 회원에게 표시되는 이름이에요. 특수 문자와 이모지를 사용할 수
            없어요.
          </p>

          <motion.div
            className={rgstrSt.inputDownWrap}
            initial="initial"
            animate={isNameFocus ? "animate" : "initial"}
            variants={moveDown(35)}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={passwordError ? loginSt.inputErrTxt : loginSt.inputTxt}>
                  비밀번호 {!passwordError && <span className={loginSt.required}>*</span>}
                  {passwordError && (
                    <span className={loginSt.inputErrSubTxt}>
                      {" - " + passwordError}
                    </span>
                  )}
                </p>
                <input
                  type="password"
                  className={`${loginSt.input} ${rgstrSt.input}`}
                  ref={pwRef}
                  onClick={inputClick}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
                <p
                  className={`${isPwFocus
                    ? `${rgstrSt.inputInfo} ${rgstrSt.showInputInfo}`
                    : rgstrSt.inputInfo
                    }`}
                  style={{ marginTop: "70px" }}
                >
                  제가 유추할 수 있도록 쉽게 만들어주세요.
                </p>
              </div>
            </div>

            <motion.div
              className={rgstrSt.inputDownWrap}
              initial="initial"
              animate={isPwFocus ? "animate" : "initial"}
              variants={moveDown(25)}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className={loginSt.inputTxtWrap}>
                <div className={loginSt.idWrap}>
                  <p className={confirmPasswordError ? loginSt.inputErrTxt : loginSt.inputTxt}>
                    비밀번호 확인 {!confirmPasswordError && <span className={loginSt.required}>*</span>}
                    {confirmPasswordError && (
                      <span className={loginSt.inputErrSubTxt}>
                        {" - " + confirmPasswordError}
                      </span>
                    )}
                  </p>
                  <input
                    type="password"
                    className={`${loginSt.input} ${rgstrSt.input}`}
                    required
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  />
                </div>
              </div>

              <div className={loginSt.inputTxtWrap}>
                <div className={`${loginSt.idWrap} ${rgstrSt.birthWrap}`}>
                  <p className={loginSt.inputTxt}>생년월일</p>
                  <BirthDropdown />
                </div>
              </div>

              <div className={rgstrSt.agreeWrap}>
                <label className={rgstrSt.customCheckbox}>
                  <input type="checkbox" className={rgstrSt.agree} />
                  <span className={rgstrSt.checkmark}>
                    <GoCheck />
                  </span>
                  <p className={rgstrSt.agreeTxt}>
                    (선택사항) Thiscord 소식, 도움말, 스펨을 이메일로
                    보내주세요. 언제든지 취소하실 수 없어요.
                  </p>
                </label>
              </div>

              {generalError && (
                <div style={{
                  color: "#fa777c",
                  fontSize: "14px",
                  marginBottom: "10px",
                  textAlign: "center"
                }}>
                  {generalError}
                </div>
              )}

              <button
                className={loginSt.submit}
                onClick={submit}
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer"
                }}
              >
                {isLoading ? "가입 중..." : "계속하기"}
              </button>

              <p className={`${rgstrSt.agreeTxt} ${rgstrSt.agreeInfo}`}>
                등록하는 순간 Thiscord의{" "}
                <Link href="/policy" className={rgstrSt.goPolicy}>
                  서비스 이용 약관
                </Link>
                과{" "}
                <Link href="/policy" className={rgstrSt.goPolicy}>
                  개인정보 보호 정책
                </Link>
                에 동의하게 됩니다.
              </p>

              <Link href="/login" className={loginSt.goRegister}>
                이미 계정이 있으신가요?
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}