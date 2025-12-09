"use client";
import React from "react";
import Image from "next/image";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Leaf } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-lg shadow-2xl overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="E-Bhoomi Logo" 
                width={64} 
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-wider">
            E-BHOOMI
          </h1>
          <p className="text-gray-600 text-sm uppercase tracking-widest font-medium">
            Agricultural Intelligence Platform
          </p>
        </div>

        {/* Lottie Animation */}
        <div className="w-32 h-32 mx-auto">
          <DotLottieReact
            src="https://lottie.host/dbd8b3de-895d-439e-8f85-ff4e0d4eaf0f/P0E2WZ6RrH.lottie"
            loop
            autoplay
          />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">
            Initializing Smart Agriculture Platform...
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}