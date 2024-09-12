import Link from "next/link";
import { NavBar } from "../_components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full overflow-x-clip justify-center">
      <Link
        className="w-full text-center text-muted-foreground hover:text-foreground underline text-sm"
        href="https://github.com/BoundaryML/baml-examples/tree/main/nextjs-starter"
      >
        View source code
      </Link>
      {children}
    </div>
  );
}
