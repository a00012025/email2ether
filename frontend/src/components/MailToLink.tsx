import dotAnimation from "@/constants/dots.json";
import { usePersistentStore } from "@/store/persistent";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { Address } from "viem";
import SendEmailIcon from "../../public/sendEmailIcon.svg";

const cubeOptions = {
  loop: true,
  autoplay: true,
  animationData: dotAnimation,

  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
interface AccountStatus {
  processing: boolean;
}
const fetchAccountStatus = async (
  hashedEmail: bigint | null
): Promise<AccountStatus> => {
  if (!hashedEmail) {
    throw new Error("No email found");
  }

  const response = await fetch(
    `https://sensible-sparrow-admittedly.ngrok-free.app/account?email_hash=${hashedEmail.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};

function MailtoLink({
  changeAddress,
  onEmailSent,
}: {
  changeAddress: Address;
  onEmailSent: () => void;
}) {
  const getHashedEmail = usePersistentStore((state) => state.getHashedEmail);
  const hashedEmail = getHashedEmail();
  const [polling, setPolling] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("Open Mail Client");
  const to = "email2ether.denver@gmail.com";
  const subject = encodeURIComponent(`Change owner to ${changeAddress}`);
  const body = encodeURIComponent(
    "Please send this email from the email address you used to generate your wallet. Don't modify the to or subject and we'll take care of the rest!"
  );

  const {
    data: accountStatus,
    isLoading,
    error,
  } = useQuery<AccountStatus, Error>({
    queryKey: ["accountStatus", hashedEmail.toString()],
    queryFn: () => fetchAccountStatus(hashedEmail),
    //refetchInterval: (data) => (data?.processing === true ? false : 2000),
    refetchInterval: polling ? 2000 : false,
    enabled: polling,
  });

  useEffect(() => {
    if (accountStatus?.processing === true) {
      onEmailSent();
      setPolling(false);
    }
  }, [accountStatus?.processing]);

  const mailtoHref = `mailto:${to}?subject=${subject}&body=${body}`;

  const handleEmail = () => {
    window.location.href = mailtoHref;
    setPolling(true);
    setButtonTitle("Waiting for email");

    setTimeout(() => {
      setButtonTitle("Try again?");
    }, 50000); // 50 seconds
  };

  return (
    <motion.button
      onClick={handleEmail}
      disabled={polling}
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
      type="button"
    >
      <div
        className="flex justify-center items-center"
        style={{ height: "100%" }}
      >
        <span>{buttonTitle}</span>
        <div style={{ width: "28px" }}>
          {isLoading ? (
            <Lottie options={cubeOptions} height={40} width={40} />
          ) : (
            <motion.div>
              <Image
                style={{ marginLeft: "10px" }}
                src={SendEmailIcon}
                alt="send email button"
                width={18}
                height={18}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default MailtoLink;
