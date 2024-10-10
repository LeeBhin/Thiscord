"use client";

import { delete_msg, load_chats, load_friends } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import io from "socket.io-client";
import styles from "./dm.module.css";
import Images from "@/Images";
import { useDispatch } from "react-redux";
import { triggerSignal } from "@/counterSlice";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DM({ params }) {
  const userId = decodeURIComponent(params.userId).replace("@", "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [receiverColor, setReceiverColor] = useState();
  const [receiverName, setReceiverName] = useState();
  const [myColor, setMyColor] = useState();
  const [isBottom, setIsBottom] = useState(true);
  const [isPopup, setIsPopup] = useState(false);
  const [msgInfo, setMsgInfo] = useState();
  const [copyContent, setCopyContent] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [editValue, setEditValue] = useState();
  const [editMsg, setEditMsg] = useState();

  const router = useRouter();
  const currentPath = usePathname();
  const dispatch = useDispatch();
  const chatsRef = useRef(null);

  useEffect(() => {
    if (!currentPath.startsWith("/channels/me/@")) {
      router.push(`/channels/me/@${userId}`);
    }
  });

  useEffect(() => {
    dispatch(triggerSignal());
  }, [messages]);

  const connectSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    newSocket.on("message", (data) => {
      const formattedMessage = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);
    });

    newSocket.on("delete", () => {
      fetchChats();
    });

    setSocket(newSocket);

    return newSocket;
  }, []);

  useEffect(() => {
    const storedmyColor = localStorage.getItem("userInfo");
    if (storedmyColor) {
      setMyColor(JSON.parse(storedmyColor).iconColor);
    }
  }, [router, currentPath]);

  const fetchChats = async () => {
    try {
      const chats = await load_chats(decodeURIComponent(userId));
      if (chats.length > 0) {
        setMessages(chats);
      }
    } catch (err) {
      console.error("load chat err", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [userId, router, currentPath]);

  useEffect(() => {
    load_friends().then((friendsList) => {
      const matchingFriends = friendsList.filter(
        (friend) => friend.name == decodeURIComponent(userId)
      );

      if (matchingFriends.length > 0) {
        setReceiverColor(matchingFriends[0].iconColor);
        setReceiverName(matchingFriends[0].name);
      } else {
        router.push("/");
      }
    });
  }, [router, currentPath]);

  useEffect(() => {
    const newSocket = connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [connectSocket]);

  const sendMessage = useCallback(() => {
    if (message && socket) {
      socket.emit("message", {
        receivedUser: decodeURIComponent(userId),
        message,
      });
      setMessage("");
      dispatch(triggerSignal());
    }
  }, [message, socket, userId]);

  const sendDelete = useCallback(() => {
    if (socket) {
      socket.emit("delete", {
        receivedUser: decodeURIComponent(userId),
      });
      dispatch(triggerSignal());
    }
  }, [socket]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday = today.toDateString() === date.toDateString();

    const isYesterday =
      today.getTime() - date.getTime() < 1000 * 60 * 60 * 24 && !isToday;

    const dateString = isToday
      ? "오늘"
      : isYesterday
      ? "어제"
      : date
          .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\./g, ".");

    const timeString = date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return `${dateString} ${timeString}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);

    const timeString = date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return `${timeString}`;
  };

  const handleScroll = () => {
    const chatElement = chatsRef.current;
    const isNearBottom =
      chatElement.scrollHeight - chatElement.scrollTop <=
      chatElement.clientHeight + 50;
    setIsBottom(isNearBottom);
  };

  useEffect(() => {
    const chatElement = chatsRef.current;
    chatElement.addEventListener("scroll", handleScroll);

    return () => {
      chatElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const chatElement = chatsRef.current;
    if (isBottom) {
      chatElement.scrollTop = chatElement.scrollHeight;
    }
  }, [messages]);

  const deleteMsg = (msgInfoP) => {
    if (msgInfoP) {
      delete_msg(msgInfoP.senderId, msgInfoP.msgId, receiverName).then(() => {
        fetchChats();
      });
    } else {
      delete_msg(msgInfo.senderId, msgInfo.msgId, receiverName).then(() => {
        fetchChats();
      });
    }
    closePopup();
    sendDelete();
  };

  const openPopup = (senderId, msgId, copyDiv, e) => {
    const msgInfo = {
      senderId: senderId,
      msgId: msgId,
    };
    setMsgInfo(msgInfo);

    if (e.shiftKey) {
      deleteMsg(msgInfo);
      return;
    }

    setIsPopup(true);
    setCopyContent(copyDiv);
  };

  const closePopup = () => {
    setIsPopup(false);
  };

  const handleEdit = (e) => {
    setEditValue(e.target.value);
  };

  return (
    <>
      <div className={styles.dmBody}>
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
                    <h3 className={styles.popTitle}>메시지 삭제하기</h3>
                    <p className={styles.popSubTitle}>
                      정말 이 메시지를 삭제할까요?
                    </p>
                    <div className={styles.copyMsg}>
                      <div className={styles.popupMsg}>
                        <div className={styles.msgInfos}>
                          <div
                            className={styles.msgIcon}
                            style={{
                              backgroundColor: myColor,
                            }}
                          >
                            <Images.icon className={styles.chatIcon} />
                          </div>
                          <div className={styles.msgInfo}>
                            <span className={styles.senderId}>
                              {copyContent.senderId}
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
                        <b>메시지 삭제</b>를 Shift 버튼과 함께 누르시면 이 확인
                        창을 건너뛰실 수 있어요.
                      </span>
                    </div>
                  </div>

                  <div className={styles.popBtns}>
                    <div className={styles.popBtnsWrap}>
                      <div
                        className={styles.cancel}
                        onClick={() => closePopup()}
                      >
                        취소
                      </div>
                      <div
                        className={styles.confirm}
                        onClick={() => deleteMsg()}
                      >
                        삭제
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className={styles.header}>
          <div className={styles.headerWrap}>
            <div className={styles.headerIconWrap}>
              <div
                className={styles.headerIcon}
                style={{ backgroundColor: receiverColor }}
              >
                <Images.icon className={styles.icon} />
              </div>
              {receiverName}
            </div>
          </div>
        </header>

        <div className={styles.chats} ref={chatsRef}>
          <div className={styles.top}>
            <div
              className={styles.topIconWrap}
              style={{ backgroundColor: receiverColor }}
            >
              <Images.icon className={styles.topIcon} />
            </div>
            <h3 className={styles.topName}>{receiverName}</h3>
            <div className={styles.topTxt}>
              <b>{receiverName}</b>님과 나눈 다이렉트 메시지의 첫 부분이에요.
            </div>
          </div>

          {messages.map((msg, index) => {
            const sameSender =
              index > 0 && messages[index - 1].senderId === msg.senderId;
            const sameDate =
              index > 0 &&
              formatDate(messages[index - 1].timestamp) ===
                formatDate(msg.timestamp);
            const firstMsg = index === 0;

            return (
              <div key={`${msg._id}-${msg.timestamp}`}>
                {(firstMsg || !sameDate) && (
                  <div className={styles.divisionDate}>
                    <div className={styles.dateLine} />
                    <div className={styles.date}>
                      {formatDate(msg.timestamp)}
                    </div>
                  </div>
                )}

                <div
                  className={`${styles.message} ${
                    styles[msg.senderId === receiverName ? "received" : "sent"]
                  }`}
                  style={{
                    backgroundColor:
                      isEdit && msg._id === editMsg ? "#2e3035" : "",
                  }}
                >
                  {msg.senderId !== receiverName && (
                    <div className={styles.edit}>
                      <div
                        className={styles.editBtn}
                        onClick={() => {
                          setEditValue(msg.message);
                          setIsEdit(true);
                          setEditMsg(msg._id);
                        }}
                      >
                        <Images.edit className={styles.btnIcon} />
                      </div>
                      <div className={styles.editLine} />
                      <div
                        className={styles.removeBtn}
                        onClick={(e) => {
                          const copyDiv = {
                            senderId: msg.senderId,
                            timestamp: formatDateTime(msg.timestamp),
                            message: msg.message,
                            isedit: msg.isedit,
                          };
                          openPopup(msg.senderId, msg._id, copyDiv, e);
                        }}
                      >
                        <Images.remove className={styles.btnIcon} />
                      </div>
                    </div>
                  )}

                  {firstMsg ||
                  (sameSender && !sameDate) ||
                  (!sameSender && !sameDate) ||
                  (!sameSender && sameDate) ? (
                    <div className={styles.msgInfos}>
                      <div
                        className={styles.msgIcon}
                        style={{
                          backgroundColor:
                            msg.senderId === receiverName
                              ? receiverColor
                              : myColor,
                        }}
                      >
                        <Images.icon className={styles.chatIcon} />
                      </div>
                      <div className={styles.msgInfo}>
                        <span className={styles.senderId}>{msg.senderId}</span>
                        <span className={styles.timestamp}>
                          {formatDateTime(msg.timestamp)}
                        </span>

                        {isEdit && msg._id === editMsg ? (
                          <div className={styles.editWrap}>
                            <div
                              contentEditable={true}
                              className={styles.editInput}
                            />
                            <div className={styles.editAction}>
                              ESC 키로 <span className={styles.esc}>취소</span>
                              <span className={styles.dot}> • </span>Enter 키로{" "}
                              <span className={styles.enter}>저장</span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.msgContent}>{msg.message}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.singleMsg}>
                      <span
                        className={styles.singleMsgTime}
                        style={{
                          marginBottom:
                            isEdit && msg._id === editMsg ? "40px" : "",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>

                      {isEdit && msg._id === editMsg ? (
                        <div className={styles.editWrap}>
                          <div
                            contentEditable={true}
                            className={styles.editInput}
                          />
                          <div className={styles.editAction}>
                            ESC 키로 <span className={styles.esc}>취소</span>
                            <span className={styles.dot}> • </span>Enter 키로{" "}
                            <span className={styles.enter}>저장</span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.singleMsgContent}>
                          {msg.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.chatInputWrap}>
          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder={`@${receiverName}에 메시지 보내기`}
              className={styles.input}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleEnter}
            />
          </div>
        </div>
      </div>
    </>
  );
}
