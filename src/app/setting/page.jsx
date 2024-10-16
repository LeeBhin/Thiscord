"use client";

import Images from "@/Images";
import styles from "./setting.module.css";
import { logout, update_name } from "@/utils/api";
import { useEffect, useRef, useState } from "react";

export default function Setting() {
  const [userInfo, setUserInfo] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState();

  useEffect(() => {
    const userinfo = localStorage.getItem("userInfo");
    setUserInfo(JSON.parse(userinfo));
  }, []);

  const changeName = () => {
    setIsEdit(true);
    setName(userInfo?.name);
  };

  const handleChange = (e) => {
    setName(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      newName();
    }
  };

  const newName = () => {
    update_name(name);
    setIsEdit(false);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    userInfo.name = name;

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    location.reload();
  };

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

          <div
            className={styles.card}
            style={{ backgroundColor: userInfo?.iconColor }}
          >
            <div className={styles.cardBtm}>
              <div className={styles.profileWrap}>
                <div
                  className={styles.profile}
                  style={{ backgroundColor: userInfo?.iconColor }}
                >
                  <Images.icon className={styles.icon} />
                </div>
                {isEdit ? (
                  <div className={styles.edit}>
                    <input
                      className={styles.nameInput}
                      value={name}
                      onChange={(e) => handleChange(e)}
                      onKeyDown={handleEnter}
                    />
                    <div className={styles.editAction}>
                      ESC 키로{" "}
                      <span
                        className={styles.esc}
                        onClick={() => setIsEdit(false)}
                      >
                        취소
                      </span>
                      <span className={styles.dot}> • </span>Enter 키로{" "}
                      <span
                        className={styles.enter}
                        onClick={() => {
                          newName();
                        }}
                      >
                        저장
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.name}>{userInfo?.name}</div>
                )}
              </div>
              <div className={styles.changeName} onClick={() => changeName()}>
                사용자 이름 변경
              </div>
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
