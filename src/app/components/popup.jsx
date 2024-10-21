import { motion } from "framer-motion";
import styles from "../channels/me/[userId]/dm.module.css";
import Images from "@/Images";

const Popup = ({
  copyContent,
  userInfo,
  receiverColor,
  myId,
  closePopup,
  deleteMsg,
  setIsPopup,
  myName,
}) => {
  const displayName = (senderId) => {
    if (senderId === myId) {
      return myName;
    } else {
      return receiverName;
    }
  };
  return (
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
            <h3 className={styles.popTitle}>메시지 삭제하기</h3>
            <p className={styles.popSubTitle}>정말 이 메시지를 삭제할까요?</p>
            <div className={styles.copyMsg}>
              <div className={styles.popupMsg}>
                <div className={styles.msgInfos}>
                  <div
                    className={styles.msgIcon}
                    style={{
                      backgroundColor:
                        copyContent.senderId === myId
                          ? userInfo.iconColor
                          : receiverColor,
                    }}
                  >
                    <Images.icon className={styles.chatIcon} />
                  </div>
                  <div className={styles.msgInfo}>
                    <span className={styles.senderId}>
                      {displayName(copyContent.senderId)}
                    </span>
                    <span className={styles.timestamp}>
                      {copyContent.timestamp}
                    </span>
                    <div className={styles.msgContent}>
                      {copyContent.message}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.popTxt}>
              <span className={styles.notice}>참고:</span>
              <span className={styles.noticeTxt}>
                <b>메시지 삭제</b>를 Shift 버튼과 함께 누르시면 이 확인 창을
                건너뛰실 수 있어요.
              </span>
            </div>
          </div>
          <div className={styles.popBtns}>
            <div className={styles.popBtnsWrap}>
              <div className={styles.cancel} onClick={() => closePopup()}>
                취소
              </div>
              <div className={styles.confirm} onClick={() => deleteMsg()}>
                삭제
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default Popup;
