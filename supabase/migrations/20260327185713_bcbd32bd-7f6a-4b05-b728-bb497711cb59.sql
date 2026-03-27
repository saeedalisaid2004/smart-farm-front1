CREATE TABLE public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id text NOT NULL,
  push boolean NOT NULL DEFAULT true,
  email boolean NOT NULL DEFAULT true,
  analysis_alerts boolean NOT NULL DEFAULT true,
  role text NOT NULL DEFAULT 'farmer',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(external_user_id, role)
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notification_settings" ON public.notification_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notification_settings" ON public.notification_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notification_settings" ON public.notification_settings FOR UPDATE USING (true);