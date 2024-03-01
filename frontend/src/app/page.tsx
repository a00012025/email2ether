"use client";
import { usePersistentStore } from "@/store/persistent";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  email: string;
}

export default function GetStarted() {
  // setup the account
  const setupAccount = usePersistentStore((state) => state.setupNewAccount);
  const account = usePersistentStore((state) => state.account);
  const router = useRouter();

  useEffect(() => {
    if (!account) {
      setupAccount();
    }
  }, [account, setupAccount]);

  const { register, handleSubmit } = useForm<FormData>();
  const registerEmail = usePersistentStore((state) => state.setEmail);

  // todo add error states
  const onSubmit = (data: FormData) => {
    if (
      data.email &&
      data.email.includes("@gmail") &&
      data.email.includes(".")
    ) {
      registerEmail(data.email);
      router.push("/steps/1");
    } else {
      console.log("Invalid email");
    }
  };

  return (
    <div className="p-6">
      <div className="flex p-6">
        <text className="text-lg text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          lacinia odio vitae vestibulum vestibulum. Sed nec felis pellentesque,
          lacinia dui sed, ultricies sapien.
        </text>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-4 h-full gap-y-4"
      >
        <div className="flex flex-1 justify-around items-center flex-col">
          <input
            id="email"
            type="email"
            {...register("email")}
            style={{
              width: "100%",
              border: "none",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
            className="flex mt-1 mb-6 px-6 py-1 rounded-lg h-14 text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-inner"
          />
          <motion.input
            type="submit"
            value="Claim Account"
            whileHover={{ scale: 1.03, backgroundColor: "#2563eb" }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer px-6 py-4 bg-blue-500 text-white  text-xl font-bold rounded-lg"
            style={{ border: "none" }}
          />
        </div>
      </form>
    </div>
  );
}
