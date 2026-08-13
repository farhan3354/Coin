"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "@/components/shared/StatCard";
import {
  Users, Video as VideoIcon, Wallet, Trophy, Crown, Settings, BarChart3, FileDown,
  Coins, Building2, Shield, Plus, Trash2, CheckCircle2, XCircle, Clock,
  TrendingUp, Globe, Smartphone, DollarSign, Activity, Eye, EyeOff,
  Ban, RotateCcw, AlertTriangle, Link2, Copy, Gamepad2, ExternalLink,
  Menu, X, LogOut, LayoutDashboard, Cpu, Mail, Send, Inbox
} from "lucide-react";
import { formatPoints, formatUSD, formatDate } from "@/lib/mockData";
import { toast } from "sonner";
import type { WithdrawalMethod, VideoPlatform, TaskType, Video, Task, EventItem, Room } from "@/lib/types";

interface AdminSection {
  value: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: "main" | "management" | "system";
}

const adminSections: AdminSection[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard, group: "main" },
  { value: "analytics", label: "Analytics", icon: TrendingUp, group: "main" },
  { value: "reports", label: "Reports", icon: FileDown, group: "main" },
  { value: "users", label: "Users", icon: Users, group: "management" },
  { value: "official-links", label: "Official Links", icon: Link2, group: "management" },
  { value: "videos", label: "Videos", icon: VideoIcon, group: "management" },
  { value: "tasks", label: "Tasks", icon: Activity, group: "management" },
  { value: "events", label: "Events", icon: Trophy, group: "management" },
  { value: "rooms", label: "Rooms", icon: Crown, group: "management" },
  { value: "games", label: "Games", icon: Gamepad2, group: "management" },
  { value: "withdrawals", label: "Withdrawals", icon: Wallet, group: "management" },
  { value: "emails", label: "Emails", icon: Mail, group: "system" },
  { value: "businesses", label: "Businesses", icon: Building2, group: "system" },
  { value: "settings", label: "Settings", icon: Settings, group: "system" },
];

const groupLabels: Record<AdminSection["group"], string> = {
  main: "Dashboard",
  management: "Management",
  system: "System",
};

function AdminSidebarContent({ activeTab, setActiveTab, onNavigate }: { activeTab: string; setActiveTab: (v: string) => void; onNavigate?: () => void }) {
  const user = useCurrentUser();
  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Admin header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="grid place-items-center w-10 h-10 rounded-xl bg-primary text-primary-foreground"
          >
            <Shield className="w-5 h-5" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">Administrator</p>
          </div>
        </div>
        <Badge className="mt-3 w-full justify-center bg-primary/10 text-primary hover:bg-primary/15">
          <Shield className="w-3 h-3 mr-1" /> Admin Access
        </Badge>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-5">
          {(Object.keys(groupLabels) as AdminSection["group"][]).map((group) => {
            const items = adminSections.filter((s) => s.group === group);
            return (
              <div key={group}>
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupLabels[group]}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = activeTab === item.value;
                    return (
                      <motion.button
                        key={item.value}
                        onClick={() => { setActiveTab(item.value); onNavigate?.(); }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80 hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="admin-sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* System info */}
      <div className="p-3 border-t">
        <div className="rounded-md bg-muted/50 p-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Cpu className="w-3.5 h-3.5 text-green-600" />
          <span>System: Operational</span>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderSection = () => {
    switch (tab) {
      case "overview": return <AdminOverview />;
      case "users": return <AdminUsers />;
      case "official-links": return <AdminOfficialLinks />;
      case "videos": return <AdminVideos />;
      case "tasks": return <AdminTasks />;
      case "withdrawals": return <AdminWithdrawals />;
      case "events": return <AdminEvents />;
      case "rooms": return <AdminRooms />;
      case "games": return <AdminGames />;
      case "analytics": return <AdminAnalytics />;
      case "reports": return <AdminReports />;
      case "businesses": return <AdminBusinesses />;
      case "settings": return <AdminSettingsPanel />;
      case "emails": return <AdminEmails />;
      default: return <AdminOverview />;
    }
  };

  const activeLabel = adminSections.find((s) => s.value === tab)?.label || "Overview";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block w-64 flex-shrink-0"
        >
          <div className="sticky top-20 h-[calc(100vh-6rem)] rounded-xl border bg-card overflow-hidden">
            <AdminSidebarContent activeTab={tab} setActiveTab={setTab} />
          </div>
        </motion.aside>

        {/* Mobile sidebar trigger */}
        <div className="lg:hidden fixed bottom-20 right-3 sm:bottom-4 sm:right-4 z-30">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="icon" className="w-12 h-12 rounded-full shadow-lg">
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-semibold text-sm">Admin Menu</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setMobileOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[calc(100vh-60px)]">
                <AdminSidebarContent activeTab={tab} setActiveTab={setTab} onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6"
          >
            <span className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary">
              {(() => {
                const ActiveIcon = adminSections.find((s) => s.value === tab)?.icon || LayoutDashboard;
                return <ActiveIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
              })()}
            </span>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">{activeLabel}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Admin Panel · EarnCoin</p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AdminOverview() {
  const { users, withdrawals, videos, tasks, events, rooms, coinHistory, campaigns, settings } = useStore();
  const realUsers = users.filter((u) => u.role === "user");
  const activeUsers = realUsers.filter((u) => u.status === "active");
  const pendingW = withdrawals.filter((w) => ["pending", "under-review", "approved"].includes(w.status));
  const completedW = withdrawals.filter((w) => w.status === "completed");
  const totalWithdrawn = completedW.reduce((s, w) => s + w.amountUSD, 0);
  const totalPointsCirculating = realUsers.reduce((s, u) => s + u.points, 0);
  const totalCampaignSpend = campaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={formatPoints(users.length)} subtitle={`${activeUsers.length} active`} icon={Users} accent="bg-blue-100 text-blue-700" />
        <StatCard title="Total Points" value={formatPoints(totalPointsCirculating)} subtitle="circulating" icon={Coins} accent="bg-amber-100 text-amber-700" />
        <StatCard title="Withdrawals" value={`$${totalWithdrawn.toFixed(2)}`} subtitle={`${pendingW.length} pending`} icon={Wallet} accent="bg-green-100 text-green-700" />
        <StatCard title="Ad Revenue" value={`$${totalCampaignSpend.toFixed(2)}`} subtitle="from businesses" icon={Building2} accent="bg-purple-100 text-purple-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Videos" value={videos.length} subtitle={`${videos.filter((v) => v.status === "active").length} active`} icon={VideoIcon} accent="bg-red-100 text-red-700" />
        <StatCard title="Tasks" value={tasks.length} subtitle={`${tasks.reduce((s, t) => s + t.completed, 0)} completions`} icon={Activity} accent="bg-orange-100 text-orange-700" />
        <StatCard title="Events" value={events.length} subtitle={`${events.filter((e) => e.status === "live").length} live`} icon={Trophy} accent="bg-amber-100 text-amber-700" />
        <StatCard title="Rooms" value={rooms.length} subtitle={`${rooms.filter((r) => r.status === "open").length} open`} icon={Crown} accent="bg-purple-100 text-purple-700" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Withdrawals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {withdrawals.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{w.username}</p>
                  <p className="text-xs text-muted-foreground">{formatUSD(w.amountUSD)} · {w.method}</p>
                </div>
                <Badge variant="outline" className="capitalize">{w.status.replace("-", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Newest Users</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {users.slice(-5).reverse().map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8"><AvatarFallback style={{ backgroundColor: u.avatarColor, color: "white" }} className="text-xs">{u.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-medium">@{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.country}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">{u.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminUsers() {
  const { users, toggleUserStatus, coinHistory } = useStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex flex-col sm:flex-row gap-2 border-b">
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="business">Businesses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Country</th>
                <th className="text-right p-3 font-medium">Points</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">Referrals</th>
                <th className="text-center p-3 font-medium">Role</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8"><AvatarFallback style={{ backgroundColor: u.avatarColor, color: "white" }} className="text-xs">{u.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">@{u.username} · {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{u.country}</td>
                  <td className="p-3 text-right font-medium">{formatPoints(u.points)}</td>
                  <td className="p-3 text-right hidden md:table-cell">{u.totalReferrals}</td>
                  <td className="p-3 text-center"><Badge variant="secondary" className="capitalize">{u.role}</Badge></td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className={u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{u.status}</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Button size="sm" variant="ghost" onClick={() => { toggleUserStatus(u.id); toast.success(`User ${u.status === "active" ? "suspended" : "activated"}`); }}>
                      {u.status === "active" ? <Ban className="w-4 h-4 text-red-600" /> : <RotateCcw className="w-4 h-4 text-green-600" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminVideos() {
  const { videos, addVideo, deleteVideo } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", url: "", platform: "youtube" as VideoPlatform,
    rewardPoints: 10, watchDurationSec: 30, category: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addVideo({ ...form, status: "active", addedBy: "admin", thumbnail: "" });
    toast.success("Video added");
    setOpen(false);
    setForm({ title: "", description: "", url: "", platform: "youtube", rewardPoints: 10, watchDurationSec: 30, category: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Video</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => (
          <Card key={v.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{v.platform}</Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { deleteVideo(v.id); toast.success("Video deleted"); }}>
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                </Button>
              </div>
              <h3 className="font-medium text-sm line-clamp-1">{v.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{v.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <Badge variant="outline">+{v.rewardPoints} pts</Badge>
                <span>{v.totalViews} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
            <DialogDescription>Paste a video URL. We&apos;ll embed it directly on EarnCoin.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2"><Label htmlFor="vtitle">Title</Label><Input id="vtitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="vdesc">Description</Label><Textarea id="vdesc" required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="vurl">Video URL</Label><Input id="vurl" required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as VideoPlatform })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["youtube", "tiktok", "instagram", "facebook", "x", "linkedin", "pinterest", "snapchat", "vimeo", "dailymotion"].map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="vcat">Category</Label><Input id="vcat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Sponsored" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="vrew">Reward Points</Label><Input id="vrew" type="number" min={1} required value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label htmlFor="vdur">Watch Duration (sec)</Label><Input id="vdur" type="number" min={1} required value={form.watchDurationSec} onChange={(e) => setForm({ ...form, watchDurationSec: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <DialogFooter><Button type="submit">Add Video</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminTasks() {
  const { tasks, addTask, deleteTask } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "watch-video" as TaskType,
    rewardPoints: 10, durationMin: 1, link: "", availability: 1000,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({ ...form, status: "active", link: form.link || "#" });
    toast.success("Task added");
    setOpen(false);
    setForm({ title: "", description: "", type: "watch-video", rewardPoints: 10, durationMin: 1, link: "", availability: 1000 });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium">Task</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-right p-3 font-medium">Reward</th>
                  <th className="text-right p-3 font-medium hidden md:table-cell">Progress</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3"><p className="font-medium">{t.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p></td>
                    <td className="p-3 hidden sm:table-cell"><Badge variant="outline" className="capitalize">{t.type.replace("-", " ")}</Badge></td>
                    <td className="p-3 text-right font-medium">+{t.rewardPoints}</td>
                    <td className="p-3 text-right hidden md:table-cell text-xs text-muted-foreground">{t.completed}/{t.availability}</td>
                    <td className="p-3 text-center"><Badge variant="secondary" className={t.status === "active" ? "bg-green-100 text-green-700" : ""}>{t.status}</Badge></td>
                    <td className="p-3 text-center"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { deleteTask(t.id); toast.success("Task deleted"); }}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2"><Label htmlFor="ttitle">Title</Label><Input id="ttitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="tdesc">Description</Label><Textarea id="tdesc" required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TaskType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["watch-video", "visit-website", "read-article", "complete-survey", "social-follow", "share-content", "join-telegram", "join-discord"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t.replace("-", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="trew">Reward</Label><Input id="trew" type="number" min={1} required value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2"><Label htmlFor="tdur">Duration (min)</Label><Input id="tdur" type="number" min={1} required value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label htmlFor="tav">Availability</Label><Input id="tav" type="number" min={1} required value={form.availability} onChange={(e) => setForm({ ...form, availability: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label htmlFor="tlink">Link</Label><Input id="tlink" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Optional" /></div>
            </div>
            <DialogFooter><Button type="submit">Add Task</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminWithdrawals() {
  const { withdrawals, updateWithdrawalStatus } = useStore();
  const [filter, setFilter] = useState("all");
  const filtered = withdrawals.filter((w) => filter === "all" || w.status === filter);

  const statuses = ["pending", "under-review", "approved", "completed", "rejected", "hold", "cancelled"];
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700", "under-review": "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700", completed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700", hold: "bg-purple-100 text-purple-700", cancelled: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
        {statuses.map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" className="capitalize" onClick={() => setFilter(s)}>{s.replace("-", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Account</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <p className="font-medium">@{w.username}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.requestedAt)}</p>
                    </td>
                    <td className="p-3 text-right"><p className="font-bold">{formatUSD(w.amountUSD)}</p><p className="text-xs text-muted-foreground">-{formatPoints(w.pointsUsed)} pts</p></td>
                    <td className="p-3 hidden sm:table-cell capitalize">{w.method}</td>
                    <td className="p-3 hidden md:table-cell text-xs text-muted-foreground font-mono truncate max-w-[150px]">{w.accountDetails}</td>
                    <td className="p-3 text-center"><Badge className={`capitalize ${statusColors[w.status]}`}>{w.status.replace("-", " ")}</Badge></td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        {w.status !== "completed" && w.status !== "rejected" && w.status !== "cancelled" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Approve" onClick={() => { updateWithdrawalStatus(w.id, "approved"); toast.success("Approved"); }}><CheckCircle2 className="w-4 h-4 text-green-600" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Complete" onClick={() => { updateWithdrawalStatus(w.id, "completed"); toast.success("Marked completed"); }}><CheckCircle2 className="w-4 h-4 text-blue-600" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Reject" onClick={() => { updateWithdrawalStatus(w.id, "rejected"); toast.success("Rejected & refunded"); }}><XCircle className="w-4 h-4 text-red-600" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Hold" onClick={() => { updateWithdrawalStatus(w.id, "hold"); toast.success("On hold"); }}><Clock className="w-4 h-4 text-purple-600" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminEvents() {
  const { events, addEvent, deleteEvent } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "daily" as EventItem["type"],
    rewardPoints: 200, startTime: "", endTime: "", rules: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) return toast.error("Pick start and end times");
    addEvent({
      title: form.title, description: form.description, type: form.type,
      rewardPoints: form.rewardPoints,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      rules: form.rules.split("\n").filter(Boolean),
      status: new Date(form.startTime) > new Date() ? "upcoming" : "live",
    });
    toast.success("Event created");
    setOpen(false);
    setForm({ title: "", description: "", type: "daily", rewardPoints: 200, startTime: "", endTime: "", rules: "" });
  };

  const typeColors: Record<string, string> = {
    daily: "bg-gray-100 text-gray-700", weekly: "bg-blue-100 text-blue-700",
    monthly: "bg-purple-100 text-purple-700", special: "bg-amber-100 text-amber-700", festival: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Event</Button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className={`capitalize ${typeColors[e.type]}`}>{e.type}</Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { deleteEvent(e.id); toast.success("Event deleted"); }}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
              </div>
              <h3 className="font-semibold text-sm">{e.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{e.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <Badge variant="outline">+{e.rewardPoints} pts</Badge>
                <Badge variant="secondary" className="capitalize">{e.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{e.participants.length} participants</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2"><Label htmlFor="etitle">Title</Label><Input id="etitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edesc">Description</Label><Textarea id="edesc" required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as EventItem["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["daily", "weekly", "monthly", "special", "festival"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="erew">Reward Points</Label><Input id="erew" type="number" min={1} required value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="estart">Start Time</Label><Input id="estart" type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="eend">End Time</Label><Input id="eend" type="datetime-local" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="erules">Rules (one per line)</Label><Textarea id="erules" rows={3} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="Complete 10 tasks&#10;Refer at least 1 friend" /></div>
            <DialogFooter><Button type="submit">Create Event</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminRooms() {
  const { rooms, addRoom, deleteRoom } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", level: 1 as 1 | 2 | 3 | 4 | 5,
    entryPoints: 0, entryCost: 0, rewardPoints: 100,
    startTime: "", endTime: "",
  });

  // Seat counts per level
  const seatsPerLevel: Record<number, number> = { 1: 5, 2: 7, 3: 10, 4: 15, 5: 20 };
  const levelColors: Record<number, string> = {
    1: "bg-gray-100 text-gray-700", 2: "bg-blue-100 text-blue-700",
    3: "bg-slate-200 text-slate-700", 4: "bg-amber-100 text-amber-700",
    5: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  };
  const levelNames: Record<number, string> = { 1: "Local", 2: "Community", 3: "Silver", 4: "Gold", 5: "VIP" };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) return toast.error("Pick times");
    const seats = seatsPerLevel[form.level];
    addRoom({
      name: form.name, description: form.description, level: form.level, seats,
      entryPoints: form.entryPoints, entryCost: form.entryCost,
      rewardPoints: form.rewardPoints,
      tasks: [], startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(), status: "open",
    });
    toast.success("Room created");
    setOpen(false);
    setForm({ name: "", description: "", level: 1, entryPoints: 0, entryCost: 0, rewardPoints: 100, startTime: "", endTime: "" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Room Level System</h3>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div key={lvl} className={`p-3 rounded-lg border text-center ${levelColors[lvl]}`}>
                <p className="font-bold">Level {lvl}</p>
                <p className="text-xs">{levelNames[lvl]}</p>
                <p className="text-sm font-semibold mt-1">{seatsPerLevel[lvl]} seats</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Room</Button></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`grid place-items-center w-8 h-8 rounded-lg font-bold text-sm ${levelColors[r.level]}`}>L{r.level}</div>
                  <Badge className={levelColors[r.level]}>Level {r.level}</Badge>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { deleteRoom(r.id); toast.success("Room deleted"); }}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
              </div>
              <h3 className="font-semibold text-sm">{r.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div><span className="text-muted-foreground">Seats: </span>{r.seats}</div>
                <div><span className="text-muted-foreground">Filled: </span>{r.participants.length}/{r.seats}</div>
                <div><span className="text-muted-foreground">XP req: </span>{formatPoints(r.entryPoints)}</div>
                <div><span className="text-muted-foreground">Cost: </span>{r.entryCost > 0 ? `${r.entryCost} pts` : "Free"}</div>
                <div><span className="text-muted-foreground">Reward: </span>+{r.rewardPoints}</div>
                <div><span className="text-muted-foreground">Status: </span>{r.status}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Room</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2"><Label htmlFor="rname">Name</Label><Input id="rname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Local Room" /></div>
            <div className="space-y-2"><Label htmlFor="rdesc">Description</Label><Textarea id="rdesc" required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Room Level (determines seat capacity)</Label>
              <Select value={String(form.level)} onValueChange={(v) => setForm({ ...form, level: parseInt(v) as 1 | 2 | 3 | 4 | 5, entryPoints: [0, 500, 2000, 5000, 10000][parseInt(v) - 1] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <SelectItem key={lvl} value={String(lvl)}>Level {lvl} — {levelNames[lvl]} ({seatsPerLevel[lvl]} seats)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2"><Label htmlFor="rep">Min XP</Label><Input id="rep" type="number" min={0} required value={form.entryPoints} onChange={(e) => setForm({ ...form, entryPoints: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label htmlFor="rec">Entry Cost</Label><Input id="rec" type="number" min={0} required value={form.entryCost} onChange={(e) => setForm({ ...form, entryCost: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label htmlFor="rrew">Reward</Label><Input id="rrew" type="number" min={1} required value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="rstart">Start Time</Label><Input id="rstart" type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="rend">End Time</Label><Input id="rend" type="datetime-local" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit">Create Room</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminOfficialLinks() {
  const { officialLinks, createOfficialLink, deleteOfficialLink, users } = useStore();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !username.trim()) return toast.error("Fill all fields");
    const r = createOfficialLink(label.trim(), username.trim().toLowerCase().replace(/\s+/g, "_"));
    if (r.ok) {
      toast.success("Official link created!");
      setOpen(false);
      setLabel("");
      setUsername("");
    } else {
      toast.error(r.message);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  // Count registrations per official link
  const getRegistrations = (referralCode: string) => {
    return users.filter((u) => u.referredBy === referralCode).length;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <Link2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base">Official Referral Links</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Generate official referral links for your team leads, partners, and promoters. Each link has no referrer attached — it&apos;s a root official link.
              </p>
            </div>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Generate Link</Button>
          </div>
        </CardContent>
      </Card>

      {officialLinks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No official links yet. Create one to start.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {officialLinks.map((link) => {
            const registrations = getRegistrations(link.referralCode);
            return (
              <Card key={link.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">{link.referralCode}</Badge>
                        <Badge variant="outline" className="text-xs">@{link.username}</Badge>
                        <Badge variant="outline" className="text-xs">{registrations} registrations</Badge>
                      </div>
                      <p className="font-medium text-sm">{link.label}</p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-2 py-1.5 rounded flex-1 truncate block overflow-x-auto">{link.referralLink}</code>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => copyLink(link.referralLink)}><Copy className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={link.referralLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { deleteOfficialLink(link.id); toast.success("Link deleted"); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Created {formatDate(link.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Official Referral Link</DialogTitle>
            <DialogDescription>Create an official user link. This will generate a unique referral code with no referrer attached — share it with your team and audience.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="label">Label / Description</Label>
              <Input id="label" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. YouTube Channel Partnership" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username for Official Account</Label>
              <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. official_yt" />
              <p className="text-xs text-muted-foreground">This username will be associated with the referral link. No login is needed for this account — it&apos;s just a tracking identity.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Admin generates an official link with a username</li>
                <li>A unique referral code is created (no referrer attached)</li>
                <li>Share the link with your team/audience</li>
                <li>They register through the link and become part of your network</li>
                <li>You track registrations from the Admin Panel</li>
              </ol>
            </div>
            <DialogFooter><Button type="submit">Generate Official Link</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminGames() {
  const { gameResults } = useStore();

  const totalGames = gameResults.length;
  const coinGames = gameResults.filter((g) => g.gameType === "coin");
  const totalWagered = coinGames.reduce((s, g) => s + g.entryFee, 0);
  const totalPaidOut = coinGames.filter((g) => g.result === "win").reduce((s, g) => s + g.pointsChange, 0);
  const houseProfit = totalWagered - totalPaidOut;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Games" value={totalGames} subtitle="all time" icon={Gamepad2} accent="bg-purple-100 text-purple-700" />
        <StatCard title="Total Wagered" value={formatPoints(totalWagered)} subtitle="coins" icon={Coins} accent="bg-amber-100 text-amber-700" />
        <StatCard title="Total Paid Out" value={formatPoints(totalPaidOut)} subtitle="to winners" icon={TrendingUp} accent="bg-green-100 text-green-700" />
        <StatCard title="House Profit" value={formatPoints(houseProfit)} subtitle="net revenue" icon={DollarSign} accent="bg-blue-100 text-blue-700" />
      </div>

      <Card>
        <CardHeader><CardTitle>Game History (All Users)</CardTitle></CardHeader>
        <CardContent className="p-0">
          {gameResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No games played yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Game</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Entry</th>
                    <th className="text-center p-3 font-medium">Result</th>
                    <th className="text-right p-3 font-medium">Change</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {gameResults.slice(0, 30).map((g) => (
                    <tr key={g.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">@{g.username}</td>
                      <td className="p-3 hidden sm:table-cell capitalize">{g.gameName.replace(/([A-Z])/g, " $1").trim()}</td>
                      <td className="p-3"><Badge variant="outline" className="capitalize">{g.gameType}</Badge></td>
                      <td className="p-3 text-right">{g.entryFee > 0 ? formatPoints(g.entryFee) : "—"}</td>
                      <td className="p-3 text-center">
                        <Badge variant={g.result === "win" ? "secondary" : "outline"} className={
                          g.result === "win" ? "bg-green-100 text-green-700" :
                          g.result === "loss" ? "bg-red-100 text-red-700" : ""
                        }>{g.result}</Badge>
                      </td>
                      <td className={`p-3 text-right font-medium ${g.pointsChange > 0 ? "text-green-600" : g.pointsChange < 0 ? "text-red-600" : ""}`}>
                        {g.pointsChange > 0 ? "+" : ""}{g.pointsChange !== 0 ? formatPoints(g.pointsChange) : "—"}
                      </td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{formatDate(g.playedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAnalytics() {
  const { users, withdrawals, coinHistory, campaigns, events, rooms } = useStore();

  // Country distribution
  const countries: Record<string, number> = {};
  users.forEach((u) => { countries[u.country] = (countries[u.country] || 0) + 1; });
  const sortedCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Devices / browsers
  const browsers: Record<string, number> = {};
  users.forEach((u) => {
    const b = u.browserInfo.split(" on ")[0] || "Unknown";
    browsers[b] = (browsers[b] || 0) + 1;
  });

  // Daily earnings (last 7 days, mock)
  const dailyData = Array.from({ length: 7 }).map((_, i) => ({
    day: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", { weekday: "short" }),
    value: Math.floor(2000 + Math.random() * 4000),
  }));
  const maxValue = Math.max(...dailyData.map((d) => d.value));

  const realUsers = users.filter((u) => u.role === "user");
  const totalWithdrawn = withdrawals.filter((w) => w.status === "completed").reduce((s, w) => s + w.amountUSD, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.spent, 0) + totalWithdrawn * 0.1; // mock ad rev share

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Daily Earnings" value={formatPoints(dailyData[6].value)} subtitle="points today" icon={Coins} />
        <StatCard title="Withdrawals" value={formatUSD(totalWithdrawn)} subtitle="total paid" icon={Wallet} />
        <StatCard title="Ad Revenue" value={formatUSD(campaigns.reduce((s, c) => s + c.spent, 0))} subtitle="from businesses" icon={Building2} />
        <StatCard title="Total Revenue" value={formatUSD(totalRevenue)} subtitle="est. platform" icon={DollarSign} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Daily Earnings (7 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36 sm:h-48">
              {dailyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/80 rounded-t-md transition-all" style={{ height: `${(d.value / maxValue) * 100}%` }} />
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Top Countries</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sortedCountries.map(([country, count]) => (
              <div key={country} className="flex items-center justify-between text-sm">
                <span>{country}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(count / users.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5 text-primary" /> Device / Browser</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(browsers).map(([b, count]) => (
              <div key={b} className="flex items-center justify-between text-sm">
                <span>{b}</span>
                <Badge variant="outline">{count} users</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Referral Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total referrals made</span><span className="font-medium">{realUsers.reduce((s, u) => s + u.totalReferrals, 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active referrals</span><span className="font-medium">{realUsers.reduce((s, u) => s + u.activeReferrals, 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Top referrer</span><span className="font-medium">@{[...realUsers].sort((a, b) => b.totalReferrals - a.totalReferrals)[0]?.username || "—"}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Conversion rate</span><span className="font-medium">{Math.round(realUsers.reduce((s, u) => s + u.activeReferrals, 0) / Math.max(realUsers.reduce((s, u) => s + u.totalReferrals, 0), 1) * 100)}%</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Event & Room Reports</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Live events</p><p className="text-xl font-bold">{events.filter((e) => e.status === "live").length}</p></div>
          <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Open rooms</p><p className="text-xl font-bold">{rooms.filter((r) => r.status === "open").length}</p></div>
          <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Event participants</p><p className="text-xl font-bold">{events.reduce((s, e) => s + e.participants.length, 0)}</p></div>
          <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Room participants</p><p className="text-xl font-bold">{rooms.reduce((s, r) => s + r.participants.length, 0)}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminReports() {
  const { users, withdrawals, coinHistory, campaigns, events, rooms } = useStore();
  const exports = [
    { label: "Users Report", icon: Users, fn: () => toast.success("Users PDF exported") },
    { label: "Withdrawals Report", icon: Wallet, fn: () => toast.success("Withdrawals Excel exported") },
    { label: "Coin History Report", icon: Coins, fn: () => toast.success("Coin history CSV exported") },
    { label: "Referral Statistics", icon: Users, fn: () => toast.success("Referral PDF exported") },
    { label: "Event Reports", icon: Trophy, fn: () => toast.success("Event Excel exported") },
    { label: "Room Reports", icon: Crown, fn: () => toast.success("Room CSV exported") },
    { label: "Business Revenue", icon: Building2, fn: () => toast.success("Business PDF exported") },
    { label: "Ad Revenue Report", icon: TrendingUp, fn: () => toast.success("Ad revenue Excel exported") },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Export Reports</CardTitle><CardDescription>Download platform reports as PDF, Excel or CSV.</CardDescription></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {exports.map((e) => (
            <button key={e.label} onClick={e.fn} className="text-left p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <e.icon className="w-6 h-6 text-primary mb-2" />
              <p className="font-medium text-sm">{e.label}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><FileDown className="w-3 h-3" /> PDF / Excel / CSV</p>
            </button>
          ))}
        </CardContent>
      </Card>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">Total users</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{withdrawals.length}</p><p className="text-xs text-muted-foreground">Withdrawal requests</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{coinHistory.length}</p><p className="text-xs text-muted-foreground">Total transactions</p></CardContent></Card>
      </div>
    </div>
  );
}

function AdminBusinesses() {
  const { users, campaigns } = useStore();
  const businesses = users.filter((u) => u.role === "business");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Registered Businesses</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium">Business</th>
                  <th className="text-right p-3 font-medium hidden sm:table-cell">Campaigns</th>
                  <th className="text-right p-3 font-medium">Budget</th>
                  <th className="text-right p-3 font-medium">Spent</th>
                  <th className="text-right p-3 font-medium hidden md:table-cell">Views</th>
                  <th className="text-right p-3 font-medium hidden md:table-cell">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => {
                  const bizCampaigns = campaigns.filter((c) => c.businessId === b.id);
                  const budget = bizCampaigns.reduce((s, c) => s + c.budget, 0);
                  const spent = bizCampaigns.reduce((s, c) => s + c.spent, 0);
                  const views = bizCampaigns.reduce((s, c) => s + c.views, 0);
                  const clicks = bizCampaigns.reduce((s, c) => s + c.clicks, 0);
                  return (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8"><AvatarFallback style={{ backgroundColor: b.avatarColor, color: "white" }} className="text-xs">{b.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <div><p className="font-medium">{b.fullName}</p><p className="text-xs text-muted-foreground">{b.email}</p></div>
                        </div>
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">{bizCampaigns.length}</td>
                      <td className="p-3 text-right font-medium">{formatUSD(budget)}</td>
                      <td className="p-3 text-right text-red-600">-{formatUSD(spent)}</td>
                      <td className="p-3 text-right hidden md:table-cell">{formatPoints(views)}</td>
                      <td className="p-3 text-right hidden md:table-cell">{formatPoints(clicks)}</td>
                    </tr>
                  );
                })}
                {businesses.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground sm:hidden">No businesses registered yet.</td><td colSpan={6} className="p-8 text-center text-muted-foreground hidden sm:table-cell">No businesses registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSettingsPanel() {
  const { settings, updateSettings, resetData } = useStore();
  const [form, setForm] = useState(settings);
  const [resetOpen, setResetOpen] = useState(false);

  const save = () => {
    updateSettings(form);
    toast.success("Settings saved");
  };

  const methods: WithdrawalMethod[] = ["paypal", "binance", "paytm", "jazzcash", "easypaisa"];
  const toggleMethod = (m: WithdrawalMethod) => {
    setForm((f) => ({
      ...f,
      withdrawalMethods: f.withdrawalMethods.includes(m)
        ? f.withdrawalMethods.filter((x) => x !== m)
        : [...f.withdrawalMethods, m],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Rewards Configuration</CardTitle><CardDescription>Control how many points users earn for each activity.</CardDescription></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="welcome">Welcome Bonus (points)</Label><Input id="welcome" type="number" value={form.welcomeBonus} onChange={(e) => setForm({ ...form, welcomeBonus: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="ref">Referral Reward (points)</Label><Input id="ref" type="number" value={form.referralReward} onChange={(e) => setForm({ ...form, referralReward: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="vid">Video Default Reward</Label><Input id="vid" type="number" value={form.videoDefaultReward} onChange={(e) => setForm({ ...form, videoDefaultReward: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="task">Task Default Reward</Label><Input id="task" type="number" value={form.taskDefaultReward} onChange={(e) => setForm({ ...form, taskDefaultReward: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="evt">Event Default Reward</Label><Input id="evt" type="number" value={form.eventDefaultReward} onChange={(e) => setForm({ ...form, eventDefaultReward: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="room">Room Default Reward</Label><Input id="room" type="number" value={form.roomDefaultReward} onChange={(e) => setForm({ ...form, roomDefaultReward: parseInt(e.target.value) || 0 })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversion & Withdrawal</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="ppd">Points per Dollar</Label><Input id="ppd" type="number" value={form.pointsPerDollar} onChange={(e) => setForm({ ...form, pointsPerDollar: parseInt(e.target.value) || 1 })} /><p className="text-xs text-muted-foreground">{formatPoints(form.pointsPerDollar)} points = $1 USD</p></div>
          <div className="space-y-2"><Label htmlFor="minw">Min Withdrawal ($)</Label><Input id="minw" type="number" step="0.01" value={form.minWithdrawal} onChange={(e) => setForm({ ...form, minWithdrawal: parseFloat(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="maxw">Max Withdrawal ($)</Label><Input id="maxw" type="number" step="0.01" value={form.maxWithdrawal} onChange={(e) => setForm({ ...form, maxWithdrawal: parseFloat(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label htmlFor="proc">Processing Time</Label><Input id="proc" value={form.withdrawalProcessingHours} onChange={(e) => setForm({ ...form, withdrawalProcessingHours: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Withdrawal Methods</CardTitle><CardDescription>Toggle which methods users can choose.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => toggleMethod(m)}
              className={`px-4 py-2 rounded-md border text-sm font-medium capitalize transition-colors ${form.withdrawalMethods.includes(m) ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}
            >
              {form.withdrawalMethods.includes(m) ? <Eye className="w-3.5 h-3.5 inline mr-1" /> : <EyeOff className="w-3.5 h-3.5 inline mr-1" />}
              {m}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={() => setForm(settings)}>Reset Form</Button>
        <Button onClick={save}>Save Settings</Button>
      </div>

      <Card className="border-destructive">
        <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Reset all platform data back to seed state. This will log everyone out.</p>
          <Button variant="destructive" onClick={() => setResetOpen(true)}>Reset Platform Data</Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset all data?</DialogTitle><DialogDescription>This will wipe all users, withdrawals, videos, tasks, events and rooms and restore seed data. This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { resetData(); setResetOpen(false); toast.success("Platform reset to seed data"); }}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminEmails() {
  const { emailLogs = [], users = [], sendBroadcastEmail, clearEmailLogs } = useStore();
  const [filter, setFilter] = useState("all");
  const [openBroadcast, setOpenBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState({ subject: "", message: "" });
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const filtered = (emailLogs || []).filter((e: any) => filter === "all" || e.type === filter);
  const types = ["all", "welcome", "otp", "password-reset", "referral", "withdrawal", "announcement", "event", "newsletter"];
  const typeColors: Record<string, string> = {
    welcome: "bg-green-100 text-green-700", otp: "bg-blue-100 text-blue-700",
    "password-reset": "bg-amber-100 text-amber-700", referral: "bg-purple-100 text-purple-700",
    withdrawal: "bg-orange-100 text-orange-700", announcement: "bg-red-100 text-red-700",
    event: "bg-pink-100 text-pink-700", newsletter: "bg-cyan-100 text-cyan-700",
  };
  const subscribedCount = (users || []).filter((u: any) => u.emailSubscribed !== false).length;

  const sendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.subject.trim() || !broadcast.message.trim()) return toast.error("Fill all fields");
    sendBroadcastEmail(broadcast.subject, broadcast.message);
    toast.success(`Broadcast email sent to ${subscribedCount} subscribers`);
    setOpenBroadcast(false);
    setBroadcast({ subject: "", message: "" });
  };

  const selected = selectedEmail ? (emailLogs || []).find((e: any) => e.id === selectedEmail) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sent" value={(emailLogs || []).length} subtitle="all time" icon={Mail} accent="bg-orange-100 text-orange-700" />
        <StatCard title="Subscribers" value={subscribedCount} subtitle="opted in" icon={Users} accent="bg-green-100 text-green-700" />
        <StatCard title="Total Users" value={(users || []).length} subtitle="registered" icon={Inbox} accent="bg-blue-100 text-blue-700" />
        <StatCard title="Delivery Rate" value="100%" subtitle="simulated" icon={CheckCircle2} accent="bg-purple-100 text-purple-700" />
      </div>
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} onClick={() => setFilter(t)} className="capitalize text-xs">
                {t === "all" ? "All" : t.replace("-", " ")}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { clearEmailLogs(); toast.success("Logs cleared"); }}>
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
            <Button size="sm" onClick={() => setOpenBroadcast(true)}>
              <Send className="w-4 h-4 mr-1" /> Broadcast
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>No emails sent yet.</p>
              <p className="text-xs mt-1">Emails are automatically sent on registration, OTP verification, withdrawals, and referrals.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">To</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Type</th>
                    <th className="text-left p-3 font-medium">Subject</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((e: any) => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedEmail(e.id)}>
                      <td className="p-3">
                        <p className="font-medium text-xs">{e.toName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{e.to}</p>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge className={`capitalize text-xs ${typeColors[e.type] || ""}`}>{e.type.replace("-", " ")}</Badge>
                      </td>
                      <td className="p-3 text-xs">{e.subject}</td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{formatDate(e.sentAt)}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">{e.status}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={openBroadcast} onOpenChange={setOpenBroadcast}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Broadcast Email</DialogTitle>
            <DialogDescription>Send an announcement email to all {subscribedCount} subscribed users.</DialogDescription>
          </DialogHeader>
          <form onSubmit={sendBroadcast} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bsubject">Subject</Label>
              <Input id="bsubject" required value={broadcast.subject} onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })} placeholder="Important announcement..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bmsg">Message</Label>
              <Textarea id="bmsg" required rows={5} value={broadcast.message} onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} placeholder="Your announcement message..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenBroadcast(false)}>Cancel</Button>
              <Button type="submit"><Send className="w-4 h-4 mr-2" /> Send to {subscribedCount} users</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedEmail(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{selected?.subject}</DialogTitle>
            <DialogDescription>
              To: {selected?.toName} &lt;{selected?.to}&gt; · {selected ? formatDate(selected.sentAt) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border overflow-hidden bg-white">
            <div dangerouslySetInnerHTML={{ __html: selected?.body || "" }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
