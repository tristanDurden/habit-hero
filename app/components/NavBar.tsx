import React, { useState, useRef, useEffect } from "react";
import { ModeToggle } from "./ModeToggle";
import { SquareStar, Menu } from "lucide-react";
import { CalendarDrawer } from "./CalendarDrawer";
import { AuthButtons } from "./AuthButtons";
import { useOnlineStatus } from "../providers/online-status";
import Link from "next/link";

export default function NavBar() {
  const { isOnline } = useOnlineStatus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center py-4 px-6 border-b-2 relative">
      {/* left side of the navbar */}
      <div className="flex flex-row gap-1 items-center">
        <Link href="/" className="flex flex-row gap-1 items-center">
          <SquareStar size={32} />
          <h1 className="text-2xl font-bold">Habit Hero</h1>
        </Link>
      </div>

      {/* right side of the navbar */}
      <div className="hidden md:flex items-center gap-5">
        <p>Status: {isOnline ? "🟢 Online" : "🔴 Offline"}</p>
        <AuthButtons />
        <CalendarDrawer />
        <ModeToggle />
      </div>

      {/* Mobile Hamburger Menu - Only visible on small screens */}
      <div className="md:hidden relative" ref={menuRef}>
        {/* Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Menu Items */}
            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm">
                  {isOnline ? "🟢 Online" : "🔴 Offline"}
                </span>
              </div>

              {/* Calendar Row */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="text-sm font-medium">Calendar</span>
                <CalendarDrawer />
              </div>

              {/* Theme Toggle Row */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="text-sm font-medium">Theme</span>
                <ModeToggle />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Auth Buttons */}
              <div className="p-3">
                <AuthButtons />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
