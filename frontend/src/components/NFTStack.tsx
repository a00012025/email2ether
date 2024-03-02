import { motion } from "framer-motion";
import move from "lodash-move";
import Image from "next/image";
import { useState } from "react";
import Noodle1 from "../../public/noodle1.jpg";
import Noodle2 from "../../public/noodle2.jpeg";
import Noodle3 from "../../public/noodle3.jpeg";

const CARD_COLORS = ["#266678", "#cb7c7a", " #36a18b", "#cda35f", "#747474"];
const CARD_OFFSET = 20;
const SCALE_FACTOR = 0.06;

const CARDS = [
  {
    title: "Cup of Noodles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero",
    image: Noodle1,
    tag: "noodle",
  },
  {
    title: "Noodles on a wall",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: Noodle2,
    tag: "noodle",
  },
  {
    title: "Send noodles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet semper lacus, in mollis libero.",
    image: Noodle3,
    tag: "noodle",
  },
];

const NFTStack = () => {
  const [cards, setCards] = useState(CARDS);

  const moveToEnd = (from: number) => {
    setCards(move(cards, from, cards.length - 1));
  };

  return (
    <div style={wrapperStyle}>
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
                console.log("this is the end");

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
                <div className="px-6 pt-4 pb-2">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #{nft.tag}
                  </span>
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

const wrapperStyle = {
  position: "relative" as "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
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
