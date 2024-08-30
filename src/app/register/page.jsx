'use client';

import Link from 'next/link';
import loginSt from '../login/login.module.css';
import rgstrSt from './register.module.css'
import BirthDropdown from '../components/BirthDropdown';
import { GoCheck } from "react-icons/go";
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function Register() {
  const [isNameFocus, setIsNameFocus] = useState(false);
  const [isPwFocus, setIsPwFocus] = useState(false);

  const nameRef = useRef(null);
  const pwRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nameRef.current && !nameRef.current.contains(event.target) &&
        pwRef.current && !pwRef.current.contains(event.target)) {
        setIsNameFocus(false);
        setIsPwFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const inputClick = (event) => {
    const type = event.target.type;
    if (type === 'text') {
      setIsNameFocus(true);
      setIsPwFocus(false);
    } else if (type === 'password') {
      setIsPwFocus(true);
      setIsNameFocus(false);
    }
  }

  const getFormClasses = () => {
    if (isNameFocus) {
      return `${rgstrSt.loginForm} ${rgstrSt.formHeightName}`;
    } else if (isPwFocus) {
      return `${rgstrSt.loginForm} ${rgstrSt.formHeightPW}`;
    }
  }

  const moveUp = {
    initial: { y: 0 },
    animate: { y: -8 }
  };

  const moveDown = (y) => ({
    initial: { y: 0 },
    animate: { y }
  });

  return (
    <div className={loginSt.background}>
      <div className={loginSt.logo}></div>
      <motion.div
        className={`${getFormClasses()} ${rgstrSt.loginForm}`}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: .1,
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
            transition={{ duration: .4, ease: "easeOut" }}
          >

            <div className={loginSt.welcomeWrap} style={{ 'marginBottom': '13px' }}>
              <p className={loginSt.welcome}>계정 만들기</p>
            </div>

            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>이메일 <span className={loginSt.required}>*</span></p>
                <input type="text" className={`${loginSt.input} ${rgstrSt.input}`} required />
              </div>
            </div>
            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>별명 <span className={loginSt.required}>*</span></p>
                <input type="text" className={`${loginSt.input} ${rgstrSt.input}`} ref={nameRef} onClick={inputClick} required />
              </div>
            </div>
          </motion.div>

          <p className={`${isNameFocus ? `${rgstrSt.inputInfo} ${rgstrSt.showInputInfo}` : rgstrSt.inputInfo}`}>
            다른 회원에게 표시되는 이름이에요. 특수 문자와 이모지를 사용할 수 있어요.
          </p>

          <motion.div
            className={rgstrSt.inputDownWrap}
            initial="initial"
            animate={isNameFocus ? "animate" : "initial"}
            variants={moveDown(35)}
            transition={{ duration: .4, ease: "easeOut" }}
          >

            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>비밀번호 <span className={loginSt.required}>*</span></p>
                <input type="password" className={`${loginSt.input} ${rgstrSt.input}`} ref={pwRef} onClick={inputClick} required />
                <p className={`${isPwFocus ? `${rgstrSt.inputInfo} ${rgstrSt.showInputInfo}` : rgstrSt.inputInfo}`} style={{ 'marginTop': '70px' }}>
                  제가 유추할 수 있도록 쉽게 만들어주세요.
                </p>
              </div>
            </div>

            <motion.div
              className={rgstrSt.inputDownWrap}
              initial="initial"
              animate={isPwFocus ? "animate" : "initial"}
              variants={moveDown(25)}
              transition={{ duration: .4, ease: "easeOut" }}
            >
              <div className={loginSt.inputTxtWrap}>
                <div className={loginSt.idWrap}>
                  <p className={loginSt.inputTxt}>비밀번호 확인 <span className={loginSt.required}>*</span></p>
                  <input type="password" className={`${loginSt.input} ${rgstrSt.input}`} required />
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
                  <span className={rgstrSt.checkmark}><GoCheck /></span>
                  <p className={rgstrSt.agreeTxt}>(선택사항) Thiscord 소식, 도움말, 스펨을 이메일로 보내주세요. 언제든지 취소하실 수 있어요.</p>
                </label>
              </div>

              <button className={loginSt.submit}>계속하기</button>

              <p className={`${rgstrSt.agreeTxt} ${rgstrSt.agreeInfo}`}>등록하는 순간 Thiscord의 <Link href="/policy" className={rgstrSt.goPolicy}>서비스 이용 약관</Link>과 <Link href="/policy" className={rgstrSt.goPolicy}>개인정보 보호 정책</Link>에 동의하게 됩니다.</p>

              <Link href="/login" className={loginSt.goRegister}>이미 계정이 있으신가요?</Link>

            </motion.div>
          </motion.div >
        </div >
      </motion.div >
    </div >
  );
}
