"use client";

import AnimatedButton from "@/components/Button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
  onSubmit: (data: any) => void;
  handleClick: () => void;
}

function MainContent({ onSubmit, handleClick }: MainContentProps) {
  const { register, handleSubmit } = useForm(); // Assuming useForm is already defined
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4 h-full"
    >
      <div className="text-xl font-bold">Verify your email</div>
      <div>Your contract wallet address: 0x234</div>
      <div>Your session wallet address: 0x555</div>

      <div className="flex flex-1 justify-around items-center flex-col w-full h-max">
        <AnimatedButton onClick={handleClick}>Verify Email</AnimatedButton>
      </div>
    </form>
  );
}

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const { register, handleSubmit } = useForm(); // Assuming useForm is already defined
  const onSubmit = (data) => console.log(data);

  function handleClick() {
    window.location.href = "mailto:test@example.com";
    console.log("Clicked");
  }

  return <Loading title="Finding your account..." />;
}
