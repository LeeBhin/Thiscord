"use client";

import Head from 'next/head';
import styles from './friends.module.css';
import Images from '@/Images';
import { useEffect, useState } from 'react';
import { load_friends } from '@/utils/api';
export default function Friends() {
  const [whichActive, setWichActive] = useState('all');
  const [friends, setFriends] = useState([]);

  const handleActive = (target) => {
    if (target === 'all') {
      setWichActive('all')
    } else if (target === 'ready') {
      setWichActive('ready')
    } else {
      setWichActive('recommand')
    }
  }

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friends = await load_friends();
        setFriends(friends);
      } catch (error) {
        console.error('Failed to load friends:', error);
      }
    };

    loadFriends();
  }, []);

  return (
    <div className={styles.friends}>
      <Head>
        <title>Thiscord | 친구</title>
      </Head>

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
            <div className={`${styles.all}  ${whichActive === 'all' ? styles.statusActive : ''}`} onClick={() => handleActive('all')} >
              모두
            </div>

            <div className={`${styles.ready}  ${whichActive === 'ready' ? styles.statusActive : ''}`} onClick={() => handleActive('ready')}>
              대기 중
            </div>

            <div className={`${styles.recommand}  ${whichActive === 'recommand' ? styles.statusActive : ''}`} onClick={() => handleActive('recommand')}>
              추천
            </div>
          </div>

          <div className={styles.addFriend}>
            친구 추가하기
          </div>

        </div>
      </header >

      <div className={styles.body}>
        <div className={styles.searchFriend}>
          <input type="text" />
        </div>

        <p className={styles.countFriends}>{`모든 친구 – ${friends.length}명`}</p>

        <div className={styles.friendsList}>
          {friends.length > 0 ? (
            friends.map((friend, index) => (
              <div key={index} className={styles.friend}>
                <div
                  className={styles.profile}
                  style={{ backgroundColor: friend.iconColor }}
                >
                  <Images.icon className={styles.icon} />
                </div>
                <div className={styles.name}>{friend.name}</div>
              </div>
            ))
          ) : (
            <p>친구가 없습니다.</p>
          )}
        </div>

      </div>
    </div >
  );
}
