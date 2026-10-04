"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  ListChecks,
  FileText,
  Menu,
  X,
  HardHat,
} from "lucide-react";
import { AR } from "@/config/constants";

const NAV_ITEMS = [
  { href: "/", label: AR.nav.dashboard, icon: LayoutDashboard },
];

const PROJECT_NAV_ITEMS = [
  { href: "financials", label: AR.nav.financials, icon: Receipt },
  { href: "tasks", label: AR.nav.tasks, icon: ListChecks },
  { href: "documents", label: AR.nav.documents, icon: FileText },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Extract project ID from path like /projects/[id]/...
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectMatch ? projectMatch[1] : null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-zinc-200 text-zinc-900 flex items-center justify-between px-4 h-14 shadow-sm">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Multi Systems Logo" width={32} height={20} className="object-contain" />
          <span className="font-bold font-brand text-xl tracking-tight mt-1">{AR.appName}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -me-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 start-0 z-40 w-56 bg-white border-e border-zinc-200 
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}
        lg:!translate-x-0 lg:fixed lg:h-screen lg:w-56 lg:shrink-0
      `}>
        {/* Logo Area */}
        <div className="hidden lg:flex flex-col items-center justify-center py-6 border-b border-zinc-100 bg-zinc-50/30">
          <div className="w-16 h-12 flex items-center justify-center mb-2">
            <Image src="/logo.png" alt="Multi Systems Logo" width={64} height={40} className="object-contain" />
          </div>
          <div className="font-bold font-brand text-2xl text-zinc-900 tracking-tight">{AR.appName}</div>
          <div className="text-[10px] text-zinc-400 font-mono tracking-widest mt-1">
            CONSTRUCTION MGMT
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest">
              الرئيسية
            </span>
          </div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(item.href) 
                  ? "bg-zinc-100 text-zinc-900 font-semibold shadow-sm border border-zinc-200/60" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}
              `}
            >
              <item.icon size={18} className={isActive(item.href) ? "text-zinc-800" : "text-zinc-400"} />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Project Sub-Navigation */}
          {projectId && (
            <>
              <div className="px-3 mt-6 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest">
                  المشروع الحالي
                </span>
                <div className="h-px bg-zinc-200 flex-1 ms-3"></div>
              </div>
              {PROJECT_NAV_ITEMS.map((item) => {
                const fullHref = `/projects/${projectId}/${item.href}`;
                const isItemActive = pathname === fullHref;
                return (
                  <Link
                    key={item.href}
                    href={fullHref}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isItemActive 
                        ? "bg-primary-50 text-primary-900 font-semibold shadow-sm border border-primary-100" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}
                    `}
                  >
                    <item.icon size={18} className={isItemActive ? "text-primary-600" : "text-zinc-400"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        
        {/* User / Footer Area */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-zinc-600 font-mono">CF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-800">مستخدم النظام</span>
              <span className="text-[10px] text-zinc-500 font-mono">admin@company.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
