"use client";

import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import Images from "@/Images";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkToken, load_chatrooms, my_info } from "@/utils/api";
import { Provider, useSelector } from "react-redux";
import store from "@/store";
import { useDispatch } from "react-redux";
import {
  requestSignal,
  setReceiverInfo,
  setUserInfo,
  signalToMe,
  triggerSignal,
  writingSignal,
  writingToMe,
} from "@/counterSlice";
import io from "socket.io-client";

function InnerLayout({ children }) {
  const currentPath = usePathname();
  const router = useRouter();
  const [chatrooms, setChatrooms] = useState([]);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const [title, setTitle] = useState("Thiscord");
  const [user, setUser] = useState();
  const [focus, setFocus] = useState();
  const [rooms, setRooms] = useState();
  const [newChat, setNewChat] = useState([]);
  const [isCooldown, setIsCooldown] = useState(false);

  const {
    signalReceived,
    chatSignalReceived,
    chatMessage,
    chatEdit,
    chatRemove,
    loginReceived,
    chatEditReceived,
    chatRemoveReceived,
    signalMeReceived,
    userInfo,
    writingReceived,
    whoWriting,
  } = useSelector((state) => state.counter);

  const handleUserInfoUpdate = (name, iconColor, userId) => {
    dispatch(setUserInfo({ name, iconColor, userId }));
  };

  const connectSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
    });

    newSocket.on("message", (chatData) => {
      setRooms(chatData);
      dispatch(
        signalToMe({
          chatData,
          action: "message",
        })
      );
    });

    newSocket.on("delete", (msgId) => {
      dispatch(signalToMe({ msgId, action: "delete" }));
    });

    newSocket.on("edit", (data) => {
      dispatch(
        signalToMe({
          msgId: data.msgId,
          message: data.message,
          action: "edit",
        })
      );
    });

    newSocket.on("friendRes", () => {
      dispatch(signalToMe());
    });

    newSocket.on("writing", (data) => {
      dispatch(writingToMe({ data }));
    });

    setSocket(newSocket);

    return newSocket;
  }, []);

  useEffect(() => {
    if (currentPath === "/channels/@me/request") {
      dispatch(requestSignal("request"));
      router.push("/channels/@me");
      return;
    }

    const extractedName = extractString(decodeURIComponent(currentPath));

    if (!extractedName) return;

    setNewChat((prev) =>
      prev.map((room) =>
        room.participantName === extractedName
          ? { ...room, unreadCount: 0 }
          : room
      )
    );
  }, [currentPath]);

  useEffect(() => {
    if (currentPath === "/login" || currentPath === "/register") return;

    const newSocket = connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [connectSocket]);

  useEffect(() => {
    const checkAuthAndConnect = async () => {
      try {
        await my_info();
        const newSocket = connectSocket();

        return () => {
          if (newSocket) newSocket.disconnect();
        };
      } catch (err) {
        return;
      }
    };

    checkAuthAndConnect();
  }, [loginReceived]);

  useEffect(() => {
    if (window.location.pathname.startsWith("/channels/@me/") && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  useEffect(() => {
    if (currentPath === "/login" || currentPath === "/register") return;

    const verifyToken = async () => {
      try {
        await checkToken();
      } catch (err) {
        router.push("/login");
      }
    };

    verifyToken();

    if (currentPath === "/channels/@me") chatRooms();
  }, [router, currentPath]);

  useEffect(() => {
    if (currentPath === "/login" || currentPath === "/register") {
      return;
    }
    const getInfo = async () => {
      const info = await my_info();
      handleUserInfoUpdate(info.name, info.iconColor, info.userId);
      setUser(info);
    };
    getInfo();
  }, [router, currentPath]);

  useEffect(() => {
    if (socket) {
      socket.emit("friendReq", {});
    }
  }, [signalReceived]);

  useEffect(() => {
    if (socket) {
      socket.emit("message", {
        message: chatMessage.message,
        receivedUser: chatMessage.receivedUser,
        timestamp: chatMessage.timestamp,
        iconColor: userInfo.iconColor,
      });
    }
  }, [chatSignalReceived]);

  useEffect(() => {
    chatRooms();
    if (socket) {
      socket.emit("delete", {
        receivedUser: chatRemove.receivedUser,
        msgId: chatRemove.msgId,
      });
    }
  }, [chatRemoveReceived, chatRemove]);

  useEffect(() => {
    if (socket) {
      socket.emit("edit", {
        receivedUser: chatEdit.receivedUser,
        msgId: chatEdit.msgId,
        message: chatEdit.message,
      });
    }
  }, [chatEditReceived, chatEdit]);

  useEffect(() => {
    if (socket) {
      socket.emit("writing", {
        receivedUser: whoWriting.receiverName,
        senderUser: whoWriting.myName,
      });
    }
  }, [writingReceived]);

  const chatRooms = async () => {
    if (currentPath === "/login" || currentPath === "/register") {
      return;
    }
    try {
      const rooms = await load_chatrooms();

      const sortedRooms = rooms.sort((a, b) => {
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      });
      setNewChat(sortedRooms);
      setChatrooms(sortedRooms);
    } catch (error) {
      console.error("Failed to load chatrooms:", error);
    }
  };

  useEffect(() => {
    if (!rooms?.senderName && !rooms?.receiverName) return;

    setChatrooms((prevRooms) => {
      const newRooms = [...prevRooms];

      let senderExists = newRooms.some(
        (room) => room.participantName === rooms.senderName
      );
      let receiverExists = newRooms.some(
        (room) => room.participantName === rooms.receiverName
      );

      if (!senderExists && !receiverExists && rooms) {
        chatRooms();
      }

      let targetIndex = newRooms.findIndex(
        (room) => room.participantName === rooms.senderName
      );

      if (targetIndex === -1) {
        targetIndex = newRooms.findIndex(
          (room) => room.participantName === rooms.receiverName
        );
      }

      if (targetIndex > 0) {
        const [targetRoom] = newRooms.splice(targetIndex, 1);
        newRooms.unshift(targetRoom);
      }

      return newRooms;
    });
    if (
      rooms?.senderName !== user?.name &&
      rooms?.senderName !== extractString(decodeURIComponent(currentPath))
    ) {
      setNewChat(updateNewChat(rooms, newChat));
    }
  }, [signalMeReceived]);

  const updateNewChat = (rooms, prevChat) => {
    const updatedChat = prevChat.map((chat) => ({ ...chat }));

    const participantIndex = updatedChat.findIndex(
      (participant) => participant.participantName === rooms.senderName
    );

    if (participantIndex !== -1) {
      const participant = { ...updatedChat[participantIndex] };

      updatedChat.splice(participantIndex, 1);

      const updatedParticipant = {
        ...participant,
        unreadCount: participant.unreadCount + 1,
        lastMessageAt: rooms.timestamp,
      };

      updatedChat.unshift(updatedParticipant);
    } else {
      const newParticipant = {
        participantName: rooms.senderName,
        iconColor: rooms.iconColor,
        lastMessageAt: rooms.timestamp,
        unreadCount: 1,
      };

      updatedChat.unshift(newParticipant);
    }
    return updatedChat;
  };

  useEffect(() => {
    const path = decodeURIComponent(currentPath).split("/");
    const title =
      currentPath === "/channels/@me"
        ? "• Thiscord | 친구"
        : currentPath.startsWith("/channels/me/@")
        ? `Thiscord | ${path[path.length - 1]}`
        : "Thiscord";
    setTitle(title);
  }, [currentPath]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocus(false);
      } else {
        setFocus(document.hasFocus());
      }
    };

    const handleFocus = () => {
      setFocus(true);
    };

    const handleBlur = () => {
      setFocus(false);
    };

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      setFocus(false);
    };
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    let isWindowFocused = document.hasFocus();
    if (document.hidden || !isWindowFocused || !focus) return;
    if (socket && userInfo) {
      socket.emit("current", {
        userId: userInfo?.userId,
        current: extractString(decodeURIComponent(currentPath)),
      });
    }
  }, [currentPath, userInfo, focus]);

  const extractString = (url) => {
    const prefix = "/channels/me/";

    if (url.startsWith(prefix)) {
      const atIndex = url.indexOf("@");
      if (atIndex !== -1) {
        return url.slice(atIndex + 1);
      }
    }
    return null;
  };

  const isAuthPath =
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/setting";

  const dmLink = (friend) => {
    dispatch(
      setReceiverInfo({
        name: friend.participantName,
        iconColor: friend.iconColor,
      })
    );
    router.push(`/channels/me/@${friend.participantName}`);
  };

  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <title>{title}</title>
      </head>
      <body className={styles.body}>
        {isAuthPath ? (
          children
        ) : (
          <>
            <header className={styles.header}>
              <div className={styles.headerWrap}>
                <div className={styles.channelWrap}>
                  <Link href="/channels/me" className={styles.Link}>
                    <div className={`${styles.channel} ${styles.direct}`}>
                      <div className={styles.channelBar} />
                      <Images.icon className={styles.serverImg} />
                    </div>
                  </Link>
                  {newChat?.length > 0 &&
                    newChat
                      .filter((room) => room.unreadCount > 0)
                      .map((room, index) => (
                        <Link
                          href={`/channels/me/@${room.participantName}`}
                          className={styles.Link}
                          key={room.participantName}
                        >
                          <div
                            className={`${styles.channel} ${styles.direct}`}
                            style={{ backgroundColor: room.iconColor }}
                          >
                            <div className={styles.channelBar} />
                            {room.unreadCount > 0 && (
                              <div className={styles.dmCount}>
                                <div className={styles.countNumber}>
                                  {room.unreadCount}
                                </div>
                              </div>
                            )}
                            <Images.icon className={styles.serverImg} />
                          </div>
                        </Link>
                      ))}
                </div>
                <div className={styles.barricade} />
              </div>
            </header>

            <header className={styles.friendsHeader}>
              <div className={styles.searchDiv}>
                <input
                  type="text"
                  placeholder="대화 찾기 또는 시작하기"
                  className={styles.searchChat}
                />
              </div>

              <div className={styles.friendsWrap}>
                <div className={styles.topNav}>
                  <Link
                    href="/channels/@me"
                    className={`${styles.friendsLink} ${
                      currentPath === "/channels/@me"
                        ? styles.friendsLinkActive
                        : ""
                    }`}
                  >
                    <Images.friends className={styles.icon} />
                    <span className={styles.iconTxt}>친구</span>
                  </Link>
                  <Link
                    href="/store"
                    className={`${styles.friendsLink} ${
                      currentPath === "/store" ? styles.friendsLinkActive : ""
                    }`}
                  >
                    <Images.nitro className={styles.icon} />
                    <span className={styles.iconTxt}>Nitro</span>
                  </Link>
                  <Link
                    href="/shop"
                    className={`${styles.friendsLink} ${
                      currentPath === "/shop" ? styles.friendsLinkActive : ""
                    }`}
                  >
                    <Images.shop className={styles.icon} />
                    <span className={styles.iconTxt}>상점</span>
                  </Link>
                </div>

                <div className={styles.directTxtWrap}>
                  <p>다이렉트 메시지</p>
                  <Images.plus className={styles.plus} />
                </div>

                <div className={styles.friends}>
                  {chatrooms?.length > 0 ? (
                    chatrooms.map((friend, index) => (
                      <div
                        key={index}
                        onClick={() => dmLink(friend)}
                        className={`${styles.friendsLink} ${
                          styles.friendProfile
                        } ${
                          decodeURIComponent(currentPath) ===
                          `/channels/me/@${friend.participantName}`
                            ? styles.friendsLinkActive
                            : ""
                        }`}
                      >
                        <div
                          className={styles.profileIcon}
                          style={{ backgroundColor: friend.iconColor }}
                        >
                          <Images.icon className={styles.profileImg} />
                        </div>
                        <div className={styles.name}>
                          {friend.participantName}
                        </div>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>

              <div className={styles.myInfo}>
                <div
                  className={styles.profileIcon}
                  style={{ backgroundColor: user?.iconColor }}
                >
                  <Images.icon className={styles.profileImg} />
                </div>
                <div className={styles.name}>{user?.name}</div>
                <Link href="/setting" className={styles.setting}>
                  <Images.setting />
                </Link>
              </div>
            </header>

            {children}
          </>
        )}
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <Provider store={store}>
      <InnerLayout>{children}</InnerLayout>
    </Provider>
  );
}
