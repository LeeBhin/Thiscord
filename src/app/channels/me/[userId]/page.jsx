"use client";

import {
  delete_msg,
  edit_msg,
  load_chats,
  load_friends,
  my_info,
  read_chat,
} from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import styles from "./dm.module.css";
import Images from "@/Images";
import { useDispatch, useSelector } from "react-redux";
import {
  chatEditSignal,
  chatRemoveSignal,
  chatSignal,
  signalToMe,
} from "@/counterSlice";
import React from "react";
import { AnimatePresence } from "framer-motion";
import Skeleton from "@/app/components/Skeleton";
import Popup from "@/app/components/Popup";

export default function DM({ params }) {
  const userId = decodeURIComponent(params.userId).replace("@", "");
  const [messages, setMessages] = useState([]);
  const [receiverColor, setReceiverColor] = useState();
  const [receiverName, setReceiverName] = useState();
  const [isBottom, setIsBottom] = useState(true);
  const [isTop, setIsTop] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [msgInfo, setMsgInfo] = useState();
  const [copyContent, setCopyContent] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [editMsg, setEditMsg] = useState();
  const [myId, setMyId] = useState();
  const [myName, setMyName] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [newMsg, setNewMsg] = useState([]);
  const [news, setNews] = useState([]);
  const [startMsgId, SetStartMsgId] = useState();
  const [endMsgId, SetEndMsgId] = useState();
  const [hasMore, setHasMore] = useState();

  const router = useRouter();
  const currentPath = usePathname();
  const dispatch = useDispatch();
  const chatsRef = useRef(null);
  const editRef = useRef(null);
  const inputRef = useRef(null);
  const chatWrapRef = useRef(null);
  const { userInfo, receiverInfo, signalMeReceived, toMeMessage } = useSelector(
    (state) => state.counter
  );

  useEffect(() => {
    if (!currentPath.startsWith("/channels/me/@")) {
      router.push(`/channels/me/@${userId}`);
    }
  });

  useEffect(() => {
    SetStartMsgId(messages[0]?._id);
    SetEndMsgId(messages.at(-1)?._id);
    let isWindowFocused = document.hasFocus();
    if (
      (document.hidden || !isWindowFocused) &&
      !isLoading &&
      messages?.at(-1)?.senderId !== myId &&
      messages?.at(-1)?.isRead[myId] === false
    ) {
      setNews((prev) => [...prev, messages.at(-1)]);
    }
  }, [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      if (isTop && hasMore !== messages.length && startMsgId) {
        try {
          setIsLoading(true);
          const msg = await load_chats(receiverName, startMsgId, "up", 100);

          const beforeHeight = chatsRef.current.scrollHeight;

          setMessages((prev) => [...msg.messages, ...prev]);

          setHasMore(msg.totalCount);

          requestAnimationFrame(() => {
            const afterHeight = chatsRef.current.scrollHeight;
            const heightDiff = afterHeight - beforeHeight;
            chatsRef.current.scrollTop = heightDiff;
          });
        } finally {
          setIsLoading(false);
          setIsTop(false);
        }
      }
    };

    fetchChats();
  }, [isTop]);

  const fetchNew = async () => {
    const info = await my_info();
    if (!receiverName || !myId || !myName) return;
    const chatData = await load_chats(decodeURIComponent(userId));
    setMessages(chatData.messages);
    setHasMore(chatData.totalCount);

    checkScrollPosition();

    const readMessages = chatData.messages.filter(
      (msg) => msg.isRead[info.userId]
    );

    const lastReadMessage =
      readMessages.length > 0 ? readMessages[readMessages.length - 1] : null;

    const firstUnreadMessage = chatData.messages.find(
      (msg) => !msg.isRead[info.userId]
    );

    if (firstUnreadMessage) {
      setNewMsg(firstUnreadMessage._id);
      document.getElementById(lastReadMessage._id)?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    }
  };

  const fetchChats = async () => {
    try {
      const info = await my_info();
      setMyName(info.name);
      setMyId(info.userId);
      if (!receiverName || !myId || !myName) return;
      fetchNew();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [receiverName, myId, myName]);

  const checkScrollPosition = () => {
    const chatElement = chatsRef.current;

    if (chatElement.scrollHeight <= chatElement.clientHeight) {
      return;
    }
    if (chatsRef.current) {
      const chatContainer = chatsRef.current;
      if (chatContainer.scrollHeight <= chatContainer.clientHeight) {
        setIsTop(true);
      } else {
        setIsTop(false);
      }
    }
  };

  useEffect(() => {
    if (!isLoading) checkScrollPosition();
  }, [isLoading]);

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

  const sendMessage = (msg) => {
    if (msg && msg.trim() !== "") {
      inputRef.current.value = "";
      chatAreaHeight();

      dispatch(
        chatSignal({
          message: msg,
          receivedUser: receiverName,
          timestamp: new Date().toISOString(),
        })
      );

      setNews([]);

      if (messages.length > 100) {
        setMessages((prevMessages) => {
          if (prevMessages.length > 100) {
            return prevMessages.slice(-100);
          }
          return prevMessages;
        });
      }
    }
  };

  useEffect(() => {
    if (
      toMeMessage.chatData?.senderName === myName ||
      toMeMessage.chatData?.senderName === receiverName
    ) {
      if (toMeMessage?.action === "message") {
        setMessages((prevMessages) => {
          return [...prevMessages, toMeMessage.chatData];
        });
        setHasMore(hasMore + 1);
      } else if (toMeMessage?.action === "delete") {
        setMessages((prevMessages) => {
          return prevMessages.filter(
            (msg) => msg._id !== toMeMessage.msgId.msgId
          );
        });
        setHasMore(hasMore - 1);
      } else if (toMeMessage?.action === "edit") {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) =>
            msg._id === toMeMessage.msgId
              ? { ...msg, message: toMeMessage.message, isEdit: true }
              : msg
          );
        });
      } else {
        return;
      }
    }
    // dispatch(signalToMe({}));
  }, [signalMeReceived]);

  const sendDelete = (msgId) => {
    dispatch(chatRemoveSignal({ receivedUser: receiverName, msgId }));
  };

  const sendEdit = (msgId, message) => {
    dispatch(chatEditSignal({ receivedUser: receiverName, msgId, message }));
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e.target.value);
      const chatElement = chatsRef.current;
      chatElement.scrollTop = chatElement.scrollHeight;
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

    if (chatElement.scrollHeight <= chatElement.clientHeight) {
      return;
    }

    const isNearBottom =
      chatElement.scrollHeight - chatElement.scrollTop <=
      chatElement.clientHeight + 50;

    const isNearTop = chatElement.scrollTop <= 300;

    setIsBottom(isNearBottom);
    setIsTop(isNearTop);
  };

  useEffect(() => {
    const chatElement = chatsRef.current;

    if (chatElement.scrollHeight <= chatElement.clientHeight) {
      return;
    }
    chatElement.addEventListener("scroll", handleScroll);

    return () => {
      chatElement.removeEventListener("scroll", handleScroll);
    };
  }, [messages]);

  useEffect(() => {
    const chatElement = chatsRef.current;
    if (isBottom) {
      chatElement.scrollTop = chatElement.scrollHeight;
    }
  }, [messages]);

  const deleteMsg = (msgInfoP) => {
    if (msgInfoP) {
      delete_msg(msgInfoP.senderId, msgInfoP.msgId, receiverName);
      sendDelete(msgInfoP.msgId);
    } else {
      delete_msg(msgInfo.senderId, msgInfo.msgId, receiverName);
      sendDelete(msgInfo.msgId);
    }
    closePopup();
  };

  const openPopup = (senderId, msgId, copyDiv, e) => {
    const msgInfo = {
      senderId: senderId,
      msgId: msgId,
    };
    setMsgInfo(msgInfo);

    if (e.shiftKey) {
      deleteMsg(msgInfo);
      sendDelete(msgInfo.msgId);
      return;
    }

    setIsPopup(true);
    setCopyContent(copyDiv);
  };

  const closePopup = () => {
    setIsPopup(false);
  };

  const areaHeight = () => {
    const target = editRef.current;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const chatAreaHeight = () => {
    const target = inputRef.current;
    const targetWrap = chatWrapRef.current;

    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    targetWrap.style.height = "auto";
    targetWrap.style.height = `${targetWrap.scrollHeight}px`;
  };

  const handleEditKey = async (senderId, msgId, e, msg) => {
    if (e.key === "Escape") {
      setIsEdit(false);
      return;
    }
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }
    if (e.key === "Enter") {
      editMsgKey(senderId, msgId, msg);
      return;
    }
  };

  const editMsgKey = (senderId, msgId, msg) => {
    if (msg !== editRef.current.value.trim()) {
      edit_msg(senderId, msgId, receiverName, editRef.current.value.trim());
      sendEdit(msgId, editRef.current.value.trim());
      setIsEdit(false);
    } else {
      setIsEdit(false);
    }
  };

  const editBtnClick = (msg) => {
    setIsEdit(true);
    setEditMsg(msg._id);
    setTimeout(() => {
      editRef.current.value = msg.message;
      areaHeight();
    });
  };

  const displayName = (senderId) => {
    if (senderId === myId) {
      return myName;
    } else {
      return receiverName;
    }
  };

  const isWithinOneWeek = (timestamp) => {
    const currentTime = new Date();
    const messageTime = new Date(timestamp);
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    return currentTime - messageTime < oneWeek;
  };

  useEffect(() => {
    if (isLoading) return;
    setNewMsg(news[0]?._id);
  }, [news]);

  const handleVisibleMessage = (msgId, senderId, isRead) => {
    if (senderId !== myId && !isRead[myId] && !news.includes(msgId)) {
      read_chat(msgId, receiverName);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const msgInfo = JSON.parse(
              entry.target.getAttribute("data-msginfo")
            );
            handleVisibleMessage(
              msgInfo.msgId,
              msgInfo.senderId,
              msgInfo.isRead
            );
          }
        });
      },
      { threshold: 0.5 }
    );

    const messages = chatsRef.current.querySelectorAll(`.${styles.message}`);
    messages.forEach((message) => observer.observe(message));
  }, [messages, isLoading]);

  return (
    <>
      <div className={styles.dmBody}>
        <AnimatePresence mode="wait">
          {isPopup && (
            <Popup
              copyContent={copyContent}
              userInfo={userInfo}
              receiverColor={receiverColor}
              myId={myId}
              closePopup={closePopup}
              deleteMsg={deleteMsg}
              setIsPopup={setIsPopup}
              myName={myName}
            />
          )}
        </AnimatePresence>

        <header className={styles.header}>
          <div className={styles.headerWrap}>
            <div className={styles.headerIconWrap}>
              <div
                className={styles.headerIcon}
                style={{
                  backgroundColor: receiverInfo?.iconColor || receiverColor,
                }}
              >
                <Images.icon className={styles.icon} />
              </div>
              {receiverInfo?.name || receiverName}
            </div>
          </div>
        </header>

        {isLoading && <Skeleton />}
        <div className={styles.chats} ref={chatsRef}>
          {(hasMore === messages?.length || !hasMore) && (
            <div className={styles.top}>
              <div
                className={styles.topIconWrap}
                style={{ backgroundColor: receiverColor }}
              >
                <Images.icon className={styles.topIcon} />
              </div>
              <h3 className={styles.topName}>{receiverName}</h3>
              <div className={styles.topTxt}>
                {!messages.length > 0 ||
                isWithinOneWeek(messages[0]?.timestamp) ? (
                  <div>
                    <b>{receiverName}</b> 님과의 전설적인 대화가 지금 막
                    시작되었어요.
                  </div>
                ) : (
                  <div>
                    <b>{receiverName}</b> 님과 나눈 다이렉트 메시지의 첫
                    부분이에요.
                  </div>
                )}
              </div>
            </div>
          )}

          {messages?.map((msg, index) => {
            const sameSender =
              index > 0 && messages[index - 1].senderId === msg.senderId;
            const sameDate =
              index > 0 &&
              formatDate(messages[index - 1].timestamp) ===
                formatDate(msg.timestamp);
            const firstMsg = index === 0;

            return (
              <div key={`${msg._id}`} id={msg._id} className={styles.messages}>
                {(firstMsg || !sameDate) &&
                  !(firstMsg && hasMore !== messages.length) && (
                    <div className={styles.divisionDate}>
                      <div
                        className={styles.dateLine}
                        style={{
                          borderTop: `solid 1px ${
                            msg._id === newMsg ? "#F13E41" : "#3f4147"
                          }`,
                        }}
                      />
                      <div
                        className={styles.date}
                        style={{
                          color: msg._id === newMsg ? "#F13E41" : "#b5bac1",
                        }}
                      >
                        {formatDate(msg.timestamp)}
                      </div>
                      {newMsg &&
                        msg._id === newMsg &&
                        msg.senderId !== myId && (
                          <span className={styles.newSign}>
                            <Images.newMsg className={styles.newIcon} />
                            <span className={styles.newIconTxt}>NEW</span>
                          </span>
                        )}
                    </div>
                  )}

                {!firstMsg &&
                  sameDate &&
                  newMsg &&
                  msg._id === newMsg &&
                  msg.senderId !== myId && (
                    <div className={styles.newSignWrap}>
                      <div className={styles.newLine} />
                      <span className={styles.newSign}>
                        <Images.newMsg className={styles.newIcon} />
                        <span className={styles.newIconTxt}>NEW</span>
                      </span>
                    </div>
                  )}

                <div
                  className={`${styles.message} ${
                    styles[msg.senderId !== myId ? "received" : "sent"]
                  }`}
                  style={{
                    backgroundColor:
                      isEdit && msg._id === editMsg ? "#2e3035" : "",
                  }}
                  data-msginfo={JSON.stringify({
                    msgId: msg._id,
                    senderId: msg.senderId,
                    isRead: msg.isRead,
                    msg: msg.message,
                  })}
                >
                  {msg.senderId === myId &&
                    (!isEdit || msg._id !== editMsg) && (
                      <div className={styles.edit}>
                        <div
                          className={styles.editBtn}
                          onClick={() => {
                            editBtnClick(msg);
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

                  {!(firstMsg && hasMore !== messages?.length) &&
                  (firstMsg ||
                    (sameSender && !sameDate) ||
                    (!sameSender && !sameDate) ||
                    (!sameSender && sameDate)) ? (
                    <div className={styles.msgInfos}>
                      <div
                        className={styles.msgIcon}
                        style={{
                          backgroundColor:
                            msg.senderId !== myId
                              ? receiverColor
                              : userInfo.iconColor,
                        }}
                      >
                        <Images.icon className={styles.chatIcon} />
                      </div>
                      <div className={styles.msgInfo}>
                        <span className={styles.senderId}>
                          {displayName(msg.senderId)}
                        </span>
                        <span className={styles.timestamp}>
                          {formatDateTime(msg.timestamp)}
                        </span>

                        {isEdit && msg._id === editMsg ? (
                          <div className={styles.editWrap}>
                            <textarea
                              className={styles.editInput}
                              onChange={areaHeight}
                              onKeyDown={(e) => {
                                handleEditKey(
                                  msg.senderId,
                                  msg._id,
                                  e,
                                  msg.message
                                );
                              }}
                              ref={editRef}
                              rows={1}
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
                                onClick={() =>
                                  editMsgKey(msg.senderId, msg._id, msg.message)
                                }
                              >
                                저장
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.msgContent}>
                            {msg.message}
                            {msg.isEdit && (
                              <div className={styles.isEdit}>(수정됨)</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.singleMsg}>
                      <span
                        className={styles.singleMsgTime}
                        style={{
                          marginTop:
                            isEdit && msg._id === editMsg ? "10px" : "",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                      {isEdit && msg._id === editMsg ? (
                        <div className={styles.editWrap}>
                          <textarea
                            className={styles.editInput}
                            onChange={areaHeight}
                            onKeyDown={(e) => {
                              handleEditKey(
                                msg.senderId,
                                msg._id,
                                e,
                                msg.message
                              );
                            }}
                            ref={editRef}
                            rows={1}
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
                              onClick={() =>
                                editMsgKey(msg.senderId, msg._id, msg.message)
                              }
                            >
                              저장
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.singleMsgContent}>
                          {msg.message}
                          {msg.isEdit && (
                            <div className={styles.isEdit}>(수정됨)</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className={styles.noName} />
        </div>
      </div>
      <div className={styles.chatInputWrap} ref={chatWrapRef}>
        <div className={styles.chatInput}>
          <textarea
            type="text"
            rows={1}
            placeholder={`@${receiverName}에 메시지 보내기`}
            className={styles.input}
            onChange={() => {
              chatAreaHeight();
            }}
            ref={inputRef}
            onKeyDown={handleEnter}
          />
        </div>
      </div>
    </>
  );
}
