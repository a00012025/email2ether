"use client";
import ProfileIcon from "@/../public/profile.svg";
import SparklesIcon from "@/../public/sparkles.svg";
import WalletIcon from "@/../public/walletIcon.svg";
import BigText from "@/components/BigText";
import NFTCard from "@/components/NFTCard";
import EmailAccountFactoryAbi from "@/constants/EmailAccountFactoryAbi";
import dotAnimation from "@/constants/dots.json";
import downArrowAnimation from "@/constants/downArrow.json";
import downArrowBlueAnimation from "@/constants/downArrowBlue.json";
import loadingBlockchainAnimation from "@/constants/loadingBlockchain.json";
import sendAnimation from "@/constants/send.json";
import { useChangeOwner } from "@/hooks/useChangeOwner";
import { publicClient } from "@/lib/wallet";
import { getHashedEmail, usePersistentStore } from "@/store/persistent";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Ref, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Lottie from "react-lottie";
import { Address } from "viem";
import SendEmailIcon from "../../public/sendEmailIcon.svg";

interface FormData {
  email: string;
}
function CryptoProfileCard() {
  const userProfile = {
    image: ProfileIcon,
    address: "0x123...4567",
    balance: "3.5 ETH",
  };

  return (
    <motion.div
      className="max-w-sm rounded-lg overflow-hidden  bg-white text-center p-4 m-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        className="w-24 h-24 rounded-full mx-auto"
        src={userProfile.image}
        alt="User"
      />
      <p className="text-gray-800 mt-1">{userProfile.address}</p>
      <p className="text-blue-500 mt-1">{userProfile.balance}</p>
    </motion.div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const loadingBlockchainOptions = {
  loop: true,
  autoplay: true,
  animationData: loadingBlockchainAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const downArrowOptions = {
  loop: false,
  autoplay: true,
  animationData: downArrowAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const cubeOptions = {
  loop: true,
  autoplay: true,
  animationData: dotAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const sendOptions = {
  loop: false,
  autoplay: false,
  animationData: sendAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const downArrowBlueOptions = {
  loop: false,
  autoplay: true,
  animationData: downArrowBlueAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
    segments: [0, 54],
  },
};

function MailtoLink({
  changeAddress,
  onPressed,
}: {
  changeAddress: Address;
  onPressed: () => void;
}) {
  const [buttonTitle, setButtonTitle] = useState("Open Mail Client");
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
      setButtonTitle("Try again?");
    }, 2000);
    setTimeout(() => {
      onPressed();
    }, 5000);
  };

  return (
    <motion.button
      onClick={handleEmail}
      whileHover={{ backgroundColor: "#1D4ED8" }}
      whileTap={{ scale: 0.98 }}
      className="px-4 py-2 cursor-pointer font-bold bg-[#3139FBFF] rounded-lg"
      style={{
        border: "none",
        right: 12,
        top: 10,
        height: "36px",
        color: "white",
        backgroundColor: "#2563eb",
      }}
      type="button"
    >
      <div
        className="flex justify-center items-center"
        style={{ height: "100%" }}
      >
        <span>{buttonTitle}</span>
        <div style={{ width: "28px" }}>
          {false ? (
            <Lottie options={sendOptions} height={40} width={40} />
          ) : (
            <Image
              style={{ marginLeft: "10px" }}
              src={SendEmailIcon}
              alt="send email button"
              width={18}
              height={18}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}

const EMAIL_FACTORY_ADDRESS = "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7";
export default function HomePage() {
  const sendEmailSectionRef = useRef<Ref<HTMLDivElement>>(null);
  const [loading, setLoading] = useState(false);
  const controls = useAnimation();
  const { loading: loadingChangeOwner, changeOwner } = useChangeOwner();
  const userVerified = usePersistentStore((state) => state.userVerifiedOwner);

  // setup the account
  const setupAccount = usePersistentStore((state) => state.setupNewAccount);
  const reset = usePersistentStore((state) => state.reset);
  const router = useRouter();

  const account = usePersistentStore((state) => state.account);
  const email = usePersistentStore((state) => state.email);
  const userContractAddress = usePersistentStore(
    (state) => state.userContractAddress
  );
  const setUserContractAddress = usePersistentStore(
    (state) => state.setUserContractAddress
  );

  useEffect(() => {
    reset();
    setupAccount();
  }, []);

  const { register, handleSubmit } = useForm<FormData>();
  const registerEmail = usePersistentStore((state) => state.setEmail);

  async function getContractAddress(email: string) {
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

  // todo add error states
  const onSubmit = (data: FormData) => {
    console.log("submits");
    if (
      data.email &&
      data.email.includes("@gmail") &&
      data.email.includes(".")
    ) {
      console.log("data.email", data.email);
      registerEmail(data.email);

      setLoading(true);
      getContractAddress(data.email)
        .then((address) => address && setUserContractAddress(address))
        .finally(() => {
          // wait for 3 seconds
          setTimeout(() => {
            console.log("done loading", userContractAddress);
            setLoading(false);
            sendEmailSectionRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 3000);
        });
    } else {
      console.log("Invalid email");
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: {
          type: "tween",
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          duration: 0.4,
        },
      });
    }
  };

  return (
    <div className="p-6 mb-96">
      <div className="flex p-6">
        <BigText>Get your Smart Wallet With Email in Seconds</BigText>
      </div>
      <motion.div className="flex flex-1 justify-center" animate={controls}>
        <form
          style={{
            width: "500px",
            boxShadow: "0px 0px 42px -16px rgba(0,0,0,.375)",
          }}
          onSubmit={handleSubmit(onSubmit)}
          className=" relative rounded-lg h-14 text-xl font-bold outline-none  focus:shadow-inner"
        >
          <input
            id="email"
            type="email"
            placeholder="Enter a valid Gmail address"
            {...register("email")}
            style={{
              width: "70%",
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              border: "none",
            }}
            className="rounded-lg text-xl  pl-6 font-bold outline-none focus:ring-2 focus:shadow-inner placeholder-black placeholder:font-normal placeholder:font-mono placeholder:text-lg"
          />
          <motion.button
            whileHover={{ backgroundColor: "#1D4ED8" }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 cursor-pointer font-bold bg-[#3139FBFF] rounded-lg"
            style={{
              border: "none",
              position: "absolute",
              right: 12,
              top: 10,
              height: "36px",
              color: "white",
              backgroundColor: "#2563eb",
            }}
            type="submit"
          >
            <div
              className="flex justify-center items-center"
              style={{ height: "100%" }}
            >
              <span>Generate</span>
              <div style={{ width: "28px" }}>
                {loading ? (
                  <Lottie options={cubeOptions} height={40} width={40} />
                ) : (
                  <Image
                    style={{ marginLeft: "10px" }}
                    src={SparklesIcon}
                    alt="sparkles"
                    width={18}
                    height={18}
                  />
                )}
              </div>
            </div>
          </motion.button>
        </form>
      </motion.div>
      <motion.div className="mt-16 mb-8">
        <Lottie options={downArrowOptions} height={200} width={200} />
      </motion.div>
      <motion.div
        ref={sendEmailSectionRef}
        initial="visible"
        // animate={userContractAddress && !loading ? "visible" : "hidden"}
        variants={sectionVariants}
        id="send-email-section"
        className="flex flex-col justify-center items-center"
      >
        <motion.div className="px-6">
          <BigText>Here's Your New Address</BigText>
        </motion.div>
        <div
          style={{ width: "676px", height: "32px", position: "relative" }}
          className="bg-gray-100 justify-center items-center text-2xl font-bold p-4 rounded-lg shadow-lg text-center font-mono flex-row"
        >
          <div style={{ position: "absolute", left: 20, top: 8 }}>
            <Image src={WalletIcon} alt="wallet icon" width={40} height={40} />
          </div>
          <div style={{ marginLeft: "60px" }} className="flex">
            {userContractAddress}
          </div>
        </div>
        <motion.div className="px-7">
          <BigText>Let's Claim it With Email!</BigText>
        </motion.div>
        <Lottie options={downArrowBlueOptions} height={200} width={200} />

        {account && account.address && (
          <MailtoLink changeAddress={account.address} onPressed={changeOwner} />
        )}

        {loadingChangeOwner && (
          <Lottie options={loadingBlockchainOptions} height={400} width={400} />
        )}
        <div>
          change owner pending: {loadingChangeOwner ? "pending" : "done"}
        </div>
        <div>user verified {userVerified ? "verifed" : "not verified"}</div>
      </motion.div>
      <NFTCard
        nft={{
          image: ProfileIcon,
          title: "Ethereal Landscape",
          description:
            "A beautiful digital landscape that transcends the physical realm.",
          price: "0.08",
        }}
      />
      <BigText>That was Awesome!</BigText>
      <p className="text-center">
        Try out your new profile by minting an free NFT below. Don't worry,
        we'll pay the gas
      </p>
      <Image
        className="w-24 h-24 rounded-full mx-auto"
        src={ProfileIcon}
        alt="User"
      />
      <p className="text-gray-800 mt-1">{234324}</p>
      <p className="text-blue-500 mt-1">{0}</p> ETH
      <motion.div>
        <CryptoProfileCard />
      </motion.div>
    </div>
  );
}
