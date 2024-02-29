"use client";
import { usePersistentStore } from "@/store/persistent";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface FormData {
  email: string;
}

export default function Step1() {
  const { register, handleSubmit } = useForm<FormData>();
  const registerEmail = usePersistentStore((state) => state.setEmail);
  const router = useRouter();

  const onSubmit = (data: FormData) => {
    // Basic email check
    if (data.email && data.email.includes("@") && data.email.includes(".")) {
      registerEmail(data.email);
      router.push("/steps/2");
    } else {
      console.log("Invalid email");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4 h-full"
    >
      <div className="text-xl font-bold">Login with your email</div>

      <div className="flex flex-1 justify-around items-center flex-col w-full h-max">
        <input
          id="email"
          type="email"
          {...register("email")}
          style={{ width: "100%" }}
          className="flex mt-1 px-4 py-1 border rounded-lg h-12 w-max text-xl font-bold"
        />
        <motion.input
          type="submit"
          value="Submit"
          whileHover={{ scale: 1.03, backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer px-6 py-4 bg-blue-500 text-white font-bold rounded-lg"
          style={{ border: "none" }}
        />
      </div>
    </form>
  );
}
