import { NavBar } from "../_components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* <NavBar /> */}
      {children}
    </div>
  );
}
