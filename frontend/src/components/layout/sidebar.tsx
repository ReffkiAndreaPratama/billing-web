"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Monitor,
  Users,
  Gamepad2,
  Calendar,
  Receipt,
  BarChart3,
  Clock,
  Package,
  Swords,
  LogOut,
  Settings,
  ChevronLeft,
  Computer,
  Gift,
  UserCog,
  ListOrdered,
  Trophy,
  Bell,
  Tv,
  HardDrive,
  CalendarDays,
  Store,
  Coffee,
  Lightbulb,
  Cloud,
  Bitcoin,
  Database,
  CreditCard,
  RotateCcw,
  MessageCircle,
  Wifi,
  Globe,
  Bot,
  Mic,
  Thermometer,
  Shield,
  Video,
  Sliders,
  TrendingUp,
  Percent,
  Coins,
  AlertTriangle,
  Building2,
  HeartPulse,
  Zap,
  Sun,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS / Kasir", icon: Receipt },
  { href: "/billing", label: "Billing", icon: Clock },
  { href: "/units", label: "Unit", icon: Monitor },
  { href: "/agents", label: "Agent Monitor", icon: Computer },
  { href: "/members", label: "Member", icon: Users },
  { href: "/vouchers", label: "Voucher", icon: Gift },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/bookings", label: "Booking", icon: Calendar },
  { href: "/queue", label: "Queue", icon: ListOrdered },
  { href: "/shifts", label: "Shift", icon: Gamepad2 },
  { href: "/employees", label: "Employee", icon: UserCog },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/assets", label: "Assets", icon: HardDrive },
  { href: "/tournaments", label: "Tournament", icon: Swords },
  { href: "/notifications", label: "Notif", icon: Bell },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/tv-display", label: "TV Display", icon: Tv },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/booking-online", label: "Online Book", icon: CalendarDays },
  { href: "/cafe", label: "Cafe Order", icon: Coffee },
  { href: "/league", label: "League", icon: Trophy },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/iot", label: "Smart Room", icon: Lightbulb },
  { href: "/backup", label: "Backup", icon: Database },
  { href: "/sync-status", label: "Cloud Sync", icon: Cloud },
  { href: "/crypto", label: "Crypto", icon: Bitcoin },
  { href: "/rfid", label: "RFID Tap", icon: CreditCard },
  { href: "/pc-recovery", label: "PC Recovery", icon: RotateCcw },
  { href: "/discord", label: "Discord Bot", icon: MessageCircle },
  { href: "/wifi-voucher", label: "WiFi Voucher", icon: Wifi },
  { href: "/geo", label: "Geo Analytics", icon: Globe },
  { href: "/chatbot", label: "Chatbot FAQ", icon: Bot },
  { href: "/voice", label: "Voice Cmd", icon: Mic },
  { href: "/env-monitor", label: "Env Monitor", icon: Thermometer },
  { href: "/anti-cheat", label: "Anti-Cheat", icon: Shield },
  { href: "/replay", label: "Replay Rec", icon: Video },
  { href: "/internet-mgmt", label: "Internet Mgmt", icon: Sliders },
  { href: "/game-platform", label: "Game Stats", icon: TrendingUp },
  { href: "/dynamic-promo", label: "Dynamic Promo", icon: Percent },
  { href: "/blockchain", label: "Blockchain", icon: Coins },
  { href: "/predictive-maint", label: "Pred. Maint", icon: AlertTriangle },
  { href: "/white-label", label: "White Label", icon: Building2 },
  { href: "/self-healing", label: "Self Healing", icon: HeartPulse },
  { href: "/auto-billing", label: "Auto Billing", icon: Zap },
  { href: "/queue-optimizer", label: "Queue Opt.", icon: ListOrdered },
  { href: "/smart-energy", label: "Smart Energy", icon: Sun },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div
      className={cn(
        "h-screen bg-accent border-r-3 border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b-3 border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-foreground flex items-center justify-center flex-shrink-0">
          <Gamepad2 className="w-4 h-4 text-accent" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-black text-foreground">Billing Pro</h1>
            <p className="text-[10px] font-bold text-foreground/60">
              {user?.role || "Loading..."}
            </p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all duration-100 border-2",
                isActive
                  ? "bg-foreground text-accent border-foreground shadow-brutal-sm"
                  : "bg-transparent text-foreground border-transparent hover:bg-secondary/80 hover:border-border",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.href === "/booking-online" && (
                <span className="ml-auto text-[9px] font-black text-foreground/50">
                  ↗
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t-3 border-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary/80 transition-all border-2 border-transparent hover:border-border"
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-foreground hover:bg-destructive hover:text-destructive-foreground transition-all border-2 border-transparent hover:border-border"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
