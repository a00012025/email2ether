import mintAnimation from "@/constants/mintLoading.json";
import {
  generateNftMintingCalldata,
  generateUserOps,
  signUserOps,
} from "@/lib/userOps";
import { usePersistentStore } from "@/store/persistent";
import { motion, useAnimation } from "framer-motion";
import move from "lodash-move";
import LottiePlayer from "lottie-react";
import Image from "next/image";
import { useState } from "react";

import nft0 from "@/nfts/0.webp";
import nft1 from "@/nfts/1.webp";
import nft2 from "@/nfts/2.webp";
import nft3 from "@/nfts/3.webp";
import nft4 from "@/nfts/4.webp";
import nft5 from "@/nfts/5.webp";
import { useMutation } from "@tanstack/react-query";

const CARD_COLORS = ["#266678", "#cb7c7a", " #36a18b", "#cda35f", "#747474"];
const CARD_OFFSET = 40;
const SCALE_FACTOR = 0.06;

const CARDS = [
  {
    idx: 0,
    title: "Cup of Noodles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero",
    image: nft0,
    tag: "noodle",
  },
  {
    idx: 1,
    title: "Noodles on a wall",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: nft1,
    tag: "noodle",
  },
  {
    idx: 2,
    title: "Send noodles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: nft2,
    tag: "noodle",
  },
  {
    idx: 3,
    title: "Noodles in a bowl",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: nft3,
    tag: "noodle",
  },
  {
    idx: 4,
    title: "Noodles in a cup",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: nft4,
    tag: "noodle",
  },
  {
    idx: 5,
    title: "Noodles in a bowl",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: nft5,
    tag: "noodle",
  },
];

interface NFTStack {
  selectedNftIndex: (index: number) => void;
}

const NFTStack = ({ selectedNftIndex }: NFTStack) => {
  const [cards, setCards] = useState(CARDS);
  const [minting, setMinting] = useState<number | null>(null);
  const controls = useAnimation();
  const [txHash, setTxHash] = useState();
  const [mintedNft, setMintedNft] = useState<number | null>(null);

  const [userContractAddress, userSessionAccount] = usePersistentStore(
    (state) => [state.userContractAddress, state.account]
  );

  const {
    mutate: mintNft,
    isPending,
    isError,
    error,
    data,
  } = useMutation({
    mutationFn: (signedUserOp: any) => {
      return fetch(
        `https://sensible-sparrow-admittedly.ngrok-free.app/send_user_op`,
        {
          method: "POST",
          body: JSON.stringify(signedUserOp, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          ),
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());
    },
    onSuccess(data) {
      console.log("Minted NFT", data);
      setTxHash(data.tx_hash);
      setMintedNft(minting);
      setMinting(null);
    },
  });

  const handleClick = async (imgIdx: number) => {
    console.log("begine click");
    if (!userContractAddress || !userSessionAccount) return;
    console.log("after the return");

    setMinting(imgIdx);
    console.log("Minting NFT...", imgIdx);
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

    mintNft(signedUserOp);
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
                translateX: index === mintedNft ? -400 : 0,
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: CARD_COLORS.length - index,
              }}
              onDragStart={(e) => {
                console.log("dragging start");
                selectedNftIndex(index);
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
                  onDragStart={(e) => {
                    e.preventDefault();
                  }}
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
                    onClick={() => handleClick(nft.idx)}
                  >
                    {minting === nft.idx && (
                      <>
                        <LottiePlayer
                          animationData={mintAnimation}
                          style={{ width: "20px", height: "20px" }}
                        />
                      </>
                    )}
                    {mintedNft !== nft.idx && minting !== nft.idx ? (
                      <>Mint</>
                    ) : null}
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
