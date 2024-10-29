export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex flex-col w-full h-full overflow-x-clip overflow-y-auto">
        {children}
      </div>
  );
}
