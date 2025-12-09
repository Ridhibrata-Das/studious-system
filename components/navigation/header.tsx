"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Menu, X, LayoutDashboard, Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { TranslateWrapper } from "@/components/translate-wrapper";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { setModalOpen } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // close mobile menu on route change
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md border-b" : "bg-transparent"
        }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo (preserved) */}
          <Link href="/" className="flex-shrink-0">
            <Logo isScrolled={isScrolled} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${isScrolled ? "text-gray-700 hover:text-green-600" : "text-white hover:text-green-300"
                  }`}
              >
                <TranslateWrapper text={item.name} />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setModalOpen(true)}
              className={isScrolled ? "text-gray-700" : "text-white"}
              title="Change Language"
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <TranslateWrapper text="Dashboard" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={isScrolled ? "text-gray-700" : "text-white"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg shadow-lg mt-2 border">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md cursor-pointer transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <TranslateWrapper text={item.name} />
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="block px-3 py-2 bg-green-600 text-white rounded-md text-center hover:bg-green-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="inline-flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> <TranslateWrapper text="Dashboard" />
                </span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}