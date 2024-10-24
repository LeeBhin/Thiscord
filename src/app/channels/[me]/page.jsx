"use client";

import styles from "./friends.module.css";
import Images from "@/Images";
import { useCallback, useEffect, useState } from "react";
import All_Friends from "./friend_pages/allFriend";
import Pending from "./friend_pages/pending";
import Recommend from "./friend_pages/recommend";
import Add_Friend from "./friend_pages/addFriend";
import { friends_recommand, pending_friends } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { triggerSignal } from "@/counterSlice";

export default function Friends() {
  const [whichActive, setWichActive] = useState("all");
  const [counting, setCounting] = useState(0);
  const [recommands, setRecommands] = useState([]);
  const currentPath = usePathname();
  const router = useRouter();

  const dispatch = useDispatch();
  const { signalMeReceived, userInfo } = useSelector((state) => state.counter);

  const sendFriendReq = () => {
    dispatch(triggerSignal());
  };

  const pendingCount = async () => {
    const friends = await pending_friends();
    setCounting(friends.length);
  };

  useEffect(() => {
    if (currentPath !== "/channels/@me") {
      router.push("/channels/@me");
    }
  }, [currentPath]);

  useEffect(() => {
    pendingCount();
  }, [signalMeReceived]);

  const handleActive = (target) => {
    setWichActive(target);
  };

  const refresh = () => {
    pendingCount();
  };

  useEffect(() => {
    friends_recommand(userInfo?.userId)
      .then((friends) => {
        setRecommands(friends.getFriendRecommendations);
      })
      .catch((error) => {
        console.error("Error fetching friends:", error);
      });
  }, [userInfo]);

  const friendsSign = () => {};

  const renderComponent = () => {
    switch (whichActive) {
      case "all":
        return <All_Friends friendsSign={friendsSign} />;
      case "pending":
        return (
          <Pending
            pendingCount={setCounting}
            refresh={refresh}
            sendFriendReq={sendFriendReq}
          />
        );
      case "recommand":
        return <Recommend recommands={recommands} userId={userInfo.userId} />;
      case "add":
        return <Add_Friend sendFriendReq={sendFriendReq} />;
      default:
        return <All_Friends />;
    }
  };

  return (
    <div className={styles.friends}>
      <header className={styles.header}>
        <div className={styles.headerWrap}>
          <div className={styles.frinedsTitle}>
            <div className={styles.friendSvg}>
              <Images.friends />
            </div>
            <div className={styles.friendsTxt}>친구</div>
          </div>

          <div className={styles.barricade} />

          <div className={styles.statusWrap}>
            <div
              className={`${styles.all}  ${
                whichActive === "all" ? styles.statusActive : ""
              }`}
              onClick={() => handleActive("all")}
            >
              모두
            </div>

            <div
              className={`${styles.ready}  ${
                whichActive === "pending" ? styles.statusActive : ""
              }`}
              onClick={() => handleActive("pending")}
              style={counting > 0 ? { minWidth: "100px" } : {}}
            >
              대기 중
              {counting > 0 && (
                <div className={styles.pendingCount}>
                  <div className={styles.counting}>{counting}</div>
                </div>
              )}
            </div>

            <div
              className={`${styles.recommand}  ${
                whichActive === "recommand" ? styles.statusActive : ""
              }`}
              onClick={() => handleActive("recommand")}
              style={recommands.length > 0 ? { minWidth: "73px" } : {}}
            >
              추천
              {recommands.length > 0 && (
                <div className={styles.pendingCount}>
                  <div className={styles.counting}>{recommands.length}</div>
                </div>
              )}
            </div>
          </div>

          <div
            className={`${styles.addFriend}  ${
              whichActive === "add" ? styles.addActive : ""
            }`}
            onClick={() => handleActive("add")}
          >
            친구 추가하기
          </div>
        </div>
      </header>

      <div className={styles.body}>{renderComponent()}</div>
    </div>
  );
}
