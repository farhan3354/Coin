"use client";

import { useState, useEffect } from "react";
import { timeLeft } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function CountdownTimer({ endTime, className, compact }: { endTime: string; className?: string; compact?: boolean }) {
  const [time, setTime] = useState(() => timeLeft(endTime));

  useEffect(() => {
    const t = setInterval(() => setTime(timeLeft(endTime)), 1000);
    return () => clearInterval(t);
  }, [endTime]);

  if (time.total <= 0) {
    return <span className={cn("text-destructive font-medium", className)}>Ended</span>;
  }

  if (compact) {
    return (
      <span className={cn("font-mono text-sm tabular-nums", className)}>
        {time.days > 0 && `${time.days}d `}
        {String(time.hours).padStart(2, "0")}h {String(time.minutes).padStart(2, "0")}m {String(time.seconds).padStart(2, "0")}s
      </span>
    );
  }

  const blocks: { label: string; value: number }[] = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-2">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-md px-2 py-1.5 min-w-[42px] font-mono font-bold tabular-nums">
              {String(b.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{b.label}</div>
          </div>
          {i < blocks.length - 1 && <span className="text-primary font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}
