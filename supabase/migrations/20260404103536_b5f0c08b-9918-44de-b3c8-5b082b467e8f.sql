CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id text NOT NULL UNIQUE,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user_preferences"
  ON public.user_preferences FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert user_preferences"
  ON public.user_preferences FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update user_preferences"
  ON public.user_preferences FOR UPDATE
  TO public
  USING (true);