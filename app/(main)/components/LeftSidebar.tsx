"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, use } from "react";
import { useClerk } from "@clerk/nextjs";
import {
  Home,
  Play,
  Send,
  Search,
  Compass,
  Heart,
  Plus,
  Menu,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SearchModal from "@/app/(main)/components/SearchModal";
import NotificationsPanel from "@/app/(main)/components/NotificationsPanel";
import CreateMenu from "@/app/(main)/components/CreateMenu";
import CreatePostModal from "@/app/(main)/components/CreatePostModal";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: "create" | "search" | "notifications";
};

type LeftSidebarProps = {
  userPromise: Promise<{
    username: string;
    image: string | null;
    name: string | null;
  } | null>;
  notificationCountPromise: Promise<number>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <Home size={24} />, href: "/feed" },
  { label: "Reels", icon: <Play size={24} />, href: "/reels" },
  { label: "Messages", icon: <Send size={24} />, href: "/messages" },
  { label: "Search", icon: <Search size={24} />, action: "search" },
  { label: "Explore", icon: <Compass size={24} />, href: "/explore" },
  { label: "Notifications", icon: <Heart size={24} />, action: "notifications" },
  { label: "Create", icon: <Plus size={24} />, action: "create" },
];

const BOTTOM_ITEMS = [
  { label: "Menu", icon: <Menu size={24} />, href: "#" },
  { label: "Meta AI", icon: <LayoutGrid size={24} />, href: "#" },
];

function formatBadge(count: number) {
  return count > 9 ? "9+" : String(count);
}

export default function LeftSidebar({
  userPromise,
  notificationCountPromise,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const user = use(userPromise);
  const notificationCount = use(notificationCountPromise);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  function handleNavClick(item: NavItem) {
    if (item.href) {
      router.push(item.href);
    } else if (item.action === "create") {
      setShowCreateMenu(true);
    } else if (item.action === "search") {
      setShowSearchModal(true);
    } else if (item.action === "notifications") {
      setShowNotifications(true);
    }
  }

  function isActive(href?: string) {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Collapsed sidebar — always mounted, icons only */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 border-r bg-background w-18"
        onMouseEnter={() => setIsExpanded(true)}
      >
        <div className="flex flex-col h-full justify-between py-4">
          <div>
            <div className="flex justify-center mb-6">
              <Image src="/assets/logo.svg" alt="Instagram" width={28} height={28} className="object-contain" />
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => handleNavClick(item)}
                  className={`w-full justify-center px-3 py-6 rounded-xl cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none ${isActive(item.href) ? "font-semibold" : "font-normal"}`}
                >
                  <div className="relative shrink-0">
                    {item.icon}
                    {item.action === "notifications" && notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {formatBadge(notificationCount)}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => user?.username && router.push(`/profile/${user.username}`)}
                className={`w-full justify-center px-3 py-6 rounded-xl cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none ${isActive(`/profile/${user?.username}`) ? "font-semibold" : "font-normal"}`}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.[0] ?? user?.username?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </nav>
          </div>
          <div className="flex flex-col gap-1">
            {BOTTOM_ITEMS.map((item) => (
              <Button key={item.label} variant="ghost" asChild className="w-full justify-center px-3 py-6 rounded-xl font-normal cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none">
                <Link href={item.href}>{item.icon}</Link>
              </Button>
            ))}
            <Button variant="ghost" onClick={() => setShowLogoutDialog(true)} className="w-full justify-center px-3 py-6 rounded-xl font-normal cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none">
              <LogOut size={24} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Expanded sidebar — Sheet overlay with labels */}
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent
          side="left"
          className="w-75 p-0 border-r shadow-2xl flex flex-col"
          showCloseButton={false}
          onPointerDownOutside={() => setIsExpanded(false)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col h-full justify-between py-3 overflow-y-auto">
            <div>
              <div className="px-3 mb-8">
                <Image src="/assets/logo.svg" alt="Instagram" width={88} height={28} className="object-contain" />
              </div>
              <Separator className="mb-3" />
              <nav className="flex flex-col gap-3">
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => handleNavClick(item)}
                    className={`w-full justify-start gap-4 px-3 py-4 rounded-xl cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none ${isActive(item.href) ? "font-semibold" : "font-normal"}`}
                  >
                    <div className="relative shrink-0">
                      {item.icon}
                      {item.action === "notifications" && notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                          {formatBadge(notificationCount)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => user?.username && router.push(`/profile/${user.username}`)}
                  className={`w-full justify-start gap-4 px-3 py-4 rounded-xl cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none ${isActive(`/profile/${user?.username}`) ? "font-semibold" : "font-normal"}`}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {user?.name?.[0] ?? user?.username?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Profile</span>
                </Button>
              </nav>
            </div>
            <div className="flex flex-col gap-0.5">
              <Separator className="mb-2" />
              {BOTTOM_ITEMS.map((item) => (
                <Button key={item.label} variant="ghost" asChild className="w-full justify-start gap-4 px-3 py-4 rounded-xl font-normal cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none">
                  <Link href={item.href}>
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </Button>
              ))}
              <Button variant="ghost" onClick={() => setShowLogoutDialog(true)} className="w-full justify-start gap-4 px-3 py-4 rounded-xl font-normal cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:outline-none">
                <LogOut size={24} />
                <span className="text-sm">Log out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search modal */}
      <SearchModal open={showSearchModal} onOpenChange={setShowSearchModal} />

      {/* Notifications panel */}
      <NotificationsPanel open={showNotifications} onOpenChange={setShowNotifications} />

      {/* Create menu + post modal */}
      <CreateMenu
        open={showCreateMenu}
        onOpenChange={setShowCreateMenu}
        onSelectPost={() => setShowCreatePost(true)}
      />
      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />

      {/* Logout confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => signOut({ redirectUrl: "/" })}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}