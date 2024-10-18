"use client";

import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import Images from "@/Images";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkToken, load_chatrooms, my_info } from "@/utils/api";
import { load_friends } from "@/utils/api";
import { Provider, useSelector } from "react-redux";
import store from "@/store";
import { useDispatch } from "react-redux";
import {
  chatRemoveSignal,
  setReceiverInfo,
  setUserInfo,
  signalToMe,
  chatEditReceived,
} from "@/counterSlice";
import io from "socket.io-client";

function InnerLayout({ children }) {
  const currentPath = usePathname();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const [title, setTitle] = useState("Thiscord");
  const [user, setUser] = useState();

  const {
    signalReceived,
    chatSignalReceived,
    userInfo,
    chatMessage,
    chatEdit,
    chatRemove,
    loginReceived
  } = useSelector((state) => state.counter);

  const handleUserInfoUpdate = (name, iconColor) => {
    dispatch(setUserInfo({ name, iconColor }));
  };

  const connectSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log('ccs')
    });

    newSocket.on("message", () => {
      console.log('socket message 받음')
      dispatch(signalToMe());
      chatRooms();
    });

    newSocket.on("delete", () => {
      dispatch(signalToMe());
    });

    newSocket.on("friendRes", () => {
      dispatch(signalToMe());
    });

    setSocket(newSocket);

    return newSocket;
  }, []);

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
  }, [router, currentPath]);

  useEffect(() => {
    if (currentPath === "/login" || currentPath === "/register") {
      return;
    }
    const getInfo = async () => {
      const info = await my_info();
      handleUserInfoUpdate(info.name, info.iconColor);
      setUser(info);
    };
    getInfo();
  }, [router, currentPath]);

  useEffect(() => {
    chatRooms();
    if (socket) {
      socket.emit("friendReq", {});
    }
  }, [signalReceived, currentPath]);

  useEffect(() => {
    chatRooms();
    if (socket) {
      console.log('chatsingalreceived')
      socket.emit("message", {
        message: chatMessage.message,
        receivedUser: chatMessage.receivedUser,
      });
    }
  }, [chatSignalReceived]);

  useEffect(() => {
    chatRooms();
    if (socket) {
      socket.emit("delete", {
        receivedUser: chatRemove.receivedUser,
      });
    }
  }, [chatRemoveSignal, chatRemove]);

  useEffect(() => {
    chatRooms();
    if (socket) {
      socket.emit("delete", {
        receivedUser: chatEdit.receivedUser,
      });
    }
  }, [chatEditReceived, chatEdit]);

  // useEffect(() => {
  //   const loadFriends = async () => {
  //     if (!userInfo) {
  //       return;
  //     }
  //     try {
  //       const friends = await load_friends();
  //       setFriends(friends);
  //     } catch (error) {
  //       console.error("Failed to load friends:", error);
  //     }
  //   };

  //   if (currentPath !== "/login" && currentPath !== "/register") {
  //     loadFriends();
  //   }
  // }, [currentPath]);

  const chatRooms = async () => {
    if (currentPath === "/login" || currentPath === "/register") {
      return;
    }
    try {
      const rooms = await load_chatrooms();

      const sortedRooms = rooms.sort((a, b) => {
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      });
      setChatrooms(sortedRooms);
    } catch (error) {
      console.error("Failed to load chatrooms:", error);
    }
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
                  <div className={styles.channelBar} />
                  <Link href="/channels/me">
                    <div className={`${styles.channel} ${styles.direct}`}>
                      <Images.icon className={styles.serverImg} />
                    </div>
                  </Link>
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
                    className={`${styles.friendsLink} ${currentPath === "/channels/@me"
                      ? styles.friendsLinkActive
                      : ""
                      }`}
                  >
                    <Images.friends className={styles.icon} />
                    <span className={styles.iconTxt}>친구</span>
                  </Link>
                  <Link
                    href="/store"
                    className={`${styles.friendsLink} ${currentPath === "/store" ? styles.friendsLinkActive : ""
                      }`}
                  >
                    <Images.nitro className={styles.icon} />
                    <span className={styles.iconTxt}>Nitro</span>
                  </Link>
                  <Link
                    href="/shop"
                    className={`${styles.friendsLink} ${currentPath === "/shop" ? styles.friendsLinkActive : ""
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
                  {chatrooms.length > 0 ? (
                    chatrooms.map((friend, index) => (
                      <div
                        key={index}
                        onClick={() => dmLink(friend)}
                        className={`${styles.friendsLink} ${styles.friendProfile
                          } ${decodeURIComponent(currentPath) ===
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
