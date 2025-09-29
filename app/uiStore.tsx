import { create } from "zustand";

type UiState = {
  isLoading: boolean;
};

type UiActions = {
  setIsLoading: (bool: boolean) => void;
};

type UiStore = UiActions & UiState;

const useUiStore = create<UiStore>((set) => ({
  isLoading: false,
  setIsLoading: (bool: boolean) =>
    set((state) => ({
      isLoading: !state.isLoading,
    })),
}));

export default useUiStore;
