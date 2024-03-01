"use client";

import animationData from "@/constants/loading2.json";
import Lottie from "react-lottie";

export default function Loading() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {},
  };
  return (
    <div className="flex justify-center items-center flex-col">
      <Lottie options={defaultOptions} width={400} height={350} />
    </div>
  );
}
