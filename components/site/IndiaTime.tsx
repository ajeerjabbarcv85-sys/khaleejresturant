"use client";

import { useEffect, useState } from "react";
import { formatIndiaTime } from "@/lib/utils";

export default function IndiaTime({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(formatIndiaTime(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span suppressHydrationWarning className={className}>
      {time ? `IST ${time}` : "IST --:--:--"}
    </span>
  );
}
