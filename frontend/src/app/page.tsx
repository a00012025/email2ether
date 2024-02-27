"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AnimatedForm() {
  const [email, setEmail] = useState("");
  const { register, handleSubmit } = useForm(); // Assuming useForm is already defined
  const onSubmit = (data) => console.log(data);

  const labelAnimation = {
    active: {
      opacity: 0,
      y: -20,
      scale: 0.9,
    },
    inactive: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
