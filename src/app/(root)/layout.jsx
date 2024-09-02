import "../globals.css";
import styles from "./layout.module.css";
import Link from "next/link";

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

        {children}
      </body>
    </html>
  );
}
