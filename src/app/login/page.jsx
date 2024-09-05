'use client';

import Link from 'next/link';
import styles from './login.module.css';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { login } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(false);

  const router = useRouter();

  const submit = async () => {
    try {
      const response = await login(emailOrPhone, password);
      if (response) {
        router.push('/channels/me');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErr(true)
    }
  }

  return (
    <div className={styles.background}>
      <div className={styles.logo}></div>
      <motion.div
        className={styles.loginForm}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: .2,
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
                    이메일 또는 전화번호 <span className={styles.required}>*</span>
                  </p>
                ) : (
                  <p className={styles.inputErrTxt}>
                    이메일 또는 전화번호 - <span className={styles.inputErrSubTxt}>유효하지 않은 아이디 또는 비밀번호입니다.</span>
                  </p>
                )}
                <input
                  type="text"
                  className={styles.input}
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
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
                    비밀번호 - <span className={styles.inputErrSubTxt}>유효하지 않은 아이디 또는 비밀번호입니다.</span>
                  </p>
                )}
                <input
                  type="password"
                  className={styles.input}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Link href="/register" className={styles.goRegister}>비밀번호를 잊으셨나요?</Link>

          <button className={styles.submit} onClick={submit}>로그인</button>
          <p className={styles.needAccount}>계정이 필요한가요? <Link href="/register" className={styles.goRegister}>가입하기</Link></p>
        </div>
      </motion.div>
    </div >
  );
}