
-- Table to store per-user per-project votes
CREATE TABLE public.oshub_user_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

-- Table to track daily bonus claims
CREATE TABLE public.oshub_daily_bonus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  claimed_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, claimed_date)
);

-- RLS for oshub_user_votes
ALTER TABLE public.oshub_user_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own oshub_user_votes"
  ON public.oshub_user_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own oshub_user_votes"
  ON public.oshub_user_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oshub_user_votes"
  ON public.oshub_user_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own oshub_user_votes"
  ON public.oshub_user_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS for oshub_daily_bonus
ALTER TABLE public.oshub_daily_bonus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own oshub_daily_bonus"
  ON public.oshub_daily_bonus FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own oshub_daily_bonus"
  ON public.oshub_daily_bonus FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
