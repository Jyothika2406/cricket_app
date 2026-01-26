"use client"

import { useState } from "react"
import { Menu, Wallet, LogOut, User, Home, History, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- IMPORT ALL SCREENS ---
// Ensure these files exist in your src/app/dashboard/ folder
import HomeScreen from "./home-screen"
import WalletScreen from "./wallet-screen"
import ProfileScreen from "./profile-screen"
import ReferScreen from "./refer-screen"
import BetHistoryScreen from "./bet-history-screen"
import SettingsScreen from "./settings-screen"

export default function Dashboard() {
    const { user, logout, formatCurrency, balance } = useApp()

    // This state controls which screen is currently visible
    const [activeTab, setActiveTab] = useState<string>("home")

    // This function decides which component to show based on the activeTab
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return <HomeScreen onNavigate={(screen) => setActiveTab(screen)} />
            case "wallet":
                return <WalletScreen />
            case "bets":
                return <BetHistoryScreen />
            case "refer":
                return <ReferScreen />
            case "settings":
                return <SettingsScreen />
            case "profile":
                // We pass setActiveTab to Profile so it can navigate to Settings/Bets
                return <ProfileScreen onNavigate={(screen) => setActiveTab(screen)} />
            default:
                return <HomeScreen onNavigate={(screen) => setActiveTab(screen)} />
        }
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground font-sans overflow-hidden">

            {/* --- TOP HEADER --- */}
            <header className="flex-none sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    {/* Menu Button resets to Home */}
                    <Button variant="ghost" size="icon" onClick={() => setActiveTab("home")} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Menu className="h-6 w-6" />
                    </Button>

                    {/* Logo */}
                    <div className="flex items-center gap-0 cursor-pointer" onClick={() => setActiveTab("home")}>
                        <span className="text-lg font-black italic tracking-tight text-orange-500">CRICBET</span>
                        <span className="bg-[#1a2234] text-white text-xs font-black px-1.5 py-0.5 rounded ml-0.5">
                            SK<span className="text-orange-500">I</span>LL
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Wallet Chip (Click to go to Wallet) */}
                    <button
                        onClick={() => setActiveTab("wallet")}
                        className="hidden sm:flex items-center gap-2 rounded-full bg-card px-3 py-1.5 border border-border hover:bg-muted transition-all active:scale-95"
                    >
                        <Wallet className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-bold text-foreground">
                            {formatCurrency(balance || 0)}
                        </span>
                    </button>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-border">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                                    <AvatarFallback className="bg-green-600 font-bold text-black">
                                        {user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56 bg-card border-border text-foreground mr-2 shadow-xl" align="end">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-border" />

                            <DropdownMenuItem onClick={() => setActiveTab("profile")} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-foreground">
                                <User className="mr-2 h-4 w-4" /> <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab("settings")} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-foreground">
                                <Bell className="mr-2 h-4 w-4" /> <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab("wallet")} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-foreground">
                                <Wallet className="mr-2 h-4 w-4" /> <span>Wallet</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border" />

                            <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer focus:bg-red-500/10 focus:text-red-500">
                                <LogOut className="mr-2 h-4 w-4" /> <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto bg-background scrollbar-hide">
                {/* This renders the correct screen based on activeTab */}
                {renderContent()}
            </main>

            {/* --- BOTTOM NAVIGATION BAR --- */}
            <div className="flex-none h-16 border-t border-border bg-background/95 backdrop-blur-lg flex items-center justify-around px-2 z-30 pb-safe shadow-2xl">
                <NavButton
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    icon={<Home className="w-5 h-5" />}
                    label="Home"
                />
                <NavButton
                    active={activeTab === "bets"}
                    onClick={() => setActiveTab("bets")}
                    icon={<History className="w-5 h-5" />}
                    label="My Bets"
                />

                {/* Floating Center Wallet Button */}
                <div className="relative -top-6 group">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <button
                        onClick={() => setActiveTab("wallet")}
                        className={`relative h-14 w-14 rounded-full flex items-center justify-center border-4 border-background shadow-xl transition-all duration-300 ease-out 
              ${activeTab === "wallet" ? "bg-green-500 text-black scale-110 -translate-y-1" : "bg-muted text-muted-foreground hover:bg-accent hover:-translate-y-1 hover:text-foreground"}`}
                    >
                        <Wallet className="w-6 h-6" />
                    </button>
                </div>

                <NavButton
                    active={activeTab === "refer"}
                    onClick={() => setActiveTab("refer")}
                    icon={<Users className="w-5 h-5" />}
                    label="Refer"
                />
                <NavButton
                    active={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                    icon={<User className="w-5 h-5" />}
                    label="Profile"
                />
            </div>

        </div>
    )
}

// Helper Component for Bottom Nav Buttons
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition-all duration-200 active:scale-95 ${active ? "text-green-500" : "text-muted-foreground hover:text-foreground/70"}`}
        >
            <div className={`transition-transform duration-200 ${active ? "-translate-y-0.5" : ""}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-bold transition-opacity ${active ? "opacity-100" : "opacity-70"}`}>
                {label}
            </span>
        </button>
    )
}