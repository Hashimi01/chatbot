import { create } from 'zustand';

type State = {
  queryPageIndex: number;
  queryPageSize: number;
  setQueryPageIndex: (i: number) => void;
  setQueryPageSize: (s: number) => void;
  isGrid: boolean;
  setIsGrid: (value: boolean) => void;
};

const useFiltersStore = create<State>((set) => ({
  queryPageIndex: 0,
  queryPageSize: 10,
  setQueryPageIndex: (queryPageIndex) => set({ queryPageIndex }),
  setQueryPageSize: (queryPageSize) => set({ queryPageSize }),
  isGrid: false,
  setIsGrid: (value) => set({ isGrid: value }),
}));

export default useFiltersStore;


