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
  OfficialLink,
  VideoWatch,
  GameResult,
} from "./types";

// Convert video URLs to embed URLs based on platform
export function buildEmbedUrl(url: string, platform: string, autoplay: boolean = false): string {
  try {
    const u = new URL(url);
    let base: string;
    switch (platform) {
      case "youtube": {
        const v = u.searchParams.get("v");
        if (v) base = `https://www.youtube.com/embed/${v}`;
        else {
          const parts = u.pathname.split("/").filter(Boolean);
          base = `https://www.youtube.com/embed/${parts[parts.length - 1] || ""}`;
        }
        return autoplay ? `${base}?autoplay=1&mute=0` : base;
      }
      case "vimeo": {
        const parts = u.pathname.split("/").filter(Boolean);
        base = `https://player.vimeo.com/video/${parts[parts.length - 1] || ""}`;
        return autoplay ? `${base}?autoplay=1` : base;
      }
      case "dailymotion": {
        const parts = u.pathname.split("/").filter(Boolean);
        const id = parts[parts.length - 1]?.replace(/_\w+$/, "");
        base = `https://www.dailymotion.com/embed/video/${id || ""}`;
        return autoplay ? `${base}?autoplay=1` : base;
      }
      case "tiktok":
        return url;
      case "facebook":
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false${autoplay ? "&autoplay=1" : ""}`;
      default:
        return url;
    }
  } catch {
    return url;
  }
}

export function genId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function genReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "ERN";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function genDeviceFingerprint(): string {
  if (typeof navigator === "undefined") return "server-side";
  const parts = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    `${new Date().getTimezoneOffset()}`,
    navigator.hardwareConcurrency?.toString() || "",
  ];
  let hash = 0;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}_${s.length.toString(36)}`;
}

export function getBrowserInfo(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  return `${browser} on ${os}`;
}

export function formatPoints(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function timeLeft(iso: string): { days: number; hours: number; minutes: number; seconds: number; total: number } {
  const total = new Date(iso).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

export const defaultSettings: AppSettings = {
  welcomeBonus: 150,
  referralReward: 90,
  pointsPerDollar: 1000,
  minWithdrawal: 1,
  maxWithdrawal: 500,
  withdrawalMethods: ["paypal", "binance", "paytm", "jazzcash", "easypaisa"],
  eventDefaultReward: 200,
  roomDefaultReward: 300,
  taskDefaultReward: 25,
  videoDefaultReward: 10,
  withdrawalProcessingHours: "24-72 Hours",
};

export function seedUsers(): User[] {
  const now = new Date();
  const iso = now.toISOString();
  return [
    {
      id: "u_admin",
      fullName: "Site Administrator",
      username: "admin",
      email: "admin@earncoin.com",
      password: "admin123",
      country: "United States",
      role: "admin",
      referralCode: "ERNADMIN",
      points: 0,
      dollarBalance: 0,
      emailVerified: true,
      deviceFingerprint: "fp_admin",
      browserInfo: "Chrome on macOS",
      ipAddress: "10.0.0.1",
      createdAt: iso,
      status: "active",
      avatarColor: "#16a34a",
      totalReferrals: 0,
      activeReferrals: 0,
      roomLevel: 5,
      roomXP: 0,
      diamonds: 0,
      coins: 0,
      hasFirstWithdrawal: true,
    },
    {
      id: "u_demo",
      fullName: "Demo User",
      username: "demouser",
      email: "demo@earncoin.com",
      password: "demo123",
      country: "Pakistan",
      role: "user",
      referralCode: "ERN934X",
      points: 4820,
      dollarBalance: 4.82,
      emailVerified: true,
      deviceFingerprint: "fp_demo",
      browserInfo: "Chrome on Windows",
      ipAddress: "182.191.92.10",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: iso,
      status: "active",
      avatarColor: "#ea580c",
      totalReferrals: 14,
      activeReferrals: 9,
      roomLevel: 3,
      roomXP: 2800,
      diamonds: 98,
      coins: 96, // 4820 pts / 50 = 96 coins
      hasFirstWithdrawal: true,
      isSuperStar: true,
      roomTasksCompleted: 15,
    },
    {
      id: "u_biz",
      fullName: "Acme Promotions",
      username: "acmebiz",
      email: "business@earncoin.com",
      password: "business123",
      country: "United Arab Emirates",
      role: "business",
      referralCode: "ERNACME",
      points: 0,
      dollarBalance: 0,
      emailVerified: true,
      deviceFingerprint: "fp_biz",
      browserInfo: "Safari on macOS",
      ipAddress: "94.200.10.22",
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      avatarColor: "#9333ea",
      totalReferrals: 0,
      activeReferrals: 0,
      roomLevel: 1,
      roomXP: 0,
      diamonds: 0,
      hasFirstWithdrawal: false,
    },
    // More sample users for leaderboard realism
    ...Array.from({ length: 12 }).map((_, i) => ({
      id: `u_seed_${i}`,
      fullName: `User ${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: "password",
      country: ["India", "Bangladesh", "Nigeria", "Philippines", "Kenya"][i % 5],
      role: "user" as const,
      referralCode: `ERN${1000 + i}`,
      points: 9800 - i * 650,
      dollarBalance: (9800 - i * 650) / 1000,
      emailVerified: true,
      deviceFingerprint: `fp_seed_${i}`,
      browserInfo: "Chrome on Android",
      ipAddress: `203.0.113.${i + 10}`,
      createdAt: new Date(now.getTime() - (i + 5) * 24 * 60 * 60 * 1000).toISOString(),
      status: "active" as const,
      avatarColor: ["#0891b2", "#dc2626", "#7c3aed", "#db2777", "#65a30d"][i % 5],
      totalReferrals: Math.floor(Math.random() * 30),
      activeReferrals: Math.floor(Math.random() * 20),
      roomLevel: Math.min(5, Math.floor(i / 3) + 1) as 1 | 2 | 3 | 4 | 5,
      roomXP: Math.floor(Math.random() * 8000),
      diamonds: Math.floor(Math.random() * 200),
      hasFirstWithdrawal: Math.random() > 0.5,
    })),
  ];
}

export function seedVideos(): Video[] {
  const raw: Array<Omit<Video, "embedUrl">> = [
    {
      id: "v_1",
      title: "Introducing EarnCoin Rewards Platform",
      description: "Watch the full walkthrough of how EarnCoin helps you earn points by completing simple online activities.",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      platform: "youtube",
      thumbnail: "",
      rewardPoints: 10,
      watchDurationSec: 10,
      category: "Platform",
      status: "active",
      totalViews: 1842,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      addedBy: "admin",
    },
    {
      id: "v_2",
      title: "How To Maximize Your Daily Earnings",
      description: "Tips and strategies to push your daily points higher using tasks, rooms and events.",
      url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      platform: "youtube",
      thumbnail: "",
      rewardPoints: 12,
      watchDurationSec: 10,
      category: "Tutorial",
      status: "active",
      totalViews: 932,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      addedBy: "admin",
    },
    {
      id: "v_3",
      title: "Referral System Explained",
      description: "Understand how inviting friends grows your passive income on EarnCoin.",
      url: "https://vimeo.com/76979871",
      platform: "vimeo",
      thumbnail: "",
      rewardPoints: 8,
      watchDurationSec: 10,
      category: "Tutorial",
      status: "active",
      totalViews: 540,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      addedBy: "admin",
    },
    {
      id: "v_4",
      title: "Acme Sneakers — New Collection Teaser",
      description: "Sponsored brand teaser from Acme. Watch full duration to claim reward.",
      url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
      platform: "youtube",
      thumbnail: "",
      rewardPoints: 15,
      watchDurationSec: 10,
      category: "Sponsored",
      status: "active",
      totalViews: 318,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      addedBy: "acmebiz",
    },
    {
      id: "v_5",
      title: "Festival Campaign Launch Recap",
      description: "Highlights from our festival campaign — earn bonus points this week.",
      url: "https://www.youtube.com/watch?v=L_jWHffIx5E",
      platform: "youtube",
      thumbnail: "",
      rewardPoints: 20,
      watchDurationSec: 10,
      category: "Event",
      status: "active",
      totalViews: 1220,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      addedBy: "admin",
    },
    {
      id: "v_6",
      title: "Vimeo Climate Awareness Short",
      description: "A short awareness documentary sponsored by a partner NGO.",
      url: "https://vimeo.com/76979871",
      platform: "vimeo",
      thumbnail: "",
      rewardPoints: 18,
      watchDurationSec: 10,
      category: "Awareness",
      status: "active",
      totalViews: 211,
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      addedBy: "admin",
    },
  ];
  return raw.map((v) => ({ ...v, embedUrl: buildEmbedUrl(v.url, v.platform) }));
}

export function seedTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: "t_1",
      title: "Subscribe to YouTube Channel",
      description: "Open the YouTube channel link, click Subscribe, and join to complete this task.",
      type: "social-follow",
      rewardPoints: 25,
      durationMin: 1,
      link: "https://www.youtube.com",
      availability: 2000,
      completed: 423,
      status: "active",
      createdAt: new Date(now - 4 * 86400000).toISOString(),
    },
    {
      id: "t_2",
      title: "Like & Watch YouTube Video",
      description: "Open the video, hit Like, and watch for 10+ seconds to complete the task.",
      type: "watch-video",
      rewardPoints: 20,
      durationMin: 1,
      link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      availability: 1500,
      completed: 590,
      status: "active",
      createdAt: new Date(now - 3 * 86400000).toISOString(),
    },
    {
      id: "t_3",
      title: "Join Official Telegram Channel",
      description: "Open link, join our official Telegram channel, and stay tuned for daily giveaways.",
      type: "join-telegram",
      rewardPoints: 30,
      durationMin: 1,
      link: "https://t.me",
      availability: 3000,
      completed: 1502,
      status: "active",
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: "t_4",
      title: "Visit Sponsor Website",
      description: "Visit our sponsor site, browse products, and stay for at least 15 seconds.",
      type: "visit-website",
      rewardPoints: 15,
      durationMin: 1,
      link: "https://example.com",
      availability: 800,
      completed: 198,
      status: "active",
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: "t_5",
      title: "Follow EarnCoin on X (Twitter)",
      description: "Follow our official X profile and like our pinned announcement post.",
      type: "social-follow",
      rewardPoints: 20,
      durationMin: 1,
      link: "https://x.com",
      availability: 2000,
      completed: 712,
      status: "active",
      createdAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      id: "t_6",
      title: "Join Discord Community",
      description: "Join the Discord server and say hello in the general chat room.",
      type: "join-discord",
      rewardPoints: 25,
      durationMin: 1,
      link: "https://discord.com",
      availability: 3000,
      completed: 980,
      status: "active",
      createdAt: new Date(now - 18 * 3600000).toISOString(),
    },
    {
      id: "t_7",
      title: "Read Earning Strategies Article",
      description: "Read our comprehensive guide on maximizing passive points on EarnCoin.",
      type: "read-article",
      rewardPoints: 15,
      durationMin: 2,
      link: "https://example.com",
      availability: 1500,
      completed: 333,
      status: "active",
      createdAt: new Date(now - 10 * 3600000).toISOString(),
    },
    {
      id: "t_8",
      title: "Complete Quick User Survey",
      description: "Answer a 30-second feedback survey to help improve the platform.",
      type: "complete-survey",
      rewardPoints: 35,
      durationMin: 2,
      link: "https://example.com",
      availability: 1000,
      completed: 145,
      status: "active",
      createdAt: new Date(now - 6 * 3600000).toISOString(),
    },
  ];
}

export function seedEvents(): EventItem[] {
  const now = Date.now();
  return [
    {
      id: "e_1",
      title: "Daily Speed Sprint",
      description: "Complete the most tasks today to win bonus points.",
      type: "daily",
      rewardPoints: 200,
      rules: [
        "Complete as many tasks as possible before midnight",
        "Only verified task completions count",
        "Top 3 split the reward pool",
      ],
      startTime: new Date(now - 2 * 3600000).toISOString(),
      endTime: new Date(now + 8 * 3600000).toISOString(),
      status: "live",
      participants: ["u_demo", "u_seed_0", "u_seed_1", "u_seed_2", "u_seed_3"],
      leaderboard: [
        { userId: "u_seed_0", username: "user1", score: 320 },
        { userId: "u_demo", username: "demouser", score: 280 },
        { userId: "u_seed_1", username: "user2", score: 220 },
      ],
      winners: [],
      createdAt: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: "e_2",
      title: "Weekly Referral Rumble",
      description: "Invite the most friends this week to win a 1000 point bonus.",
      type: "weekly",
      rewardPoints: 1000,
      rules: [
        "Referred friends must verify their email",
        "Self-referrals are void",
        "Winner announced on leaderboard page",
      ],
      startTime: new Date(now - 1 * 86400000).toISOString(),
      endTime: new Date(now + 6 * 86400000).toISOString(),
      status: "live",
      participants: ["u_demo", "u_seed_4", "u_seed_5", "u_seed_6"],
      leaderboard: [
        { userId: "u_demo", username: "demouser", score: 14 },
        { userId: "u_seed_4", username: "user5", score: 9 },
        { userId: "u_seed_5", username: "user6", score: 7 },
      ],
      winners: [],
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: "e_3",
      title: "Monthly Grand Tournament",
      description: "Top earner across the whole month wins 5000 bonus points.",
      type: "monthly",
      rewardPoints: 5000,
      rules: [
        "All earning activities count",
        "Cheating disqualifies the user",
        "Prize credited within 24 hours of close",
      ],
      startTime: new Date(now + 2 * 86400000).toISOString(),
      endTime: new Date(now + 32 * 86400000).toISOString(),
      status: "upcoming",
      participants: [],
      leaderboard: [],
      winners: [],
      createdAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      id: "e_4",
      title: "Eid Festival Mega Event",
      description: "Celebrate with us — bonus points on every activity.",
      type: "festival",
      rewardPoints: 1500,
      rules: [
        "Active for 7 days during festival",
        "Daily login bonus doubled",
        "Special tasks unlock extra rewards",
      ],
      startTime: new Date(now + 5 * 86400000).toISOString(),
      endTime: new Date(now + 12 * 86400000).toISOString(),
      status: "upcoming",
      participants: [],
      leaderboard: [],
      winners: [],
      createdAt: new Date(now - 12 * 3600000).toISOString(),
    },
    {
      id: "e_5",
      title: "Special Launch Carnival",
      description: "Completed carnival from our launch week.",
      type: "special",
      rewardPoints: 800,
      rules: ["Complete 10 tasks", "Refer at least 1 friend"],
      startTime: new Date(now - 14 * 86400000).toISOString(),
      endTime: new Date(now - 7 * 86400000).toISOString(),
      status: "completed",
      participants: ["u_seed_2", "u_seed_7"],
      leaderboard: [
        { userId: "u_seed_2", username: "user3", score: 540 },
        { userId: "u_seed_7", username: "user8", score: 410 },
      ],
      winners: [
        { userId: "u_seed_2", username: "user3", prize: 800 },
        { userId: "u_seed_7", username: "user8", prize: 400 },
      ],
      createdAt: new Date(now - 14 * 86400000).toISOString(),
    },
  ];
}

export function seedRooms(): Room[] {
  const now = Date.now();
  return [
    {
      id: "r_1",
      name: "Local Room",
      description: "Level 1 — The entry-level room. Open to everyone. Complete starter tasks and earn your first points. As you complete tasks you'll earn Room XP and unlock higher rooms.",
      level: 1,
      seats: 5,
      entryPoints: 0,
      entryCost: 0,
      rewardPoints: 100,
      participants: ["u_demo", "u_seed_0", "u_seed_1", "u_seed_8"],
      tasks: ["t_1", "t_3"],
      leaderboard: [
        { userId: "u_seed_0", username: "user1", score: 120 },
        { userId: "u_demo", username: "demouser", score: 90 },
        { userId: "u_seed_8", username: "user9", score: 60 },
      ],
      startTime: new Date(now - 1 * 86400000).toISOString(),
      endTime: new Date(now + 6 * 86400000).toISOString(),
      status: "open",
    },
    {
      id: "r_2",
      name: "Community Room",
      description: "Level 2 — For users who have earned at least 500 Room XP. More seats, bigger rewards.",
      level: 2,
      seats: 7,
      entryPoints: 500,
      entryCost: 50,
      rewardPoints: 250,
      participants: ["u_demo", "u_seed_2", "u_seed_3", "u_seed_9"],
      tasks: ["t_2", "t_5"],
      leaderboard: [
        { userId: "u_seed_2", username: "user3", score: 240 },
        { userId: "u_demo", username: "demouser", score: 180 },
      ],
      startTime: new Date(now - 2 * 86400000).toISOString(),
      endTime: new Date(now + 5 * 86400000).toISOString(),
      status: "open",
    },
    {
      id: "r_3",
      name: "Silver Room",
      description: "Level 3 — Premium tasks for experienced earners. Requires 2000 Room XP.",
      level: 3,
      seats: 10,
      entryPoints: 2000,
      entryCost: 150,
      rewardPoints: 500,
      participants: ["u_seed_4", "u_seed_5", "u_seed_10"],
      tasks: ["t_4", "t_6"],
      leaderboard: [
        { userId: "u_seed_4", username: "user5", score: 410 },
        { userId: "u_seed_5", username: "user6", score: 360 },
      ],
      startTime: new Date(now - 1 * 86400000).toISOString(),
      endTime: new Date(now + 3 * 86400000).toISOString(),
      status: "open",
    },
    {
      id: "r_4",
      name: "Gold Room",
      description: "Level 4 — High-stakes room for top performers. Requires 5000 Room XP.",
      level: 4,
      seats: 15,
      entryPoints: 5000,
      entryCost: 300,
      rewardPoints: 1000,
      participants: ["u_seed_6", "u_seed_7"],
      tasks: ["t_7", "t_8"],
      leaderboard: [{ userId: "u_seed_6", username: "user7", score: 820 }],
      startTime: new Date(now).toISOString(),
      endTime: new Date(now + 4 * 86400000).toISOString(),
      status: "open",
    },
    {
      id: "r_5",
      name: "VIP Room",
      description: "Level 5 — The elite room. Maximum seats and the highest rewards on EarnCoin. Requires 10000 Room XP.",
      level: 5,
      seats: 20,
      entryPoints: 10000,
      entryCost: 500,
      rewardPoints: 2000,
      participants: [],
      tasks: ["t_4", "t_5", "t_6"],
      leaderboard: [],
      startTime: new Date(now + 1 * 86400000).toISOString(),
      endTime: new Date(now + 8 * 86400000).toISOString(),
      status: "open",
    },
  ];
}

export function seedOfficialLinks(): OfficialLink[] {
  const now = Date.now();
  return [
    {
      id: "ol_1",
      label: "YouTube Channel Partnership",
      username: "official_yt",
      referralCode: "ERNOFF01",
      referralLink: `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=ERNOFF01`,
      createdAt: new Date(now - 10 * 86400000).toISOString(),
      registrations: 47,
      isActive: true,
    },
    {
      id: "ol_2",
      label: "Telegram Community Team",
      username: "official_tg",
      referralCode: "ERNOFF02",
      referralLink: `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=ERNOFF02`,
      createdAt: new Date(now - 5 * 86400000).toISOString(),
      registrations: 23,
      isActive: true,
    },
  ];
}

export function seedVideoWatches(): VideoWatch[] {
  // Demo user has watched v_1 already (to show the "already watched" state)
  return [
    {
      id: "vw_1",
      userId: "u_demo",
      videoId: "v_1",
      watchedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      rewardPoints: 10,
    },
  ];
}

export function seedGameResults(): GameResult[] {
  const now = Date.now();
  return [
    {
      id: "gr_1",
      userId: "u_demo",
      username: "demouser",
      gameName: "math",
      gameType: "coin",
      entryFee: 100,
      result: "win",
      pointsChange: 200,
      playedAt: new Date(now - 3 * 86400000).toISOString(),
    },
    {
      id: "gr_2",
      userId: "u_demo",
      username: "demouser",
      gameName: "tictactoe",
      gameType: "free",
      entryFee: 0,
      result: "win",
      pointsChange: 0,
      playedAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: "gr_3",
      userId: "u_demo",
      username: "demouser",
      gameName: "reaction",
      gameType: "coin",
      entryFee: 50,
      result: "loss",
      pointsChange: -50,
      playedAt: new Date(now - 1 * 86400000).toISOString(),
    },
  ];
}

export function seedWithdrawals(): Withdrawal[] {
  const now = Date.now();
  return [
    {
      id: "w_1",
      userId: "u_demo",
      username: "demouser",
      amountUSD: 2.5,
      pointsUsed: 2500,
      method: "paypal",
      accountDetails: "demo@paypal.com",
      status: "completed",
      requestedAt: new Date(now - 6 * 86400000).toISOString(),
      processedAt: new Date(now - 4 * 86400000).toISOString(),
      adminNote: "Processed via PayPal mass pay.",
    },
    {
      id: "w_2",
      userId: "u_demo",
      username: "demouser",
      amountUSD: 1.2,
      pointsUsed: 1200,
      method: "jazzcash",
      accountDetails: "+92 300 1234567",
      status: "pending",
      requestedAt: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: "w_3",
      userId: "u_seed_0",
      username: "user1",
      amountUSD: 5,
      pointsUsed: 5000,
      method: "binance",
      accountDetails: "binance-id-00123456",
      status: "under-review",
      requestedAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      id: "w_4",
      userId: "u_seed_2",
      username: "user3",
      amountUSD: 3,
      pointsUsed: 3000,
      method: "easypaisa",
      accountDetails: "+92 321 7654321",
      status: "approved",
      requestedAt: new Date(now - 2 * 86400000).toISOString(),
    },
  ];
}

export function seedCoinHistory(): CoinHistoryEntry[] {
  const now = Date.now();
  const entries: CoinHistoryEntry[] = [];
  let balance = 0;
  const activities: Array<{ activity: string; points: number; daysAgo: number; status: "completed" | "pending" }> = [
    { activity: "Welcome Bonus", points: 150, daysAgo: 30, status: "completed" },
    { activity: "Referral Reward (user4 joined)", points: 90, daysAgo: 28, status: "completed" },
    { activity: "Watched Video: Platform Intro", points: 10, daysAgo: 27, status: "completed" },
    { activity: "Completed Task: Visit Partner Website", points: 15, daysAgo: 25, status: "completed" },
    { activity: "Daily Login Bonus", points: 5, daysAgo: 5, status: "completed" },
    { activity: "Joined Silver Room (entry)", points: -50, daysAgo: 4, status: "completed" },
    { activity: "Won Silver Room reward", points: 250, daysAgo: 3, status: "completed" },
    { activity: "Referral Reward (user8 joined)", points: 90, daysAgo: 2, status: "completed" },
    { activity: "Daily Login Bonus", points: 5, daysAgo: 1, status: "completed" },
    { activity: "Watched Video: Festival Launch", points: 20, daysAgo: 0, status: "completed" },
    { activity: "Completed Task: Survey", points: 30, daysAgo: 0, status: "completed" },
    { activity: "Daily Login Bonus", points: 5, daysAgo: 0, status: "completed" },
    { activity: "Withdrawal to PayPal", points: -2500, daysAgo: 6, status: "completed" },
    { activity: "Withdrawal pending (JazzCash)", points: -1200, daysAgo: 0, status: "pending" },
  ];
  for (const a of activities) {
    balance += a.points;
    entries.push({
      id: `ch_${a.daysAgo}_${a.activity.slice(0, 4)}`,
      userId: "u_demo",
      date: new Date(now - a.daysAgo * 86400000).toISOString(),
      activity: a.activity,
      pointsEarned: a.points > 0 ? a.points : 0,
      pointsDeducted: a.points < 0 ? Math.abs(a.points) : 0,
      balanceAfter: balance,
      status: a.status,
    });
  }
  return entries.reverse();
}

export function seedNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "n_1",
      userId: "u_demo",
      title: "Welcome to EarnCoin!",
      message: "Your account is verified. 150 welcome bonus points credited.",
      type: "announcement",
      read: false,
      createdAt: new Date(now - 30 * 86400000).toISOString(),
    },
    {
      id: "n_2",
      userId: "u_demo",
      title: "Withdrawal Completed",
      message: "Your PayPal withdrawal of $2.50 has been completed.",
      type: "withdrawal",
      read: true,
      createdAt: new Date(now - 4 * 86400000).toISOString(),
    },
    {
      id: "n_3",
      userId: "u_demo",
      title: "New Video Available",
      message: "Festival Campaign Launch Recap is now ready to watch (+20 pts).",
      type: "video",
      read: false,
      createdAt: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: "n_4",
      userId: "u_demo",
      title: "Referral Reward",
      message: "user8 joined using your code. +90 points!",
      type: "referral",
      read: false,
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: "n_5",
      userId: "u_demo",
      title: "Event Started",
      message: "Daily Speed Sprint event is now live. Join now to win bonus points!",
      type: "event",
      read: false,
      createdAt: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: "n_6",
      userId: "u_demo",
      title: "Withdrawal Under Review",
      message: "Your JazzCash withdrawal of $1.20 is under review.",
      type: "withdrawal",
      read: false,
      createdAt: new Date(now - 6 * 3600000).toISOString(),
    },
  ];
}

export function seedCampaigns(): BusinessCampaign[] {
  const now = Date.now();
  return [
    {
      id: "c_1",
      businessId: "u_biz",
      businessName: "Acme Promotions",
      type: "product",
      title: "Acme Sneakers Summer Launch",
      description: "Promote our new sneaker collection across EarnCoin.",
      budget: 500,
      spent: 180,
      views: 4230,
      clicks: 540,
      status: "live",
      startDate: new Date(now - 5 * 86400000).toISOString(),
      endDate: new Date(now + 10 * 86400000).toISOString(),
    },
    {
      id: "c_2",
      businessId: "u_biz",
      businessName: "Acme Promotions",
      type: "social",
      title: "Follow Acme on Instagram",
      description: "Boost our Instagram followers via EarnCoin social task.",
      budget: 200,
      spent: 60,
      views: 1820,
      clicks: 280,
      status: "live",
      startDate: new Date(now - 3 * 86400000).toISOString(),
      endDate: new Date(now + 5 * 86400000).toISOString(),
    },
    {
      id: "c_3",
      businessId: "u_biz",
      businessName: "Acme Promotions",
      type: "website",
      title: "Acme Store Visit Campaign",
      description: "Drive traffic to the Acme store homepage.",
      budget: 300,
      spent: 300,
      views: 9800,
      clicks: 1200,
      status: "completed",
      startDate: new Date(now - 20 * 86400000).toISOString(),
      endDate: new Date(now - 2 * 86400000).toISOString(),
    },
  ];
}
