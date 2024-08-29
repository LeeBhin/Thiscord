'use client';

import Link from 'next/link';
import styles from './login.module.css';
import { motion } from 'framer-motion';

export default function Login() {
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
                <p className={styles.inputTxt}>이메일 또는 전화번호 <span className={styles.required}>*</span></p>
                <input type="text" className={styles.input} required />
              </div>
            </div>
            <div className={styles.inputTxtWrap}>
              <div className={styles.idWrap}>
                <p className={styles.inputTxt}>비밀번호 <span className={styles.required}>*</span></p>
                <input type="password" className={styles.input} required />
              </div>
            </div>
          </div>

          <Link href="/register" className={styles.goRegister}>비밀번호를 잊으셨나요?</Link>

          <button className={styles.submit}>로그인</button>
          <p className={styles.needAccount}>계정이 필요한가요? <Link href="/register" className={styles.goRegister}>가입하기</Link></p>
        </div>
      </motion.div>
    </div >
  );
}
