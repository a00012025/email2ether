"use client";

import AnimatedButton from "@/components/Button";
import EmailAccountFactoryAbi from "@/constants/EmailAccountFactoryAbi";
import { publicClient } from "@/lib/wallet";
import { getHashedEmail, usePersistentStore } from "@/store/persistent";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Address } from "viem";

const Loading = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col items-center gap-4 h-full justify-center">
      <div className="text-xl font-bold">{title}</div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "5px solid lightgray",
          borderTop: "5px solid magenta",
        }}
      />
    </div>
  );
};

interface MainContentProps {
  contractWalletAddress: Address;
  eoaAddress: Address;
}

function MailtoLink({ changeAddress }: { changeAddress: Address }) {
  const to = "email2ether.denver@gmail.com";
  const subject = encodeURIComponent(`Change owner to ${changeAddress}`);
  const body = encodeURIComponent(
    "Please do not modify the subject of this email.Thank you."
  );

  const mailtoHref = `mailto:${to}?subject=${subject}&body=${body}`;
  const handleEmail = () => {
    window.location.href = mailtoHref;
  };

  return (
    <AnimatedButton onClick={handleEmail}>
      Send email to claim account
    </AnimatedButton>
  );
}

function MainContent({ eoaAddress, contractWalletAddress }: MainContentProps) {
  return (
    <>
      <div className="text-xl font-bold">Verify your email</div>
      <div>Your contract wallet address: {contractWalletAddress}</div>
      <div>Your session wallet address: {eoaAddress}</div>
      if
      {contractWalletAddress !== undefined &&
        eoaAddress &&
        contractWalletAddress !== eoaAddress}{" "}
      {
        <div className="flex flex-1 justify-around items-center flex-col w-full h-max">
          <MailtoLink changeAddress={eoaAddress} />
        </div>
      }
    </>
  );
}

const EMAIL_FACTORY_ADDRESS = "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7";
export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const account = usePersistentStore((state) => state.account);
  const email = usePersistentStore((state) => state.email);
  const [smartAddress, setSmartAddress] = useState<Address>();
  const setupNewAccount = usePersistentStore((state) => state.setupNewAccount);

  useEffect(() => {
    if (smartAddress) {
      const unwatch = publicClient.watchEvent({
        address: smartAddress,
        pollingInterval: 5000,
        onLogs: (logs) => {
          console.log("Event Logs", logs);
          const transferedToAddress = logs[0]?.topics[2]?.toLowerCase();
          const accountAddress = account?.address.toLowerCase().substring(2);

          if (accountAddress && transferedToAddress?.includes(accountAddress)) {
            console.log("Account is verified!", accountAddress);
          }

          // do something when th
        },
      });

      console.log("Watching for events");

      return () => {
        console.log("stop watching for events");
        unwatch();
      };
    }
  }, [smartAddress]);

  useEffect(() => {
    async function setupAccount() {
      if (email) {
        const hashedEmail = await getHashedEmail(email);

        const smartAddress = await publicClient.readContract({
          address: EMAIL_FACTORY_ADDRESS,
          functionName: "getAddress",
          abi: EmailAccountFactoryAbi,
          args: [hashedEmail, BigInt(0)],
        });

        return smartAddress;
      } else {
        console.log("No email found, please reset email");
      }
    }

    setLoading(true);
    setupAccount()
      .then((address) => setSmartAddress(address))
      .finally(() => setLoading(false));
  }, [account, email]);

  if (loading || !account || !smartAddress) {
    return <Loading title="Finding your account..." />;
  }

  return (
    <MainContent
      eoaAddress={account.address}
      contractWalletAddress={smartAddress}
    />
  );
}
