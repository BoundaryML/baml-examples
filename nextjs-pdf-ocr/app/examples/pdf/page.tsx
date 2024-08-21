"use client";
import { unstable_noStore as noStore } from "next/cache";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import PDFExtractor from "./PDFExtractor";
import { Provider } from "jotai";
import { atomStore } from "@/app/_components/atoms";

export default function Page() {
  noStore();
  return (
    <>
      <Provider store={atomStore}>
        <PDFExtractor />
      </Provider>
    </>
  );
}
