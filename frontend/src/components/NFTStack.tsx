import {
  generateNftMintingCalldata,
  generateUserOps,
  signUserOps,
} from "@/lib/userOps";
import { usePersistentStore } from "@/store/persistent";
import { motion } from "framer-motion";
import move from "lodash-move";
import Image from "next/image";
import { useState } from "react";
import Noodle1 from "../../public/noodle1.jpg";
import Noodle2 from "../../public/noodle2.jpeg";
import Noodle3 from "../../public/noodle3.jpeg";

const CARD_COLORS = ["#266678", "#cb7c7a", " #36a18b", "#cda35f", "#747474"];
const CARD_OFFSET = 40;
const SCALE_FACTOR = 0.06;

const CARDS = [
  {
    idx: 0,
    title: "Cup of Noodles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero",
    image: Noodle1,
    tag: "noodle",
  },
  {
    idx: 1,
    title: "Noodles on a wall",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: Noodle2,
    tag: "noodle",
  },
  {
    idx: 2,
    title: "Send noodles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: Noodle3,
    tag: "noodle",
  },
];

const NFTStack = () => {
  const [cards, setCards] = useState(CARDS);

  const [userContractAddress, userSessionAccount] = usePersistentStore(
    (state) => [state.userContractAddress, state.account]
  );

  const mintNft = async (imgIdx: number) => {
    if (!userContractAddress || !userSessionAccount) return;

    console.log("Minting NFT...");
    console.log("User contract address: ", userContractAddress);
    console.log("Image index: ", imgIdx);
    // Implement minting logic here
    const calldata = await generateNftMintingCalldata(
      userContractAddress as string,
      imgIdx
    );
    console.log("Calldata: ", calldata);
    const userOp = await generateUserOps(
      userContractAddress as string,
      calldata
    );
    console.log("User op: ", userOp);
    const signedUserOp = await signUserOps(userOp, userSessionAccount);
    console.log("Signed user op: ", signedUserOp);
  };

  const moveToEnd = (from: number) => {
    setCards(move(cards, from, cards.length - 1));
  };

  return (
    <motion.div style={{ height: "100%", marginTop: "40px" }}>
      <ul style={cardWrapStyle}>
        {cards.map((nft, index) => {
          const canDrag = index === 0;

          return (
            <motion.li
              key={index}
              style={{
                ...cardStyle,
                backgroundImage: `url(${nft.image})`,
                cursor: canDrag ? "grab" : "auto",
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: CARD_COLORS.length - index,
              }}
              drag={canDrag ? "y" : false}
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              onDragEnd={() => {
                moveToEnd(index);
              }}
            >
              <motion.div
                className="max-w-xs mx-auto overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300 ease-in-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={nft.image}
                  alt="NFT"
                  width={350}
                  height={220}
                  layout="responsive"
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full h-auto"
                />
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">{nft.title}</div>
                  <p className="text-gray-700 text-base">{nft.description}</p>
                </div>
                <div className="flex px-6 pt-4 pb-2 justify-between">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #{nft.tag}
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
                    onClick={() => mintNft(nft.idx)}
                  >
                    Mint
                  </motion.button>
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
};

const cardWrapStyle = {
  position: "relative" as "relative",
  width: "350px",
  height: "220px",
};

const cardStyle = {
  position: "absolute" as "absolute",
  width: "350px",
  height: "220px",
  borderRadius: "8px",
  transformOrigin: "top center",
  listStyle: "none",
};

export default NFTStack;
