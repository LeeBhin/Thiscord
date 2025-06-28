"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkToken } from "@/utils/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const verifyTokenAndRedirect = async () => {
      try {
        await checkToken();
        router.push("/channels/@me");
      } catch (err) {
        router.push("/login");
      }
    };

    verifyTokenAndRedirect();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#313338',
      color: '#ffffff'
    }}>
      <div>로딩 중...</div>
    </div>
  );
}