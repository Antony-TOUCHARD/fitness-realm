import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex flex-col min-h-screen">
        {/* Sticky Header HUD */}
        <Header />

        {/* Dynamic Route Content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 md:pl-[18rem] pb-24 md:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}
