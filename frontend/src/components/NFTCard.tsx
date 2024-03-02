import { motion } from "framer-motion";
import Image from "next/image";

const NFTCard = ({ nft }) => {
  // Placeholder mint function
  const mintNFT = () => {
    console.log("Minting NFT...");
    // Implement minting logic here
  };

  return (
    <motion.div
      className="max-w-sm rounded overflow-hidden shadow-lg bg-white m-4"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        className="w-full"
        src={nft.image}
        alt="NFT"
        width={200}
        height={200}
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{nft.title}</div>
        <p className="text-gray-700 text-base">{nft.description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {nft.price} ETH
        </span>
        <motion.button
          whileHover={{ backgroundColor: "#1D4ED8" }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 cursor-pointer font-bold bg-[#3139FBFF] rounded-lg"
          style={{
            border: "none",
            right: 12,
            top: 10,
            height: "36px",
            color: "white",
            backgroundColor: "#2563eb",
          }}
          onClick={mintNFT}
        >
          Mint
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NFTCard;
