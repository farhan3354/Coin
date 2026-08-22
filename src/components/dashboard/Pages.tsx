"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import {
  Video as VideoIcon, Coins, ExternalLink, Trophy, Crown, Users, Wallet,
  Filter, Download, Bell, BellOff, CheckCircle2, XCircle, Search, Award, TrendingUp,
  Calendar, Clock, ArrowUpRight, ArrowDownLeft, Copy, Share2, Gift, Medal,
  Play, Gamepad2, Dice5, Brain, Zap, Target, Lock
} from "lucide-react";
import { formatPoints, formatUSD, formatDate } from "@/lib/mockData";
import { toast } from "sonner";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { WithdrawalMethod } from "@/lib/types";

const taskTypeLabels: Record<string, string> = {
  "watch-video": "Watch Video",
  "visit-website": "Visit Website",
  "read-article": "Read Article",
  "complete-survey": "Complete Survey",
  "social-follow": "Social Follow",
  "share-content": "Share Content",
  "join-telegram": "Join Telegram",
  "join-discord": "Join Discord",
  "subscribe": "Subscribe",
  "like": "Like",
  "follow": "Follow",
  "comment": "Comment",
  "share": "Share",
  "report": "Report",
};

export function VideosPage() {
  const { videos, currentUserId, videoWatches, openAuth } = useStore();
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");

  const platforms = ["all", "youtube", "tiktok", "instagram", "facebook", "x", "linkedin", "pinterest", "snapchat", "vimeo", "dailymotion"];
  const filtered = videos.filter((v) => {
    if (v.status !== "active") return false;
    if (platform !== "all" && v.platform !== platform) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openVideoInNewTab = (videoId: string) => {
    if (!currentUserId) {
      openAuth("login");
      return;
    }
    if (typeof window !== "undefined") {
      window.open(`${window.location.origin}/?watch=${videoId}`, "_blank");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <VideoIcon className="w-7 h-7 text-primary" /> Watch & Earn
        </h1>
        <p className="text-muted-foreground mt-1">Click any video to open it in a new tab. Watch until the timer completes, then claim your reward. Only one video plays at a time.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">{p === "all" ? "All Platforms" : p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
      >
        {filtered.map((v) => {
          const watched = currentUserId ? videoWatches.some((w) => w.userId === currentUserId && w.videoId === v.id) : false;
          return (
            <motion.div key={v.id} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
              {/* Thumbnail */}
              <button
                onClick={() => openVideoInNewTab(v.id)}
                className="block w-full text-left"
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                  {/* Thumbnail placeholder with platform icon */}
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-current" />
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{v.platform}</p>
                    </div>
                  </div>
                  {/* Overlay with duration */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      <Clock className="w-3 h-3 mr-1" /> {v.watchDurationSec}s
                    </Badge>
                  </div>
                  {watched && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Watched
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white capitalize">{v.platform}</Badge>
                  </div>
                </div>
              </button>

              {/* Card content */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2 flex-1">{v.title}</h3>
                  <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                    <Coins className="w-3 h-3 text-primary" /> +{v.rewardPoints}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{v.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{v.totalViews} views</span>
                  <Badge variant="outline">{v.category}</Badge>
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => openVideoInNewTab(v.id)}
                  disabled={watched}
                >
                  {watched ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Already Watched</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Watch & Earn</>
                  )}
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No videos match your filters.</div>
      )}
    </div>
  );
}

export function TasksPage() {
  const { tasks, completeTask, hasCompletedTask, currentUserId, openAuth } = useStore();
  const user = useCurrentUser();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  // Track active task timers: taskId -> { status: "verifying" | "ready"; secondsLeft: number }
  const [activeTasks, setActiveTasks] = useState<Record<string, { status: "verifying" | "ready"; secondsLeft: number }>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTasks((prev) => {
        let hasChanges = false;
        const next = { ...prev };
        for (const [taskId, taskState] of Object.entries(next)) {
          if (taskState.status === "verifying") {
            if (taskState.secondsLeft <= 1) {
              next[taskId] = { status: "ready", secondsLeft: 0 };
              hasChanges = true;
            } else {
              next[taskId] = { status: "verifying", secondsLeft: taskState.secondsLeft - 1 };
              hasChanges = true;
            }
          }
        }
        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const types = ["all", ...Object.keys(taskTypeLabels)];
  const filtered = tasks.filter((t) => {
    if (t.status !== "active") return false;
    if (filter !== "all" && t.type !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStartTask = (t: typeof tasks[0]) => {
    if (!currentUserId) {
      openAuth("login");
      return;
    }

    // Open task verification page in a new tab if valid
    if (t.link && t.link !== "#") {
      if (typeof window !== "undefined") {
        window.open(`${window.location.origin}/?task=${t.id}`, "_blank");
      }
    } else {
      toast.info(`Please perform the task and wait for verification.`);
      // Start 10-second verification countdown inline
      setActiveTasks((prev) => ({
        ...prev,
        [t.id]: { status: "verifying", secondsLeft: 10 },
      }));
    }
  };

  const handleClaim = (taskId: string) => {
    if (!currentUserId) {
      openAuth("login");
      return;
    }
    const r = completeTask(taskId);
    if (r.ok) {
      toast.success(r.message);
      setActiveTasks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } else {
      toast.error(r.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Earn by Tasks</h1>
        <p className="text-muted-foreground mt-1">Open links, follow YouTube channels, like videos, join socials, and claim instant rewards.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks (e.g. YouTube, Telegram, Survey)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All Tasks" : taskTypeLabels[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto">
          {types.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {t === "all" ? "All Tasks" : taskTypeLabels[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {filtered.map((t) => {
          const remaining = t.availability - t.completed;
          const pct = (t.completed / t.availability) * 100;
          const isDone = currentUserId ? hasCompletedTask(currentUserId, t.id) : false;
          const taskState = activeTasks[t.id];

          return (
            <motion.div key={t.id} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className={`flex flex-col h-full transition-all ${isDone ? "border-green-500/40 bg-green-500/5" : ""}`}>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={isDone ? "default" : "secondary"} className={`text-xs ${isDone ? "bg-green-600 hover:bg-green-600 text-white" : ""}`}>
                      {isDone ? "Completed ✓" : taskTypeLabels[t.type] || t.type}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 font-semibold text-primary">
                      <Coins className="w-3.5 h-3.5 text-primary" /> +{t.rewardPoints} pts
                    </Badge>
                  </div>

                  <h3 className="font-semibold mb-1 text-base">{t.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{t.description}</p>

                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{t.durationMin} min
                      </span>
                      <span>{remaining > 0 ? `${remaining} spots remaining` : "Full"}</span>
                    </div>

                    <Progress value={pct} className="h-1.5" />

                    {/* Action buttons */}
                    <div className="pt-2">
                      {isDone ? (
                        <Button size="sm" variant="outline" className="w-full text-green-700 bg-green-100/70 border-green-300 cursor-default" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" /> Reward Claimed ✓
                        </Button>
                      ) : !taskState ? (
                        <Button
                          size="sm"
                          className="w-full font-medium"
                          disabled={!currentUserId || remaining <= 0}
                          onClick={() => handleStartTask(t)}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Start Task & Open Link
                        </Button>
                      ) : taskState.status === "verifying" ? (
                        <Button size="sm" variant="secondary" className="w-full font-medium text-amber-700 bg-amber-100 hover:bg-amber-100 cursor-wait" disabled>
                          <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Verifying Action ({taskState.secondsLeft}s)...
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse"
                          onClick={() => handleClaim(t.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Verify & Claim +{t.rewardPoints} pts
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No tasks found matching your filter or search query.
        </div>
      )}
    </div>
  );
}


export function EventsPage() {
  const { events, joinEvent, currentUserId } = useStore();
  const user = useCurrentUser();
  const [tab, setTab] = useState("live");

  const filtered = events.filter((e) => {
    if (tab === "all") return true;
    return e.status === tab;
  });

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="w-7 h-7 text-primary" /> Events
        </h1>
        <p className="text-muted-foreground mt-1">Compete in events to win bonus points. Daily, weekly, monthly, special and festival events.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6"
      >
        {filtered.map((e) => {
          const joined = user ? e.participants.includes(user.id) : false;
          return (
            <motion.div key={e.id} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="flex flex-col h-full">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <Badge variant="secondary" className="capitalize mb-1">{e.type}</Badge>
                    <h3 className="font-semibold text-lg">{e.title}</h3>
                  </div>
                  <Badge variant={e.status === "live" ? "destructive" : "secondary"} className="capitalize">
                    {e.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{e.description}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(e.startTime)}
                </div>

                {e.status === "live" && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Ends in</p>
                    <CountdownTimer endTime={e.endTime} />
                  </div>
                )}
                {e.status === "upcoming" && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Starts in</p>
                    <CountdownTimer endTime={e.startTime} />
                  </div>
                )}

                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Rules:</p>
                  {e.rules.slice(0, 2).map((r, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {r}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-primary" /> +{e.rewardPoints} pts
                  </Badge>
                  <span className="text-xs text-muted-foreground">{e.participants.length} participants</span>
                </div>

                {e.leaderboard.length > 0 && (
                  <div className="border-t pt-3 mb-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1"><Medal className="w-3 h-3 text-amber-500" /> Top 3</p>
                    <div className="space-y-1">
                      {e.leaderboard.slice(0, 3).map((l, i) => (
                        <div key={l.userId} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-700" : "bg-orange-100 text-orange-700"}`}>{i + 1}</span>
                            {l.username}
                          </span>
                          <span className="font-medium">{formatPoints(l.score)} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {e.status === "live" && (
                  <Button
                    className="w-full mt-auto"
                    disabled={!currentUserId || joined}
                    onClick={() => {
                      joinEvent(e.id);
                      toast.success(joined ? "Already joined" : "Joined event!");
                    }}
                  >
                    {joined ? "Joined ✓" : "Join Event"}
                  </Button>
                )}
                {e.status === "completed" && e.winners.length > 0 && (
                  <div className="mt-auto pt-3 border-t">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" /> Winners</p>
                    {e.winners.map((w, i) => (
                      <div key={w.userId} className="flex items-center justify-between text-xs">
                        <span>{i + 1}. {w.username}</span>
                        <Badge variant="outline">{formatPoints(w.prize)} pts</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>
      {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No events in this category.</div>}
    </div>
  );
}

export function RoomsPage() {
  const { rooms, joinRoom, currentUserId } = useStore();
  const user = useCurrentUser();

  const levelColors: Record<number, string> = {
    1: "bg-gray-100 text-gray-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-slate-200 text-slate-700",
    4: "bg-amber-100 text-amber-700",
    5: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  };

  const xpThresholds = [0, 500, 2000, 5000, 10000];
  const userLevel = user?.roomLevel || 1;
  const userXP = user?.roomXP || 0;
  const nextLevelXP = userLevel < 5 ? xpThresholds[userLevel] : null;
  const prevLevelXP = userLevel > 1 ? xpThresholds[userLevel - 2] : 0;
  const levelProgress = nextLevelXP ? Math.min(((userXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100, 100) : 100;

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Crown className="w-7 h-7 text-primary" /> Earning Rooms
        </h1>
        <p className="text-muted-foreground mt-1">5 room levels with increasing seats and rewards. Complete tasks to earn Room XP and unlock higher levels.</p>
      </div>

      {/* User's room level progress */}
      {user && (
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`grid place-items-center w-12 h-12 rounded-xl font-bold text-lg ${levelColors[userLevel]}`}>
                  L{userLevel}
                </div>
                <div>
                  <p className="font-semibold">Your Room Level: {userLevel}</p>
                  <p className="text-xs text-muted-foreground">{formatPoints(userXP)} Room XP</p>
                </div>
              </div>
              {userLevel < 5 ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next: Level {userLevel + 1}</p>
                  <p className="text-sm font-medium">{formatPoints(nextLevelXP! - userXP)} XP to go</p>
                </div>
              ) : (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Max Level</Badge>
              )}
            </div>
            <Progress value={levelProgress} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Level {userLevel}</span>
              {userLevel < 5 && <span>Level {userLevel + 1} ({formatPoints(nextLevelXP!)} XP)</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room levels overview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Room Level System</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {xpThresholds.map((thresh, i) => {
              const level = i + 1;
              const seats = [5, 7, 10, 15, 20][i];
              const unlocked = userLevel >= level;
              return (
                <div key={level} className={`p-3 rounded-lg border text-center ${unlocked ? "border-primary/30 bg-primary/5" : "opacity-50"}`}>
                  <div className={`inline-grid place-items-center w-8 h-8 rounded-lg font-bold text-sm mb-1 ${levelColors[level]}`}>
                    L{level}
                  </div>
                  <p className="text-xs font-medium">{seats} seats</p>
                  <p className="text-[10px] text-muted-foreground">{formatPoints(thresh)} XP</p>
                  {unlocked && <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto mt-1" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
      >
        {rooms.map((r) => {
          const joined = user ? r.participants.includes(user.id) : false;
          const meetsLevel = user ? userLevel >= r.level : false;
          const meetsXP = user ? userXP >= r.entryPoints : false;
          const canEnter = meetsLevel && meetsXP;
          const pct = (r.participants.length / r.seats) * 100;
          return (
            <motion.div key={r.id} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="flex flex-col h-full">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`grid place-items-center w-10 h-10 rounded-lg font-bold ${levelColors[r.level]}`}>
                      L{r.level}
                    </div>
                    <div>
                      <Badge className={levelColors[r.level]}>Level {r.level}</Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-primary" /> +{r.rewardPoints}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{r.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex-1">{r.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                  <div className="p-2 rounded-md bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Seats</p>
                    <p className="font-semibold">{r.seats}</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Min XP</p>
                    <p className="font-semibold">{formatPoints(r.entryPoints)}</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Entry</p>
                    <p className="font-semibold">{r.entryCost > 0 ? `${r.entryCost}` : "Free"}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Seats filled</span>
                    <span className="font-medium">{r.participants.length}/{r.seats}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>

                {r.status === "open" && (
                  <div className="bg-muted/50 rounded-lg p-2 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Ends in</p>
                    <CountdownTimer endTime={r.endTime} compact />
                  </div>
                )}

                {r.leaderboard.length > 0 && (
                  <div className="border-t pt-3 mb-3">
                    <p className="text-xs font-medium mb-2">Top 3</p>
                    <div className="space-y-1">
                      {r.leaderboard.slice(0, 3).map((l, i) => (
                        <div key={l.userId} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-700" : "bg-orange-100 text-orange-700"}`}>{i + 1}</span>
                            {l.username}
                          </span>
                          <span className="font-medium">{formatPoints(l.score)} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {r.status === "open" && (
                  <Button
                    className="w-full mt-auto"
                    disabled={!currentUserId || joined || !canEnter || r.participants.length >= r.seats}
                    onClick={() => {
                      const res = joinRoom(r.id);
                      if (res.ok) toast.success(res.message);
                      else toast.error(res.message);
                    }}
                  >
                    {!currentUserId ? "Login to join" : joined ? "Joined ✓" : !meetsLevel ? `Need Level ${r.level}` : !meetsXP ? `Need ${formatPoints(r.entryPoints)} XP` : r.participants.length >= r.seats ? "Room full" : r.entryCost > 0 ? `Join (-${r.entryCost} pts)` : "Join Free"}
                  </Button>
                )}
                {r.status !== "open" && (
                  <Button variant="outline" className="w-full mt-auto capitalize" disabled>
                    {r.status}
                  </Button>
                )}

                {/* Gift Panel - only show if joined and room is open */}
                {joined && r.status === "open" && r.participants.length > 1 && (
                  <div className="mt-3 border-t pt-3">
                    <GiftPanel roomId={r.id} participants={r.participants.map(pid => ({ userId: pid }))} />
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function ReferralsPage() {
  const user = useCurrentUser();
  const { users, coinHistory, settings } = useStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  if (!user) return null;

  const myReferrals = users.filter((u) => u.referredBy === user.referralCode);
  const myReferralHistory = coinHistory.filter((h) => h.userId === user.id && h.activity.toLowerCase().includes("referral"));
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${user.referralCode}`;
  const earnings = myReferralHistory.reduce((s, h) => s + h.pointsEarned, 0);

  const totalCount = Math.max(user.totalReferrals || 0, myReferrals.length);
  const activeCount = Math.max(user.activeReferrals || 0, myReferrals.filter(r => r.emailVerified).length);
  const pendingCount = Math.max(0, totalCount - activeCount);

  const filteredReferrals = myReferrals.filter(r => {
    if (filter === "active" && !r.emailVerified) return false;
    if (filter === "pending" && r.emailVerified) return false;
    if (search && !r.username.toLowerCase().includes(search.toLowerCase()) && !(r.email || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" /> Referral Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Invite friends and earn {settings.referralReward} points per verified referral.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5 text-center"><Users className="w-6 h-6 mx-auto text-primary mb-2" /><p className="text-2xl font-bold">{totalCount}</p><p className="text-xs text-muted-foreground">Total Referrals</p></CardContent></Card>
        <Card><CardContent className="p-5 text-center"><CheckCircle2 className="w-6 h-6 mx-auto text-green-600 mb-2" /><p className="text-2xl font-bold text-green-600">{activeCount}</p><p className="text-xs text-muted-foreground">Active Referrals</p></CardContent></Card>
        <Card><CardContent className="p-5 text-center"><Clock className="w-6 h-6 mx-auto text-amber-600 mb-2" /><p className="text-2xl font-bold text-amber-600">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending Verification</p></CardContent></Card>
        <Card><CardContent className="p-5 text-center"><Coins className="w-6 h-6 mx-auto text-primary mb-2" /><p className="text-2xl font-bold">{formatPoints(earnings)}</p><p className="text-xs text-muted-foreground">Referral Earnings</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link or code with friends. When they verify their email, you get {settings.referralReward} points instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 px-4 py-3 rounded-md bg-muted font-mono text-sm truncate">{user.referralCode}</div>
            <Button variant="outline" onClick={() => copy(user.referralCode, "Code")}><Copy className="w-4 h-4 mr-2" /> Copy Code</Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 px-4 py-3 rounded-md bg-muted text-sm truncate">{referralLink}</div>
            <Button variant="outline" onClick={() => copy(referralLink, "Link")}><Copy className="w-4 h-4 mr-2" /> Copy Link</Button>
            <Button onClick={() => {
              if (navigator.share) navigator.share({ title: "Join EarnCoin", url: referralLink });
              else copy(referralLink, "Link");
            }}><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Your Referrals ({myReferrals.length})</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {myReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No referrals yet. Share your link to start earning!</p>
          ) : filteredReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No referrals match your search.</p>
          ) : (
            <div className="space-y-3">
              {filteredReferrals.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border shadow-sm">
                      <AvatarFallback style={{ backgroundColor: r.avatarColor || "#4f46e5", color: "white" }} className="text-sm font-semibold">
                        {r.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{r.fullName || r.username}</p>
                        <Badge variant={r.emailVerified ? "secondary" : "outline"} className={`text-[10px] h-5 ${r.emailVerified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>
                          {r.emailVerified ? "Active" : "Pending OTP"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="truncate max-w-[120px] sm:max-w-none">{r.email || "No Email"}</span>
                        <span>•</span>
                        <span>{formatDate(r.createdAt)}</span>
                        <span>•</span>
                        <span>{r.country || "Global"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center justify-between sm:block">
                    <p className="text-xs text-muted-foreground sm:mb-1">Reward</p>
                    <p className={`text-sm font-bold flex items-center gap-1 ${r.emailVerified ? "text-green-600" : "text-muted-foreground opacity-50"}`}>
                      <Coins className="w-3.5 h-3.5" />
                      +{r.emailVerified ? settings.referralReward : "0"} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { icon: Share2, label: "1. Share your code" },
              { icon: Users, label: "2. Friend registers" },
              { icon: CheckCircle2, label: "3. Friend verifies email" },
              { icon: Gift, label: `4. You get ${settings.referralReward} pts` },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-muted/30">
                <s.icon className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WithdrawalsPage() {
  const user = useCurrentUser();
  const { withdrawals, users, settings, requestWithdrawal, addPoints } = useStore();
  const [method, setMethod] = useState<WithdrawalMethod>("paypal");
  const [diamondAmount, setDiamondAmount] = useState("");
  const [account, setAccount] = useState("");
  if (!user) return null;

  const mine = withdrawals.filter((w) => w.userId === user.id);
  const diamonds = user.diamonds || 0;
  
  // Enforce 10-referral requirement
  const myReferrals = users.filter((u) => u.referredBy === user.referralCode);
  const referralsCount = Math.max(user.totalReferrals || 0, myReferrals.length);
  const requiredReferrals = 10;
  const isReferralEligible = referralsCount >= requiredReferrals;
  const referralPct = Math.min((referralsCount / requiredReferrals) * 100, 100);
  
  const isFirstWithdrawal = !user.hasFirstWithdrawal;
  const MIN_DIAMONDS = 10; // minimum for non-first withdrawals

  // Conversion: 1 diamond ≈ Rs 0.12 (≈ $0.0004)
  const diamondToUSD = (d: number) => d * 0.12;
  const diamondToPKR = (d: number) => d * 0.50;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReferralEligible) {
      return toast.error(`You need ${requiredReferrals} completed referrals to request a withdrawal.`);
    }

    const dAmt = parseInt(diamondAmount || "0");
    if (!dAmt || dAmt <= 0) return toast.error("Enter a valid diamond amount");
    if (!account.trim()) return toast.error("Enter your account details");
    // First withdrawal is free — no minimum
    if (!isFirstWithdrawal && dAmt < MIN_DIAMONDS) {
      return toast.error(`Minimum ${MIN_DIAMONDS} diamonds required for withdrawal (first withdrawal is free)`);
    }
    if (dAmt > diamonds && !isFirstWithdrawal) {
      return toast.error("Not enough diamonds");
    }
    const usdAmount = diamondToUSD(dAmt);
    const r = requestWithdrawal({ method, amountUSD: usdAmount, accountDetails: account });
    if (r.ok) {
      toast.success(r.message);
      setDiamondAmount("");
      setAccount("");
      // Deduct diamonds
      addPoints(user.id, 0, ""); // no-op to trigger re-render
    } else {
      toast.error(r.message);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    "under-review": "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    hold: "bg-purple-100 text-purple-700",
    cancelled: "bg-gray-200 text-gray-700",
  };

  const methodLabels: Record<string, string> = {
    paypal: "PayPal", binance: "Binance", paytm: "Paytm", jazzcash: "JazzCash", easypaisa: "EasyPaisa",
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="w-7 h-7 text-primary" /> Withdraw Diamonds
        </h1>
        <p className="text-muted-foreground mt-1">
          {isFirstWithdrawal
            ? "🎉 Your first withdrawal is FREE — no minimum diamonds required!"
            : `Minimum ${MIN_DIAMONDS} diamonds required per withdrawal. Processing: ${settings.withdrawalProcessingHours}`}
        </p>
      </div>

      {/* Diamond balance hero card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <p className="text-4xl font-bold">{diamonds}</p>
              </div>
              <p className="text-sm opacity-90 mt-1">≈ Rs {diamondToPKR(diamonds).toFixed(0)} · ${diamondToUSD(diamonds).toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">Cashable Diamonds</p>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30" onClick={() => useStore.getState().setView("tasks")}>
              Earn More →
            </Button>
          </div>
        </div>
      </Card>

      {/* Referral Eligibility Banner */}
      <Card className={isReferralEligible ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`grid place-items-center w-10 h-10 rounded-lg flex-shrink-0 ${isReferralEligible ? "bg-green-500/20 text-green-600" : "bg-amber-500/20 text-amber-600"}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-medium text-sm sm:text-base ${isReferralEligible ? "text-green-600" : "text-amber-700"}`}>
                {isReferralEligible 
                  ? "Referral Requirement Met ✓" 
                  : `Referral Requirement: ${referralsCount}/${requiredReferrals} Completed`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isReferralEligible 
                  ? `You have ${referralsCount} referrals. You are eligible to withdraw.` 
                  : `You need ${requiredReferrals - referralsCount} more referrals to unlock withdrawals.`}
              </p>
            </div>
          </div>
          {!isReferralEligible && (
            <div className="w-full sm:w-auto flex flex-col gap-2 min-w-[140px]">
              <Progress value={referralPct} className="h-2 w-full" />
              <Button size="sm" onClick={() => useStore.getState().setView("referrals")} className="w-full">
                Invite Friends
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* First withdrawal banner */}
      {isFirstWithdrawal && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-lg bg-green-500/10 text-green-600">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm text-green-600">Free First Withdrawal!</p>
              <p className="text-xs text-muted-foreground">No minimum diamond requirement for your first withdrawal. Withdraw any amount you have.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className={`lg:col-span-2 ${!isReferralEligible ? "opacity-70 pointer-events-none filter grayscale-[0.3]" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {!isReferralEligible && <Lock className="w-4 h-4 text-muted-foreground" />}
              Withdraw Diamonds
            </CardTitle>
            <CardDescription>Processing time: {settings.withdrawalProcessingHours}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diamonds">Diamond Amount</Label>
                <Input id="diamonds" type="number" min={isFirstWithdrawal ? 1 : MIN_DIAMONDS} required value={diamondAmount} onChange={(e) => setDiamondAmount(e.target.value)} placeholder={isFirstWithdrawal ? "Enter any amount" : `Minimum ${MIN_DIAMONDS} diamonds`} disabled={!isReferralEligible} />
                {diamondAmount && parseInt(diamondAmount) > 0 && (
                  <p className="text-xs text-muted-foreground">≈ Rs {diamondToPKR(parseInt(diamondAmount)).toFixed(2)} · ${diamondToUSD(parseInt(diamondAmount)).toFixed(4)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Method</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {settings.withdrawalMethods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      disabled={!isReferralEligible}
                      className={`p-3 rounded-md border text-xs font-medium transition-colors ${method === m ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"}`}
                    >
                      {methodLabels[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">{methodLabels[method]} Account Details</Label>
                <Input id="account" required value={account} onChange={(e) => setAccount(e.target.value)} placeholder={method === "paypal" ? "you@email.com" : method === "binance" ? "Binance ID" : "Phone number"} disabled={!isReferralEligible} />
              </div>

              <Button type="submit" className="w-full" disabled={!diamondAmount || !account || !isReferralEligible}>
                {!isReferralEligible ? "Locked: 10 Referrals Required" : "Request Withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Conversion rate</span><span className="font-medium">{formatPoints(settings.pointsPerDollar)} pts = $1</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Min withdrawal</span><span className="font-medium">{formatUSD(settings.minWithdrawal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max withdrawal</span><span className="font-medium">{formatUSD(settings.maxWithdrawal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Processing</span><span className="font-medium">{settings.withdrawalProcessingHours}</span></div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium mb-2">Status flow:</p>
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                {["pending", "under-review", "approved", "completed"].map((s, i) => (
                  <span key={s} className="flex items-center gap-1">
                    <Badge variant="outline" className="capitalize text-[10px]">{s.replace("-", " ")}</Badge>
                    {i < 3 && <span>→</span>}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No withdrawals yet.</p>
          ) : (
            <div className="space-y-2">
              {mine.map((w) => (
                <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg grid place-items-center ${w.pointsDeducted > 0 || w.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {w.status === "completed" ? <ArrowUpRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{formatUSD(w.amountUSD)} via {methodLabels[w.method]}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.requestedAt)} · -{formatPoints(w.pointsUsed)} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`capitalize ${statusColors[w.status]}`}>{w.status.replace("-", " ")}</Badge>
                    {w.adminNote && <span className="text-xs text-muted-foreground hidden sm:block">{w.adminNote}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CoinHistoryPage() {
  const user = useCurrentUser();
  const { coinHistory } = useStore();
  const [period, setPeriod] = useState("all");
  const [activity, setActivity] = useState("all");
  if (!user) return null;

  let mine = coinHistory.filter((h) => h.userId === user.id);
  const now = new Date();
  if (period === "today") mine = mine.filter((h) => new Date(h.date).toDateString() === now.toDateString());
  if (period === "month") {
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    mine = mine.filter((h) => new Date(h.date) >= monthAgo);
  }
  if (activity !== "all") {
    mine = mine.filter((h) => h.activity.toLowerCase().includes(activity));
  }

  const totalEarned = mine.reduce((s, h) => s + h.pointsEarned, 0);
  const totalDeducted = mine.reduce((s, h) => s + h.pointsDeducted, 0);

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Coin History</h1>
        <p className="text-muted-foreground mt-1">Full audit log of every point transaction on your account.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Earned</p><p className="text-xl font-bold text-green-600">+{formatPoints(totalEarned)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Deducted</p><p className="text-xl font-bold text-red-600">-{formatPoints(totalDeducted)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Net</p><p className="text-xl font-bold">{formatPoints(totalEarned - totalDeducted)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transactions</p><p className="text-xl font-bold">{mine.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Activity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="referral">Referrals</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="room">Rooms</SelectItem>
              <SelectItem value="welcome">Welcome bonus</SelectItem>
              <SelectItem value="login">Login</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="sm:ml-auto" onClick={() => toast.info("Export started — check your downloads")}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium">Date & Time</th>
                  <th className="text-left p-3 font-medium">Activity</th>
                  <th className="text-right p-3 font-medium">Earned</th>
                  <th className="text-right p-3 font-medium">Deducted</th>
                  <th className="text-right p-3 font-medium">Balance</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((h) => (
                  <tr key={h.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(h.date)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {h.pointsEarned > 0 ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />}
                        <span>{h.activity}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium text-green-600">{h.pointsEarned > 0 ? `+${formatPoints(h.pointsEarned)}` : "—"}</td>
                    <td className="p-3 text-right font-medium text-red-600">{h.pointsDeducted > 0 ? `-${formatPoints(h.pointsDeducted)}` : "—"}</td>
                    <td className="p-3 text-right font-medium">{formatPoints(h.balanceAfter)}</td>
                    <td className="p-3 text-center">
                      <Badge variant={h.status === "completed" ? "secondary" : "outline"} className={h.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {h.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {mine.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LeaderboardPage() {
  const { users, events, rooms } = useStore();
  const [tab, setTab] = useState("earners");
  const [period, setPeriod] = useState("all");

  // For demo: derive "period" leaderboards from coinHistory would be more accurate,
  // but we'll use users' total points for simplicity
  const topEarners = [...users].filter((u) => u.role === "user").sort((a, b) => b.points - a.points).slice(0, 10);
  const topReferrers = [...users].filter((u) => u.role === "user").sort((a, b) => b.totalReferrals - a.totalReferrals).slice(0, 10);
  const eventWinners = events.flatMap((e) => e.winners.map((w) => ({ ...w, eventTitle: e.title }))).slice(0, 10);
  const roomWinners = rooms.flatMap((r) => r.leaderboard.slice(0, 1).map((l) => ({ ...l, roomName: r.name }))).slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" /> Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">See who&apos;s topping the charts. Daily, weekly, monthly and all-time rankings.</p>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="earners"><Coins className="w-3.5 h-3.5 mr-1" /> Top Earners</TabsTrigger>
          <TabsTrigger value="referrals"><Users className="w-3.5 h-3.5 mr-1" /> Top Referrals</TabsTrigger>
          <TabsTrigger value="events"><Trophy className="w-3.5 h-3.5 mr-1" /> Event Winners</TabsTrigger>
          <TabsTrigger value="rooms"><Crown className="w-3.5 h-3.5 mr-1" /> Room Winners</TabsTrigger>
        </TabsList>

        <TabsContent value="earners">
          <LeaderboardTable rows={topEarners.map((u, i) => ({ rank: i + 1, username: u.username, score: u.points, label: "points" }))} />
        </TabsContent>
        <TabsContent value="referrals">
          <LeaderboardTable rows={topReferrers.map((u, i) => ({ rank: i + 1, username: u.username, score: u.totalReferrals, label: "referrals" }))} />
        </TabsContent>
        <TabsContent value="events">
          <Card>
            <CardContent className="p-0">
              {eventWinners.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No event winners yet.</p>
              ) : (
                <div className="divide-y">
                  {eventWinners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 grid place-items-center font-bold text-sm">{i + 1}</span>
                        <div>
                          <p className="font-medium text-sm">@{w.username}</p>
                          <p className="text-xs text-muted-foreground">{w.eventTitle}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1"><Coins className="w-3 h-3 text-primary" /> {formatPoints(w.prize)} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rooms">
          <Card>
            <CardContent className="p-0">
              {roomWinners.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No room winners yet.</p>
              ) : (
                <div className="divide-y">
                  {roomWinners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center font-bold text-sm">{i + 1}</span>
                        <div>
                          <p className="font-medium text-sm">@{w.username}</p>
                          <p className="text-xs text-muted-foreground">{w.roomName}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1"><Coins className="w-3 h-3 text-primary" /> {formatPoints(w.score)} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeaderboardTable({ rows }: { rows: { rank: number; username: string; score: number; label: string }[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.rank} className={`flex items-center justify-between p-4 ${r.rank <= 3 ? "bg-muted/30" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-full grid place-items-center font-bold ${
                  r.rank === 1 ? "bg-amber-100 text-amber-700" :
                  r.rank === 2 ? "bg-gray-200 text-gray-700" :
                  r.rank === 3 ? "bg-orange-100 text-orange-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {r.rank <= 3 ? <Medal className="w-5 h-5" /> : r.rank}
                </span>
                <div>
                  <p className="font-medium">@{r.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPoints(r.score)}</p>
                <p className="text-xs text-muted-foreground">{r.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationsPage() {
  const user = useCurrentUser();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  if (!user) return null;

  const mine = notifications.filter((n) => n.userId === user.id);
  const unread = mine.filter((n) => !n.read).length;

  const typeIcons: Record<string, typeof Bell> = {
    withdrawal: Wallet, video: VideoIcon, task: CheckCircle2, referral: Users,
    event: Trophy, room: Crown, announcement: Bell, admin: Bell,
  };
  const typeColors: Record<string, string> = {
    withdrawal: "bg-green-100 text-green-700", video: "bg-red-100 text-red-700",
    task: "bg-blue-100 text-blue-700", referral: "bg-purple-100 text-purple-700",
    event: "bg-amber-100 text-amber-700", room: "bg-orange-100 text-orange-700",
    announcement: "bg-gray-100 text-gray-700", admin: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground mt-1">{unread > 0 ? `${unread} unread notifications` : "All caught up!"}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={() => { markAllNotificationsRead(); toast.success("All marked as read"); }}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {mine.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />No notifications yet.</CardContent></Card>
        )}
        {mine.map((n) => {
          const Icon = typeIcons[n.type] || Bell;
          return (
            <Card key={n.id} className={`cursor-pointer transition-colors hover:bg-muted/30 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`} onClick={() => markNotificationRead(n.id)}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg grid place-items-center flex-shrink-0 ${typeColors[n.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const user = useCurrentUser();
  const { settings } = useStore();
  if (!user) return null;

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <h1 className="text-xl sm:text-3xl font-bold tracking-tight">My Profile</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback style={{ backgroundColor: user.avatarColor, color: "white" }} className="text-2xl font-bold">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                <Badge variant="outline">{user.country}</Badge>
                <Badge variant="outline" className={user.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  {user.emailVerified ? "Email verified" : "Not verified"}
                </Badge>
                <Badge variant="outline" className={user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Points</p><p className="text-2xl font-bold">{formatPoints(user.points)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">USD Balance</p><p className="text-2xl font-bold text-green-600">{formatUSD(user.dollarBalance)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Referrals</p><p className="text-2xl font-bold">{user.totalReferrals}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Referrals</p><p className="text-2xl font-bold text-green-600">{user.activeReferrals}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Referral code</span><span className="font-mono font-bold">{user.referralCode}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{formatDate(user.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Last login</span><span>{user.lastLogin ? formatDate(user.lastLogin) : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Device fingerprint</span><span className="font-mono text-xs">{user.deviceFingerprint}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Browser / OS</span><span>{user.browserInfo}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">IP address</span><span className="font-mono">{user.ipAddress}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conversion rate</span><span>{formatPoints(settings.pointsPerDollar)} pts = $1</span></div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ GAMING SYSTEM ============

const GAMES_LIST = [
  // Free Games (entertainment only)
  { id: "tictactoe", name: "Tic-Tac-Toe", type: "free" as const, entryFee: 0, reward: 0, description: "Classic Tic-Tac-Toe vs computer. Pure entertainment — no rewards.", icon: "grid" },
  { id: "memory", name: "Memory Match", type: "free" as const, entryFee: 0, reward: 0, description: "Flip cards and match pairs. Train your memory for free.", icon: "brain" },
  // Coin Games (skill-based, win double or lose entry)
  { id: "math", name: "Quick Math Challenge", type: "coin" as const, entryFee: 100, reward: 200, description: "Solve 5 math problems in 30 seconds. Win 200 coins or lose 100.", icon: "zap" },
  { id: "reaction", name: "Reaction Speed Test", type: "coin" as const, entryFee: 50, reward: 100, description: "Click as fast as you can when the light turns green. Win 100 or lose 50.", icon: "target" },
  { id: "numberhunt", name: "Number Hunt", type: "coin" as const, entryFee: 200, reward: 400, description: "Find the hidden number in 5 tries. Win 400 or lose 200.", icon: "dice" },
];

const gameIcons: Record<string, typeof Gamepad2> = {
  grid: Gamepad2, brain: Brain, zap: Zap, target: Target, dice: Dice5,
};

export function GamesPage() {
  const user = useCurrentUser();
  const { gameResults } = useStore();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");

  if (!user) return null;
  const myResults = gameResults.filter((g) => g.userId === user.id);
  const wins = myResults.filter((g) => g.result === "win").length;
  const losses = myResults.filter((g) => g.result === "loss").length;
  const netChange = myResults.reduce((s, g) => s + g.pointsChange, 0);

  if (activeGame) {
    const game = GAMES_LIST.find((g) => g.id === activeGame);
    if (!game) return null;
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveGame(null)}>
          <ArrowUpRight className="w-4 h-4 mr-2 rotate-180" /> Back to Games
        </Button>
        {game.id === "tictactoe" && <TicTacToeGame onEnd={(result) => { toast.success(result === "win" ? "You won!" : result === "loss" ? "Computer won!" : "It's a draw!"); }} />}
        {game.id === "memory" && <MemoryGame onEnd={(result) => { toast.success(result === "win" ? "You matched all pairs!" : "Game over!"); }} />}
        {game.id === "math" && <MathGame entryFee={game.entryFee} reward={game.reward} onEnd={(result) => {
          const r = useStore.getState().playGame("math", "coin", game.entryFee, result);
          if (r.ok) toast.success(r.message); else toast.error(r.message);
        }} />}
        {game.id === "reaction" && <ReactionGame entryFee={game.entryFee} reward={game.reward} onEnd={(result) => {
          const r = useStore.getState().playGame("reaction", "coin", game.entryFee, result);
          if (r.ok) toast.success(r.message); else toast.error(r.message);
        }} />}
        {game.id === "numberhunt" && <NumberHuntGame entryFee={game.entryFee} reward={game.reward} onEnd={(result) => {
          const r = useStore.getState().playGame("numberhunt", "coin", game.entryFee, result);
          if (r.ok) toast.success(r.message); else toast.error(r.message);
        }} />}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Gamepad2 className="w-7 h-7 text-primary" /> Gaming Center
        </h1>
        <p className="text-muted-foreground mt-1">Play games while waiting in rooms. Free games are for fun; Coin games let you multiply your earned coins through skill.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Games Played</p><p className="text-xl font-bold">{myResults.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Wins</p><p className="text-xl font-bold text-green-600">{wins}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Losses</p><p className="text-xl font-bold text-red-600">{losses}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Net Coins</p><p className={`text-xl font-bold ${netChange >= 0 ? "text-green-600" : "text-red-600"}`}>{netChange >= 0 ? "+" : ""}{formatPoints(netChange)}</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">All Games</TabsTrigger>
          <TabsTrigger value="free">Free Games</TabsTrigger>
          <TabsTrigger value="coin">Coin Games</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary" /> Free Games (Entertainment Only)</h3>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 gap-4"
            >
              {GAMES_LIST.filter((g) => g.type === "free").map((g) => {
                const Icon = gameIcons[g.icon] || Gamepad2;
                return (
                  <motion.div key={g.id} variants={staggerItem} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <motion.div
                          className="grid place-items-center w-12 h-12 rounded-xl bg-muted text-foreground flex-shrink-0"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{g.name}</h4>
                          <Badge variant="secondary" className="mt-1">Free</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{g.description}</p>
                      <Button className="w-full" variant="outline" onClick={() => setActiveGame(g.id)}>
                        <Play className="w-4 h-4 mr-2" /> Play for Fun
                      </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Coins className="w-4 h-4 text-primary" /> Coin Games (Win Double or Lose Entry)</h3>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {GAMES_LIST.filter((g) => g.type === "coin").map((g) => {
                const Icon = gameIcons[g.icon] || Gamepad2;
                const canAfford = user.points >= g.entryFee;
                return (
                  <motion.div key={g.id} variants={staggerItem} whileHover={canAfford ? { y: -4, scale: 1.01 } : undefined} transition={{ duration: 0.2 }}>
                  <Card className={`hover:shadow-md transition-shadow h-full ${!canAfford ? "opacity-60" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <motion.div
                          className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{g.name}</h4>
                          <Badge variant="outline" className="mt-1">Coin Game</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{g.description}</p>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="p-2 rounded bg-red-50 text-red-700 text-center">
                          <p className="text-muted-foreground text-[10px]">Entry</p>
                          <p className="font-bold">-{g.entryFee}</p>
                        </div>
                        <div className="p-2 rounded bg-green-50 text-green-700 text-center">
                          <p className="text-muted-foreground text-[10px]">Win</p>
                          <p className="font-bold">+{g.reward}</p>
                        </div>
                      </div>
                      <Button className="w-full" disabled={!canAfford} onClick={() => setActiveGame(g.id)}>
                        {canAfford ? <><Coins className="w-4 h-4 mr-2" /> Enter ({g.entryFee} coins)</> : <><Lock className="w-4 h-4 mr-2" /> Need {g.entryFee} coins</>}
                      </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="free">
          <div className="grid sm:grid-cols-2 gap-4">
            {GAMES_LIST.filter((g) => g.type === "free").map((g) => {
              const Icon = gameIcons[g.icon] || Gamepad2;
              return (
                <Card key={g.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="grid place-items-center w-12 h-12 rounded-xl bg-muted flex-shrink-0"><Icon className="w-6 h-6" /></div>
                      <div><h4 className="font-semibold">{g.name}</h4><Badge variant="secondary" className="mt-1">Free</Badge></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{g.description}</p>
                    <Button className="w-full" variant="outline" onClick={() => setActiveGame(g.id)}><Play className="w-4 h-4 mr-2" /> Play</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="coin">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES_LIST.filter((g) => g.type === "coin").map((g) => {
              const Icon = gameIcons[g.icon] || Gamepad2;
              const canAfford = user.points >= g.entryFee;
              return (
                <Card key={g.id} className={!canAfford ? "opacity-60" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0"><Icon className="w-6 h-6" /></div>
                      <div><h4 className="font-semibold">{g.name}</h4><Badge variant="outline" className="mt-1">Coin Game</Badge></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{g.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="p-2 rounded bg-red-50 text-red-700 text-center"><p className="text-[10px]">Entry</p><p className="font-bold">-{g.entryFee}</p></div>
                      <div className="p-2 rounded bg-green-50 text-green-700 text-center"><p className="text-[10px]">Win</p><p className="font-bold">+{g.reward}</p></div>
                    </div>
                    <Button className="w-full" disabled={!canAfford} onClick={() => setActiveGame(g.id)}>
                      {canAfford ? <><Coins className="w-4 h-4 mr-2" /> Enter ({g.entryFee})</> : <><Lock className="w-4 h-4 mr-2" /> Need {g.entryFee}</>}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {myResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No games played yet.</p>
              ) : (
                <div className="divide-y">
                  {myResults.map((g) => (
                    <div key={g.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg grid place-items-center ${g.result === "win" ? "bg-green-100 text-green-700" : g.result === "loss" ? "bg-red-100 text-red-700" : "bg-gray-100"}`}>
                          {g.result === "win" ? <CheckCircle2 className="w-4 h-4" /> : g.result === "loss" ? <XCircle className="w-4 h-4" /> : <span className="text-xs">=</span>}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{g.gameName.replace(/([A-Z])/g, " $1").trim()}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(g.playedAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${g.pointsChange > 0 ? "text-green-600" : g.pointsChange < 0 ? "text-red-600" : ""}`}>
                          {g.pointsChange > 0 ? "+" : ""}{g.pointsChange !== 0 ? formatPoints(g.pointsChange) : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{g.gameType} · {g.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Individual Game Components ---

function TicTacToeGame({ onEnd }: { onEnd: (result: "win" | "loss" | "draw") => void }) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const checkWin = (b: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every((c) => c)) return "draw";
    return null;
  };

  const computerMove = (b: (string | null)[]) => {
    // Simple AI: try to win, then block, then random
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of lines) {
      if (b[a] === "O" && b[c] === "O" && !b[d]) return d;
      if (b[a] === "O" && b[d] === "O" && !b[c]) return c;
      if (b[c] === "O" && b[d] === "O" && !b[a]) return a;
    }
    for (const [a, c, d] of lines) {
      if (b[a] === "X" && b[c] === "X" && !b[d]) return d;
      if (b[a] === "X" && b[d] === "X" && !b[c]) return c;
      if (b[c] === "X" && b[d] === "X" && !b[a]) return a;
    }
    if (!b[4]) return 4;
    const empty = b.map((c, i) => c ? null : i).filter((c) => c !== null);
    return empty[Math.floor(Math.random() * empty.length)] ?? 0;
  };

  const handleClick = (i: number) => {
    if (board[i] || gameOver || !isPlayerTurn) return;
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);
    const win = checkWin(newBoard);
    if (win) { setGameOver(true); onEnd(win === "X" ? "win" : win === "O" ? "loss" : "draw"); return; }
    setTimeout(() => {
      const move = computerMove(newBoard);
      const updatedBoard = [...newBoard];
      updatedBoard[move] = "O";
      setBoard(updatedBoard);
      setIsPlayerTurn(true);
      const win2 = checkWin(updatedBoard);
      if (win2) { setGameOver(true); onEnd(win2 === "X" ? "win" : win2 === "O" ? "loss" : "draw"); }
    }, 500);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setIsPlayerTurn(true); setGameOver(false); };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-1">Tic-Tac-Toe</h3>
        <p className="text-sm text-muted-foreground mb-4">You are X. Computer is O. {isPlayerTurn ? "Your turn." : "Computer thinking..."}</p>
        <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              onClick={() => handleClick(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="aspect-square rounded-lg border-2 border-border text-3xl font-bold grid place-items-center hover:bg-accent transition-colors"
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    key={cell}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cell === "X" ? "text-primary" : "text-destructive"}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
        {gameOver && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><Button className="w-full mt-4" onClick={reset}>Play Again</Button></motion.div>}
      </CardContent>
    </Card>
  );
}

function MemoryGame({ onEnd }: { onEnd: (result: "win" | "loss" | "draw") => void }) {
  const symbols = ["★", "♦", "♠", "♣", "♥", "▲", "●", "■"];
  const [cards, setCards] = useState(() => {
    const pairs = [...symbols, ...symbols];
    return pairs.sort(() => Math.random() - 0.5).map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const endedRef = useRef(false);

  const handleClick = (id: number) => {
    if (flipped.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;
    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].symbol === newCards[b].symbol) {
        setTimeout(() => {
          setCards(cs => {
            const updated = cs.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c);
            return updated;
          });
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(cs => cs.map(c => c.id === a || c.id === b ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 800);
      }
    }
  };

  const allMatched = cards.every(c => c.matched);
  useEffect(() => {
    if (allMatched && moves > 0 && !endedRef.current) {
      endedRef.current = true;
      onEnd("win");
    }
  }, [allMatched, moves, onEnd]);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-1">Memory Match</h3>
        <p className="text-sm text-muted-foreground mb-4">Match all 8 pairs. Moves: {moves}</p>
        <div className="grid grid-cols-4 gap-2 max-w-[400px] mx-auto">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleClick(card.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotateY: (card.flipped || card.matched) ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: "preserve-3d" }}
              className={`aspect-square rounded-lg border-2 grid place-items-center text-2xl font-bold transition-colors ${card.flipped || card.matched ? "bg-primary/10 border-primary" : "bg-muted border-border hover:bg-accent"}`}
            >
              <motion.span
                animate={{ rotateY: (card.flipped || card.matched) ? 0 : 180 }}
                style={{ backfaceVisibility: "hidden" }}
              >
                {(card.flipped || card.matched) ? card.symbol : "?"}
              </motion.span>
            </motion.button>
          ))}
        </div>
        {allMatched && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="text-center text-green-600 font-bold mt-4">All pairs matched in {moves} moves!</motion.p>}
      </CardContent>
    </Card>
  );
}

function MathGame({ entryFee, reward, onEnd }: { entryFee: number; reward: number; onEnd: (r: "win" | "loss") => void }) {
  const [problems] = useState(() => Array.from({ length: 5 }).map(() => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const op = ["+", "-", "×"][Math.floor(Math.random() * 3)];
    const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
    return { question: `${a} ${op} ${b}`, answer };
  }));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [correct, setCorrect] = useState(0);
  const endedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fire onEnd once when finished
  useEffect(() => {
    if (finished && !endedRef.current) {
      endedRef.current = true;
      const won = correct >= 4;
      onEnd(won ? "win" : "loss");
    }
  }, [finished, correct, onEnd]);

  if (finished) {
    const won = correct >= 4;
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-xl mb-2">{won ? "You Win!" : "You Lost"}</h3>
          <p className="text-muted-foreground mb-4">You got {correct}/5 correct in 30 seconds.</p>
          <p className={won ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {won ? `+${reward} coins credited!` : `-${entryFee} coins lost.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === problems[current].answer) setCorrect(c => c + 1);
    if (current < 4) { setCurrent(c => c + 1); setInput(""); } else { setFinished(true); }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Quick Math Challenge</h3>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Question {current + 1}/5</Badge>
            <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"}>
              <Clock className="w-3 h-3 mr-1" /> {timeLeft}s
            </Badge>
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-8 text-center mb-4">
          <p className="text-4xl font-bold font-mono">{problems[current].question} = ?</p>
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <Input type="number" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Your answer" autoFocus className="text-lg text-center" />
          <Button type="submit">Submit</Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3 text-center">Need 4/5 correct to win {reward} coins. Entry: {entryFee} coins.</p>
      </CardContent>
    </Card>
  );
}

function ReactionGame({ entryFee, reward, onEnd }: { entryFee: number; reward: number; onEnd: (r: "win" | "loss") => void }) {
  const [state, setState] = useState<"waiting" | "ready" | "result" | "tooEarly">("waiting");
  const [startTime, setStartTime] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const maxAttempts = 3;

  const startWait = () => {
    setState("waiting");
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      setStartTime(Date.now());
      setState("ready");
    }, delay);
  };

  // Start first attempt on mount — use a ref to avoid setState in effect
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const delay = 2000 + Math.random() * 3000;
    const t = setTimeout(() => {
      setStartTime(Date.now());
      setState("ready");
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const endedRef = useRef(false);

  useEffect(() => {
    if (state === "result" && !endedRef.current) {
      endedRef.current = true;
      const avg = attempts.reduce((s, n) => s + n, 0) / attempts.length;
      const won = avg < 400;
      onEnd(won ? "win" : "loss");
    }
  }, [state, attempts, onEnd]);

  const handleClick = () => {
    if (state === "waiting") {
      setState("tooEarly");
      return;
    }
    if (state === "ready") {
      const rt = Date.now() - startTime;
      setAttempts(prev => {
        const next = [...prev, rt];
        if (next.length >= maxAttempts) {
          setState("result");
          return next;
        }
        return next;
      });
      setState("waiting");
      setTimeout(() => startWait(), 1000);
    }
  };

  if (state === "result") {
    const avg = attempts.reduce((s, n) => s + n, 0) / attempts.length;
    const won = avg < 400;
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-xl mb-2">{won ? "You Win!" : "You Lost"}</h3>
          <p className="text-muted-foreground mb-4">Average reaction: {Math.round(avg)}ms (need under 400ms)</p>
          <p className={won ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {won ? `+${reward} coins credited!` : `-${entryFee} coins lost.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-1">Reaction Speed Test</h3>
        <p className="text-sm text-muted-foreground mb-4">Click when the box turns green. 3 attempts. Average must be under 400ms to win. Attempts: {attempts.length}/{maxAttempts}</p>
        {attempts.length > 0 && <p className="text-sm text-muted-foreground mb-2">Times: {attempts.map(a => `${a}ms`).join(", ")}</p>}
        <button
          onClick={handleClick}
          className={`w-full h-48 rounded-xl grid place-items-center text-white font-bold text-xl transition-colors ${
            state === "waiting" ? "bg-red-500" : state === "ready" ? "bg-green-500" : state === "tooEarly" ? "bg-amber-500" : "bg-primary"
          }`}
        >
          {state === "waiting" ? "Wait for green..." : state === "ready" ? "CLICK NOW!" : state === "tooEarly" ? "Too early! Wait for green." : "Done"}
        </button>
        {state === "tooEarly" && <Button className="w-full mt-3" onClick={startWait}>Try Again</Button>}
      </CardContent>
    </Card>
  );
}

function NumberHuntGame({ entryFee, reward, onEnd }: { entryFee: number; reward: number; onEnd: (r: "win" | "loss") => void }) {
  const [target] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<number[]>([]);
  const [hint, setHint] = useState("");
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const maxAttempts = 5;
  const endedRef = useRef(false);

  useEffect(() => {
    if (finished && !endedRef.current) {
      endedRef.current = true;
      onEnd(won ? "win" : "loss");
    }
  }, [finished, won, onEnd]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseInt(guess);
    if (isNaN(g) || g < 1 || g > 100) return;
    const newAttempts = [...attempts, g];
    setAttempts(newAttempts);
    setGuess("");
    if (g === target) {
      setFinished(true);
      setWon(true);
      setHint("Correct!");
    } else if (newAttempts.length >= maxAttempts) {
      setFinished(true);
      setWon(false);
      setHint(`Out of guesses! The number was ${target}.`);
    } else {
      setHint(`${g < target ? "Higher" : "Lower"} than ${g}. ${maxAttempts - newAttempts.length} guesses left.`);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-1">Number Hunt</h3>
        <p className="text-sm text-muted-foreground mb-4">Guess the number between 1 and 100. You have {maxAttempts} attempts. Win {reward} coins or lose {entryFee}.</p>
        <div className="bg-muted/50 rounded-xl p-6 text-center mb-4">
          <p className="text-lg font-medium">{finished ? hint : hint || "Enter your first guess"}</p>
        </div>
        {!finished && (
          <form onSubmit={submit} className="flex gap-2">
            <Input type="number" min={1} max={100} value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="1-100" autoFocus />
            <Button type="submit">Guess</Button>
          </form>
        )}
        {attempts.length > 0 && <p className="text-xs text-muted-foreground mt-3">Your guesses: {attempts.join(", ")}</p>}
      </CardContent>
    </Card>
  );
}

// ============ BUY COINS PAGE ============

const COIN_PACKAGES = [
  { coins: 300, bonus: 30, vipExp: 33, pricePKR: 140, priceUSD: 0.50 },
  { coins: 600, bonus: 60, vipExp: 66, pricePKR: 280, priceUSD: 1.00 },
  { coins: 1500, bonus: 150, vipExp: 170, pricePKR: 700, priceUSD: 2.50 },
  { coins: 5000, bonus: 500, vipExp: 570, pricePKR: 2300, priceUSD: 8.00 },
  { coins: 14000, bonus: 1400, vipExp: 1600, pricePKR: 6400, priceUSD: 22.00 },
  { coins: 50000, bonus: 5000, vipExp: 5700, pricePKR: 23000, priceUSD: 80.00 },
];

const PAYMENT_METHODS = [
  { id: "jazzcash", name: "JazzCash", color: "bg-red-500" },
  { id: "easypaisa", name: "EasyPaisa", color: "bg-green-500" },
  { id: "paypal", name: "PayPal", color: "bg-blue-500" },
  { id: "binance", name: "Binance", color: "bg-yellow-500" },
];

export function BuyCoinsPage() {
  const user = useCurrentUser();
  const { addPoints } = useStore();
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState("jazzcash");
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const pkg = COIN_PACKAGES[selectedPkg];

  const handlePurchase = () => {
    addPoints(user.id, pkg.coins + pkg.bonus, `Purchased ${pkg.coins} coins (+${pkg.bonus} bonus)`);
    toast.success(`${pkg.coins + pkg.bonus} coins added to your account!`);
    setOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Coins className="w-7 h-7 text-primary" /> Buy Coins
        </h1>
        <p className="text-muted-foreground mt-1">Purchase coins to play games, enter rooms, and multiply your earnings.</p>
      </div>

      {/* Balance card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Coin Balance</p>
              <p className="text-4xl font-bold mt-1">{formatPoints(user.points)}</p>
              <p className="text-sm opacity-75 mt-1">≈ {formatUSD(user.dollarBalance)} USD</p>
            </div>
            <div className="grid place-items-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur">
              <Coins className="w-8 h-8" />
            </div>
          </div>
        </div>
      </Card>

      {/* Coin packages */}
      <div>
        <h3 className="font-semibold mb-3">Select Amount</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COIN_PACKAGES.map((p, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card
                className={`cursor-pointer transition-all ${selectedPkg === i ? "border-primary border-2 ring-2 ring-primary/20" : ""}`}
                onClick={() => setSelectedPkg(i)}
              >
                <CardContent className="p-4 text-center">
                  <Badge className="mb-2 bg-primary/10 text-primary">VIP +{p.vipExp}</Badge>
                  <div className="grid place-items-center w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 text-primary">
                    <Coins className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-lg">{formatPoints(p.coins)}</p>
                  <p className="text-xs text-primary font-medium">+{p.bonus} bonus</p>
                  <div className="mt-2 inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">
                    PKR {p.pricePKR}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <h3 className="font-semibold mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <Card
              key={m.id}
              className={`cursor-pointer transition-all ${selectedMethod === m.id ? "border-primary border-2" : ""}`}
              onClick={() => setSelectedMethod(m.id)}
            >
              <CardContent className="p-3 text-center">
                <div className={`grid place-items-center w-8 h-8 mx-auto mb-1 rounded-lg ${m.color} text-white text-xs font-bold`}>
                  {m.name[0]}
                </div>
                <p className="text-xs font-medium">{m.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button size="lg" className="w-full text-base font-bold" onClick={() => setOpen(true)}>
        Pay Now — PKR {pkg.pricePKR}
      </Button>

      {/* Purchase confirmation */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>You are about to purchase {formatPoints(pkg.coins)} coins (+{pkg.bonus} bonus) for PKR {pkg.pricePKR} via {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Coins</span><span className="font-medium">{formatPoints(pkg.coins)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bonus</span><span className="font-medium text-primary">+{pkg.bonus}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">{formatPoints(pkg.coins + pkg.bonus)} coins</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Price</span><span className="font-bold">PKR {pkg.pricePKR}</span></div>
          </div>
          <Button className="w-full" onClick={handlePurchase}>Confirm & Pay</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ GIFT PANEL (for Rooms) ============

const GIFTS = [
  { id: "rose", name: "Rose", icon: "🌹", coins: 1, diamonds: 1 },
  { id: "icecream", name: "Ice Cream", icon: "🍦", coins: 5, diamonds: 2 },
  { id: "ring", name: "Ring", icon: "💍", coins: 10, diamonds: 3 },
  { id: "car", name: "Car", icon: "🚗", coins: 50, diamonds: 5 },
  { id: "plane", name: "Plane", icon: "✈️", coins: 100, diamonds: 10 },
  { id: "castle", name: "Castle", icon: "🏰", coins: 500, diamonds: 50 },
];

export function GiftPanel({ roomId, participants }: { roomId: string; participants: any[] }) {
  const user = useCurrentUser();
  const { sendGift, users } = useStore();
  const [selectedGift, setSelectedGift] = useState("rose");
  const [selectedUser, setSelectedUser] = useState<string>("");

  if (!user) return null;
  const myCoins = user.coins || 0;
  const otherParticipants = participants.filter((p) => p.userId !== user.id);

  const handleSend = () => {
    if (!selectedUser) return toast.error("Select a user to gift");
    const r = sendGift(roomId, user.id, selectedUser, selectedGift);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">🎁 Send Gift</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Coins balance */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground">Your Coins</span>
          <span className="font-bold text-sm">{myCoins} 🪙</span>
        </div>

        {/* Super Star status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground">Super Star Status</span>
          <Badge variant={user.isSuperStar ? "secondary" : "outline"} className={user.isSuperStar ? "bg-purple-100 text-purple-700" : ""}>
            {user.isSuperStar ? "⭐ Super Star" : "Not yet"}
          </Badge>
        </div>
        {!user.isSuperStar && (
          <p className="text-xs text-muted-foreground">Complete 10+ room tasks to become a Super Star and earn diamonds from gifts!</p>
        )}

        {/* Select recipient */}
        <div className="space-y-2">
          <Label className="text-xs">Select Recipient</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choose user..." /></SelectTrigger>
            <SelectContent>
              {otherParticipants.map((p) => {
                const u = users.find((usr) => usr.id === p.userId);
                return (
                  <SelectItem key={p.userId} value={p.userId}>
                    {u?.username || "Unknown"} {u?.isSuperStar ? "⭐" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Gift grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GIFTS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGift(g.id)}
              className={`p-2 rounded-lg border text-center transition-all ${selectedGift === g.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`}
            >
              <div className="text-2xl">{g.icon}</div>
              <p className="text-[10px] font-medium mt-1">{g.name}</p>
              <p className="text-[10px] text-primary">{g.coins} 🪙</p>
              <p className="text-[10px] text-purple-500">+{g.diamonds} 💎</p>
            </button>
          ))}
        </div>

        <Button className="w-full" size="sm" onClick={handleSend} disabled={!selectedUser || myCoins < (GIFTS.find(g => g.id === selectedGift)?.coins || 0)}>
          Send {GIFTS.find(g => g.id === selectedGift)?.icon} {GIFTS.find(g => g.id === selectedGift)?.name}
        </Button>
      </CardContent>
    </Card>
  );
}

// ==================== QUIZ PAGE ====================
export function QuizPage() {
  const { quizzes, quizAttempts, submitQuiz, hasAttemptedQuiz } = useStore();
  const user = useCurrentUser();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch full quiz (with questions) when activeQuiz changes
  useEffect(() => {
    if (!activeQuiz) return;
    setAnswers([]);
    setResult(null);
    setTimeLeft(activeQuiz.timeLimitMin * 60);
    // Fetch full quiz with questions from API
    fetch(`/api/quizzes/${activeQuiz.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.questions) {
          setActiveQuiz({ ...activeQuiz, questions: data.questions });
        }
      })
      .catch((e) => console.error("Failed to fetch quiz questions:", e));
  }, [activeQuiz?.id]);

  // Countdown timer
  useEffect(() => {
    if (!activeQuiz || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [activeQuiz, timeLeft, result]);

  const handleSelect = (questionId: string, selectedIndex: number) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) return prev.map((a) => (a.questionId === questionId ? { ...a, selectedIndex } : a));
      return [...prev, { questionId, selectedIndex }];
    });
  };

  const handleSubmit = async () => {
    if (!activeQuiz || !user) return;
    setSubmitting(true);
    const r = await submitQuiz(activeQuiz.id, answers);
    setSubmitting(false);
    if (r.ok) {
      setResult(r);
      if (r.pointsEarned > 0) toast.success(r.message);
      else toast.info(r.message);
    } else {
      toast.error(r.message);
      setResult({ ok: false, message: r.message });
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Result view
  if (activeQuiz && result) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full grid place-items-center mb-4 ${result.passed ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
              {result.passed ? <CheckCircle2 className="w-12 h-12" /> : <Award className="w-12 h-12" />}
            </div>
            <h2 className="text-2xl font-bold mb-2">{result.passed ? "Quiz Passed! 🎉" : "Quiz Completed"}</h2>
            <p className="text-muted-foreground mb-4">{activeQuiz.title}</p>
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{result.percentage}%</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{result.score}/{result.totalPoints}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">+{result.pointsEarned}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>
            <Button onClick={() => { setActiveQuiz(null); setResult(null); }} className="w-full">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz (taking it)
  if (activeQuiz && activeQuiz.questions) {
    const answered = answers.length;
    const total = activeQuiz.questions.length;
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{activeQuiz.title}</CardTitle>
                <CardDescription>{activeQuiz.questions.length} questions • Pass: {activeQuiz.passScore}%</CardDescription>
              </div>
              <Badge variant={timeLeft < 30 ? "destructive" : "secondary"} className="font-mono">
                <Clock className="w-3 h-3 mr-1" /> {formatTime(timeLeft)}
              </Badge>
            </div>
            <Progress value={(answered / total) * 100} className="h-1.5 mt-2" />
          </CardHeader>
        </Card>

        {activeQuiz.questions.map((q: any, idx: number) => {
          const selected = answers.find((a) => a.questionId === q.id)?.selectedIndex;
          return (
            <Card key={q.id}>
              <CardContent className="p-4">
                <p className="font-medium mb-3">
                  <span className="text-primary mr-2">Q{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(q.id, i)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selected === i
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:bg-muted border-input"
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || answered < total}
        >
          {submitting ? "Submitting..." : answered < total ? `Answer ${total - answered} more` : "Submit Quiz"}
        </Button>
      </div>
    );
  }

  // Quiz list
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Quizzes & MCQs
          </CardTitle>
          <CardDescription>
            Test your knowledge and earn points. Each quiz can be taken only once.
          </CardDescription>
        </CardHeader>
      </Card>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No quizzes available yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new quizzes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {quizzes.map((q: any) => {
            const attempted = user ? hasAttemptedQuiz(user.id, q.id) : false;
            const attempt = user ? quizAttempts.find((a: any) => a.userId === user.id && a.quizId === q.id) : null;
            return (
              <Card key={q.id} className={attempted ? "opacity-75" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{q.title}</h3>
                      {q.category && <Badge variant="secondary" className="text-xs mt-1">{q.category}</Badge>}
                    </div>
                    {attempted ? (
                      <Badge variant={attempt?.passed ? "default" : "destructive"} className="capitalize">
                        {attempt?.passed ? "Passed" : "Failed"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">+{q.rewardPoints} pts</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{q.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> {q.questionCount || (q.questions?.length || 0)} Qs</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.timeLimitMin} min</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Pass: {q.passScore}%</span>
                  </div>
                  {attempted && attempt ? (
                    <div className="text-xs bg-muted/50 p-2 rounded">
                      <p>Your score: <span className="font-semibold">{Math.round((attempt.score / attempt.totalPoints) * 100)}%</span></p>
                      <p>Earned: <span className="font-semibold text-green-600">+{attempt.pointsEarned} pts</span></p>
                    </div>
                  ) : (
                    <Button className="w-full" size="sm" onClick={() => setActiveQuiz(q)}>
                      Start Quiz
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
