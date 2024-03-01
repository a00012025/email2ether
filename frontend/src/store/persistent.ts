import { poseidonCircom, stringToCircomArray } from "@/lib/crypto";
import { Account, Address } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StoreState {
  userVerifiedOwner: boolean; // user is the verified owner
  userContractAddress: Address | null;
  account: Account | null;
  email: string | null;
}

const initialState: StoreState = {
  userVerifiedOwner: false,
  userContractAddress: null,
  account: null,
  email: null,
};

type StoreFunctions = {
  setUserVerifiedOwner: (verified: boolean) => void;
  setUserContractAddress: (address: Address) => void;
  setupNewAccount: () => Account;
  setEmail: (email: string) => void;
  reset: () => void;
};

export const usePersistentStore = create<StoreState & StoreFunctions>()(
  persist(
    (set, get) => ({
      ...initialState,
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
        return get().account as Account;
      },
      setEmail: (email: string) => {
        set({ email });
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
