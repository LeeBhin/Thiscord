import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import '../globals.css'

export const metadata = {
  title: "Thiscord",
  description: "Thiscord is great for playing games and chilling with friends, or even building a worldwide community. Customize your own space to talk, play, and hang out.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html >
  );
}