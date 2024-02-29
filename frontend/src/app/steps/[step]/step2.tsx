"use client";

import AnimatedButton from "@/components/Button";
import abi from "@/constants/abi";
import { publicClient } from "@/lib/wallet";
import { getHashedEmail, usePersistentStore } from "@/store/persistent";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Address, getContract } from "viem";

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
  contractWalletAddress: Address | undefined;
  eoaAddress: Address | undefined;
}

function MainContent({ eoaAddress, contractWalletAddress }: MainContentProps) {
  const handleClick = () => {
    window.location.href = "mailto:xxx";
  };

  return (
    <>
      <div className="text-xl font-bold">Verify your email</div>
      <div>Your contract wallet address: {contractWalletAddress}</div>
      <div>Your session wallet address: {eoaAddress}</div>

      <div className="flex flex-1 justify-around items-center flex-col w-full h-max">
        <AnimatedButton onClick={handleClick}>Verify Email</AnimatedButton>
      </div>
    </>
  );
}

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const account = usePersistentStore((state) => state.account);
  const email = usePersistentStore((state) => state.email);
  const [smartAddress, setSmartAddress] = useState<Address | undefined>();
  const setupNewAccount = usePersistentStore((state) => state.setupNewAccount);
  console.log("account", account);

  const contract = useMemo(() => {
    return getContract({
      address: "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7",
      abi,
      client: publicClient,
    });
  }, []);

  useEffect(() => {
    async function setupAccount() {
      if (account && email) {
        const hashedEmail = await getHashedEmail(email);
        console.log("hashedEmail", hashedEmail);
        console.log("contract", contract);

        const smartAddress = await contract?.read.getAddress([
          hashedEmail,
          BigInt(0),
        ]);

        console.log("smartAddress", smartAddress);

        return smartAddress;
      } else {
        console.log("Setting up new account because no account found");
        setupNewAccount();
      }
    }

    setLoading(true);
    setupAccount()
      .then((address) => setSmartAddress(address))
      .finally(() => setLoading(false));
  }, [account, email]);

  if (loading) {
    return <Loading title="Finding your account..." />;
  }

  function handleClick() {
    window.location.href = "mailto:test@example.com";
    console.log("Clicked");
  }

  return (
    <MainContent
      eoaAddress={account?.address}
      contractWalletAddress={smartAddress}
    />
  );
}
