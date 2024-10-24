"use client";

import Images from "@/Images";
import styles from "../friends.module.css";
import { useEffect, useState } from "react";
import { add_friend, delete_friend, friends_recommand } from "@/utils/api";

export default function Recommend({ recommands, userId }) {
  const [friends, setFriends] = useState(recommands);

  const friendsRecommand = async () => {
    const friends = await friends_recommand(userId);
    setFriends(friends);
  };

  const acceptFriend = async (friendName) => {
    await add_friend(friendName);
    await friendsRecommand();
  };

  const deleteFriend = async (friendName) => {
    await delete_friend(friendName);
    await friendsRecommand();
  };

  return (
    <div>
      <div className={styles.bodyWrap}>
        <div className={styles.searchFriend}>
          <input type="text" placeholder="검색하기" />
          <Images.search className={styles.searchIcon} />
        </div>

        <div className={styles.friendsWrap}>
          <p
            className={styles.countFriends}
          >{`친구 추천 – ${friends.length}명`}</p>
        </div>

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
                        {recommands.mutualFriends}
                      </div>
                    </div>
                  </div>

                  <div className={styles.ox}>
                    <div
                      className={styles.accept}
                      onClick={() => acceptFriend(friend.name)}
                    >
                      <Images.accept />
                    </div>
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
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
