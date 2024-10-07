"use client";

import { load_chats, load_friends } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import io from "socket.io-client";
import styles from "./dm.module.css";
import Images from "@/Images";
import { useDispatch } from "react-redux";
import { triggerSignal } from "@/counterSlice";

export default function DM({ params }) {
  const { userId } = params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [receiverColor, setReceiverColor] = useState();
  const [receiverName, setReceiverName] = useState();
  const [myColor, setMyColor] = useState();
  const [isBottom, setIsBottom] = useState(true);

  const router = useRouter();
  const currentPath = usePathname();
  const dispatch = useDispatch();
  const chatsRef = useRef(null);

  useEffect(() => {
    dispatch(triggerSignal());
  }, []);

  const connectSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
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

    setSocket(newSocket);

    return newSocket;
  }, []);

  useEffect(() => {
    const storedmyColor = localStorage.getItem("userInfo");
    if (storedmyColor) {
      setMyColor(JSON.parse(storedmyColor).iconColor);
    }
  }, [router, currentPath]);

  useEffect(() => {
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

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    const chatElement = document.querySelector(".chats");
    chatElement.scrollTop = chatElement.scrollHeight;
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);

    const dateString = date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, ".");

    const timeString = date
      .toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace("오전", "오전 ")
      .replace("오후", "오후 ");

    return `${dateString} ${timeString}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);

    const timeString = date
      .toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace("오전", "오전 ")
      .replace("오후", "오후 ");

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

  return (
    <div className={styles.dmBody}>
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
        {messages.map((msg, index) => {
          const sameSender =
            index > 0 && messages[index - 1].senderId === msg.senderId;

          return (
            <div
              key={`${msg._id}-${msg.timestamp}`}
              className={`${styles.message} ${
                styles[msg.senderId === receiverName ? "received" : "sent"]
              }`}
            >
              {!sameSender ? (
                <div className={styles.msgInfos}>
                  <div
                    className={styles.msgIcon}
                    style={{
                      backgroundColor:
                        msg.senderId === receiverName ? receiverColor : myColor,
                    }}
                  >
                    <Images.icon className={styles.chatIcon} />
                  </div>
                  <div className={styles.msgInfo}>
                    <span className={styles.senderId}>{msg.senderId}</span>
                    <span className={styles.timestamp}>
                      {formatDateTime(msg.timestamp)}
                    </span>
                    <div className={styles.msgContent}>{msg.message}</div>
                  </div>
                </div>
              ) : (
                <div className={styles.singleMsg}>
                  <span className={styles.singleMsgTime}>
                    {formatTime(msg.timestamp)}
                  </span>
                  <div className={styles.singleMsgContent}>{msg.message}</div>
                </div>
              )}
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
  );
}
