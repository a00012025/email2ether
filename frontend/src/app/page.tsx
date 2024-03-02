"use client";
import logo from "@/../public/logo.png";
import SparklesIcon from "@/../public/sparkles.svg";
import WalletIcon from "@/../public/walletIcon.svg";
import BigText from "@/components/BigText";
import MailtoLink from "@/components/MailToLink";
import NFTStack from "@/components/NFTStack";
import ProgressBar from "@/components/ProgressBar";
import EmailAccountFactoryAbi from "@/constants/EmailAccountFactoryAbi";
import dotAnimation from "@/constants/dots.json";
import downArrowAnimation from "@/constants/downArrow.json";
import ethWalletAnimation from "@/constants/ethWallet.json";
import greenSuccessAnimation from "@/constants/greenSuccess.json";
import loadingBlockchainAnimation from "@/constants/loadingBlockchain.json";
import pinkEmailAnimation from "@/constants/pinkEmail.json";
import profileAnimation from "@/constants/profile.json";
import sendAnimation from "@/constants/send.json";
import { useChangeOwner } from "@/hooks/useChangeOwner";
import { publicClient } from "@/lib/wallet";
import { getHashedEmail, usePersistentStore } from "@/store/persistent";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import LottiePlayer from "lottie-react";
import Image from "next/image";
import { Ref, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Lottie from "react-lottie";

interface FormData {
  email: string;
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const pinkEmail = {
  loop: true,
  autoplay: true,
  animationData: pinkEmailAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const ethWalletOptions = {
  loop: false,
  autoplay: false,
  animationData: ethWalletAnimation,
  speed: 0.01,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const profileOptions = {
  loop: false,
  autoplay: true,
  animationData: profileAnimation,

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

const EMAIL_FACTORY_ADDRESS = "0x2ECC385Af1fb4C7b2f37ad0295e603ed619B7C70";
export default function HomePage() {
  const section1 = useRef<Ref<HTMLDivElement>>(null);
  const section2 = useRef<Ref<HTMLDivElement>>(null);
  const section3 = useRef<Ref<HTMLDivElement>>(null);
  const section4 = useRef<Ref<HTMLDivElement>>(null);
  const section5 = useRef<Ref<HTMLDivElement>>(null);

  const downArrowRefSection2 = useRef(null);

  const userVerifiedOwner = usePersistentStore(
    (state) => state.userVerifiedOwner
  );

  const pinkEmailRef = useRef(null);

  const emailRecieved = usePersistentStore((state) => state.emailRecieved);

  const [loading, setLoading] = useState(false);
  const controls = useAnimation();
  const { loading: loadingChangeOwner, changeOwner } = useChangeOwner({
    onOwnerChanged: () => {
      setTimeout(() => {
        section4.current?.scrollIntoView({ behavior: "smooth" });
      }, 3000);
    },
  });
  const [showSection1Arrow, setShowSection1Arrow] = useState(false);

  // setup the account
  const setupAccount = usePersistentStore((state) => state.setupNewAccount);
  const reset = usePersistentStore((state) => state.reset);

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
  const setHashedEmail = usePersistentStore((state) => state.setHashedEmail);
  const userHashedEmail = usePersistentStore((state) => state.hashedEmail);

  // Lottie Refs
  const section1Arrow = useRef(null);

  async function getContractAddress(email: string) {
    if (email) {
      const hashedEmail = await getHashedEmail(email);
      setHashedEmail(hashedEmail);

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

            setShowSection1Arrow(true);
            setTimeout(() => {
              section5.current?.scrollIntoView({ behavior: "smooth" });
            }, 2000);

            setTimeout(() => {
              section2.current?.scrollIntoView({ behavior: "smooth" });
            }, 7000);
            setTimeout(() => {
              downArrowRefSection2.current?.play();
            }, 8000);

            // trigger animation here
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
    <motion.div>
      <motion.div
        id="section-1"
        ref={section1}
        className="section"
        style={{
          justifyContent: "start",
          marginTop: "48px",
          position: "relative",
        }}
      >
        <div className="flex mb-4 rounded-2xl  my-a p-2 bg-[#1D4ED8] mt-20">
          <Image src={logo} alt="logo" width={100} height={100} />
        </div>
        <div className="flex p-6">
          <BigText>Get your Smart Wallet With Email in Seconds</BigText>
        </div>
        <motion.div
          style={{ marginTop: "12px" }}
          className="flex justify-center"
          animate={controls}
        >
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
        {showSection1Arrow && (
          <LottiePlayer
            key="downArrowSec1"
            lottieRef={section1Arrow}
            animationData={downArrowAnimation}
            loop={false}
            autoplay={true}
            initialSegment={[5, 60]}
            style={{
              width: "300px",
              height: "300px",
              position: "absolute",
              bottom: "140px",
            }}
          />
        )}
      </motion.div>
      <motion.div
        ref={section5}
        id="section-5"
        className="section"
        style={{ justifyContent: "center", paddingBottom: "300px" }}
      >
        {userHashedEmail && (
          <>
            <LottiePlayer
              animationData={ethWalletAnimation}
              style={{ width: "300px", height: "300px" }}
            />
            <motion.div className="px-12 mb-6">
              <BigText>Your Unique Address</BigText>
            </motion.div>
            <motion.div
              style={{ width: "676px", height: "32px", position: "relative" }}
              className="bg-gray-100 justify-center items-center text-2xl font-bold p-4 rounded-lg shadow-lg text-center font-mono flex-row"
            >
              <div style={{ position: "absolute", left: 20, top: 8 }}>
                <Image
                  src={WalletIcon}
                  alt="wallet icon"
                  width={40}
                  height={40}
                />
              </div>
              <div style={{ marginLeft: "60px" }} className="flex">
                {userContractAddress}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
      <motion.div
        id="section-2"
        ref={section2}
        initial="visible"
        // animate={userContractAddress && !loading ? "visible" : "hidden"}
        variants={sectionVariants}
        className="section"
      >
        {userHashedEmail && (
          <>
            <motion.div className="px-12 tm-2">
              <BigText>Let's Claim it by Sending an Email!</BigText>
            </motion.div>
            <div>
              <p className="italic text-sm">
                Only YOUR email address can claim this address
              </p>
            </div>
            <AnimatePresence>
              {emailRecieved ? (
                <motion.div className="flex justify-center" key="sec2-1">
                  <LottiePlayer
                    animationData={greenSuccessAnimation}
                    autoplay={true}
                    loop={false}
                    style={{ height: "400px", width: "500px" }}
                  />
                </motion.div>
              ) : (
                <motion.div className="flex justify-center" key="sec2-2">
                  <LottiePlayer
                    animationData={pinkEmailAnimation}
                    autoplay={false}
                    lottieRef={pinkEmailRef}
                    style={{ height: "400px", width: "500px" }}
                  />
                </motion.div>
              )}
              <motion.div className="mt-8 mb-8" key="sec2-3">
                <LottiePlayer
                  key="downArrowSec2"
                  lottieRef={downArrowRefSection2}
                  loop={false}
                  autoplay={false}
                  animationData={downArrowAnimation}
                  initialSegment={[5, 60]}
                  style={{ width: "200px", height: "200px" }}
                />
              </motion.div>
            </AnimatePresence>
            <motion.div
              className="flex justify-center mt-3"
              style={{ width: "200px" }}
            >
              {!emailRecieved && account && account.address && (
                <MailtoLink
                  onClicked={() => {
                    pinkEmailRef.current?.play();
                    downArrowRefSection2.current?.destroy();
                  }}
                  changeAddress={account.address}
                  onEmailSent={() => {
                    changeOwner();
                    pinkEmailRef.current?.stop();
                    setTimeout(() => {
                      section3.current?.scrollIntoView({ behavior: "smooth" });
                    }, 3000);
                  }}
                />
              )}
            </motion.div>
          </>
        )}
      </motion.div>
      <motion.div ref={section3} id="section-3" className="section">
        <motion.div className="flex items-center flex-col px-12 tm-2 relative">
          <AnimatePresence>
            {loadingChangeOwner && !userVerifiedOwner && (
              <motion.div key="sec3-1">
                <BigText>Connecting You to Your Wallet</BigText>
                <LottiePlayer
                  animationData={loadingBlockchainAnimation}
                  autoplay={true}
                />
                <motion.div
                  style={{ bottom: 20 }}
                  className="flex flex-1 mx-56"
                >
                  <ProgressBar />
                </motion.div>
              </motion.div>
            )}
            {!loadingChangeOwner && userVerifiedOwner && (
              <motion.div key="sec3-2">
                <BigText>Yay! You're Connected!</BigText>
                <LottiePlayer
                  animationData={greenSuccessAnimation}
                  autoplay={true}
                  loop={false}
                  style={{ height: "400px", width: "500px" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div
        ref={section4}
        id="section-4"
        className="section justify-start"
        style={{ marginBottom: "48px", justifyContent: "start" }}
      >
        {userVerifiedOwner && (
          <>
            <BigText>That was Awesome!</BigText>
            <p className="text-center px-32 m-0 pt-6">
              Try out your new wallet by minting a free NFT below
            </p>
            <p className="text-center text-sm px-32 m-0">
              (Don't worry, we'll pay all the fees!)
            </p>
            <motion.div className="flex justify-center  flex-col mb-10">
              <Lottie options={profileOptions} height={200} width={200} />
              <motion.div className="text-center">
                <p className="text-gray-800 m-0 font-bold shadow rounded-2xl p-3 ">
                  {userContractAddress} sadfsdf
                </p>
              </motion.div>
            </motion.div>

            <NFTStack />
          </>
        )}
      </motion.div>{" "}
      {/* END SECTION 4*/}
    </motion.div>
  );
}
