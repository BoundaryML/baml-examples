import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-2 overflow-y-scroll">
      <div className="font-semibold text-3xl h-fit flex">
        NextJS Generative UI Demos
      </div>
      <div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/examples/stream-object"
        >
          Extract resume
        </Link>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/examples/rag"
        >
          RAG UI
        </Link>
      </div>
    </main>
  );
}
