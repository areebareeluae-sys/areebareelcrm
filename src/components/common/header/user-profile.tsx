"use client";

import {
  UserGroupIcon,
  LogoutIcon,
  UserCircleIcon,
} from "@/components/common/header/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/tailgrids/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { AltArrowDownIcon } from "@/utils/icon";
import Link from "next/link";
import { logoutUser } from "@/app/api/users/route"; // Apne project ke route ke mutabiq path verify kar lein

interface UserProfileMenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface UserProfileButtonProps {
  userName: string;
  userEmail?: string;
  userImage?: string | null;
}

export function UserProfileButton({ userName, userEmail, userImage }: UserProfileButtonProps) {
  const menuItems: UserProfileMenuItem[] = [
    {
      href: "/profile/account",
      icon: <UserCircleIcon />,
      label: "View profile",
    },
    {
      href: "/users/create",
      icon: <UserGroupIcon />,
      label: "Create User",
    },
  ];

  const displayName = userName || "User";
  const displayEmail = userEmail || "user@example.com";
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2.5 rounded-lg border-0 p-0 transition-all outline-none focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 focus-visible:ring-offset-1">
        <Avatar>
          {userImage ? (
            <AvatarImage 
              src={userImage} 
              alt={displayName} 
              className="aspect-square h-full w-full object-cover" 
            />
          ) : null}
          <AvatarFallback className="rounded-lg border border-border-secondary-alt bg-background-gray-secondary_alt font-semibold text-gray-700">
            {firstLetter}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm leading-5 font-medium text-text-primary">{displayName}</span>

        <AltArrowDownIcon className="text-icon-tertiary transition-transform duration-200 group-aria-expanded:-rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent placement="bottom end" className="w-70 overflow-hidden p-0 shadow-3xl">
        <DropdownMenuHeader className="flex w-full items-center justify-start gap-2 border-b border-border-secondary-alt px-4 py-3">
          <Avatar size="md">
            {userImage ? (
              <AvatarImage 
                src={userImage} 
                alt={displayName} 
                className="aspect-square h-full w-full object-cover" 
              />
            ) : null}
            <AvatarFallback className="border border-border-secondary-alt bg-background-gray-secondary_alt font-semibold text-gray-700">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <span className="flex flex-col truncate">
            <span className="text-sm font-medium text-text-primary truncate">{displayName}</span>
            <span className="truncate text-xs text-gray-500">{displayEmail}</span>
          </span>
        </DropdownMenuHeader>

        <DropdownMenuSection className="p-1.5">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              href={item.href}
              className="cursor-pointer px-3 py-2.5"
              render={(domProps) =>
                "href" in domProps ? <Link {...domProps} /> : <div {...domProps} />
              }
            >
              <span className="shrink-0 text-icon-secondary group-hover:text-text-primary">
                {item.icon}
              </span>
              <span className="leading-5 font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>

        <DropdownMenuSeparator />

        {/* Logout Action */}
        <DropdownMenuItem
          onAction={handleLogout}
          className="m-1.5 w-auto cursor-pointer px-3 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
        >
          <span className="text-red-500 group-hover:text-red-600">
            <LogoutIcon />
          </span>
          <span className="leading-5 font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}