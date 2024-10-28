"use client";

import Images from "@/Images";
import styles from "./setting.module.css";
import {
  delete_user,
  getPushNotification,
  logout,
  my_info,
  subscribePushNotification,
  unsubscribePushNotification,
  update_name,
} from "@/utils/api";
import { useEffect, useRef, useState } from "react";
import { setUserInfo } from "@/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

export default function Setting() {
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const bodyRef = useRef(null);
  const btnRef = useRef(null);
  const { userInfo } = useSelector((state) => state.counter);
  const router = useRouter();
  const [isPopup, setIsPopup] = useState(false);
  const [pw, setPw] = useState("");
  const [allow, setAllow] = useState(false);
  const [err, setErr] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserInfoUpdate = (name, iconColor) => {
    dispatch(setUserInfo({ name, iconColor }));
  };

  useEffect(() => {
    const getInfo = async () => {
      const info = await my_info();
      handleUserInfoUpdate(info.name, info.iconColor);
    };
    getInfo();
  }, []);

  const changeName = () => {
    setIsEdit(true);
    setName(userInfo?.name || "");
  };

  const handleChange = (e) => {
    setName(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      newName();
    }
    if (e.key === "Escape") {
      setIsEdit(false);
    }
  };

  const newName = () => {
    update_name(name);
    setIsEdit(false);
    handleUserInfoUpdate(name, userInfo?.iconColor);
  };

  useEffect(() => {
    const handleEscPress = (event) => {
      if (event.key === "Escape" && event.target.tagName !== "INPUT") {
        router.back();
      }
    };
    document.addEventListener("keydown", handleEscPress);
    return () => {
      document.removeEventListener("keydown", handleEscPress);
    };
  }, []);

  const handleClick = async () => {
    if (allow) {
      try {
        await delete_user(pw);
        logout();
        location.reload();
      } catch (error) {
        setErr(true);
      }
    }
  };

  const handlePw = (e) => {
    const value = e.target.value;
    setPw(value);

    if (!value) {
      btnRef.current.classList.remove(styles.enabled);
      btnRef.current.classList.add(styles.disabled);
      setAllow(false);
    } else {
      btnRef.current.classList.remove(styles.disabled);
      btnRef.current.classList.add(styles.enabled);
      setAllow(true);
    }
  };

  const checkSubscription = async () => {
    console.log("dd");
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ),
        });
      }

      const response = getPushNotification(subscription);
      console.log(response)
      if (response.success === true) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to check push subscription:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleToggle = async () => {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    if (!isSubscribed) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ),
        });

        const success = await subscribePushNotification(subscription);

        if (!success) {
          throw new Error("Failed to subscribe to push notifications");
        }
        setIsSubscribed(true);
      } catch (error) {
        console.error("Push notification subscription failed:", error);
      }
    } else {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          const success = await unsubscribePushNotification();

          if (success) {
            setIsSubscribed(false);
          } else {
            setIsSubscribed(true);
            console.error("Failed to unsubscribe from push notifications");
          }
        }
      } catch (error) {
        console.error("Failed to unsubscribe from push notifications:", error);
      }
    }
  };

  const registerServiceWorker = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
      });
    } catch (error) {
      console.error("Service Worker 등록 실패:", error);
    }
  };

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className={styles.wrap}>
      <AnimatePresence mode="wait">
        {isPopup && (
          <motion.div
            key="delete-popup"
            className={styles.deletePopup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.back} onClick={() => setIsPopup(false)}>
              <motion.div
                key="popup-content"
                className={styles.popup}
                initial={{ opacity: 0, scale: 0, x: "50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0, x: "50%", y: "-50%" }}
                transition={{
                  duration: 0.2,
                  type: "spring",
                  stiffness: 600,
                  damping: 35,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.popWrap}>
                  <h3 className={styles.popTitle}>계정 삭제하기</h3>
                  <p className={styles.popSubTitle}>
                    정말로 계정을 삭제하시겠어요? 즉시 계정에서 로그아웃되며
                    다시 로그인하실 수 없어요.
                  </p>
                </div>

                <div className={styles.inputWrap}>
                  <span className={styles.popupTxt}>비밀번호</span>
                  <input
                    type="password"
                    className={styles.pwInput}
                    onChange={(e) => handlePw(e)}
                  />
                  {err && (
                    <span className={styles.err}>
                      비밀번호가 일치하지 않아요
                    </span>
                  )}
                </div>

                <div className={styles.popBtns}>
                  <div className={styles.popBtnsWrap}>
                    <div
                      className={styles.cancel}
                      onClick={() => setIsPopup(false)}
                    >
                      취소
                    </div>
                    <div
                      className={`${styles.confirm} ${styles.disabled}`}
                      ref={btnRef}
                      onClick={() => handleClick()}
                    >
                      계정 삭제하기
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

      <div className={styles.body} ref={bodyRef}>
        <div className={styles.accountWrap}>
          <h2 className={styles.title}>내 계정</h2>

          <div className={styles.cardWrap}>
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
                        onChange={handleChange}
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

            <div className={styles.escWrap} onClick={() => router.back()}>
              <div className={styles.circle}>
                <Images.esc />
              </div>
              <span className={styles.txt}>ESC</span>
            </div>
          </div>

          <div className={styles.rmWrap}>
            <span className={styles.rmTitle}>푸시 알림</span>
            <span className={styles.rmSubtitle}>
              {isLoading
                ? "알림 상태를 확인하는 중이에요..."
                : isSubscribed
                ? "알림을 받고 계세요. 끄고 싶다면 토글을 눌러주세요."
                : "알림을 받고 있지 않아요. 켜고 싶다면 토글을 눌러주세요."}
            </span>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={isSubscribed}
                onChange={handleToggle}
                disabled={isLoading}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.rmWrap}>
            <span className={styles.rmTitle}>계정 제거</span>
            <span className={styles.rmSubtitle}>
              계정을 제거하면 복구할 수 없어요.
            </span>
            <div className={styles.rmAccount} onClick={() => setIsPopup(true)}>
              계정 삭제하기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
