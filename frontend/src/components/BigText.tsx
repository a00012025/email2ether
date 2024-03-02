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
      style={{
        fontSize: 64,
        fontWeight: "bold",
        letterSpacing: "-2.5px",
        lineHeight: "66px",
      }}
      className="text-center"
      {...props}
    >
      {children}
    </motion.p>
  );
}
