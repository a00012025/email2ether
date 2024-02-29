import { poseidonCircom, stringToCircomArray } from "@/lib/crypto";
import { Account } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StoreState {
  account: Account | null;
  email: string | null;
}

const initialState: StoreState = {
  account: null,
  email: null,
};

type StoreFunctions = {
  setupNewAccount: () => void;
  setEmail: (email: string) => void;
};

export const usePersistentStore = create<StoreState & StoreFunctions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setupNewAccount: () => {
        if (get().account === null) {
          const privateKey = generatePrivateKey();
          set({ account: privateKeyToAccount(privateKey) });
        }
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
