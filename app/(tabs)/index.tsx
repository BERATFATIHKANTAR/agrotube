import SplashScreen from "@/components/SplashScreen";
import { useRouter } from "expo-router";
import React from "react";

export default function Index() {
  const router = useRouter();

  const handleStart = () => {
    // Sağa kaydırıldığında Login sayfasına yönlendir
    router.replace("/auth/login");
  };

  return <SplashScreen onStartPressed={handleStart} />;
}
