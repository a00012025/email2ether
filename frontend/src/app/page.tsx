"use client";

import AnimatedButton from "@/components/Button";

export default function Home() {
  return (
    <main className="flex flex-1 min-h-screen flex-col items-center justify-between p-24">
      <div
        style={{ minWidth: 500, minHeight: 400 }}
        className="rounded-lg bg-offwhite shadow-lg p-8 flex flex-col items-center justify-center"
      >
        <div>working</div>
        <AnimatedButton>Click Me</AnimatedButton>
      </div>
    </main>
  );
}
