"use client";

import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import Images from "@/Images";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkToken } from "@/utils/api";
import { logout, load_friends } from '@/utils/api';

export default function RootLayout({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const currentPath = usePathname();
  const router = useRouter();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const verifyToken = async () => {
      if (currentPath !== '/login' && currentPath !== '/register') {
        try {
          await checkToken();

          const storedUserInfo = localStorage.getItem('userInfo');
          if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
          }
        } catch (err) {
          console.error(err);
          router.push('/login');
        }
      }
    };

    verifyToken();
  }, [router, currentPath]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friends = await load_friends();
        setFriends(friends);
      } catch (error) {
        console.error('Failed to load friends:', error);
      }
    };

    if (currentPath != '/login' || currentPath != 'register') {
      loadFriends();
    }
  }, []);

  if (currentPath === '/login' || currentPath === '/register') {
    return (
      <html lang="ko">
        <head><title>Thiscord</title></head>
        <body>
          {children}
        </body>
      </html>
    );
  }

  const logOut = () => {
    logout();
  }

  return (
    <html lang="ko">
      <head>
        <title>{currentPath === '/channels/me' ? '• Thiscord | 친구' : 'Thiscord'}</title>
      </head>
      <body className={styles.body}>
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
            <input type="text" placeholder="대화 찾기 또는 시작하기" className={styles.searchChat} />
          </div>

          <div className={styles.friendsWrap}>
            <div className={styles.topNav}>
              <Link
                href="/channels/me"
                className={`${styles.friendsLink} ${currentPath === '/channels/me' ? styles.friendsLinkActive : ''}`}
              >
                <Images.friends className={styles.icon} />
                <span className={styles.iconTxt}>친구</span>
              </Link>

              <Link
                href="/store"
                className={`${styles.friendsLink} ${currentPath === '/store' ? styles.friendsLinkActive : ''}`}
              >
                <Images.nitro className={styles.icon} />
                <span className={styles.iconTxt}>Nitro</span>
              </Link>

              <Link
                href="/shop"
                className={`${styles.friendsLink} ${currentPath === '/shop' ? styles.friendsLinkActive : ''}`}
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

              {friends.length > 0 ? (
                friends.map((friend, index) => (
                  <Link href={`/channels/me/${friend.name}`} key={index} className={`${styles.friendsLink} ${styles.friendProfile}`}>
                    <div
                      className={styles.profileIcon}
                      style={{ backgroundColor: friend.iconColor }}
                    >
                      <Images.icon className={styles.profileImg} />
                    </div>
                    <div className={styles.name}>{friend.name}</div>
                  </Link>
                ))
              ) : <></>}
            </div>
          </div>

          <div className={styles.myInfo}>
            <div className={styles.profileIcon} style={{ backgroundColor: userInfo?.iconColor }}>
              <Images.icon className={styles.profileImg} />
            </div>
            <div className={styles.name}>{userInfo?.name || ''}</div>
            <Link href="/setting" className={styles.setting} onClick={logOut}>
              <Images.setting />
            </Link>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
