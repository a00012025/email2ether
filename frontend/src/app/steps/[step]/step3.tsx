"use client";

import AnimatedButton from "@/components/Button";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Step3() {
  const [email, setEmail] = useState("");
  const { register, handleSubmit } = useForm(); // Assuming useForm is already defined
  const onSubmit = (data) => console.log(data);

  function handleClick() {
    window.location.href = "mailto:test@example.com";
    console.log("Clicked");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4 h-full"
    >
      <div>lots of verification here, a dynamic button too</div>

      <div className="flex flex-1 justify-around items-center flex-col w-full h-max">
        <AnimatedButton onClick={handleClick}>Verify Email</AnimatedButton>
      </div>
    </form>
  );
}
