-- Secure RLS Migration
-- Enable RLS on every table in the public schema

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RoomParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Withdrawal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CoinHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VideoWatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GameResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OfficialLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BusinessCampaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PasswordReset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailVerification" ENABLE ROW LEVEL SECURITY;

-- USER policies
CREATE POLICY user_select_self ON public."User" FOR SELECT USING (auth.uid() = id OR role = 'admin');
CREATE POLICY user_insert_self ON public."User" FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY user_update_self ON public."User" FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY user_delete_admin ON public."User" FOR DELETE USING (role = 'admin');

-- VIDEO policies (public read, admin write)
CREATE POLICY video_select_public ON public."Video" FOR SELECT USING (true);
CREATE POLICY video_insert_admin ON public."Video" FOR INSERT WITH CHECK (role = 'admin');
CREATE POLICY video_update_admin ON public."Video" FOR UPDATE USING (role = 'admin') WITH CHECK (role = 'admin');
CREATE POLICY video_delete_admin ON public."Video" FOR DELETE USING (role = 'admin');

-- TASK policies (public read, admin write)
CREATE POLICY task_select_public ON public."Task" FOR SELECT USING (true);
CREATE POLICY task_insert_admin ON public."Task" FOR INSERT WITH CHECK (role = 'admin');
CREATE POLICY task_update_admin ON public."Task" FOR UPDATE USING (role = 'admin') WITH CHECK (role = 'admin');
CREATE POLICY task_delete_admin ON public."Task" FOR DELETE USING (role = 'admin');

-- EVENT policies (public read, admin write)
CREATE POLICY event_select_public ON public."Event" FOR SELECT USING (true);
CREATE POLICY event_insert_admin ON public."Event" FOR INSERT WITH CHECK (role = 'admin');
CREATE POLICY event_update_admin ON public."Event" FOR UPDATE USING (role = 'admin') WITH CHECK (role = 'admin');
CREATE POLICY event_delete_admin ON public."Event" FOR DELETE USING (role = 'admin');

-- EVENTPARTICIPANT policies (owner or admin)
CREATE POLICY ep_select_self ON public."EventParticipant" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY ep_insert_self ON public."EventParticipant" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY ep_update_self ON public."EventParticipant" FOR UPDATE USING (userId = auth.uid()) WITH CHECK (userId = auth.uid());
CREATE POLICY ep_delete_admin ON public."EventParticipant" FOR DELETE USING (role = 'admin');

-- ROOM policies (public read, admin write)
CREATE POLICY room_select_public ON public."Room" FOR SELECT USING (true);
CREATE POLICY room_insert_admin ON public."Room" FOR INSERT WITH CHECK (role = 'admin');
CREATE POLICY room_update_admin ON public."Room" FOR UPDATE USING (role = 'admin') WITH CHECK (role = 'admin');
CREATE POLICY room_delete_admin ON public."Room" FOR DELETE USING (role = 'admin');

-- ROOMPARTICIPANT policies (owner or admin)
CREATE POLICY rp_select_self ON public."RoomParticipant" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY rp_insert_self ON public."RoomParticipant" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY rp_update_self ON public."RoomParticipant" FOR UPDATE USING (userId = auth.uid()) WITH CHECK (userId = auth.uid());
CREATE POLICY rp_delete_admin ON public."RoomParticipant" FOR DELETE USING (role = 'admin');

-- WITHDRAWAL policies (owner or admin)
CREATE POLICY withdrawal_select_self ON public."Withdrawal" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY withdrawal_insert_self ON public."Withdrawal" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY withdrawal_update_admin ON public."Withdrawal" FOR UPDATE USING (role = 'admin');
CREATE POLICY withdrawal_delete_admin ON public."Withdrawal" FOR DELETE USING (role = 'admin');

-- COINHISTORY policies (system insert)
CREATE POLICY coinhistory_select_self ON public."CoinHistory" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY coinhistory_insert_service ON public."CoinHistory" FOR INSERT WITH CHECK (role = 'service');
CREATE POLICY coinhistory_delete_admin ON public."CoinHistory" FOR DELETE USING (role = 'admin');

-- NOTIFICATION policies (system insert)
CREATE POLICY notification_select_self ON public."Notification" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY notification_insert_service ON public."Notification" FOR INSERT WITH CHECK (role = 'service');
CREATE POLICY notification_delete_admin ON public."Notification" FOR DELETE USING (role = 'admin');

-- VIDEOWATCH policies
CREATE POLICY videowatch_select_self ON public."VideoWatch" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY videowatch_insert_self ON public."VideoWatch" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY videowatch_delete_admin ON public."VideoWatch" FOR DELETE USING (role = 'admin');

-- GAMERESULT policies
CREATE POLICY gameresult_select_self ON public."GameResult" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY gameresult_insert_self ON public."GameResult" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY gameresult_delete_admin ON public."GameResult" FOR DELETE USING (role = 'admin');

-- OFFICIALINK policies (public read, admin write)
CREATE POLICY officiallink_select_public ON public."OfficialLink" FOR SELECT USING (true);
CREATE POLICY officiallink_insert_admin ON public."OfficialLink" FOR INSERT WITH CHECK (role = 'admin');
CREATE POLICY officiallink_update_admin ON public."OfficialLink" FOR UPDATE USING (role = 'admin') WITH CHECK (role = 'admin');
CREATE POLICY officiallink_delete_admin ON public."OfficialLink" FOR DELETE USING (role = 'admin');

-- BUSINESSCAMPAIGN policies (public read, owner write, admin delete)
CREATE POLICY businesscampaign_select_public ON public."BusinessCampaign" FOR SELECT USING (true);
CREATE POLICY businesscampaign_insert_owner ON public."BusinessCampaign" FOR INSERT WITH CHECK (businessId = auth.uid());
CREATE POLICY businesscampaign_update_owner ON public."BusinessCampaign" FOR UPDATE USING (businessId = auth.uid()) WITH CHECK (businessId = auth.uid());
CREATE POLICY businesscampaign_delete_admin ON public."BusinessCampaign" FOR DELETE USING (role = 'admin');

-- EMAILLOG policies (admin view, service insert)
CREATE POLICY emaillog_select_admin ON public."EmailLog" FOR SELECT USING (role = 'admin');
CREATE POLICY emaillog_insert_service ON public."EmailLog" FOR INSERT WITH CHECK (role = 'service');
CREATE POLICY emaillog_delete_admin ON public."EmailLog" FOR DELETE USING (role = 'admin');

-- SETTINGS policies (admin only)
CREATE POLICY settings_select_admin ON public."Settings" FOR SELECT USING (role = 'admin');
CREATE POLICY settings_update_admin ON public."Settings" FOR UPDATE USING (role = 'admin') WITH CHECK (role = 'admin');

-- PASSWORDRESET policies (owner read/insert, admin delete)
CREATE POLICY passwordreset_select_self ON public."PasswordReset" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY passwordreset_insert_self ON public."PasswordReset" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY passwordreset_delete_admin ON public."PasswordReset" FOR DELETE USING (role = 'admin');

-- EMAILVERIFICATION policies (owner read/insert, admin delete)
CREATE POLICY emailverification_select_self ON public."EmailVerification" FOR SELECT USING (userId = auth.uid() OR role = 'admin');
CREATE POLICY emailverification_insert_self ON public."EmailVerification" FOR INSERT WITH CHECK (userId = auth.uid());
CREATE POLICY emailverification_delete_admin ON public."EmailVerification" FOR DELETE USING (role = 'admin');

-- Ensure a service account exists (run once)
INSERT INTO public."User" (id, fullName, username, email, password, country, role, referralCode, points, dollarBalance, emailVerified, deviceFingerprint, browserInfo, ipAddress, createdAt, status)
VALUES ('service-user-id', 'Service', 'service', 'service@example.com', 'hashedpw', 'N/A', 'service', 'none', 0, 0, true, 'fingerprint', '', '', now(), 'active')
ON CONFLICT (id) DO NOTHING;
