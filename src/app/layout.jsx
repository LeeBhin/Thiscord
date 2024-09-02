import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Thiscord",
  description: "Thiscord is great for playing games and chilling with friends, or even building a worldwide community. Customize your own space to talk, play, and hang out.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <header>

          <div className={styles.channelWrap}>
            <div className={styles.channelBar} />
            <Link href="/channels/me" className={styles.channel} />
          </div>

        </header>
        {children}
      </body>
    </html>
  );
}
