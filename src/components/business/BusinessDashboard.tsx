"use client";

import { useState } from "react";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { StatCard } from "@/components/shared/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Eye, MousePointerClick, DollarSign, Plus, MessageCircle,
  BarChart3, Megaphone as CampaignIcon, Target, TrendingUp, Video, Globe,
  Smartphone, Users, Sparkles, FileDown, Pause, Play, Trash2
} from "lucide-react";
import { formatPoints, formatUSD, formatDate } from "@/lib/mockData";
import { toast } from "sonner";
import type { BusinessCampaign } from "@/lib/types";

const campaignTypeLabels: Record<string, string> = {
  product: "Product Promotion",
  company: "Company Promotion",
  business: "Business Promotion",
  website: "Website Promotion",
  app: "App Promotion",
  video: "Video Promotion",
  social: "Social Media Promotion",
  sponsored: "Sponsored Campaign",
};

const campaignTypeIcons: Record<string, typeof Building2> = {
  product: Building2, company: BarChart3, business: Building2, website: Globe,
  app: Smartphone, video: Video, social: Users, sponsored: Sparkles,
};

export function BusinessDashboard() {
  const user = useCurrentUser();
  const { campaigns, setView } = useStore();
  const [tab, setTab] = useState("overview");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "product" as BusinessCampaign["type"],
    title: "", description: "", budget: 100,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });

  if (!user) return null;
  const myCampaigns = campaigns.filter((c) => c.businessId === user.id);
  const totalBudget = myCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = myCampaigns.reduce((s, c) => s + c.spent, 0);
  const totalViews = myCampaigns.reduce((s, c) => s + c.views, 0);
  const totalClicks = myCampaigns.reduce((s, c) => s + c.clicks, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  const waLink = `https://wa.me/971509327341?text=${encodeURIComponent("Hi EarnCoin team, I'd like to start a new promotion campaign.")}`;

  const createCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: BusinessCampaign = {
      id: `c_${Date.now()}`,
      businessId: user.id,
      businessName: user.fullName,
      type: form.type,
      title: form.title,
      description: form.description,
      budget: form.budget,
      spent: 0,
      views: 0,
      clicks: 0,
      status: "draft",
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    };
    useStore.setState((s) => ({ campaigns: [newCampaign, ...s.campaigns] }));
    toast.success("Campaign created. Contact us on WhatsApp to launch.");
    setOpen(false);
    setForm({ type: "product", title: "", description: "", budget: 100, startDate: new Date().toISOString().slice(0, 10), endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) });
  };

  const launchCampaign = (id: string) => {
    useStore.setState((s) => ({
      campaigns: s.campaigns.map((c) => c.id === id ? { ...c, status: "live" } : c),
    }));
    toast.success("Campaign is now live");
  };

  const pauseCampaign = (id: string) => {
    useStore.setState((s) => ({
      campaigns: s.campaigns.map((c) => c.id === id ? { ...c, status: c.status === "live" ? "paused" : "live" } : c),
    }));
    toast.success("Campaign status updated");
  };

  const deleteCampaign = (id: string) => {
    useStore.setState((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) }));
    toast.success("Campaign deleted");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <Building2 className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.fullName}. Manage your campaigns and reach 125K+ users.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={waLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us</a>
          </Button>
          <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard title="Total Budget" value={formatUSD(totalBudget)} subtitle={`${formatUSD(totalSpent)} spent`} icon={DollarSign} accent="bg-green-100 text-green-700" />
        <StatCard title="Total Views" value={formatPoints(totalViews)} subtitle="across all campaigns" icon={Eye} accent="bg-blue-100 text-blue-700" />
        <StatCard title="Total Clicks" value={formatPoints(totalClicks)} subtitle={`${ctr}% CTR`} icon={MousePointerClick} accent="bg-purple-100 text-purple-700" />
        <StatCard title="Active Campaigns" value={myCampaigns.filter((c) => c.status === "live").length} subtitle={`${myCampaigns.length} total`} icon={CampaignIcon} accent="bg-amber-100 text-amber-700" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Quick Start</CardTitle><CardDescription>Choose a promotion type to begin.</CardDescription></CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(campaignTypeLabels) as BusinessCampaign["type"][]).map((t) => {
                const Icon = campaignTypeIcons[t];
                return (
                  <button key={t} onClick={() => { setForm({ ...form, type: t }); setOpen(true); }} className="text-left p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <Icon className="w-6 h-6 text-primary mb-2" />
                    <p className="font-medium text-sm">{campaignTypeLabels[t]}</p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {myCampaigns.filter((c) => c.status === "live").map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center">
                      {(() => { const Icon = campaignTypeIcons[c.type]; return <Icon className="w-5 h-5 text-primary" />; })()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{campaignTypeLabels[c.type]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-center"><p className="font-bold">{formatPoints(c.views)}</p><p className="text-xs text-muted-foreground">views</p></div>
                    <div className="text-center"><p className="font-bold">{formatPoints(c.clicks)}</p><p className="text-xs text-muted-foreground">clicks</p></div>
                    <Badge className="bg-green-100 text-green-700">live</Badge>
                  </div>
                </div>
              ))}
              {myCampaigns.filter((c) => c.status === "live").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No live campaigns. Create one to get started.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left p-3 font-medium">Campaign</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Type</th>
                      <th className="text-right p-3 font-medium">Budget</th>
                      <th className="text-right p-3 font-medium hidden md:table-cell">Views</th>
                      <th className="text-right p-3 font-medium hidden md:table-cell">Clicks</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-center p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCampaigns.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          <p className="font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                        </td>
                        <td className="p-3 hidden sm:table-cell"><Badge variant="outline">{campaignTypeLabels[c.type]}</Badge></td>
                        <td className="p-3 text-right"><p className="font-medium">{formatUSD(c.budget)}</p><p className="text-xs text-muted-foreground">{formatUSD(c.spent)} spent</p></td>
                        <td className="p-3 text-right hidden md:table-cell">{formatPoints(c.views)}</td>
                        <td className="p-3 text-right hidden md:table-cell">{formatPoints(c.clicks)}</td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className={
                            c.status === "live" ? "bg-green-100 text-green-700" :
                            c.status === "paused" ? "bg-amber-100 text-amber-700" :
                            c.status === "completed" ? "bg-blue-100 text-blue-700" : ""
                          }>{c.status}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            {c.status === "draft" && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Launch" onClick={() => launchCampaign(c.id)}><Play className="w-3.5 h-3.5 text-green-600" /></Button>
                            )}
                            {c.status === "live" && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Pause" onClick={() => pauseCampaign(c.id)}><Pause className="w-3.5 h-3.5 text-amber-600" /></Button>
                            )}
                            {c.status === "paused" && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Resume" onClick={() => pauseCampaign(c.id)}><Play className="w-3.5 h-3.5 text-green-600" /></Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Delete" onClick={() => deleteCampaign(c.id)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {myCampaigns.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No campaigns yet. Click &quot;New Campaign&quot; to get started.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Campaign Performance</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {myCampaigns.map((c) => {
                  const pct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
                  const ctr = c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(1) : "0";
                  return (
                    <div key={c.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium truncate">{c.title}</span>
                        <Badge variant="outline">{ctr}% CTR</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{formatUSD(c.spent)} / {formatUSD(c.budget)}</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
                {myCampaigns.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total invested</span><span className="font-medium">{formatUSD(totalSpent)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total impressions</span><span className="font-medium">{formatPoints(totalViews)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total clicks</span><span className="font-medium">{formatPoints(totalClicks)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg. CTR</span><span className="font-medium">{ctr}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg. cost per view</span><span className="font-medium">{totalViews > 0 ? formatUSD(totalSpent / totalViews) : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg. cost per click</span><span className="font-medium">{totalClicks > 0 ? formatUSD(totalSpent / totalClicks) : "—"}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Export Reports</CardTitle><CardDescription>Download your campaign performance reports.</CardDescription></CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "Campaign Performance", icon: CampaignIcon },
                { label: "Budget Utilization", icon: DollarSign },
                { label: "Views & Clicks", icon: Eye },
                { label: "Conversion Report", icon: Target },
                { label: "Monthly Summary", icon: BarChart3 },
                { label: "Audience Insights", icon: Users },
              ].map((r) => (
                <button key={r.label} onClick={() => toast.success(`${r.label} exported`)} className="text-left p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                  <r.icon className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><FileDown className="w-3 h-3" /> PDF / Excel / CSV</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Fill in the details. We&apos;ll review and launch within 24 hours.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createCampaign} className="space-y-3">
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as BusinessCampaign["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(campaignTypeLabels) as BusinessCampaign["type"][]).map((t) => (
                    <SelectItem key={t} value={t}>{campaignTypeLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="ctitle">Campaign Title</Label><Input id="ctitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="cdesc">Description</Label><Textarea id="cdesc" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="cbud">Budget (USD)</Label><Input id="cbud" type="number" min={10} required value={form.budget} onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="cstart">Start Date</Label><Input id="cstart" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="cend">End Date</Label><Input id="cend" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" asChild>
                <a href={waLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp to Launch</a>
              </Button>
              <Button type="submit">Create Campaign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
