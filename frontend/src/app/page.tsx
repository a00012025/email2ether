"use client";
import Link from "next/link";

export default function GetStarted() {
  return (
    <>
      <div>Get Started</div>
      <div>some explainer text</div>
      <Link href="/steps/1">Get started</Link>
    </>
  );
}
