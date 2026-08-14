"use client";

import { useStore } from "./store";
import type {
  User, Video, Task, EventItem, Room, Withdrawal,
  CoinHistoryEntry, Notification, AppSettings,
  BusinessCampaign, OfficialLink, VideoWatch, GameResult,
} from "./types";
import { defaultSettings, buildEmbedUrl } from "./mockData";

// Fetch all data from the database via API and load into the store
export async function syncFromDatabase(): Promise<void> {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();

    const quizRes = await fetch("/api/quizzes", { cache: "no-store" }).catch(() => null);
    const quizzes = quizRes && quizRes.ok ? await quizRes.json() : [];

    // Transform DB records to app types
    const users: User[] = (data.users || []).map((u: any) => ({
      id: u.id, fullName: u.fullName, username: u.username, email: u.email,
      password: u.password, country: u.country, role: u.role,
      referralCode: u.referralCode, referredBy: u.referredBy || undefined,
      points: u.points, coins: u.coins || 0, diamonds: u.diamonds || 0,
      dollarBalance: u.dollarBalance, hasFirstWithdrawal: u.hasFirstWithdrawal || false,
      emailVerified: u.emailVerified,
      deviceFingerprint: u.deviceFingerprint, browserInfo: u.browserInfo,
      ipAddress: u.ipAddress, createdAt: u.createdAt, lastLogin: u.lastLogin || undefined,
      status: u.status, avatarColor: u.avatarColor,
      totalReferrals: u.totalReferrals, activeReferrals: u.activeReferrals,
      roomLevel: u.roomLevel, roomXP: u.roomXP,
      isSuperStar: u.isSuperStar || false,
      roomTasksCompleted: u.roomTasksCompleted || 0,
      isOfficialLink: u.isOfficialLink || false,
      officialLinkLabel: u.officialLinkLabel || undefined,
      notificationPreferences: {
        emailOnWithdrawal: u.notifPrefWithdrawal,
        emailOnReferral: u.notifPrefReferral,
        emailOnEvent: u.notifPrefEvent,
        emailOnAnnouncement: u.notifPrefAnnouncement,
        emailOnNewsletter: u.notifPrefNewsletter,
        browserNotifications: u.browserNotifications,
      },
      emailSubscribed: u.emailSubscribed,
    }));

    const videos: Video[] = (data.videos || []).map((v: any) => ({
      id: v.id, title: v.title, description: v.description, url: v.url,
      platform: v.platform, embedUrl: v.embedUrl || buildEmbedUrl(v.url, v.platform, false),
      thumbnail: v.thumbnail || "", rewardPoints: v.rewardPoints,
      watchDurationSec: v.watchDurationSec, category: v.category,
      status: v.status, totalViews: v.totalViews, createdAt: v.createdAt, addedBy: v.addedBy,
    }));

    const tasks: Task[] = (data.tasks || []).map((t: any) => ({
      id: t.id, title: t.title, description: t.description, type: t.type,
      rewardPoints: t.rewardPoints, durationMin: t.durationMin,
      link: t.link || undefined, availability: t.availability,
      completed: t.completed, status: t.status, createdAt: t.createdAt,
    }));

    const events: EventItem[] = (data.events || []).map((e: any) => ({
      id: e.id, title: e.title, description: e.description, type: e.type,
      rewardPoints: e.rewardPoints, rules: JSON.parse(e.rules || "[]"),
      startTime: e.startTime, endTime: e.endTime, status: e.status,
      participants: (e.participants || []).map((p: any) => p.userId),
      leaderboard: [], winners: [], createdAt: e.createdAt,
    }));

    const rooms: Room[] = (data.rooms || []).map((r: any) => ({
      id: r.id, name: r.name, description: r.description, level: r.level,
      seats: r.seats, entryPoints: r.entryPoints, entryCost: r.entryCost,
      rewardPoints: r.rewardPoints,
      participants: (r.participants || []).map((p: any) => p.userId),
      tasks: [], leaderboard: [], startTime: r.startTime, endTime: r.endTime,
      status: r.status,
    }));

    const withdrawals: Withdrawal[] = (data.withdrawals || []).map((w: any) => ({
      id: w.id, userId: w.userId, username: w.username, amountUSD: w.amountUSD,
      pointsUsed: w.pointsUsed, method: w.method, accountDetails: w.accountDetails,
      status: w.status, requestedAt: w.requestedAt, processedAt: w.processedAt || undefined,
      adminNote: w.adminNote || undefined,
    }));

    const coinHistory: CoinHistoryEntry[] = (data.coinHistory || []).map((c: any) => ({
      id: c.id, userId: c.userId, date: c.date, activity: c.activity,
      pointsEarned: c.pointsEarned, pointsDeducted: c.pointsDeducted,
      balanceAfter: c.balanceAfter, status: c.status,
    }));

    const notifications: Notification[] = (data.notifications || []).map((n: any) => ({
      id: n.id, userId: n.userId, title: n.title, message: n.message,
      type: n.type, read: n.read, createdAt: n.createdAt,
    }));

    const campaigns: BusinessCampaign[] = (data.campaigns || []).map((c: any) => ({
      id: c.id, businessId: c.businessId, businessName: c.businessName,
      type: c.type, title: c.title, description: c.description,
      budget: c.budget, spent: c.spent, views: c.views, clicks: c.clicks,
      status: c.status, startDate: c.startDate, endDate: c.endDate || undefined,
    }));

    const officialLinks: OfficialLink[] = (data.officialLinks || []).map((l: any) => ({
      id: l.id, label: l.label, username: l.username, referralCode: l.referralCode,
      referralLink: l.referralLink, createdAt: l.createdAt,
      registrations: l.registrations, isActive: l.isActive,
    }));

    const videoWatches: VideoWatch[] = (data.videoWatches || []).map((w: any) => ({
      id: w.id, userId: w.userId, videoId: w.videoId,
      watchedAt: w.watchedAt, rewardPoints: w.rewardPoints,
    }));

    const gameResults: GameResult[] = (data.gameResults || []).map((g: any) => ({
      id: g.id, userId: g.userId, username: g.username, gameName: g.gameName,
      gameType: g.gameType, entryFee: g.entryFee, result: g.result,
      pointsChange: g.pointsChange, playedAt: g.playedAt,
    }));

    const s = data.settings;
    const settings: AppSettings = s ? {
      welcomeBonus: s.welcomeBonus, referralReward: s.referralReward,
      pointsPerDollar: s.pointsPerDollar, minWithdrawal: s.minWithdrawal,
      maxWithdrawal: s.maxWithdrawal,
      withdrawalMethods: (s.withdrawalMethods || "paypal,binance,paytm,jazzcash,easypaisa").split(",") as any,
      eventDefaultReward: s.eventDefaultReward, roomDefaultReward: s.roomDefaultReward,
      taskDefaultReward: s.taskDefaultReward, videoDefaultReward: s.videoDefaultReward,
      withdrawalProcessingHours: s.withdrawalProcessingHours,
    } : defaultSettings;

    // Load into store
    useStore.setState({
      users, videos, tasks, events, rooms, withdrawals, coinHistory,
      notifications, campaigns, officialLinks, videoWatches, gameResults,
      quizzes: Array.isArray(quizzes) ? quizzes : [],
      settings, emailLogs: (data.emailLogs || []).map((e: any) => ({
        id: e.id, to: e.to, toName: e.toName, subject: e.subject,
        body: e.body, type: e.type, sentAt: e.sentAt, status: e.status,
      })),
      dbLoaded: true,
    });
  } catch (e) {
    console.error("Failed to sync from database:", e);
  }
}

// API helper for POST/PUT requests
export async function apiCall(url: string, body: any): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
