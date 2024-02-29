import { Account } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      getStorage: () => localStorage,
    }
  )
);
