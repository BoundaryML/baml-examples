import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center p-24 gap-y-2 overflow-y-auto">
      <div className="font-semibold text-3xl h-fit flex">
        NextJS Generative UI Demos
      </div>
      <div className="flex flex-col gap-y-4 pt-12">
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/examples/pdf"
        >
          PDF Extraction
        </Link>
      </div>
    </div>
  );
}
