"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Coins,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Fingerprint,
  RotateCcw,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const countries = [
  "United States",
  "United Kingdom",
  "Pakistan",
  "India",
  "Bangladesh",
  "United Arab Emirates",
  "Nigeria",
  "Philippines",
  "Kenya",
  "Indonesia",
  "Malaysia",
  "Turkey",
  "Egypt",
  "Saudi Arabia",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Brazil",
  "Mexico",
  "Other",
];

// Helper: map DB user to store-compatible user object
function mapDbUser(u: any) {
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    password: u.password || "",
    country: u.country,
    role: u.role || "user",
    referralCode: u.referralCode,
    referredBy: u.referredBy || undefined,
    points: u.points || 0,
    coins: u.coins || 0,
    diamonds: u.diamonds || 0,
    dollarBalance: u.dollarBalance || 0,
    hasFirstWithdrawal: u.hasFirstWithdrawal || false,
    emailVerified: u.emailVerified ?? true,
    deviceFingerprint: u.deviceFingerprint || "",
    browserInfo: u.browserInfo || "",
    ipAddress: u.ipAddress || "0.0.0.0",
    createdAt: u.createdAt || new Date().toISOString(),
    lastLogin: u.lastLogin || undefined,
    status: u.status || "active",
    avatarColor: u.avatarColor || "#16a34a",
    totalReferrals: u.totalReferrals || 0,
    activeReferrals: u.activeReferrals || 0,
    roomLevel: u.roomLevel || 1,
    roomXP: u.roomXP || 0,
    isSuperStar: u.isSuperStar || false,
    roomTasksCompleted: u.roomTasksCompleted || 0,
  };
}

export function AuthModals() {
  const {
    authModal,
    closeAuth,
    openAuth,
    register,
    login,
    verifyOtp,
    forgotPassword,
    setView,
  } = useStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // register form
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    country: "",
    referralCode: "",
  });

  // otp
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // pending user for OTP verification (from DB registration)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmailLocal] = useState<string | null>(null);

  // forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "code" | "newpass">(
    "email",
  );
  const [forgotUserId, setForgotUserId] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Reset error/otp whenever the modal target changes
  const [lastModal, setLastModal] = useState(authModal);
  if (lastModal !== authModal) {
    setLastModal(authModal);
    setError("");
    setOtp("");
    if (authModal === "forgot") setForgotStep("email");
  }

  // ─────────────────────────────────── LOGIN ───────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPwd }),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.ok) {
        // Account exists but email not verified — redirect to OTP
        if (data.unverified && data.userId) {
          setPendingUserId(data.userId);
          setPendingEmailLocal(data.email || loginEmail);
          useStore.setState({ pendingEmail: data.email || loginEmail });
          openAuth("otp");
          toast.info(
            "Please verify your email first. A new code has been sent.",
          );
          return;
        }
        setError(data.message);
      } else {
        // Sync DB user into store
        if (data.user) {
          const dbUser = mapDbUser(data.user);
          const currentState = useStore.getState();
          const exists = currentState.users.find((u) => u.id === dbUser.id);
          if (exists) {
            useStore.setState({
              users: currentState.users.map((u) =>
                u.id === dbUser.id ? dbUser : u,
              ),
            });
          } else {
            useStore.setState({ users: [...currentState.users, dbUser] });
          }
          useStore.setState({
            currentUserId: dbUser.id,
            authModal: null,
          });
          if (dbUser.role === "admin")
            useStore.setState({ currentView: "admin" });
          else if (dbUser.role === "business")
            useStore.setState({ currentView: "business" });
          else useStore.setState({ currentView: "dashboard" });
        } else {
          // Fallback: local store login
          const r = login(loginEmail, loginPwd);
          if (!r.ok) setError(r.message);
        }
        toast.success("Logged in successfully!");
        closeAuth();
      }
    } catch {
      setLoading(false);
      // Fallback to local store
      const r = login(loginEmail, loginPwd);
      if (!r.ok) setError(r.message);
      else {
        toast.success(r.message);
        closeAuth();
      }
    }
  };

  // ─────────────────────────────────── REGISTER ────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reg.firstName.trim() || !reg.lastName.trim()) {
      setError("Please enter your first and last name");
      return;
    }
    if (!reg.phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (reg.password !== reg.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (reg.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!reg.country) {
      setError("Please select your country");
      return;
    }

    setLoading(true);
    const fullName = `${reg.firstName} ${reg.lastName}`;
    const username = (reg.firstName + reg.lastName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          email: reg.email,
          password: reg.password,
          country: reg.country,
          referralCode: reg.referralCode || undefined,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.unverified && data.userId) {
        // Account already exists but email not verified — send them to OTP
        setPendingUserId(data.userId);
        setPendingEmailLocal(data.email || reg.email);
        useStore.setState({ pendingEmail: data.email || reg.email });
        openAuth("otp");
        toast.info(
          "Account already exists! A new OTP has been sent to your email.",
        );
        return;
      }

      if (!data.ok) {
        setError(data.message);
        return;
      }

      // Successfully created account — go to OTP verification
      setPendingUserId(data.userId);
      setPendingEmailLocal(data.email || reg.email);
      useStore.setState({ pendingEmail: data.email || reg.email });
      openAuth("otp");

      if (data.sent === false) {
        toast.warning(
          "Account created! However, the email could not be sent. Use Resend Code to try again.",
        );
      } else {
        toast.success(
          "Account created! A verification code has been sent to your email.",
        );
      }
    } catch {
      setLoading(false);
      // Fallback to local store (offline mode)
      const r = register({
        fullName,
        username,
        email: reg.email,
        password: reg.password,
        country: reg.country,
        referralCode: reg.referralCode || undefined,
      });
      if (!r.ok) setError(r.message);
      else {
        setPendingEmailLocal(reg.email);
        toast.success(r.message);
      }
    }
  };

  // ─────────────────────────────────── OTP VERIFY ──────────────────────────────
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    // Resolve userId: use pendingUserId (from API) or fall back to local store user
    const storeState = useStore.getState();
    const resolvedEmail = pendingEmail || storeState.pendingEmail;
    const userId =
      pendingUserId ||
      storeState.users.find((u) => u.email === resolvedEmail)?.id;

    if (userId) {
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, code: otp }),
        });
        const data = await res.json();
        setLoading(false);

        if (!data.ok) {
          setError(
            data.message || "Invalid or expired code. Please try again.",
          );
          return;
        }

        // ── Sync DB user into local store ──
        if (data.user) {
          const dbUser = mapDbUser(data.user);
          const latest = useStore.getState();
          const exists = latest.users.find((u) => u.id === dbUser.id);
          const updatedUsers = exists
            ? latest.users.map((u) => (u.id === dbUser.id ? dbUser : u))
            : [...latest.users, dbUser];

          // Add welcome notification & coin history if not already present
          const alreadyHasBonus = latest.coinHistory.some(
            (h) => h.userId === dbUser.id && h.activity === "Welcome Bonus",
          );
          const newHistory = alreadyHasBonus
            ? latest.coinHistory
            : [
                {
                  id: `ch_${Date.now()}`,
                  userId: dbUser.id,
                  date: new Date().toISOString(),
                  activity: "Welcome Bonus",
                  pointsEarned: dbUser.points,
                  pointsDeducted: 0,
                  balanceAfter: dbUser.points,
                  status: "completed" as const,
                },
                ...latest.coinHistory,
              ];
          const alreadyHasNotif = latest.notifications.some(
            (n) => n.userId === dbUser.id && n.title === "Welcome to EarnCoin!",
          );
          const newNotifs = alreadyHasNotif
            ? latest.notifications
            : [
                {
                  id: `n_${Date.now()}`,
                  userId: dbUser.id,
                  title: "Welcome to EarnCoin!",
                  message: `Your account is verified. Welcome bonus points credited.`,
                  type: "announcement" as const,
                  read: false,
                  createdAt: new Date().toISOString(),
                },
                ...latest.notifications,
              ];

          useStore.setState({
            users: updatedUsers,
            coinHistory: newHistory,
            notifications: newNotifs,
            currentUserId: dbUser.id,
            authModal: null,
            pendingEmail: null,
            currentView: "dashboard",
          });
          setPendingUserId(null);
          setPendingEmailLocal(null);
          toast.success("Email verified! Welcome bonus credited! 🎉");
        } else {
          // data.ok but no user returned — fall back to local store verification
          const r = verifyOtp(otp);
          if (!r.ok) setError(r.message);
          else toast.success(r.message);
        }
        return;
      } catch {
        setLoading(false);
        // Network error — fall back to local
      }
    }

    // Fallback: local store OTP (demo mode — accepts any 6-digit code)
    const r = verifyOtp(otp);
    setLoading(false);
    if (!r.ok) setError(r.message);
    else toast.success(r.message);
  };

  // ─────────────────────────────────── RESEND OTP ──────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    const storeState = useStore.getState();
    const email = pendingEmail || storeState.pendingEmail;
    if (!email) {
      toast.error("Email not found. Please go back and register again.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.ok) {
        // Also update pendingUserId if returned
        if (data.userId && !pendingUserId) setPendingUserId(data.userId);
        toast.success("New verification code sent to your email!");
        startResendCooldown();
      } else {
        toast.error(data.message || "Failed to resend code. Please try again.");
      }
    } catch {
      setLoading(false);
      toast.error("Failed to resend code. Check your internet connection.");
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // ─────────────────────────────────── FORGOT PASSWORD ─────────────────────────
  const handleForgotSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.ok) {
        setError(data.message);
      } else {
        setForgotUserId(data.userId);
        setForgotStep("code");
        toast.success("Reset code sent to your email!");
      }
    } catch {
      setLoading(false);
      const r = forgotPassword(forgotEmail);
      if (!r.ok) setError(r.message);
      else {
        toast.success(r.message);
        setForgotStep("code");
      }
    }
  };

  const handleForgotSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(resetCode)) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setForgotStep("newpass");
  };

  const handleForgotSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: forgotUserId,
          code: resetCode,
          newPassword,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.ok) {
        setError(data.message);
      } else {
        toast.success("Password reset successfully! You can now login.");
        setForgotStep("email");
        setResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        openAuth("login");
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  // ─────────────────────────────────── RENDER ──────────────────────────────────
  const displayEmail = pendingEmail || useStore.getState().pendingEmail || "";

  return (
    <>
      {/* ── Login ── */}
      <Dialog
        open={authModal === "login"}
        onOpenChange={(o) => !o && closeAuth()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
                <Coins className="w-5 h-5" />
              </span>
              <DialogTitle>Welcome back</DialogTitle>
            </div>
            <DialogDescription>
              Login to your EarnCoin account to continue earning.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="lemail">Email</Label>
              <Input
                id="lemail"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lpwd">Password</Label>
              <div className="relative">
                <Input
                  id="lpwd"
                  type={showPwd ? "text" : "password"}
                  required
                  value={loginPwd}
                  onChange={(e) => setLoginPwd(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openAuth("forgot")}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => openAuth("register")}
              className="text-primary hover:underline font-medium"
            >
              Register
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Register ── */}
      <Dialog
        open={authModal === "register"}
        onOpenChange={(o) => !o && closeAuth()}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
                <Coins className="w-5 h-5" />
              </span>
              <DialogTitle>Create your account</DialogTitle>
            </div>
            <DialogDescription>
              Join EarnCoin and get 150 welcome bonus points after verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  required
                  value={reg.firstName}
                  onChange={(e) =>
                    setReg({ ...reg, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  required
                  value={reg.lastName}
                  onChange={(e) => setReg({ ...reg, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remail">Email</Label>
              <Input
                id="remail"
                type="email"
                required
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rphone">Phone Number</Label>
              <Input
                id="rphone"
                type="tel"
                required
                value={reg.phone}
                onChange={(e) => setReg({ ...reg, phone: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rpwd">Password</Label>
                <div className="relative">
                  <Input
                    id="rpwd"
                    type={showPwd ? "text" : "password"}
                    required
                    value={reg.password}
                    onChange={(e) =>
                      setReg({ ...reg, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rconfirm">Confirm Password</Label>
                <Input
                  id="rconfirm"
                  type={showPwd ? "text" : "password"}
                  required
                  value={reg.confirm}
                  onChange={(e) => setReg({ ...reg, confirm: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  required
                  value={reg.country}
                  onChange={(e) => setReg({ ...reg, country: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ref">Referral Code (Optional)</Label>
                <Input
                  id="ref"
                  value={reg.referralCode}
                  onChange={(e) =>
                    setReg({
                      ...reg,
                      referralCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ERN934X"
                />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> One device = one account
                (fingerprint enforced)
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5" /> Duplicate and fake
                accounts are blocked
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5" /> Email &amp; OTP
                verification required
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => openAuth("login")}
              className="text-primary hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── OTP Verification ── */}
      <Dialog
        open={authModal === "otp"}
        onOpenChange={(o) => !o && closeAuth()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                <Mail className="w-5 h-5" />
              </span>
              <DialogTitle>Verify your email</DialogTitle>
            </div>
            <DialogDescription>
              We&apos;ve sent a 6-digit code to{" "}
              {displayEmail ? (
                <strong className="text-foreground">{displayEmail}</strong>
              ) : (
                "your email"
              )}
              . Enter it below to activate your account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOtp} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  setError("");
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Verify &amp;
                  Continue
                </>
              )}
            </Button>
          </form>

          {/* Resend + Back */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn&apos;t receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                className="gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
              </Button>
            </div>

            <div className="text-center border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Wrong email? Go back and register again.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOtp("");
                  setError("");
                  openAuth("register");
                }}
                className="gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Registration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Forgot Password (multi-step) ── */}
      <Dialog
        open={authModal === "forgot"}
        onOpenChange={(o) => !o && closeAuth()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {forgotStep === "email" && "Reset your password"}
              {forgotStep === "code" && "Enter reset code"}
              {forgotStep === "newpass" && "Create new password"}
            </DialogTitle>
            <DialogDescription>
              {forgotStep === "email" &&
                "Enter your email and we'll send you a reset code."}
              {forgotStep === "code" &&
                "We've sent a 6-digit code to your email. Enter it below."}
              {forgotStep === "newpass" && "Enter your new password below."}
            </DialogDescription>
          </DialogHeader>

          {forgotStep === "email" && (
            <form onSubmit={handleForgotSubmitEmail} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="femail">Email</Label>
                <Input
                  id="femail"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {forgotStep === "code" && (
            <form onSubmit={handleForgotSubmitCode} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={resetCode}
                  onChange={(v) => setResetCode(v)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resetCode.length !== 6}
              >
                Verify Code
              </Button>
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setForgotStep("email");
                    setError("");
                  }}
                >
                  ← Back to email
                </Button>
              </div>
            </form>
          )}

          {forgotStep === "newpass" && (
            <form
              onSubmit={handleForgotSubmitNewPassword}
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fnewpwd">New Password</Label>
                <div className="relative">
                  <Input
                    id="fnewpwd"
                    type={showPwd ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fconfirmpwd">Confirm New Password</Label>
                <Input
                  id="fconfirmpwd"
                  type={showPwd ? "text" : "password"}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              onClick={() => openAuth("login")}
              className="text-primary hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
