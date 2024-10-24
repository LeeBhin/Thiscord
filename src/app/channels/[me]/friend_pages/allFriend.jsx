"use client";

import Images from "@/Images";
import styles from "../friends.module.css";
import { useEffect, useState } from "react";
import { delete_friend, load_friends } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function All_Friends({ friendsSign }) {
  const [friends, setFriends] = useState([]);
  const router = useRouter();
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friends = await load_friends();
        setFriends(friends);
      } catch (error) {
        console.error("Failed to load friends:", error);
      }
    };

    loadFriends();
  }, [friendsSign]);

  const gotoDM = (user) => {
    router.push(`/channels/me/${user}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPopup && !event.target.closest(`.${styles.pop}`)) {
        setIsPopup(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isPopup]);

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
          >{`모든 친구 – ${friends.length}명`}</p>
        </div>
      </div>

      <div className={styles.friendsList}>
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <div key={index}>
              <div className={styles.friendsLine} />
              <div
                onClick={() => gotoDM(friend.name)}
                className={styles.friend}
              >
                <div className={styles.profileWrap}>
                  <div
                    className={styles.profile}
                    style={{ backgroundColor: friend.iconColor }}
                  >
                    <Images.icon className={styles.icon} />
                  </div>
                  <div className={styles.name}>{friend.name}</div>
                </div>

                <div className={styles.btns}>
                  <Link
                    href={`/channels/me/${friend.name}`}
                    className={styles.btn}
                  >
                    <Images.chat className={styles.btnIcon} />
                  </Link>
                  <div
                    className={styles.btn}
                    onClick={(e) => {
                      setIsPopup(true);
                      e.stopPropagation();
                    }}
                  >
                    <Images.threeDot className={styles.btnIcon} />
                  </div>
                  {isPopup && (
                    <div className={styles.pop}>
                      <div
                        className={styles.deleteFriend}
                        onClick={(e) => {
                          delete_friend(friend.name);
                          setIsPopup(false);
                          e.stopPropagation();
                          location.reload();
                        }}
                      >
                        친구 삭제하기
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
