import { NavBar } from "../_components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full overflow-x-clip justify-center">
      {children}
    </div>
  );
}
