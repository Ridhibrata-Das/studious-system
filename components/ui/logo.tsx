"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, isScrolled }: { className?: string; isScrolled?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/logo.png" 
        alt="E-Bhoomi Logo" 
        width={32} 
        height={32}
        className="rounded-md"
      />
      <span className={`font-semibold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`}>E-Bhoomi</span>
    </div>
  );
}