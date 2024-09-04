"use client";

import Head from 'next/head';
import styles from './friends.module.css';
import Images from '@/Images';
import { useState } from 'react';
export default function Friends() {
  const [whichActive, setWichActive] = useState('all');

  const handleActive = (target) => {
    if (target === 'all') {
      setWichActive('all')
    } else if (target === 'ready') {
      setWichActive('ready')
    } else {
      setWichActive('recommand')
    }
  }

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

      </div>
    </div >
  );
}
