import Link from 'next/link';
import loginSt from '../login/login.module.css';
import rgstrSt from './register.module.css'
import BirthDropdown from '../components/BirthDropdown';

export default function Register() {
  return (
    <div className={loginSt.background}>
      <div className={loginSt.logo}></div>
      <div className={rgstrSt.loginForm}>
        <div className={loginSt.formWrap}>

          <div className={loginSt.welcomeWrap}>
            <p className={loginSt.welcome}>계정 만들기</p>
          </div>

          <div className={`${loginSt.inputWrap} ${rgstrSt.inputWrap}`}>

            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>이메일 <span className={loginSt.required}>*</span></p>
                <input type="text" className={loginSt.input} required />
              </div>
            </div>
            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>별명 <span className={loginSt.required}>*</span></p>
                <input type="text" className={loginSt.input} required />
              </div>
            </div>
            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>비밀번호 <span className={loginSt.required}>*</span></p>
                <input type="password" className={loginSt.input} required />
              </div>
            </div>
            <div className={loginSt.inputTxtWrap}>
              <div className={loginSt.idWrap}>
                <p className={loginSt.inputTxt}>비밀번호 확인 <span className={loginSt.required}>*</span></p>
                <input type="password" className={loginSt.input} required />
              </div>
            </div>
            <div className={loginSt.inputTxtWrap}>
              <div className={`${loginSt.idWrap} ${rgstrSt.birthWrap}`}>
                <p className={loginSt.inputTxt}>생년월일</p>
                <BirthDropdown />
              </div>
            </div>

          </div>

          <button className={loginSt.submit}>계속하기</button>
          <Link href="/login" className={loginSt.goRegister}>이미 계정이 있으신가요?</Link>
        </div>
      </div>
    </div>
  );
}
