"use client";

import Link from "next/link";
import styles from "./login.module.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { login } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/counterSlice";
import { loginSignal } from "@/counterSlice";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

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

  const submit = async () => {
    setIsLoading(true);
    setErr(false);
    setErrorMessage("");

    try {
      const response = await login(emailOrPhone, password);
      if (response) {
        dispatch(
          setUserInfo({
            name: response.userInfo.name,
            iconColor: response.userInfo.iconColor,
          })
        );
        dispatch(loginSignal());
        router.push("/channels/me");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr(true);

      // 서버 에러 응답 파싱
      if (error.message === "Unauthorized") {
        setErrorMessage("유효하지 않은 아이디 또는 비밀번호입니다.");
      } else if (error.message.includes("fetch")) {
        setErrorMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      } else if (error.message.includes("500")) {
        setErrorMessage("서버 내부 오류가 발생했습니다. (500)");
      } else if (error.message.includes("404")) {
        setErrorMessage("요청한 서비스를 찾을 수 없습니다. (404)");
      } else if (error.message.includes("403")) {
        setErrorMessage("접근이 거부되었습니다. (403)");
      } else {
        setErrorMessage(error.message || "로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (err) {
      setErr(false);
      setErrorMessage("");
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.logo}></div>
      <motion.div
        className={styles.loginForm}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.2,
          type: "spring",
          stiffness: 600,
          damping: 30,
        }}
      >
        <div className={styles.formWrap}>
          <div className={styles.welcomeWrap}>
            <p className={styles.welcome}>돌아오신 것을 환영해요!</p>
            <p className={styles.subWelcome}>다시 만나다니 너무 반가워요!</p>
          </div>

          <div className={styles.inputWrap}>
            <div className={styles.inputTxtWrap}>
              <div className={styles.idWrap}>
                {!err ? (
                  <p className={styles.inputTxt}>
                    이메일 또는 전화번호{" "}
                    <span className={styles.required}>*</span>
                  </p>
                ) : (
                  <p className={styles.inputErrTxt}>
                    이메일 또는 전화번호 -{" "}
                    <span className={styles.inputErrSubTxt}>
                      {errorMessage}
                    </span>
                  </p>
                )}
                <input
                  type="text"
                  className={styles.input}
                  required
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    handleInputChange();
                  }}
                />
              </div>
            </div>
            <div className={styles.inputTxtWrap}>
              <div className={styles.idWrap}>
                {!err ? (
                  <p className={styles.inputTxt}>
                    비밀번호 <span className={styles.required}>*</span>
                  </p>
                ) : (
                  <p className={styles.inputErrTxt}>
                    비밀번호 -{" "}
                    <span className={styles.inputErrSubTxt}>
                      {errorMessage}
                    </span>
                  </p>
                )}
                <input
                  type="password"
                  className={styles.input}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submit();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <Link href="/register" className={styles.goRegister}>
            비밀번호를 잊으셨나요?
          </Link>

          <button
            className={styles.submit}
            onClick={submit}
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
          <p className={styles.needAccount}>
            계정이 필요한가요?{" "}
            <Link href="/register" className={styles.goRegister}>
              가입하기
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}