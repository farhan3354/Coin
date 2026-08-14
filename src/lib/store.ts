"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  User,
  Video,
  Task,
  EventItem,
  Room,
  Withdrawal,
  CoinHistoryEntry,
  Notification,
  AppSettings,
  BusinessCampaign,
  ViewKey,
  OfficialLink,
  VideoWatch,
  GameResult,
  GameName,
  GameType,
} from "./types";
import {
  defaultSettings,
  seedUsers,
  seedVideos,
  seedTasks,
  seedEvents,
  seedRooms,
  seedWithdrawals,
  seedCoinHistory,
  seedNotifications,
  seedCampaigns,
  seedOfficialLinks,
  seedVideoWatches,
  seedGameResults,
  genId,
  genReferralCode,
  genDeviceFingerprint,
  getBrowserInfo,
  buildEmbedUrl,
} from "./mockData";

interface EarnState {
  // data
  users: User[];
  videos: Video[];
  tasks: Task[];
  events: EventItem[];
  rooms: Room[];
  withdrawals: Withdrawal[];
  coinHistory: CoinHistoryEntry[];
  notifications: Notification[];
  campaigns: BusinessCampaign[];
  settings: AppSettings;
  officialLinks: OfficialLink[];
  videoWatches: VideoWatch[];
  gameResults: GameResult[];
  emailLogs: any[];
  quizzes: any[];
  dbLoaded: boolean;

  // session
  currentUserId: string | null;
  currentView: ViewKey;
  authModal: "login" | "register" | "forgot" | "otp" | null;
  pendingEmail: string | null;

  // actions
  setView: (v: ViewKey) => void;
  openAuth: (m: "login" | "register" | "forgot" | "otp") => void;
  closeAuth: () => void;
  register: (input: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    country: string;
    referralCode?: string;
  }) => { ok: boolean; message: string };
  verifyOtp: (code: string) => { ok: boolean; message: string };
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  forgotPassword: (email: string) => { ok: boolean; message: string };

  addPoints: (userId: string, points: number, activity: string) => void;
  requestWithdrawal: (input: {
    method: Withdrawal["method"];
    amountUSD: number;
    accountDetails: string;
  }) => { ok: boolean; message: string };
  updateWithdrawalStatus: (id: string, status: Withdrawal["status"], note?: string) => void;
  joinEvent: (eventId: string) => void;
  joinRoom: (roomId: string) => { ok: boolean; message: string };
  completeTask: (taskId: string) => { ok: boolean; message: string };
  watchVideo: (videoId: string) => { ok: boolean; message: string };
  hasWatchedVideo: (userId: string, videoId: string) => boolean;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;

  // admin
  updateSettings: (s: Partial<AppSettings>) => void;
  addVideo: (v: Omit<Video, "id" | "createdAt" | "totalViews" | "embedUrl">) => void;
  deleteVideo: (id: string) => void;
  addTask: (t: Omit<Task, "id" | "createdAt" | "completed">) => void;
  deleteTask: (id: string) => void;
  addEvent: (e: Omit<EventItem, "id" | "createdAt" | "participants" | "leaderboard" | "winners">) => void;
  deleteEvent: (id: string) => void;
  addRoom: (r: Omit<Room, "id" | "participants" | "leaderboard">) => void;
  deleteRoom: (id: string) => void;
  toggleUserStatus: (userId: string) => void;

  // quizzes
  addQuiz: (q: any) => void;
  deleteQuiz: (id: string) => void;
  submitQuiz: (quizId: string, answers: number[]) => { ok: boolean; message: string };

  // Official links — admin generates referral links for partners/teams
  createOfficialLink: (label: string, username: string) => { ok: boolean; message: string; link?: OfficialLink };
  deleteOfficialLink: (id: string) => void;

  // Gaming system
  playGame: (gameName: GameName, gameType: GameType, entryFee: number, result: "win" | "loss" | "draw") => { ok: boolean; message: string };

  // Email + notification preferences
  sendEmail: (toUserId: string, type: string, templateData: { [key: string]: string | number }) => void;
  sendBroadcastEmail: (subject: string, message: string) => void;
  clearEmailLogs: () => void;
  updateNotificationPreferences: (userId: string, prefs: any) => void;
  toggleEmailSubscription: (userId: string) => void;

  // Gifting system
  sendGift: (roomId: string, fromUserId: string, toUserId: string, giftId: string) => { ok: boolean; message: string };
  convertPointsToCoins: (userId: string) => { ok: boolean; message: string };
  checkSuperStarStatus: (userId: string) => boolean;

  resetData: () => void;
}

export const useStore = create<EarnState>()(
  persist(
    (set, get) => ({
      users: [],
      videos: [],
      tasks: [],
      events: [],
      rooms: [],
      withdrawals: [],
      coinHistory: [],
      notifications: [],
      campaigns: [],
      settings: defaultSettings,
      officialLinks: [],
      videoWatches: [],
      gameResults: [],
      emailLogs: [],
          quizzes: [],
      dbLoaded: false,

      currentUserId: null,
      currentView: "home",
      authModal: null,
      pendingEmail: null,

      setView: (v) => {
        set({ currentView: v });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },

      openAuth: (m) => set({ authModal: m }),
      closeAuth: () => set({ authModal: null, pendingEmail: null }),

      register: ({ fullName, username, email, password, country, referralCode }) => {
        const state = get();
        const exists = state.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
        );
        if (exists) return { ok: false, message: "Email or username already in use" };

        // Device fingerprint — one device = one account
        const fp = genDeviceFingerprint();
        const dupDevice = state.users.find((u) => u.deviceFingerprint === fp);
        if (dupDevice) {
          return {
            ok: false,
            message: "This device already has an account. One device can only create one account.",
          };
        }

        const newUser: User = {
          id: genId("u"),
          fullName,
          username,
          email,
          password,
          country,
          role: "user",
          referralCode: genReferralCode(),
          referredBy: referralCode || undefined,
          points: 0,
          coins: 0,
          diamonds: 0,
          dollarBalance: 0,
          hasFirstWithdrawal: false,
          emailVerified: false,
          deviceFingerprint: fp,
          browserInfo: getBrowserInfo(),
          ipAddress: "0.0.0.0",
          createdAt: new Date().toISOString(),
          status: "active",
          avatarColor: ["#16a34a", "#ea580c", "#9333ea", "#0891b2", "#dc2626"][Math.floor(Math.random() * 5)],
          totalReferrals: 0,
          activeReferrals: 0,
          roomLevel: 1,
          roomXP: 0,
          isSuperStar: false,
          roomTasksCompleted: 0,
        };
        set({ users: [...state.users, newUser], pendingEmail: email, authModal: "otp" });
        // Sync new user to database
        fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName, username, email, password, country,
            role: "user", referralCode: newUser.referralCode,
            referredBy: referralCode || null,
            deviceFingerprint: fp,
            browserInfo: newUser.browserInfo,
            ipAddress: newUser.ipAddress,
          }),
        }).catch(() => {});
        return { ok: true, message: "Account created. Enter the OTP sent to your email." };
      },

      verifyOtp: (code) => {
        const state = get();
        const email = state.pendingEmail;
        if (!email) return { ok: false, message: "No pending registration" };
        // demo: accept any 6-digit code
        if (!/^\d{6}$/.test(code)) return { ok: false, message: "OTP must be 6 digits" };

        const user = state.users.find((u) => u.email === email);
        if (!user) return { ok: false, message: "User not found" };

        const bonus = state.settings.welcomeBonus;
        const updatedUsers = state.users.map((u) =>
          u.id === user.id ? { ...u, emailVerified: true, points: u.points + bonus } : u
        );

        // credit inviter
        let finalUsers = updatedUsers;
        const inviterCode = user.referredBy;
        if (inviterCode) {
          const inviter = updatedUsers.find((u) => u.referralCode === inviterCode);
          if (inviter) {
            const reward = state.settings.referralReward;
            finalUsers = updatedUsers.map((u) =>
              u.id === inviter.id
                ? { ...u, points: u.points + reward, totalReferrals: u.totalReferrals + 1, activeReferrals: u.activeReferrals + 1 }
                : u
            );
            // history for inviter
            set({
              coinHistory: [
                {
                  id: genId("ch"),
                  userId: inviter.id,
                  date: new Date().toISOString(),
                  activity: `Referral Reward (${user.username} verified)`,
                  pointsEarned: reward,
                  pointsDeducted: 0,
                  balanceAfter: inviter.points + reward,
                  status: "completed",
                },
                ...state.coinHistory,
              ],
              notifications: [
                {
                  id: genId("n"),
                  userId: inviter.id,
                  title: "Referral Reward",
                  message: `${user.username} joined using your code. +${reward} points!`,
                  type: "referral",
                  read: false,
                  createdAt: new Date().toISOString(),
                },
                ...state.notifications,
              ],
            });
          }
        }

        // welcome bonus history
        set({
          users: finalUsers,
          coinHistory: [
            {
              id: genId("ch"),
              userId: user.id,
              date: new Date().toISOString(),
              activity: "Welcome Bonus",
              pointsEarned: bonus,
              pointsDeducted: 0,
              balanceAfter: bonus,
              status: "completed",
            },
            ...get().coinHistory,
          ],
          notifications: [
            {
              id: genId("n"),
              userId: user.id,
              title: "Welcome to EarnCoin!",
              message: `Your account is verified. ${bonus} welcome bonus points credited.`,
              type: "announcement",
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...get().notifications,
          ],
          currentUserId: user.id,
          authModal: null,
          pendingEmail: null,
          currentView: "dashboard",
        });
        // Sync verification to database
        fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }).catch(() => {});
        return { ok: true, message: "Verified! Welcome to EarnCoin." };
      },

      login: (email, password) => {
        const state = get();
        const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { ok: false, message: "No account found with this email" };
        if (user.password !== password) return { ok: false, message: "Incorrect password" };
        if (user.status !== "active") return { ok: false, message: "Account suspended. Contact support." };
        const updatedUsers = state.users.map((u) =>
          u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
        );
        set({ users: updatedUsers, currentUserId: user.id, authModal: null });
        if (user.role === "admin") set({ currentView: "admin" });
        else if (user.role === "business") set({ currentView: "business" });
        else set({ currentView: "dashboard" });
        return { ok: true, message: "Login successful" };
      },

      logout: () => set({ currentUserId: null, currentView: "home" }),

      forgotPassword: (email) => {
        const state = get();
        const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { ok: false, message: "No account found with this email" };
        set({ authModal: "otp", pendingEmail: email });
        return { ok: true, message: "Reset OTP sent to your email" };
      },

      addPoints: (userId, points, activity) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user) return;
        const newBalance = user.points + points;
        set({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, points: newBalance, dollarBalance: newBalance / state.settings.pointsPerDollar } : u
          ),
          coinHistory: [
            {
              id: genId("ch"),
              userId,
              date: new Date().toISOString(),
              activity,
              pointsEarned: points > 0 ? points : 0,
              pointsDeducted: points < 0 ? Math.abs(points) : 0,
              balanceAfter: newBalance,
              status: "completed",
            },
            ...state.coinHistory,
          ],
        });
      },

      requestWithdrawal: ({ method, amountUSD, accountDetails }) => {
        const state = get();
        const user = state.users.find((u) => u.id === state.currentUserId);
        if (!user) return { ok: false, message: "Not logged in" };
        if (amountUSD < state.settings.minWithdrawal)
          return { ok: false, message: `Minimum withdrawal is $${state.settings.minWithdrawal}` };
        if (amountUSD > state.settings.maxWithdrawal)
          return { ok: false, message: `Maximum withdrawal is $${state.settings.maxWithdrawal}` };
        const pointsNeeded = Math.ceil(amountUSD * state.settings.pointsPerDollar);
        if (user.points < pointsNeeded) return { ok: false, message: "Not enough points" };

        const w: Withdrawal = {
          id: genId("w"),
          userId: user.id,
          username: user.username,
          amountUSD,
          pointsUsed: pointsNeeded,
          method,
          accountDetails,
          status: "pending",
          requestedAt: new Date().toISOString(),
        };
        // deduct points immediately (held)
        set({
          withdrawals: [w, ...state.withdrawals],
          users: state.users.map((u) => (u.id === user.id ? { ...u, points: u.points - pointsNeeded } : u)),
          coinHistory: [
            {
              id: genId("ch"),
              userId: user.id,
              date: new Date().toISOString(),
              activity: `Withdrawal request (${method})`,
              pointsEarned: 0,
              pointsDeducted: pointsNeeded,
              balanceAfter: user.points - pointsNeeded,
              status: "pending",
            },
            ...state.coinHistory,
          ],
          notifications: [
            {
              id: genId("n"),
              userId: user.id,
              title: "Withdrawal Requested",
              message: `Your ${method} withdrawal of $${amountUSD.toFixed(2)} is pending review.`,
              type: "withdrawal",
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        });
        // Sync to database
        fetch("/api/withdrawals/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, method, amountUSD, accountDetails }) }).catch(() => {});
        return { ok: true, message: "Withdrawal requested" };
      },

      updateWithdrawalStatus: (id, status, note) => {
        const state = get();
        const w = state.withdrawals.find((x) => x.id === id);
        if (!w) return;
        // If rejected, refund points
        let users = state.users;
        let extraHistory: CoinHistoryEntry[] = [];
        let extraNotifs: Notification[] = [];
        if (status === "rejected" || status === "cancelled") {
          users = state.users.map((u) =>
            u.id === w.userId ? { ...u, points: u.points + w.pointsUsed } : u
          );
          extraHistory = [
            {
              id: genId("ch"),
              userId: w.userId,
              date: new Date().toISOString(),
              activity: `Withdrawal refunded (${w.method})`,
              pointsEarned: w.pointsUsed,
              pointsDeducted: 0,
              balanceAfter: (users.find((u) => u.id === w.userId)?.points ?? 0),
              status: "completed",
            },
          ];
        }
        extraNotifs = [
          {
            id: genId("n"),
            userId: w.userId,
            title: `Withdrawal ${status.replace("-", " ")}`,
            message: `Your ${w.method} withdrawal of $${w.amountUSD.toFixed(2)} is now ${status.replace("-", " ")}.${note ? " Note: " + note : ""}`,
            type: "withdrawal",
            read: false,
            createdAt: new Date().toISOString(),
          },
        ];
        set({
          withdrawals: state.withdrawals.map((x) =>
            x.id === id ? { ...x, status, processedAt: new Date().toISOString(), adminNote: note } : x
          ),
          users,
          coinHistory: [...extraHistory, ...state.coinHistory],
          notifications: [...extraNotifs, ...state.notifications],
        });
        // Sync to database
        fetch("/api/withdrawals/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, note }) }).catch(() => {});
      },

      joinEvent: (eventId) => {
        const state = get();
        const user = state.users.find((u) => u.id === state.currentUserId);
        if (!user) return;
        set({
          events: state.events.map((e) =>
            e.id === eventId && !e.participants.includes(user.id)
              ? { ...e, participants: [...e.participants, user.id] }
              : e
          ),
          notifications: [
            {
              id: genId("n"),
              userId: user.id,
              title: "Event Joined",
              message: `You joined the event. Complete tasks to climb the leaderboard!`,
              type: "event",
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        });
      },

      joinRoom: (roomId) => {
        const state = get();
        const user = state.users.find((u) => u.id === state.currentUserId);
        if (!user) return { ok: false, message: "Not logged in" };
        const room = state.rooms.find((r) => r.id === roomId);
        if (!room) return { ok: false, message: "Room not found" };
        if (room.participants.includes(user.id)) return { ok: true, message: "Already joined" };
        // Check room level requirement — user must have roomLevel >= room.level
        if (user.roomLevel < room.level)
          return { ok: false, message: `You need Room Level ${room.level} to enter. Complete more tasks to level up.` };
        // Check XP requirement
        if (user.roomXP < room.entryPoints)
          return { ok: false, message: `You need ${room.entryPoints} Room XP to enter this room.` };
        if (room.participants.length >= room.seats) return { ok: false, message: "Room is full — all seats taken" };
        const costDeduct = room.entryCost;
        if (user.points < costDeduct) return { ok: false, message: "Not enough points for entry cost" };

        const newBalance = user.points - costDeduct;
        set({
          rooms: state.rooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  participants: [...r.participants, user.id],
                  leaderboard: [...r.leaderboard, { userId: user.id, username: user.username, score: 0 }],
                }
              : r
          ),
          users: state.users.map((u) => (u.id === user.id ? { ...u, points: newBalance } : u)),
          coinHistory: costDeduct
            ? [
                {
                  id: genId("ch"),
                  userId: user.id,
                  date: new Date().toISOString(),
                  activity: `Joined ${room.name} (entry)`,
                  pointsEarned: 0,
                  pointsDeducted: costDeduct,
                  balanceAfter: newBalance,
                  status: "completed",
                },
                ...state.coinHistory,
              ]
            : state.coinHistory,
          notifications: [
            {
              id: genId("n"),
              userId: user.id,
              title: "Room Joined",
              message: `You joined ${room.name} (Level ${room.level}). Complete room tasks to climb the leaderboard!`,
              type: "room",
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        });
        // Sync to database
        fetch("/api/rooms/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, roomId }) }).catch(() => {});
        return { ok: true, message: `Joined ${room.name}` };
      },

      completeTask: (taskId) => {
        const state = get();
        const user = state.users.find((u) => u.id === state.currentUserId);
        if (!user) return { ok: false, message: "Not logged in" };
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return { ok: false, message: "Task not found" };
        if (task.completed >= task.availability) return { ok: false, message: "Task no longer available" };

        const newBalance = user.points + task.rewardPoints;
        // Award room XP for leveling up
        const xpGained = Math.floor(task.rewardPoints * 0.5);
        const newXP = user.roomXP + xpGained;
        // Check for level up: thresholds are 0, 500, 2000, 5000, 10000
        const xpThresholds = [0, 500, 2000, 5000, 10000];
        let newLevel = user.roomLevel;
        let leveledUp = false;
        for (let lvl = 5; lvl >= 1; lvl--) {
          if (newXP >= xpThresholds[lvl - 1]) {
            if (user.roomLevel < lvl) {
              leveledUp = true;
              newLevel = lvl;
            }
            break;
          }
        }

        const updatedUser = { ...user, points: newBalance, roomXP: newXP, roomLevel: newLevel as 1 | 2 | 3 | 4 | 5 };
        set({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: t.completed + 1 } : t
          ),
          users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
          coinHistory: [
            {
              id: genId("ch"),
              userId: user.id,
              date: new Date().toISOString(),
              activity: `Completed Task: ${task.title}`,
              pointsEarned: task.rewardPoints,
              pointsDeducted: 0,
              balanceAfter: newBalance,
              status: "completed",
            },
            ...state.coinHistory,
          ],
          notifications: leveledUp
            ? [
                {
                  id: genId("n"),
                  userId: user.id,
                  title: "Room Level Up!",
                  message: `Congratulations! You reached Room Level ${newLevel}. New rooms are now unlocked.`,
                  type: "room",
                  read: false,
                  createdAt: new Date().toISOString(),
                },
                ...state.notifications,
              ]
            : state.notifications,
        });
        // Sync to database — send auth cookie and update local store from server response
        fetch("/api/tasks/complete", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId }) })
          .then((r) => r.json())
          .then((data) => {
            if (data && data.ok && data.user) {
              set((s) => ({ users: s.users.map((u) => (u.id === data.user.id ? data.user : u)), tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, completed: (t.completed || 0) + 1 } : t)) }));
            }
          })
          .catch(() => {});
        return { ok: true, message: leveledUp ? `+${task.rewardPoints} points! Room Level Up to ${newLevel}!` : `+${task.rewardPoints} points earned!` };
      },

      watchVideo: (videoId) => {
        const state = get();
        const user = state.users.find((u) => u.id === state.currentUserId);
        if (!user) return { ok: false, message: "Not logged in" };
        const video = state.videos.find((v) => v.id === videoId);
        if (!video) return { ok: false, message: "Video not found" };

        // Prevent double-claiming — one reward per video per user
        const alreadyWatched = state.videoWatches.find(
          (w) => w.userId === user.id && w.videoId === videoId
        );
        if (alreadyWatched) return { ok: false, message: "You have already watched this video and claimed the reward." };

        const newBalance = user.points + video.rewardPoints;
        set({
          videos: state.videos.map((v) => (v.id === videoId ? { ...v, totalViews: v.totalViews + 1 } : v)),
          users: state.users.map((u) => (u.id === user.id ? { ...u, points: newBalance, dollarBalance: newBalance / state.settings.pointsPerDollar } : u)),
          videoWatches: [
            { id: genId("vw"), userId: user.id, videoId, watchedAt: new Date().toISOString(), rewardPoints: video.rewardPoints },
            ...state.videoWatches,
          ],
          coinHistory: [
            { id: genId("ch"), userId: user.id, date: new Date().toISOString(), activity: `Watched Video: ${video.title}`, pointsEarned: video.rewardPoints, pointsDeducted: 0, balanceAfter: newBalance, status: "completed" },
            ...state.coinHistory,
          ],
        });
        // Sync to database — send auth cookie and update local store from server response
        fetch("/api/videos/watch", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId }) })
          .then((r) => r.json())
          .then((data) => {
            if (data && data.ok && data.user) {
              set((s) => ({ users: s.users.map((u) => (u.id === data.user.id ? data.user : u)) }));
            }
          })
          .catch(() => {});
        return { ok: true, message: `+${video.rewardPoints} points earned!` };
      },

      hasWatchedVideo: (userId, videoId) => {
        return get().videoWatches.some((w) => w.userId === userId && w.videoId === videoId);
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.userId === s.currentUserId ? { ...n, read: true } : n
          ),
        })),
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: genId("n"), read: false, createdAt: new Date().toISOString() },
            ...s.notifications,
          ],
        })),

      updateSettings: (partial) => {
        set((s) => ({ settings: { ...s.settings, ...partial } }));
        // Sync to database
        const s = get().settings;
        fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          welcomeBonus: s.welcomeBonus, referralReward: s.referralReward, pointsPerDollar: s.pointsPerDollar,
          minWithdrawal: s.minWithdrawal, maxWithdrawal: s.maxWithdrawal,
          withdrawalMethods: s.withdrawalMethods.join(","),
          eventDefaultReward: s.eventDefaultReward, roomDefaultReward: s.roomDefaultReward,
          taskDefaultReward: s.taskDefaultReward, videoDefaultReward: s.videoDefaultReward,
          withdrawalProcessingHours: s.withdrawalProcessingHours,
        }) }).catch(() => {});
      },

      addVideo: (v) => {
        const tempId = genId("v");
        const tempVideo = {
          ...v,
          id: tempId,
          embedUrl: buildEmbedUrl(v.url, v.platform, false),
          totalViews: 0,
          createdAt: new Date().toISOString(),
        } as any;
        set((s) => ({ videos: [tempVideo, ...s.videos] }));

        // Background sync to server — replace temp entry with server record on success
        fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...v, embedUrl: tempVideo.embedUrl }),
        })
          .then((r) => r.json())
          .then((created) => {
            set((s) => ({ videos: s.videos.map((vid) => (vid.id === tempId ? created : vid)) }));
          })
          .catch(() => {
            // keep temp entry if server unreachable
          });
      },
      deleteVideo: (id) => {
        set((s) => ({ videos: s.videos.filter((v) => v.id !== id) }));
        fetch(`/api/videos?id=${id}`, { method: "DELETE" }).catch(() => {});
      },

      addTask: (t) => {
        const tempId = genId("t");
        const tempTask = {
          ...t,
          id: tempId,
          completed: 0,
          hidden: !!t.hidden,
          startTime: t.startTime || undefined,
          endTime: t.endTime || undefined,
          createdAt: new Date().toISOString(),
        } as any;
        set((s) => ({ tasks: [tempTask, ...s.tasks] }));

        // Background sync to server — replace temp entry with server record on success
        fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        })
          .then((r) => r.json())
          .then((created) => {
            set((s) => ({ tasks: s.tasks.map((task) => (task.id === tempId ? created : task)) }));
          })
          .catch(() => {
            // keep temp entry if server unreachable
          });
      },
      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        fetch(`/api/tasks?id=${id}`, { method: "DELETE" }).catch(() => {});
      },

      addEvent: (e) =>
        set((s) => ({
          events: [
            {
              ...e,
              id: genId("e"),
              hidden: !!e.hidden,
              participants: [],
              leaderboard: [],
              winners: [],
              createdAt: new Date().toISOString(),
            },
            ...s.events,
          ],
        })),
      deleteEvent: (id) => {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
        fetch(`/api/events?id=${id}`, { method: "DELETE" }).catch(() => {});
      },

      addRoom: (r) =>
        set((s) => ({
          rooms: [
            { ...r, id: genId("r"), hidden: !!r.hidden, participants: [], leaderboard: [] },
            ...s.rooms,
          ],
        })),
      deleteRoom: (id) => {
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) }));
        fetch(`/api/rooms?id=${id}`, { method: "DELETE" }).catch(() => {});
      },

      toggleUserStatus: (userId) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
          ),
        })),

      // Official Links — admin creates referral links for partners/team leads
      createOfficialLink: (label, username) => {
        const state = get();
        const exists = state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
        if (exists) return { ok: false, message: "Username already taken" };

        const referralCode = genReferralCode();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const link: OfficialLink = {
          id: genId("ol"),
          label,
          username,
          referralCode,
          referralLink: `${origin}/?ref=${referralCode}`,
          createdAt: new Date().toISOString(),
          registrations: 0,
          isActive: true,
        };
        // Also create a placeholder "official" user account so the referral code is tracked
        const officialUser: User = {
          id: genId("u"),
          fullName: label,
          username,
          email: `${username}@official.earncoin.com`,
          password: genReferralCode(), // random password — not used for login
          country: "Official",
          role: "user",
          referralCode,
          referredBy: undefined, // NO referrer — this is an official root link
          coins: 0,
          diamonds: 0,
          hasFirstWithdrawal: false,
          points: 0,
          dollarBalance: 0,
          emailVerified: true,
          deviceFingerprint: `fp_official_${Date.now()}`,
          browserInfo: "Official Account",
          ipAddress: "0.0.0.0",
          createdAt: new Date().toISOString(),
          status: "active",
          avatarColor: "#0891b2",
          totalReferrals: 0,
          activeReferrals: 0,
          roomLevel: 1,
          roomXP: 0,
          isOfficialLink: true,
          officialLinkLabel: label,
        };
        set({
          officialLinks: [link, ...state.officialLinks],
          users: [...state.users, officialUser],
        });
        return { ok: true, message: "Official link created", link };
      },

      deleteOfficialLink: (id) => {
        set((s) => ({ officialLinks: s.officialLinks.filter((l) => l.id !== id) }));
        fetch(`/api/official-links?id=${id}`, { method: "DELETE" }).catch(() => {});
      },

      // Gaming system — handles entry fee deduction and reward crediting
      playGame: (gameName, gameType, entryFee, result) => {
        const state = get();
        const user = state.users.find((u) => u.id === state.currentUserId);
        if (!user) return { ok: false, message: "Not logged in" };

        // For coin games, deduct entry fee first
        if (gameType === "coin") {
          if (user.points < entryFee) return { ok: false, message: "Not enough coins to enter" };
        }

        let pointsChange = 0;
        if (gameType === "coin") {
          if (result === "win") pointsChange = entryFee; // win = double (get back entry + entry)
          else if (result === "loss") pointsChange = -entryFee; // lose entry fee
          // draw = 0 change (entry returned)
        }

        const newBalance = user.points + pointsChange;
        const gameResult: GameResult = {
          id: genId("gr"),
          userId: user.id,
          username: user.username,
          gameName,
          gameType,
          entryFee,
          result,
          pointsChange,
          playedAt: new Date().toISOString(),
        };

        const newHistory = pointsChange !== 0 ? [
          {
            id: genId("ch"),
            userId: user.id,
            date: new Date().toISOString(),
            activity: `Game: ${gameName} (${result})`,
            pointsEarned: pointsChange > 0 ? pointsChange : 0,
            pointsDeducted: pointsChange < 0 ? Math.abs(pointsChange) : 0,
            balanceAfter: newBalance,
            status: "completed" as const,
          },
          ...state.coinHistory,
        ] : state.coinHistory;

        set({
          users: state.users.map((u) => (u.id === user.id ? { ...u, points: newBalance } : u)),
          gameResults: [gameResult, ...state.gameResults],
          coinHistory: newHistory,
        });

        // Sync to database
        fetch("/api/games/play", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, gameName, gameType, entryFee, result }) }).catch(() => {});
        if (result === "win" && gameType === "coin") {
          return { ok: true, message: `You won! +${pointsChange} coins credited!` };
        } else if (result === "loss" && gameType === "coin") {
          return { ok: true, message: `You lost. -${entryFee} coins.` };
        } else if (result === "draw") {
          return { ok: true, message: "It's a draw! Entry fee returned." };
        } else {
          return { ok: true, message: "Game completed!" };
        }
      },
        // Quizzes
        addQuiz: (q) => {
          const tempId = genId("q");
          const tempQuiz = { ...q, id: tempId, createdAt: new Date().toISOString() } as any;
          set((s) => ({ quizzes: [tempQuiz, ...s.quizzes] }));
          fetch("/api/quizzes", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) })
            .then((r) => r.json())
            .then((created) => {
              if (created && created.id) set((s) => ({ quizzes: s.quizzes.map((qq) => (qq.id === tempId ? created : qq)) }));
            })
            .catch(() => {});
        },
        deleteQuiz: (id) => {
          set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) }));
          fetch(`/api/quizzes?id=${id}`, { method: "DELETE" }).catch(() => {});
        },
        submitQuiz: (quizId, answers) => {
          const state = get();
          const user = state.users.find((u) => u.id === state.currentUserId);
          if (!user) return { ok: false, message: "Not logged in" };
          // optimistic local attempt: post to server and apply response
          fetch("/api/quizzes/submit", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId, answers }) })
            .then((r) => r.json())
            .then((data) => {
              if (data && data.ok) {
                if (data.user) {
                  set((s) => ({ users: s.users.map((u) => (u.id === data.user.id ? data.user : u)) }));
                } else if (data.awarded) {
                  // fallback: award locally
                  set((s) => ({ users: s.users.map((u) => (u.id === user.id ? { ...u, points: u.points + data.awarded, dollarBalance: (u.points + data.awarded) / s.settings.pointsPerDollar } : u)) }));
                }
              }
            })
            .catch(() => {});
          return { ok: true, message: "Submitted. Processing..." };
        },

      // Email system
      sendEmail: (toUserId, type, templateData) => {
        const state = get();
        const user = state.users.find((u) => u.id === toUserId);
        if (!user) return;
        if (user.emailSubscribed === false) return;
        const log = {
          id: genId("email"),
          to: user.email, toName: user.fullName,
          subject: templateData.subject ? String(templateData.subject) : type,
          body: templateData.message ? String(templateData.message) : "",
          type, sentAt: new Date().toISOString(), status: "sent",
        };
        set({ emailLogs: [log, ...state.emailLogs].slice(0, 200) });
      },

      sendBroadcastEmail: (subject, message) => {
        const state = get();
        const subscribers = state.users.filter((u) => u.emailSubscribed !== false);
        const logs = subscribers.map((u) => ({
          id: genId("email"),
          to: u.email, toName: u.fullName, subject, body: message,
          type: "announcement", sentAt: new Date().toISOString(), status: "sent",
        }));
        set({ emailLogs: [...logs, ...state.emailLogs].slice(0, 200) });
        // Also sync to DB
        fetch("/api/emails/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message }) }).catch(() => {});
      },

      clearEmailLogs: () => set({ emailLogs: [] }),

      updateNotificationPreferences: (userId, prefs) => {
        const state = get();
        set({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, notificationPreferences: { ...(u.notificationPreferences || {}), ...prefs } }
              : u
          ),
        });
        fetch("/api/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, prefs }) }).catch(() => {});
      },

      toggleEmailSubscription: (userId) => {
        const state = get();
        set({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, emailSubscribed: !u.emailSubscribed } : u
          ),
        });
      },

      // Gifting system — sender sends coins, receiver gets coins, sender gets diamonds+coins
      sendGift: (roomId, fromUserId, toUserId, giftId) => {
        const state = get();
        const GIFTS: Record<string, { coins: number; diamonds: number; icon: string; name: string }> = {
          rose: { coins: 1, diamonds: 1, icon: "🌹", name: "Rose" },
          icecream: { coins: 5, diamonds: 2, icon: "🍦", name: "Ice Cream" },
          ring: { coins: 10, diamonds: 3, icon: "💍", name: "Ring" },
          car: { coins: 50, diamonds: 5, icon: "🚗", name: "Car" },
          plane: { coins: 100, diamonds: 10, icon: "✈️", name: "Plane" },
          castle: { coins: 500, diamonds: 50, icon: "🏰", name: "Castle" },
        };
        const gift = GIFTS[giftId];
        if (!gift) return { ok: false, message: "Invalid gift" };

        const sender = state.users.find((u) => u.id === fromUserId);
        const receiver = state.users.find((u) => u.id === toUserId);
        if (!sender || !receiver) return { ok: false, message: "User not found" };
        if ((sender.coins || 0) < gift.coins) return { ok: false, message: "Not enough coins" };

        // Sender: deduct coins, receive diamonds + 2 coins back
        const senderNewCoins = (sender.coins || 0) - gift.coins + 2;
        const senderNewDiamonds = (sender.diamonds || 0) + gift.diamonds;
        // Receiver: gets 8 coins (if Super Star, also gets diamonds)
        const receiverNewCoins = (receiver.coins || 0) + 8;
        const receiverIsSuperStar = receiver.isSuperStar || false;
        const receiverNewDiamonds = receiverIsSuperStar ? (receiver.diamonds || 0) + Math.floor(gift.diamonds * 0.5) : (receiver.diamonds || 0);

        set({
          users: state.users.map((u) => {
            if (u.id === fromUserId) return { ...u, coins: senderNewCoins, diamonds: senderNewDiamonds };
            if (u.id === toUserId) return { ...u, coins: receiverNewCoins, diamonds: receiverNewDiamonds };
            return u;
          }),
          coinHistory: [
            { id: genId("ch"), userId: fromUserId, date: new Date().toISOString(), activity: `Sent ${gift.name} gift to ${receiver.username}`, pointsEarned: 2, pointsDeducted: gift.coins, balanceAfter: sender.points, status: "completed" },
            { id: genId("ch"), userId: toUserId, date: new Date().toISOString(), activity: `Received ${gift.name} gift from ${sender.username}`, pointsEarned: 8, pointsDeducted: 0, balanceAfter: receiver.points, status: "completed" },
            ...state.coinHistory,
          ],
        });

        return { ok: true, message: receiverIsSuperStar ? `Gift sent! +${gift.diamonds} diamonds, +2 coins. Receiver got 8 coins + diamonds!` : `Gift sent! +${gift.diamonds} diamonds, +2 coins. Receiver got 8 coins.` };
      },

      // Convert points to coins (50 points = 1 coin)
      convertPointsToCoins: (userId) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user) return { ok: false, message: "User not found" };
        const POINTS_PER_COIN = 50;
        const coinsToConvert = Math.floor(user.points / POINTS_PER_COIN);
        if (coinsToConvert < 1) return { ok: false, message: `Need at least ${POINTS_PER_COIN} points to convert` };
        const pointsUsed = coinsToConvert * POINTS_PER_COIN;
        const newPoints = user.points - pointsUsed;
        const newCoins = (user.coins || 0) + coinsToConvert;
        set({
          users: state.users.map((u) => u.id === userId ? { ...u, points: newPoints, coins: newCoins } : u),
          coinHistory: [{ id: genId("ch"), userId, date: new Date().toISOString(), activity: `Converted ${pointsUsed} points → ${coinsToConvert} coins`, pointsEarned: 0, pointsDeducted: pointsUsed, balanceAfter: newPoints, status: "completed" }, ...state.coinHistory],
        });
        return { ok: true, message: `Converted ${pointsUsed} points to ${coinsToConvert} coins!` };
      },

      // Check if user qualifies as Super Star (completed 10+ room tasks)
      checkSuperStarStatus: (userId) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user) return false;
        const qualifies = (user.roomTasksCompleted || 0) >= 10;
        if (qualifies && !user.isSuperStar) {
          set({ users: state.users.map((u) => u.id === userId ? { ...u, isSuperStar: true } : u) });
        }
        return qualifies;
      },

      resetData: () => {
        set({ currentUserId: null, currentView: "home", authModal: null, pendingEmail: null });
        import("./dbSync").then(({ syncFromDatabase }) => syncFromDatabase());
      },
    }),
    {
      name: "earncoin-session-v3",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      // Persist currentUserId and the minimal current user object so UI stays logged-in
      partialize: (s) => ({
        currentUserId: s.currentUserId,
        users: s.currentUserId ? s.users.filter((u) => u.id === s.currentUserId) : [],
      }),
    }
  )
);

// Selectors
export const useCurrentUser = () => {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) || null);
};
