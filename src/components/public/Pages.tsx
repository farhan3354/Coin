"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Coins, Video, ListChecks as TasksIcon, Users, Trophy, Gift, Shield, Wallet,
  Play, ArrowRight, CheckCircle2, Globe, Smartphone, Lock,
  TrendingUp, Bell, Building2, Crown, Target, Award, BarChart3,
  MessageCircle, Mail, Send, Sparkles, Clock
} from "lucide-react";
import { toast } from "sonner";
import { staggerContainer, staggerItem, fadeUp, Floating, Pulsing } from "@/lib/animations";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Home() {
  const { setView, openAuth, videos, events, rooms } = useStore();
  const stats = [
    { label: "Active Users", value: "125K+", icon: Users },
    { label: "Points Paid Out", value: "48M+", icon: Coins },
    { label: "Videos Watched", value: "1.2M+", icon: Video },
    { label: "Countries", value: "190+", icon: Globe },
  ];

  const features = [
    { icon: Video, title: "Watch Videos, Earn Points", desc: "Watch promotional videos from YouTube, TikTok, Instagram, and more without leaving EarnCoin. Auto-credited rewards." },
    { icon: TasksIcon, title: "Complete Tasks", desc: "Visit websites, read articles, take surveys, follow social accounts, join Telegram/Discord — get paid for every action." },
    { icon: Trophy, title: "Join Events & Rooms", desc: "Daily, weekly, monthly and festival events with leaderboards. Climb into Beginner, Silver, Gold, VIP and Premium rooms." },
    { icon: Users, title: "Referral System", desc: "Share your unique referral code. When friends verify their email, you both earn points — instantly." },
    { icon: Wallet, title: "Withdraw to Any Wallet", desc: "PayPal, Binance, Paytm, JazzCash, EasyPaisa — withdraw in 24-72 hours after admin approval." },
    { icon: Building2, title: "Business Advertising", desc: "Promote your product, app, website or social media. Reach a global audience with real engagement." },
  ];

  const steps = [
    { num: "01", title: "Register & Verify", desc: "Create your account with email verification and get 150 welcome bonus points instantly." },
    { num: "02", title: "Complete Activities", desc: "Watch videos, finish tasks, join events and rooms, invite friends — every action pays." },
    { num: "03", title: "Convert & Withdraw", desc: "Convert your points to USD automatically and withdraw to PayPal, Binance, Paytm, JazzCash or EasyPaisa." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        {/* Animated background blobs */}
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp}>
                <Badge variant="secondary" className="mb-4 flex items-center gap-1 w-fit">
                  <Sparkles className="w-3 h-3" /> Welcome bonus: 150 points
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl lg:text-6xl font-bold tracking-tight"
              >
                Earn rewards by doing what you love online
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-muted-foreground max-w-xl"
              >
                EarnCoin is the all-in-one rewards platform — watch promotional videos, complete tasks,
                join events, invite friends, and withdraw real money to your favorite wallet.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => openAuth("register")} className="group">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setView("how-it-works")}>
                  <Play className="w-4 h-4 mr-2" /> How It Works
                </Button>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> 150 points welcome bonus</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> Withdraw from $1</span>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <Card className="shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <motion.img
                          src="/logo.png"
                          alt="EarnCoin"
                          className="w-10 h-10 rounded-full object-cover"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        />
                        <div>
                          <p className="font-semibold">Demo Dashboard</p>
                          <p className="text-xs text-muted-foreground">demouser</p>
                        </div>
                      </div>
                      <Pulsing>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                      </Pulsing>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="rounded-lg bg-muted p-3"
                      >
                        <p className="text-xs text-muted-foreground">Total Points</p>
                        <p className="text-2xl font-bold">4,820</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="rounded-lg bg-muted p-3"
                      >
                        <p className="text-xs text-muted-foreground">USD Balance</p>
                        <p className="text-2xl font-bold">$4.82</p>
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Today's earnings", value: "+85 pts", icon: TrendingUp },
                        { label: "Referral code", value: "ERN934X", icon: Users },
                        { label: "Active referrals", value: "9", icon: Gift },
                      ].map((r, i) => (
                        <motion.div
                          key={r.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                        >
                          <span className="flex items-center gap-2 text-sm"><r.icon className="w-4 h-4 text-primary" /> {r.label}</span>
                          <span className="font-semibold text-sm">{r.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <Floating>
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-3 shadow-lg rotate-6">
                  <Trophy className="w-5 h-5" />
                </div>
              </Floating>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.03 }}
                className="text-center"
              >
                <div className="inline-grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                  <s.icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <Badge variant="secondary" className="mb-3">Features</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Everything you need to earn online</h2>
          <p className="mt-4 text-muted-foreground">Six powerful earning channels, one secure platform. Built for users and businesses alike.</p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <motion.div
                    className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <f.icon className="w-6 h-6" />
                  </motion.div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-3">How It Works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Start earning in 3 simple steps</h2>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((s) => (
              <motion.div key={s.num} variants={staggerItem} whileHover={{ y: -4 }} className="relative">
                <motion.div
                  className="text-6xl font-bold text-primary/10 mb-2"
                  whileHover={{ scale: 1.1, color: "rgba(var(--primary), 0.2)" }}
                >
                  {s.num}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <Badge variant="secondary" className="mb-3">Live Preview</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">What&apos;s happening right now</h2>
          <p className="mt-4 text-muted-foreground">A peek at live events, rooms and videos available on EarnCoin.</p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid lg:grid-cols-3 gap-6"
        >
          <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="w-5 h-5 text-primary" /> Live Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.filter((e) => e.status === "live").slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{e.type} event</p>
                    </div>
                    <Pulsing>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">LIVE</Badge>
                    </Pulsing>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Crown className="w-5 h-5 text-primary" /> Open Rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rooms.filter((r) => r.status === "open").slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">Level {r.level} · {r.seats} seats</p>
                    </div>
                    <Badge variant="outline">{r.participants.length}/{r.seats}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Video className="w-5 h-5 text-primary" /> Latest Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {videos.slice(0, 3).map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{v.title}</p>
                      <p className="text-xs text-muted-foreground">+{v.rewardPoints} pts</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{v.platform}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-10"
        >
          <Button size="lg" onClick={() => openAuth("register")} className="group">
            Create your free account <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground relative overflow-hidden">
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-4xl font-bold"
          >
            Ready to start earning?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Join 125,000+ users who are already earning with EarnCoin. Registration is free and takes less than a minute.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="secondary" onClick={() => openAuth("register")}>
                Register Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => setView("advertise")}>
                Advertise Your Business
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Badge variant="secondary" className="mb-4">About EarnCoin</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Empowering online earners worldwide</h1>
        <p className="text-lg text-muted-foreground mb-8">
          EarnCoin was built on a simple idea — anyone with a phone or laptop should be able to earn real rewards
          from their time online, while businesses get a fair, transparent way to reach engaged audiences.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid md:grid-cols-2 gap-6 my-12"
      >
        <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
          <Card className="h-full">
            <CardContent className="p-6">
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Target className="w-8 h-8 text-primary mb-3" />
              </motion.div>
              <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                Create a global rewards economy where time spent online translates into tangible value — fairly,
                transparently, and securely. We connect advertisers with real users, not bots.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
          <Card className="h-full">
            <CardContent className="p-6">
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Award className="w-8 h-8 text-primary mb-3" />
              </motion.div>
              <h3 className="font-semibold text-lg mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground">
                Become the most trusted rewards platform on the internet — where every click, view and completion
                is verifiable, every withdrawal is paid, and every user is treated fairly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mt-12 mb-4"
      >
        Our values
      </motion.h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-4"
      >
        {[
          { icon: Shield, title: "Security first", desc: "Device fingerprinting, OTP verification, and JWT-based auth keep your account safe. One device, one account — fake accounts are blocked at registration." },
          { icon: Users, title: "Fair to users", desc: "Every activity has a transparent reward. Every withdrawal request is tracked end-to-end. Points convert to USD at a rate you can see in your dashboard." },
          { icon: BarChart3, title: "Transparent for businesses", desc: "Real engagement from real users. Advertisers get detailed reports on views, clicks and conversions — exported as PDF, Excel or CSV." },
          { icon: Globe, title: "Global and inclusive", desc: "Support for 190+ countries and five withdrawal methods — including JazzCash and EasyPaisa for South Asia, Paytm for India, and PayPal/Binance worldwide." },
        ].map((v) => (
          <motion.div
            key={v.title}
            variants={staggerItem}
            whileHover={{ x: 4 }}
            className="flex gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="grid place-items-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <v.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mt-12 mb-4"
      >
        By the numbers
      </motion.h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Active users", value: "125K+" },
          { label: "Points paid out", value: "48M+" },
          { label: "Countries served", value: "190+" },
          { label: "Avg. withdrawal time", value: "48 hrs" },
        ].map((s) => (
          <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4, scale: 1.03 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function Features() {
  const features = [
    { icon: Video, title: "Video Promotion System", desc: "Watch promotional videos from YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Snapchat, Vimeo and Dailymotion — all embedded directly. Rewards auto-credit after the required watch duration, with anti-abuse protection.", points: "Up to 20 pts/video" },
    { icon: TasksIcon, title: "Task System", desc: "Eight task types: watch video, visit website, read article, complete survey, social follow, share content, join Telegram, join Discord. Admin controls reward, duration and availability per task.", points: "10-30 pts/task" },
    { icon: Trophy, title: "Event System", desc: "Daily, weekly, monthly, special and festival events. Each event has a countdown timer, rules, participants list, leaderboard and winner announcement. Status: upcoming, live, completed, expired.", points: "200-5000 pts" },
    { icon: Crown, title: "Room System", desc: "Five levels — Local (5 seats), Community (7), Silver (10), Gold (15), VIP (20). Each level unlocks higher rewards. Complete tasks to earn Room XP and level up.", points: "100-2000 pts" },
    { icon: Users, title: "Referral System", desc: "Every user gets a unique code like ERN934X. When a friend registers and verifies their email, you earn points automatically. Track total, active and pending referrals in real time.", points: "90 pts/referral" },
    { icon: Wallet, title: "Withdrawal System", desc: "Five methods: PayPal, Binance, Paytm, JazzCash, EasyPaisa. Workflow: pending → under review → approved → completed. Processing in 24-72 hours. Admin can approve, reject, hold or cancel.", points: "$1-$500" },
    { icon: BarChart3, title: "Leaderboards", desc: "Four leaderboards: daily, weekly, monthly and all-time. Categories: top earners, top referrals, top event winners, top room winners. Compete globally.", points: "Live rankings" },
    { icon: Bell, title: "Notifications", desc: "Real-time alerts for withdrawal status, new videos, new tasks, referral rewards, event start/end, room invitations, announcements and admin messages.", points: "Instant" },
    { icon: Shield, title: "Security & Anti-Fraud", desc: "JWT + refresh tokens, device fingerprint (one device = one account), browser info + IP tracking, email + OTP verification. Prevents duplicate and fake accounts.", points: "Enterprise-grade" },
    { icon: Building2, title: "Business Dashboard", desc: "Businesses manage campaigns (product, company, website, app, video, social, sponsored), track views/clicks/budget, view reports and analytics. WhatsApp integration for new promotions.", points: "Self-serve" },
    { icon: Gift, title: "Welcome Bonus", desc: "Every newly registered user gets 150 points automatically after email verification. Use them to enter Community Room or convert to $0.15 USD.", points: "150 pts" },
    { icon: Coins, title: "Coin History", desc: "Every activity logged with date, time, activity, points earned/deducted, running balance and status. Filter by date, month or activity type.", points: "Full audit" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <Badge variant="secondary" className="mb-3">Features</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">A complete rewards platform</h1>
        <p className="text-lg text-muted-foreground">Twelve core systems working together to make earning online simple, fair and secure.</p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((f) => (
          <motion.div key={f.title} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <f.icon className="w-6 h-6" />
                  </motion.div>
                  <Badge variant="outline">{f.points}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { num: 1, icon: Shield, title: "Register securely", desc: "Sign up with your full name, username, email, password, country and optional referral code. Our system fingerprints your device to enforce the one-device-one-account rule." },
    { num: 2, icon: Mail, title: "Verify your email", desc: "Enter the 6-digit OTP sent to your email. Once verified, you instantly receive 150 welcome bonus points. If someone referred you, they get 90 points too." },
    { num: 3, icon: Video, title: "Watch videos", desc: "Open the Videos page. Pick any video — YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Snapchat, Vimeo or Dailymotion. Watch the full required duration and the reward is auto-credited." },
    { num: 4, icon: TasksIcon, title: "Complete tasks", desc: "Choose from eight task types: visit a website, read an article, take a survey, follow a social account, share content, join Telegram, join Discord. Each task pays 10-30 points." },
    { num: 5, icon: Trophy, title: "Join events & rooms", desc: "Browse live and upcoming events. Join rooms (Beginner → Premium tiers) for bigger rewards. Climb the leaderboards for bonus prizes." },
    { num: 6, icon: Users, title: "Invite friends", desc: "Share your unique referral code (e.g. ERN934X). When friends register and verify, you earn 90 points per active referral. Your referral dashboard tracks everything." },
    { num: 7, icon: Wallet, title: "Convert points to USD", desc: "Points convert automatically at the admin-set rate (default 1000 points = $1). Your dashboard shows your live USD balance alongside your points balance." },
    { num: 8, icon: Coins, title: "Withdraw your earnings", desc: "Request a withdrawal to PayPal, Binance, Paytm, JazzCash or EasyPaisa. Status goes pending → under review → approved → completed in 24-72 hours." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="secondary" className="mb-3">How It Works</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">From signup to withdrawal in 8 steps</h1>
        <p className="text-lg text-muted-foreground">A clear path from your first welcome bonus to your first cashout.</p>
      </div>
      <div className="space-y-6">
        {steps.map((s, i) => (
          <div key={s.num} className="flex gap-4 lg:gap-6">
            <div className="flex flex-col items-center">
              <div className="grid place-items-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                {s.num}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
            </div>
            <div className="pb-6 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{s.title}</h3>
              </div>
              <p className="text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Advertise() {
  const { setView } = useStore();
  const types = [
    { icon: Building2, title: "Product Promotion", desc: "Showcase a physical or digital product to a global audience." },
    { icon: BarChart3, title: "Company Promotion", desc: "Build brand awareness with targeted campaigns and detailed reports." },
    { icon: Globe, title: "Website Promotion", desc: "Drive real traffic to your website with verified clicks." },
    { icon: Smartphone, title: "App Promotion", desc: "Get installs and engagement from real users, not bots." },
    { icon: Video, title: "Video Promotion", desc: "Embed YouTube, TikTok, Instagram and more — pay per verified watch." },
    { icon: Users, title: "Social Media Promotion", desc: "Grow your followers on X, Instagram, TikTok, Discord and Telegram." },
    { icon: Sparkles, title: "Sponsored Campaign", desc: "Premium placement across EarnCoin home, dashboard and emails." },
    { icon: Building2, title: "Business Promotion", desc: "Full-funnel promotion combining all of the above." },
  ];

  const waNumber = "971509327341"; // Support WhatsApp number
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi EarnCoin team, I'd like to start a promotion for my business.")}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="secondary" className="mb-3">For Businesses</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Advertise to 125K+ engaged users</h1>
        <p className="text-lg text-muted-foreground">Real engagement. Transparent reporting. Pay only for verified views, clicks and completions.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" /> Start Promotion on WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" onClick={() => setView("contact")}>
            <Mail className="w-4 h-4 mr-2" /> Contact Sales
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Promotion types</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {types.map((t) => (
          <Card key={t.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="grid place-items-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3">
                <t.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {[
          { stat: "$0.05", label: "Avg. cost per verified view" },
          { stat: "98%", label: "Real-user engagement (no bots)" },
          { stat: "24h", label: "Campaign launch time" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-primary">{s.stat}</p>
              <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const { addNotification } = useStore();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent. Our team will reply within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="secondary" className="mb-3">Contact Us</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Get in touch</h1>
        <p className="text-lg text-muted-foreground">Questions, partnership ideas, or support — we typically reply within 24 hours.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <MessageCircle className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-3">Fastest way to reach us for promotions and support.</p>
              <a href="https://wa.me/971509327341" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">+971 50 932 7341</a>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <Mail className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">For support tickets and inquiries.</p>
              <a href="mailto:earncoinofficial804@gmail.com" className="text-sm text-primary hover:underline">earncoinofficial804@gmail.com</a>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Support Hours</h3>
              <p className="text-sm text-muted-foreground">24/7 ticket support. Live chat Mon-Fri 9am-6pm UTC.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    { q: "Is EarnCoin free to join?", a: "Yes. Registration is 100% free. You get 150 welcome bonus points after email verification — no credit card or payment required." },
    { q: "How do I earn points?", a: "You earn points by watching promotional videos, completing tasks (visit website, read article, take survey, social follow, etc.), joining events, joining rooms, daily login bonus, and referral rewards when friends verify their email." },
    { q: "How much is 1 point worth?", a: "By default, 1000 points = $1 USD. The conversion rate is set by the admin and is always visible in your dashboard and on the withdrawal page." },
    { q: "What withdrawal methods are supported?", a: "PayPal, Binance, Paytm, JazzCash and EasyPaisa. Choose any method based on your country. Minimum withdrawal is $1, maximum is $500 per request." },
    { q: "How long do withdrawals take?", a: "Withdrawals are processed within 24-72 hours. Status flow: pending → under review → approved → completed. Admin can also reject, hold or cancel a withdrawal — in those cases your points are refunded." },
    { q: "Can I have more than one account?", a: "No. EarnCoin enforces a one-device-one-account policy using device fingerprinting, browser info and IP tracking. Duplicate and fake accounts are blocked at registration." },
    { q: "How does the referral system work?", a: "Every user gets a unique referral code (e.g. ERN934X). When a friend registers with your code and verifies their email, you automatically receive 90 points. The admin can change this reward at any time." },
    { q: "What are rooms and events?", a: "Rooms are tiered earning environments (Beginner, Silver, Gold, VIP, Premium) with entry requirements and bigger rewards. Events are time-bound competitions (daily, weekly, monthly, special, festival) with leaderboards and prizes." },
    { q: "Can businesses advertise on EarnCoin?", a: "Yes. Click the Advertise button to start a WhatsApp chat with our sales team. Choose from product, company, website, app, video, social or sponsored campaign types. You get a business dashboard to manage campaigns and view reports." },
    { q: "How do you prevent fraud?", a: "We use device fingerprinting, email + OTP verification, JWT-based authentication, IP tracking, and abuse detection on every video watch and task completion. Suspicious activity is flagged for admin review." },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-3">FAQ</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Frequently asked questions</h1>
        <p className="text-lg text-muted-foreground">Everything you need to know about earning and withdrawing on EarnCoin.</p>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 prose prose-sm">
      <Badge variant="secondary" className="mb-4">Legal</Badge>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">By creating an account on EarnCoin, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not register or use the platform.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">2. One Device, One Account</h2>
          <p className="text-muted-foreground">EarnCoin enforces a one-device-one-account policy. We track device fingerprints, browser information and IP addresses. Attempting to create multiple accounts from the same device will result in account suspension and forfeiture of all points and balances.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Prohibited Activities</h2>
          <p className="text-muted-foreground">You must not use bots, automated scripts, VPNs to circumvent device limits, fake video watch timers, or any other method to artificially inflate earnings. Violations result in immediate account termination.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Points and Withdrawals</h2>
          <p className="text-muted-foreground">Points have no cash value until converted to USD and successfully withdrawn. Withdrawal requests are processed within 24-72 hours. EarnCoin reserves the right to hold, reject or cancel any withdrawal request suspected of fraud.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Account Suspension</h2>
          <p className="text-muted-foreground">We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or attempt to exploit the platform. Suspended accounts forfeit all accumulated points and balances.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
          <p className="text-muted-foreground">We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p className="text-muted-foreground">For questions about these terms, contact us at earncoinofficial804@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 prose prose-sm">
      <Badge variant="secondary" className="mb-4">Legal</Badge>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground">When you register, we collect your full name, username, email, country, and an optional referral code. We also track your device fingerprint, browser information, and IP address to enforce our one-device-one-account policy.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to authenticate you, prevent fraud, process withdrawals, send notifications, and improve the platform. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Data Security</h2>
          <p className="text-muted-foreground">We use JWT-based authentication, OTP verification, device fingerprinting and encrypted password storage. Your withdrawal account details are stored only for the purpose of processing withdrawals.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Cookies and Local Storage</h2>
          <p className="text-muted-foreground">EarnCoin uses local storage to keep you logged in and to persist your session. We do not use third-party tracking cookies.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
          <p className="text-muted-foreground">You may request a copy of your data, request deletion of your account, or update your profile information at any time by contacting earncoinofficial804@gmail.com.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">6. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground">EarnCoin is not available to users under 13 years old. We do not knowingly collect data from children.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p className="text-muted-foreground">For privacy questions, contact privacy@earncoin.com.</p>
        </section>
      </div>
    </div>
  );
}
