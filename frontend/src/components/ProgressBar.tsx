import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const ProgressBar = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      width: "100%",
      backgroundColor: ["#ff0000", "#ffff00", "#008000"],
      transition: { duration: 30, ease: "linear" },
    });
  }, [controls]);

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#eee",
        height: "15px",
        borderRadius: "5px",
      }}
    >
      <motion.div
        initial={{ width: "0%", backgroundColor: "#ff0000" }}
        animate={controls}
        style={{ height: "15px", borderRadius: "5px" }}
      />
    </div>
  );
};

export default ProgressBar;
