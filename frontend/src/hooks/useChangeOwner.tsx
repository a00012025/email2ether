import { publicClient } from "@/lib/wallet";
import { usePersistentStore } from "@/store/persistent";
import { useEffect, useState } from "react";

export const useChangeOwner = () => {
  const account = usePersistentStore((state) => state.account);
  const userContractAddress = usePersistentStore(
    (state) => state.userContractAddress
  );

  const setVerified = usePersistentStore((state) => state.setUserVerifiedOwner);
  const userVerified = usePersistentStore((state) => state.userVerifiedOwner);
  const [loading, setLoading] = useState(false);
  const [newOwnerTrigger, setNewOwnerTrigger] = useState(0);

  function changeOwner() {
    setNewOwnerTrigger((prev) => prev + 1);
  }

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
  }, [newOwnerTrigger]);

  return { loading, changeOwner };
};
