import { Navbar } from "@/components/layout/navbar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh bg-bg-primary">
      <Navbar solid />
      <div className="flex h-full min-h-0 flex-col pt-14">{children}</div>
    </div>
  );
}
