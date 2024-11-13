"use client";

import Images from "@/Images";
import styles from "../friends.module.css";
import { useEffect, useState } from "react";
import { accept_friend, delete_friend, pending_friends } from "@/utils/api";

export default function Pending({ refresh, sendFriendReq }) {
  const [friends, setFriends] = useState([]);

  const pendingFriends = async () => {
    const friends = await pending_friends();
    setFriends(friends);
  };

  useEffect(() => {
    pendingFriends();
  }, [refresh]);

  const acceptFriend = async (friendName) => {
    await accept_friend(friendName);
    await pendingFriends();
    refresh();
    sendFriendReq();
  };

  const deleteFriend = async (friendName) => {
    await delete_friend(friendName);
    await pendingFriends();
    refresh();
    sendFriendReq();
  };
  return (
    <div>
      {friends.length > 0 ? (
        <div className={styles.bodyWrap}>
          <div className={styles.searchFriend}>
            <input type="text" placeholder="검색하기" />
            <Images.search className={styles.searchIcon} />
          </div>

          <div className={styles.friendsWrap}>
            <p className={styles.countFriends}>{`대기 중 – ${friends.length}명`}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.friendsList}>
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <div key={index}>
              <div className={styles.friendsLine} />
              <div
                key={index}
                className={`${styles.friend} ${styles.friendPending}`}
              >
                <div className={styles.profileWrap}>
                  <div
                    className={styles.profile}
                    style={{ backgroundColor: friend.iconColor }}
                  >
                    <Images.icon className={styles.icon} />
                  </div>
                  <div className={styles.nameWrap}>
                    <div className={styles.name}>{friend.name}</div>
                    <div className={styles.pending}>
                      {friend.name === friend.who
                        ? "받은 친구 요청"
                        : "보낸 친구 요청"}
                    </div>
                  </div>
                </div>

                <div className={styles.ox}>
                  {friend.name === friend.who ? (
                    <div
                      className={styles.accept}
                      onClick={() => acceptFriend(friend.name)}
                    >
                      <Images.accept />
                    </div>
                  ) : (
                    <></>
                  )}
                  <div
                    className={styles.deny}
                    onClick={() => deleteFriend(friend.name)}
                  >
                    <Images.deny />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.bottom}>
            <Images.nopending className={styles.wumpus} />
            <p>대기 중인 친구 요청이 없네요. 그래도 옆에 Wumpus는 있네요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
