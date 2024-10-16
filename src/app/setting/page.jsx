"use client";

import Images from "@/Images";
import styles from "./setting.module.css";
import { logout } from "@/utils/api";
import { useEffect, useState } from "react";

export default function Setting() {
  const [name, setName] = useState();

  useEffect(() => {
    const myName = JSON.parse(localStorage.getItem("userInfo"));
    setName(myName.name);
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div
          className={styles.logOut}
          onClick={() => {
            logout();
            location.reload();
          }}
        >
          <span>로그아웃</span>
          <Images.logout />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.accountWrap}>
          <h2 className={styles.title}>내 계정</h2>

          <div className={styles.card}>
            <div className={styles.cardBtm}>
              <div className={styles.profileWrap}>
                <div className={styles.profile}>
                  <Images.icon className={styles.icon} />
                </div>
                <div className={styles.name}>{name}</div>
              </div>
              <div className={styles.changeName}>사용자 이름 변경</div>
            </div>
          </div>

          <div className={styles.rmWrap}>
            <span className={styles.rmTitle}>계정 제거</span>
            <span className={styles.rmSubtitle}>
              계정을 제거하면 복구할 수 없어요.
            </span>
            <div className={styles.rmAccount}>계정 삭제하기</div>
          </div>
        </div>
      </div>
    </div>
  );
}
