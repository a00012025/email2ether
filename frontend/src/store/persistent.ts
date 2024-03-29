import { poseidonCircom, stringToCircomArray } from "@/lib/crypto";
import { Address, PrivateKeyAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StoreState {
  userVerifiedOwner: boolean; // user is the verified owner
  userContractAddress: Address | null;
  account: PrivateKeyAccount | null;
  email: string | null;
  hashedEmail: string | null;
  emailRecieved: boolean;
}

const initialState: StoreState = {
  userVerifiedOwner: false,
  userContractAddress: null,
  account: null,
  email: null,
  hashedEmail: null,
  emailRecieved: false,
};

type StoreFunctions = {
  setEmailRecieved: (recieved: boolean) => void;
  setUserVerifiedOwner: (verified: boolean) => void;
  setUserContractAddress: (address: Address) => void;
  setupNewAccount: () => PrivateKeyAccount;
  setEmail: (email: string) => void;
  setHashedEmail: (email: bigint) => void;
  getHashedEmail: () => bigint;
  reset: () => void;
};

export const usePersistentStore = create<StoreState & StoreFunctions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setEmailRecieved: (recieved: boolean) => {
        set({ emailRecieved: recieved });
      },
      reset: () => {
        set(initialState);
      },
      setUserVerifiedOwner: (verified: boolean) => {
        set({ userVerifiedOwner: verified });
      },
      setUserContractAddress: (address: Address) => {
        set({ userContractAddress: address });
      },
      setupNewAccount: () => {
        if (get().account === null) {
          const privateKey = generatePrivateKey();
          set({ account: privateKeyToAccount(privateKey) });
        }

        return get().account as PrivateKeyAccount;
      },
      setEmail: (email: string) => {
        set({ email });
      },
      setHashedEmail: (hashedEmail: bigint) => {
        set({ hashedEmail: hashedEmail.toString() });
      },
      getHashedEmail: () => {
        return BigInt(get().hashedEmail || "0");
      },
    }),
    {
      name: "persistent-user-account-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export async function getHashedEmail(email: string): Promise<bigint> {
  try {
    const circomArray = stringToCircomArray(email);
    const hashedEmail = await poseidonCircom(circomArray);
    return BigInt(hashedEmail);
  } catch (error) {
    console.error("Error hashing email:", error);
    throw error; // Rethrow or handle as needed
  }
}

export function saltEmailHash(emailHash: string, salt: string): string {
  return emailHash + salt;
}
