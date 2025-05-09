"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<string>("No data yet");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/health");
        const txt = await res.text();
        setData(txt);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData("Error fetching data");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {data}
    </div>
  );
}
