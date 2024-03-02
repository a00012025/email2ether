import { motion } from "framer-motion";

interface BigTextProps {
  children: React.ReactNode;
  props?: any;
}

export default function BigText({ children, props }: BigTextProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="m-0 text-center font-bold !text-[64px] leading-[66px] tracking-[2.5px]"
      {...props}
    >
      {children}
    </motion.p>
  );
}
