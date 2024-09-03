import "../globals.css";
import styles from "./layout.module.css";
import Link from "next/link";

import Images from "@/Images";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={styles.body}>
        <header className={styles.header}>
          <div className={styles.headerWrap}>

            <div className={styles.channelWrap}>
              <div className={styles.channelBar} />
              <Link href="/channels/me">
                <div className={`${styles.channel} ${styles.direct}`}>
                  <div className={styles.serverImg} />
                </div>
              </Link>
            </div>

          </div>

        </header>

        <header className={styles.friendsHeader}>
          <div className={styles.searchDiv}>
            <input type="text" placeholder="대화 찾기 또는 시작하기" className={styles.searchChat} />
          </div>

          <div className={styles.friendsWrap}>
            <div className={styles.topNav}>
              <Link href="/channels/me" className={styles.friendsLink}>
                <Images.friends className={styles.icon} />
                <span className={styles.iconTxt}>친구</span>
              </Link>

              <Link href="/store" className={styles.friendsLink}>
              </Link>

              <Link href="/shop" className={styles.friendsLink}>
              </Link>
            </div>
          </div>

        </header>

        {children}
      </body>
    </html>
  );
}
