import { motion } from "framer-motion";
import React from "react";

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  whileHover?: object;
  whileTap?: object;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  whileHover = {
    scale: 1.3,
    transition: { duration: 0.4 },
  },
  whileTap = {
    scale: 0.9,
    transition: { duration: 0.2 },
  },
  className = "",
}) => {
  return (
    <motion.button
      whileHover={whileHover}
      whileTap={whileTap}
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
