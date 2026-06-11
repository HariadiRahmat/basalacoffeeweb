"use client";

import { ReactElement, useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";

export function ChartFrame({
  height,
  className = "",
  children,
}: {
  height: number;
  className?: string;
  children: ReactElement;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`chart-frame ${className}`} style={{ height }}>
      {mounted ? (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
