"use client";

import MailImage from "@/../public/mail.png";
import AnimatedButton from "@/components/Button";
import Loading from "@/components/Loading";
import EmailAccountFactoryAbi from "@/constants/EmailAccountFactoryAbi";
import { publicClient } from "@/lib/wallet";
import { getHashedEmail, usePersistentStore } from "@/store/persistent";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Address } from "viem";

const EMAIL_FACTORY_ADDRESS = "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7";

function MailtoLink({ changeAddress }: { changeAddress: Address }) {
  const router = useRouter();
  const to = "email2ether.denver@gmail.com";
  const subject = encodeURIComponent(`Change owner to ${changeAddress}`);
  const body = encodeURIComponent(
    "Please do not modify the subject of this email.Thank you."
  );

  const mailtoHref = `mailto:${to}?subject=${subject}&body=${body}`;
  const handleEmail = () => {
    window.location.href = mailtoHref;
    setTimeout(() => {
      router.push("/steps/2");
    }, 5000);
  };

  return (
    <AnimatedButton onClick={handleEmail}>
      Send email to claim account
    </AnimatedButton>
  );
}

export default function Step1() {
  const [loading, setLoading] = useState(false);

  const account = usePersistentStore((state) => state.account);
  const email = usePersistentStore((state) => state.email);
  const userContractAddress = usePersistentStore(
    (state) => state.userContractAddress
  );
  const setUserContractAddress = usePersistentStore(
    (state) => state.setUserContractAddress
  );
  const setupNewAccount = usePersistentStore((state) => state.setupNewAccount);

  useEffect(() => {
    async function setupAccount() {
      if (email) {
        const hashedEmail = await getHashedEmail(email);

        const userContractAddress = await publicClient.readContract({
          address: EMAIL_FACTORY_ADDRESS,
          functionName: "getAddress",
          abi: EmailAccountFactoryAbi,
          args: [hashedEmail, BigInt(0)],
        });

        return userContractAddress;
      } else {
        console.log("No email found, please reset email");
      }
    }

    setLoading(true);
    setupAccount()
      .then((address) => address && setUserContractAddress(address))
      .finally(() => {
        // wait for 3 seconds
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      });
  }, [account, email]);

  function MainContent() {
    if (loading || !account || !userContractAddress) {
      return <Loading />;
    }

    const eoaAddress = account.address;
    const contractWalletAddress = userContractAddress;

    return (
      <>
        <Image src={MailImage} alt="ethereum" width={200} height={200} />
        <div className="text-xl font-bold">Verify your email</div>
        <div>Your contract wallet address: {contractWalletAddress}</div>
        <div>Your session wallet address: {eoaAddress}</div>
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

  return (
    <div className="flex justify-center items-center flex-col">
      <button onClick={() => setLoading(!loading)}>Toggle loading</button>
      <AnimatePresence>
        <motion.div
          key="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MainContent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
