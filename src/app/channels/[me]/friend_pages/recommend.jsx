"use client";

import Images from "@/Images";
import styles from "../friends.module.css";
import { useEffect, useState } from "react";
import { add_friend, delete_friend, friends_recommand } from "@/utils/api";

export default function Recommend({ recommands, userId, sendFriendReq }) {
  const [friends, setFriends] = useState(recommands || []);
  const [excludedFriends, setExcludedFriends] = useState(() => {
    const storedExcluded = localStorage.getItem("excludedFriends");
    return storedExcluded ? JSON.parse(storedExcluded) : [];
  });

  useEffect(() => {
    friends_recommand(userId)
      .then((response) => {
        const filteredFriends = response.getFriendRecommendations.filter(
          (friend) => !excludedFriends.includes(friend.name)
        );
        setFriends(filteredFriends);
      })
      .catch((error) => {
        console.error("Error fetching friends:", error);
      });
  }, [userId, excludedFriends]);

  const friendsRecommand = async () => {
    const friends = await friends_recommand(userId);
    const filteredFriends = friends.getFriendRecommendations.filter(
      (friend) => !excludedFriends.includes(friend.name)
    );
    setFriends(filteredFriends);
  };

  const acceptFriend = async (friendName) => {
    await add_friend(friendName);
    sendFriendReq();
    await friendsRecommand();
    location.reload();
  };

  const deleteFriend = async (friendName) => {
    await delete_friend(friendName);
    const newExcludedFriends = [...excludedFriends, friendName];
    setExcludedFriends(newExcludedFriends);
    localStorage.setItem("excludedFriends", JSON.stringify(newExcludedFriends));
    await friendsRecommand();
    sendFriendReq();
    location.reload();
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
            <p
              className={styles.countFriends}
            >{`친구 추천 – ${friends.length}명`}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.friendsList}>
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <div key={index}>
              <div className={styles.friendsLine} />
              <div className={`${styles.friend} ${styles.friendPending}`}>
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
                      {friend.mutualFriends?.length ? (
                        <>
                          {friend.mutualFriends
                            .slice(0, 2)
                            .map((name, index) => (
                              <span key={`mutual-${index}`}>
                                <strong>{name}</strong>님
                                {index <
                                Math.min(1, friend.mutualFriends.length - 1)
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          {friend.mutualFriends.length > 2
                            ? ` 외 ${friend.mutualFriends.length - 2}명`
                            : null}
                          과 친구입니다.
                        </>
                      ) : null}
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
          <div className={styles.bottom}>
            <Images.norecommand className={styles.wumpus} />
            <p>
              Wumpus가 친구 찾기에 열심히예요. 곧 멋진 친구를 소개해줄 거예요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
