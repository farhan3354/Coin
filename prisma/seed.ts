import { PrismaClient } from "@prisma/client";
import { buildEmbedUrl } from "../src/lib/mockData";

const db = new PrismaClient();

function genReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "ERN";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.emailLog.deleteMany();
  await db.gameResult.deleteMany();
  await db.videoWatch.deleteMany();
  await db.notification.deleteMany();
  await db.coinHistory.deleteMany();
  await db.withdrawal.deleteMany();
  await db.roomParticipant.deleteMany();
  await db.eventParticipant.deleteMany();
  await db.businessCampaign.deleteMany();
  await db.officialLink.deleteMany();
  await db.room.deleteMany();
  await db.event.deleteMany();
  await db.task.deleteMany();
  await db.video.deleteMany();
  await db.user.deleteMany();
  await db.settings.deleteMany();

  // Settings
  await db.settings.create({
    data: {
      id: "singleton",
      welcomeBonus: 150,
      referralReward: 90,
      pointsPerDollar: 1000,
      minWithdrawal: 1,
      maxWithdrawal: 500,
      withdrawalMethods: "paypal,binance,paytm,jazzcash,easypaisa",
      eventDefaultReward: 200,
      roomDefaultReward: 300,
      taskDefaultReward: 25,
      videoDefaultReward: 10,
      withdrawalProcessingHours: "24-72 Hours",
    },
  });

  // Users
  const admin = await db.user.create({
    data: {
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
      status: "active",
      avatarColor: "#FF8C00",
      roomLevel: 5,
      roomXP: 0,
    },
  });

  const demo = await db.user.create({
    data: {
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
      status: "active",
      avatarColor: "#ea580c",
      totalReferrals: 14,
      activeReferrals: 9,
      roomLevel: 3,
      roomXP: 2800,
    },
  });

  const biz = await db.user.create({
    data: {
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
      status: "active",
      avatarColor: "#9333ea",
      roomLevel: 1,
      roomXP: 0,
    },
  });

  // Seed users for leaderboard
  const seedUsers: any[] = [];
  for (let i = 0; i < 12; i++) {
    const u = await db.user.create({
      data: {
        fullName: `User ${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: "password",
        country: ["India", "Bangladesh", "Nigeria", "Philippines", "Kenya"][i % 5],
        role: "user",
        referralCode: `ERN${1000 + i}`,
        points: 9800 - i * 650,
        dollarBalance: (9800 - i * 650) / 1000,
        emailVerified: true,
        deviceFingerprint: `fp_seed_${i}`,
        browserInfo: "Chrome on Android",
        ipAddress: `203.0.113.${i + 10}`,
        status: "active",
        avatarColor: ["#0891b2", "#dc2626", "#7c3aed", "#db2777", "#65a30d"][i % 5],
        totalReferrals: Math.floor(Math.random() * 30),
        activeReferrals: Math.floor(Math.random() * 20),
        roomLevel: Math.min(5, Math.floor(i / 3) + 1),
        roomXP: Math.floor(Math.random() * 8000),
      },
    });
    seedUsers.push(u);
  }

  // Videos
  const videoData = [
    { title: "Introducing EarnCoin Rewards Platform", description: "Watch the full walkthrough of how EarnCoin helps you earn points by completing simple online activities.", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", platform: "youtube", rewardPoints: 10, watchDurationSec: 30, category: "Platform" },
    { title: "How To Maximize Your Daily Earnings", description: "Tips and strategies to push your daily points higher using tasks, rooms and events.", url: "https://www.youtube.com/watch?v=ScMzIvxBSi4", platform: "youtube", rewardPoints: 12, watchDurationSec: 45, category: "Tutorial" },
    { title: "Referral System Explained", description: "Understand how inviting friends grows your passive income on EarnCoin.", url: "https://vimeo.com/76979871", platform: "vimeo", rewardPoints: 8, watchDurationSec: 20, category: "Tutorial" },
    { title: "Acme Sneakers — New Collection Teaser", description: "Sponsored brand teaser from Acme. Watch full duration to claim reward.", url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ", platform: "youtube", rewardPoints: 15, watchDurationSec: 60, category: "Sponsored" },
    { title: "Festival Campaign Launch Recap", description: "Highlights from our festival campaign — earn bonus points this week.", url: "https://www.youtube.com/watch?v=L_jWHffIx5E", platform: "youtube", rewardPoints: 20, watchDurationSec: 40, category: "Event" },
    { title: "Vimeo Climate Awareness Short", description: "A short awareness documentary sponsored by a partner NGO.", url: "https://vimeo.com/76979871", platform: "vimeo", rewardPoints: 18, watchDurationSec: 50, category: "Awareness" },
  ];
  for (const v of videoData) {
    await db.video.create({
      data: { ...v, embedUrl: buildEmbedUrl(v.url, v.platform, false), totalViews: Math.floor(Math.random() * 2000), addedBy: v.category === "Sponsored" ? "acmebiz" : "admin" },
    });
  }

  // Tasks
  const taskData = [
    { title: "Watch Promo Video", description: "Watch the latest promo video for 30 seconds to earn points.", type: "watch-video", rewardPoints: 10, durationMin: 1, availability: 1000, completed: 423 },
    { title: "Visit Partner Website", description: "Visit our partner site and stay for at least 60 seconds.", type: "visit-website", rewardPoints: 15, durationMin: 2, link: "https://example.com", availability: 500, completed: 198 },
    { title: "Read EarnCoin Article", description: "Read our latest blog article to claim your reading reward.", type: "read-article", rewardPoints: 12, durationMin: 3, availability: 2000, completed: 876 },
    { title: "Complete Lifestyle Survey", description: "Answer 5 short questions in our lifestyle survey.", type: "complete-survey", rewardPoints: 30, durationMin: 4, availability: 800, completed: 145 },
    { title: "Follow EarnCoin on X", description: "Follow our official X account and engage with the latest post.", type: "social-follow", rewardPoints: 20, durationMin: 1, link: "https://x.com", availability: 2000, completed: 712 },
    { title: "Share Campaign Post", description: "Share our latest campaign post on any social platform.", type: "share-content", rewardPoints: 25, durationMin: 1, availability: 1500, completed: 333 },
    { title: "Join Telegram Channel", description: "Join our official Telegram channel for announcements and rewards.", type: "join-telegram", rewardPoints: 18, durationMin: 1, link: "https://telegram.org", availability: 3000, completed: 1502 },
    { title: "Join Discord Community", description: "Join our Discord community to unlock extra tasks.", type: "join-discord", rewardPoints: 18, durationMin: 1, link: "https://discord.com", availability: 3000, completed: 980 },
  ];
  for (const t of taskData) {
    await db.task.create({ data: t });
  }

  // Events
  const now = Date.now();
  await db.event.create({
    data: {
      title: "Daily Speed Sprint", description: "Complete the most tasks today to win bonus points.", type: "daily",
      rewardPoints: 200, rules: JSON.stringify(["Complete as many tasks as possible before midnight", "Only verified task completions count", "Top 3 split the reward pool"]),
      startTime: new Date(now - 2 * 3600000), endTime: new Date(now + 8 * 3600000), status: "live",
    },
  });
  await db.event.create({
    data: {
      title: "Weekly Referral Rumble", description: "Invite the most friends this week to win a 1000 point bonus.", type: "weekly",
      rewardPoints: 1000, rules: JSON.stringify(["Referred friends must verify their email", "Self-referrals are void", "Winner announced on leaderboard page"]),
      startTime: new Date(now - 86400000), endTime: new Date(now + 6 * 86400000), status: "live",
    },
  });
  await db.event.create({
    data: {
      title: "Monthly Grand Tournament", description: "Top earner across the whole month wins 5000 bonus points.", type: "monthly",
      rewardPoints: 5000, rules: JSON.stringify(["All earning activities count", "Cheating disqualifies the user", "Prize credited within 24 hours of close"]),
      startTime: new Date(now + 2 * 86400000), endTime: new Date(now + 32 * 86400000), status: "upcoming",
    },
  });

  // Rooms
  const roomData = [
    { name: "Local Room", description: "Level 1 — The entry-level room. Open to everyone.", level: 1, seats: 5, entryPoints: 0, entryCost: 0, rewardPoints: 100, startTime: new Date(now - 86400000), endTime: new Date(now + 6 * 86400000), status: "open" },
    { name: "Community Room", description: "Level 2 — For users who have earned at least 500 Room XP.", level: 2, seats: 7, entryPoints: 500, entryCost: 50, rewardPoints: 250, startTime: new Date(now - 2 * 86400000), endTime: new Date(now + 5 * 86400000), status: "open" },
    { name: "Silver Room", description: "Level 3 — Premium tasks for experienced earners.", level: 3, seats: 10, entryPoints: 2000, entryCost: 150, rewardPoints: 500, startTime: new Date(now - 86400000), endTime: new Date(now + 3 * 86400000), status: "open" },
    { name: "Gold Room", description: "Level 4 — High-stakes room for top performers.", level: 4, seats: 15, entryPoints: 5000, entryCost: 300, rewardPoints: 1000, startTime: new Date(now), endTime: new Date(now + 4 * 86400000), status: "open" },
    { name: "VIP Room", description: "Level 5 — The elite room with the highest rewards.", level: 5, seats: 20, entryPoints: 10000, entryCost: 500, rewardPoints: 2000, startTime: new Date(now + 86400000), endTime: new Date(now + 8 * 86400000), status: "open" },
  ];
  for (const r of roomData) {
    await db.room.create({ data: r });
  }

  // Withdrawals
  await db.withdrawal.create({ data: { userId: demo.id, username: "demouser", amountUSD: 2.5, pointsUsed: 2500, method: "paypal", accountDetails: "demo@paypal.com", status: "completed", requestedAt: new Date(now - 6 * 86400000), processedAt: new Date(now - 4 * 86400000), adminNote: "Processed via PayPal mass pay." } });
  await db.withdrawal.create({ data: { userId: demo.id, username: "demouser", amountUSD: 1.2, pointsUsed: 1200, method: "jazzcash", accountDetails: "+92 300 1234567", status: "pending", requestedAt: new Date(now - 6 * 3600000) } });
  await db.withdrawal.create({ data: { userId: seedUsers[0].id, username: "user1", amountUSD: 5, pointsUsed: 5000, method: "binance", accountDetails: "binance-id-00123456", status: "under-review", requestedAt: new Date(now - 86400000) } });

  // Coin History for demo user
  const activities = [
    { activity: "Welcome Bonus", points: 150, daysAgo: 30 },
    { activity: "Referral Reward (user4 joined)", points: 90, daysAgo: 28 },
    { activity: "Watched Video: Platform Intro", points: 10, daysAgo: 27 },
    { activity: "Completed Task: Visit Partner Website", points: 15, daysAgo: 25 },
    { activity: "Daily Login Bonus", points: 5, daysAgo: 5 },
    { activity: "Joined Silver Room (entry)", points: -50, daysAgo: 4 },
    { activity: "Won Silver Room reward", points: 250, daysAgo: 3 },
    { activity: "Watched Video: Festival Launch", points: 20, daysAgo: 0 },
    { activity: "Completed Task: Survey", points: 30, daysAgo: 0 },
  ];
  let balance = 0;
  for (const a of activities) {
    balance += a.points;
    await db.coinHistory.create({
      data: { userId: demo.id, activity: a.activity, pointsEarned: a.points > 0 ? a.points : 0, pointsDeducted: a.points < 0 ? Math.abs(a.points) : 0, balanceAfter: balance, date: new Date(now - a.daysAgo * 86400000) },
    });
  }

  // Notifications for demo user
  const notifData = [
    { title: "Welcome to EarnCoin!", message: "Your account is verified. 150 welcome bonus points credited.", type: "announcement", daysAgo: 30 },
    { title: "Withdrawal Completed", message: "Your PayPal withdrawal of $2.50 has been completed.", type: "withdrawal", daysAgo: 4 },
    { title: "New Video Available", message: "Festival Campaign Launch Recap is now ready to watch (+20 pts).", type: "video", daysAgo: 0 },
    { title: "Referral Reward", message: "user8 joined using your code. +90 points!", type: "referral", daysAgo: 2 },
    { title: "Event Started", message: "Daily Speed Sprint event is now live. Join now to win bonus points!", type: "event", daysAgo: 0 },
  ];
  for (const n of notifData) {
    await db.notification.create({ data: { userId: demo.id, title: n.title, message: n.message, type: n.type, read: n.daysAgo === 4, createdAt: new Date(now - n.daysAgo * 86400000) } });
  }

  // Video watch (demo watched first video)
  const firstVideo = await db.video.findFirst();
  if (firstVideo) {
    await db.videoWatch.create({ data: { userId: demo.id, videoId: firstVideo.id, rewardPoints: 10, watchedAt: new Date(now - 2 * 86400000) } });
  }

  // Game results for demo
  await db.gameResult.create({ data: { userId: demo.id, username: "demouser", gameName: "math", gameType: "coin", entryFee: 100, result: "win", pointsChange: 200, playedAt: new Date(now - 3 * 86400000) } });
  await db.gameResult.create({ data: { userId: demo.id, username: "demouser", gameName: "tictactoe", gameType: "free", entryFee: 0, result: "win", pointsChange: 0, playedAt: new Date(now - 2 * 86400000) } });
  await db.gameResult.create({ data: { userId: demo.id, username: "demouser", gameName: "reaction", gameType: "coin", entryFee: 50, result: "loss", pointsChange: -50, playedAt: new Date(now - 86400000) } });

  // Official links
  await db.officialLink.create({ data: { label: "YouTube Channel Partnership", username: "official_yt", referralCode: "ERNOFF01", referralLink: "https://earncoin.com/?ref=ERNOFF01", registrations: 47 } });
  await db.officialLink.create({ data: { label: "Telegram Community Team", username: "official_tg", referralCode: "ERNOFF02", referralLink: "https://earncoin.com/?ref=ERNOFF02", registrations: 23 } });

  // Business campaigns
  await db.businessCampaign.create({ data: { businessId: biz.id, businessName: "Acme Promotions", type: "product", title: "Acme Sneakers Summer Launch", description: "Promote our new sneaker collection across EarnCoin.", budget: 500, spent: 180, views: 4230, clicks: 540, status: "live", startDate: new Date(now - 5 * 86400000), endDate: new Date(now + 10 * 86400000) } });
  await db.businessCampaign.create({ data: { businessId: biz.id, businessName: "Acme Promotions", type: "social", title: "Follow Acme on Instagram", description: "Boost our Instagram followers via EarnCoin social task.", budget: 200, spent: 60, views: 1820, clicks: 280, status: "live", startDate: new Date(now - 3 * 86400000), endDate: new Date(now + 5 * 86400000) } });
  await db.businessCampaign.create({ data: { businessId: biz.id, businessName: "Acme Promotions", type: "website", title: "Acme Store Visit Campaign", description: "Drive traffic to the Acme store homepage.", budget: 300, spent: 300, views: 9800, clicks: 1200, status: "completed", startDate: new Date(now - 20 * 86400000), endDate: new Date(now - 2 * 86400000) } });

  console.log("Database seeded successfully!");
  console.log(`  Users: ${await db.user.count()}`);
  console.log(`  Videos: ${await db.video.count()}`);
  console.log(`  Tasks: ${await db.task.count()}`);
  console.log(`  Events: ${await db.event.count()}`);
  console.log(`  Rooms: ${await db.room.count()}`);
  console.log(`  Withdrawals: ${await db.withdrawal.count()}`);
  console.log(`  Coin History: ${await db.coinHistory.count()}`);
  console.log(`  Notifications: ${await db.notification.count()}`);
  console.log(`  Official Links: ${await db.officialLink.count()}`);
  console.log(`  Campaigns: ${await db.businessCampaign.count()}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
