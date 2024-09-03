"use client";

import "../globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Images from "@/Images";

export default function RootLayout({ children }) {

  const currentPath = usePathname();

  return (
    <html lang="ko">
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

              <div className={`${styles.friendsLink} ${styles.friendProfile}`}>
                <div className={styles.profileIcon} >
                  <Images.icon className={styles.profileImg} />
                </div>
                <div className={styles.name}>이빈</div>
              </div>

            </div>
          </div>

        </header>

        {children}
      </body>
    </html>
  );
}
