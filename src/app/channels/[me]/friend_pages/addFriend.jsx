import Images from "@/Images";
import styles from "../friends.module.css";
import { useState } from "react";
import { add_friend } from "@/utils/api";

export default function Add_Friend({ sendFriendReq }) {
  const [friendId, setFriendId] = useState();
  const [status, setStatus] = useState();
  const [err, setErr] = useState();

  const sendRequest = async () => {
    try {
      const friends = await add_friend(friendId);
      sendFriendReq();
      setStatus(friends.message);
      setErr(false);
    } catch (error) {
      const msg = error.message.toString();
      if (msg.startsWith("Cannot")) {
        setStatus(
          "흠, 안 되는군요. 사용자명을 올바르게 입력했는지 확인하세요."
        );
      } else {
        setStatus(error.message);
      }
      setErr(true);
    }
  };

  const handleInput = (e) => {
    setFriendId(e);
    if (!e) {
      setErr();
      setStatus();
    }
  };

  return (
    <div className={styles.bodyWrap}>
      <div className={styles.addHeader}>
        <p className={styles.title}>친구 추가하기</p>
        <p className={styles.subTitle}>
          Thiscord 사용자명을 사용하여 친구를 추가할 수 있어요.
        </p>
        <div className={styles.inputWrap}>
          <input
            type="text"
            placeholder="Thiscord 사용자명을 사용하여 친구를 추가할 수 있어요."
            onChange={(e) => handleInput(e.target.value)}
            className={`${
              err === true
                ? styles.inputErr
                : err === false
                ? styles.inputOk
                : ""
            }`}
          />
          <button
            className={styles.sendRequestBtn}
            onClick={() => sendRequest()}
          >
            친구 요청 보내기
          </button>
        </div>
        {status ? (
          <p
            className={`${styles.resultMSG} ${
              err === true
                ? styles.resultErr
                : err === false
                ? styles.resultOk
                : ""
            }`}
          >
            {status}
          </p>
        ) : (
          <p className={styles.resultMSG2}>.</p>
        )}
      </div>

      <div className={styles.line} />

      <div className={styles.bottomAdd}>
        <Images.wumpus className={styles.wumpus} />
        <p>Wumpus는 친구를 기다리고 있어요.</p>
      </div>
    </div>
  );
}
