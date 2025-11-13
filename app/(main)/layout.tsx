import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="min-h-screen bg-bg-base text-primary">{children}</div>;
}
