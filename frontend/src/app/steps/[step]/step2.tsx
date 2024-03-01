"use client";

import { publicClient } from "@/lib/wallet";
import { usePersistentStore } from "@/store/persistent";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Step2() {
  const account = usePersistentStore((state) => state.account);
  const userContractAddress = usePersistentStore(
    (state) => state.userContractAddress
  );

  const setVerified = usePersistentStore((state) => state.setUserVerifiedOwner);
  const userVerified = usePersistentStore((state) => state.userVerifiedOwner);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userContractAddress && account && !userVerified) {
      console.log("user contractAddress", userContractAddress);
      console.log("account", account.address);
      setLoading(true);
      const unwatch = publicClient.watchEvent({
        address: userContractAddress,
        pollingInterval: 5000,
        onLogs: (logs) => {
          console.log("Event Logs", logs);
          const transferedToAddress = logs[0]?.topics[2]?.toLowerCase();
          const accountAddress = account?.address.toLowerCase().substring(2);

          if (accountAddress && transferedToAddress?.includes(accountAddress)) {
            setVerified(true);
            setLoading(false);
            unwatch();
            console.log("Account is verified!", accountAddress);
          }
        },
      });

      console.log("Watching for events");

      return () => {
        console.log("stop watching for events");
        setLoading(false);
        unwatch();
      };
    }
  }, [userContractAddress]);

  return (
    <div>
      <Link href="/steps/1">Back</Link>
      <p>
        Looking for your account: Verified?:{" "}
        {userVerified ? "verified" : "pending"}
      </p>
      {userVerified && (
        <div>
          <div>profile photo</div>
          <div>address</div>
          <div>seperator</div>
          <div>NFT Image</div>
          <button>Claim</button>
        </div>
      )}
    </div>
  );
}
