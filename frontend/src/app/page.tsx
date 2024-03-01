"use client";
import SparklesIcon from "@/../public/sparkles.svg";
import EmailAccountFactoryAbi from "@/constants/EmailAccountFactoryAbi";
import dotAnimation from "@/constants/dots.json";
import { publicClient } from "@/lib/wallet";
import { getHashedEmail, usePersistentStore } from "@/store/persistent";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Lottie from "react-lottie";

interface FormData {
  email: string;
}

const cubeOptions = {
  loop: true,
  autoplay: true,
  animationData: dotAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const shakeAnimation = {
  transformX: [0, -10, 10, -10, 10, 0],
  transition: { type: "linear", duration: 0.4 },
};

const EMAIL_FACTORY_ADDRESS = "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7";
export default function GetStarted() {
  const [loading, setLoading] = useState(false);
  const controls = useAnimation();
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

      console.log("returns", userContractAddress);

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
    <div className="p-6">
      <div className="flex p-6">
        <p
          style={{
            fontSize: 64,
            fontWeight: "bold",
            letterSpacing: "-2.5px",
            lineHeight: "66px",
          }}
          className="text-center"
        >
          Get your Smart Wallet With Email in Seconds
        </p>
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
              <span>Get Started</span>
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
      <div>{userContractAddress} </div>
    </div>
  );
}
