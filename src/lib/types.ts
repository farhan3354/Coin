// Core type definitions for EarnCoin platform

export type Role = "user" | "admin" | "business";

export type ViewKey =
  | "home"
  | "about"
  | "features"
  | "how-it-works"
  | "advertise"
  | "contact"
  | "faq"
  | "terms"
  | "privacy"
  | "login"
  | "register"
  | "dashboard"
  | "videos"
  | "tasks"
  | "events"
  | "rooms"
  | "games"
  | "referrals"
  | "withdrawals"
  | "coin-history"
  | "leaderboard"
  | "notifications"
  | "profile"
  | "admin"
  | "business"
  | "buy-coins"
  | "theme";

export interface User {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  phone?: string;
  password: string; // demo only — hashed in real apps
  country: string;
  role: Role;
  referralCode: string;
  referredBy?: string; // referral code of inviter
  points: number;
  coins: number; // earned from points (50 pts = 1 coin), used for gifting
  diamonds: number; // earned from gifting/super star, used for withdrawal
  dollarBalance: number;
  hasFirstWithdrawal: boolean; // first withdrawal is free
  emailVerified: boolean;
  deviceFingerprint: string;
  browserInfo: string;
  ipAddress: string;
  createdAt: string;
  lastLogin?: string;
  status: "active" | "suspended" | "banned";
  avatarColor: string;
  totalReferrals: number;
  activeReferrals: number;
  roomLevel: number; // 1-5, determines which rooms user can enter
  roomXP: number; // experience points for leveling up rooms
  isOfficialLink?: boolean; // true if this account was created as an official referral link by admin
  officialLinkLabel?: string; // optional label for official link accounts
  isSuperStar?: boolean; // completed room tasks, eligible for diamond earning
  roomTasksCompleted?: number; // count of completed room tasks for super star tracking
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string; // source URL
  platform: VideoPlatform;
  embedUrl: string;
  thumbnail: string;
  rewardPoints: number;
  watchDurationSec: number;
  category: string;
  status: "active" | "inactive";
  totalViews: number;
  createdAt: string;
  addedBy: string;
}

export type VideoPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "x"
  | "linkedin"
  | "pinterest"
  | "snapchat"
  | "vimeo"
  | "dailymotion";

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  rewardPoints: number;
  durationMin: number;
  link?: string;
  availability: number; // how many can complete
  completed: number;
  status: "active" | "inactive";
  createdAt: string;
}

export type TaskType =
  | "watch-video"
  | "visit-website"
  | "read-article"
  | "complete-survey"
  | "social-follow"
  | "share-content"
  | "join-telegram"
  | "join-discord";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special" | "festival";
  rewardPoints: number;
  rules: string[];
  startTime: string;
  endTime: string;
  status: "upcoming" | "live" | "completed" | "expired";
  participants: string[]; // user ids
  leaderboard: { userId: string; username: string; score: number }[];
  winners: { userId: string; username: string; prize: number }[];
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  level: 1 | 2 | 3 | 4 | 5; // room level — capacity depends on level
  seats: number; // total seats for this room level (5/7/10/15/20)
  entryPoints: number; // minimum points to join
  entryCost: number; // points deducted on entry (0 = free)
  rewardPoints: number;
  participants: string[];
  tasks: string[];
  leaderboard: { userId: string; username: string; score: number }[];
  startTime: string;
  endTime: string;
  status: "open" | "closed" | "completed";
}

// Room level configuration
export const ROOM_LEVELS: { level: number; name: string; seats: number; minPoints: number; color: string }[] = [
  { level: 1, name: "Local Room", seats: 5, minPoints: 0, color: "bg-gray-100 text-gray-700" },
  { level: 2, name: "Community Room", seats: 7, minPoints: 500, color: "bg-blue-100 text-blue-700" },
  { level: 3, name: "Silver Room", seats: 10, minPoints: 2000, color: "bg-slate-200 text-slate-700" },
  { level: 4, name: "Gold Room", seats: 15, minPoints: 5000, color: "bg-amber-100 text-amber-700" },
  { level: 5, name: "VIP Room", seats: 20, minPoints: 10000, color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white" },
];

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amountUSD: number;
  pointsUsed: number;
  method: WithdrawalMethod;
  accountDetails: string;
  status: "pending" | "under-review" | "approved" | "rejected" | "completed" | "hold" | "cancelled";
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
}

export type WithdrawalMethod =
  | "paypal"
  | "binance"
  | "paytm"
  | "jazzcash"
  | "easypaisa";

export interface CoinHistoryEntry {
  id: string;
  userId: string;
  date: string;
  activity: string;
  pointsEarned: number;
  pointsDeducted: number;
  balanceAfter: number;
  status: "completed" | "pending" | "failed";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "withdrawal" | "video" | "task" | "referral" | "event" | "room" | "announcement" | "admin";
  read: boolean;
  createdAt: string;
}

export interface AppSettings {
  welcomeBonus: number;
  referralReward: number;
  pointsPerDollar: number; // e.g. 1000 points = $1
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalMethods: WithdrawalMethod[];
  eventDefaultReward: number;
  roomDefaultReward: number;
  taskDefaultReward: number;
  videoDefaultReward: number;
  withdrawalProcessingHours: string;
}

export interface BusinessCampaign {
  id: string;
  businessId: string;
  businessName: string;
  type: "product" | "company" | "business" | "website" | "app" | "video" | "social" | "sponsored";
  title: string;
  description: string;
  budget: number;
  spent: number;
  views: number;
  clicks: number;
  status: "draft" | "live" | "paused" | "completed";
  startDate: string;
  endDate: string;
}

export interface ReferralStat {
  total: number;
  active: number;
  pending: number;
  earnings: number;
}

// Official referral links generated by admin
export interface OfficialLink {
  id: string;
  label: string; // descriptive label, e.g. "YouTube Channel Promotion"
  username: string; // username of the official account
  referralCode: string; // unique referral code
  referralLink: string; // full URL
  createdAt: string;
  registrations: number; // how many users registered via this link
  isActive: boolean;
}

// Video watch tracking — one entry per user per video
export interface VideoWatch {
  id: string;
  userId: string;
  videoId: string;
  watchedAt: string;
  rewardPoints: number;
}

// Gaming system
export type GameType = "free" | "coin";
export type GameName = "tictactoe" | "memory" | "reaction" | "math" | "numberhunt";

export interface GameResult {
  id: string;
  userId: string;
  username: string;
  gameName: GameName;
  gameType: GameType;
  entryFee: number; // 0 for free games
  result: "win" | "loss" | "draw";
  pointsChange: number; // positive for win, negative for loss, 0 for draw/free
  playedAt: string;
}

export interface GameDef {
  id: GameName;
  name: string;
  type: GameType;
  description: string;
  entryFee: number; // 0 for free games
  reward: number; // win amount (typically 2x entry fee)
  icon: string;
  minLevel?: number;
}
