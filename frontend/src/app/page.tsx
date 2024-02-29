"use client";
import { usePersistentStore } from "@/store/persistent";
import Link from "next/link";
import { useEffect } from "react";

export default function GetStarted() {
  // setup the account
  const setupAccount = usePersistentStore((state) => state.setupNewAccount);
  const account = usePersistentStore((state) => state.account);

  useEffect(() => {
    if (!account) {
      setupAccount();
    }
  }, [account, setupAccount]);

  return (
    <>
      <div>Get Started</div>
      <div>some explainer text</div>
      <Link href="/steps/1">Get started</Link>
    </>
  );
}
