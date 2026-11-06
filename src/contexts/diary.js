import { createContext, useContext } from "react";

export const DiaryContext = createContext(null);

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("DiaryProvider 안에서 사용해야 해요.");
  return ctx;
}
