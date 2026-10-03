"use client";

import { MenuIcon } from "@/components/common/header/icons";
import ThemeToggle from "@/components/common/header/theme-toggle";
import { UserProfileButton } from "@/components/common/header/user-profile";
import { ThreeDots } from "@/components/common/sidebar/icon";
import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";
import SearchBar from "./searchbar";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userName, setUserName] = useState("Talha Mehmood");
  const [userEmail, setUserEmail] = useState("divcodexweb@gmail.com");
  const [userImage, setUserImage] = useState<string | null>(null); // <-- Image ke liye state add kar di

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const nameCookie = getCookie("userName");
    const emailCookie = getCookie("userEmail");
    const imageCookie = getCookie("userImage"); // <-- Cookie se image ka link nikal rahe hain

    if (nameCookie) {
      setUserName(decodeURIComponent(nameCookie));
    }
    if (emailCookie) {
      setUserEmail(decodeURIComponent(emailCookie));
    }
    if (imageCookie) {
      setUserImage(decodeURIComponent(imageCookie)); // <-- State mein Cloudinary link set kar diya
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-[0.5px] border-card-border bg-card-surface-area px-2 py-4 lg:px-5">
        {/* Mobile layout (< xl) 3-column grid: menu | logo | dots */}
        <div className="flex items-center xl:hidden">
          {/* Left: Menu / Hamburger */}
          <div className="flex flex-1 justify-start">
            <button
              id="mobile-menu-toggle"
              onClick={onMenuClick}
              aria-label="Open sidebar menu"
              className="rounded-md px-1.5 py-1 text-icon-tertiary transition-colors hover:text-text-primary"
            >
              <MenuIcon />
            </button>
          </div>


          {/* Right: Three-dot */}
          <div className="flex flex-1 justify-end">
            <button
              id="mobile-info-toggle"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              aria-label="Open quick access"
              className={cn(
                "rounded-md px-1.5 py-3 transition-colors",
                isDrawerOpen
                  ? "bg-background-gray-secondary text-text-primary"
                  : "text-icon-tertiary hover:text-text-primary",
              )}
            >
              <ThreeDots />
            </button>
          </div>
        </div>

        {/* Desktop layout (xl+) - original layout */}
        <div className="hidden items-center justify-between xl:flex">
          {/* Left Side - Search */}
          <div className="max-w-xs flex-1">
            <SearchBar />
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2.5">
            {/* Yahan userImage prop pass kar diya hai */}
            <UserProfileButton userName={userName} userEmail={userEmail} userImage={userImage} />
          </div>
        </div>
      </header>

      {/* Mobile Info */}
      <MobileInfoDrawer isOpen={isDrawerOpen} userName={userName} userEmail={userEmail} userImage={userImage} />
    </>
  );
}

// Mobile Info Drawer
function MobileInfoDrawer({ 
  isOpen, 
  userName, 
  userEmail,
  userImage
}: { 
  isOpen: boolean; 
  userName: string; 
  userEmail: string; 
  userImage: string | null;
}) {
  return (
    <div className={cn("xl:hidden", isOpen ? "block" : "hidden")}>
      <div className="px-5 py-4 shadow-xs">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
           
            <ThemeToggle />
            <SearchBar />
          </div>

          {/* Right Side - Actions (Yahan bhi userImage pass kar diya) */}
          <UserProfileButton userName={userName} userEmail={userEmail} userImage={userImage} />
        </div>
      </div>
    </div>
  );
}