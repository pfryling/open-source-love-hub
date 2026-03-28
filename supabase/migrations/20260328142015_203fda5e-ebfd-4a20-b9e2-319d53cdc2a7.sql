
-- oshub_projects
CREATE TABLE public.oshub_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  lovable_url text NOT NULL DEFAULT '',
  contact_email text DEFAULT '',
  contact_discord text DEFAULT '',
  goals text DEFAULT '',
  contribution_areas text DEFAULT '',
  tags text[] DEFAULT '{}',
  stars integer DEFAULT 0,
  contributors_count integer DEFAULT 0,
  is_demo boolean DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  image_url text DEFAULT '',
  rating_sum numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.oshub_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read oshub_projects" ON public.oshub_projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert oshub_projects" ON public.oshub_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own oshub_projects" ON public.oshub_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own oshub_projects" ON public.oshub_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- oshub_project_features
CREATE TABLE public.oshub_project_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES public.oshub_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  votes integer DEFAULT 0,
  status text DEFAULT 'suggested'
);

ALTER TABLE public.oshub_project_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read oshub_project_features" ON public.oshub_project_features FOR SELECT TO anon, authenticated USING (true);

-- oshub_project_comments
CREATE TABLE public.oshub_project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES public.oshub_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment text NOT NULL
);

ALTER TABLE public.oshub_project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read oshub_project_comments" ON public.oshub_project_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert oshub_project_comments" ON public.oshub_project_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- oshub_project_ratings
CREATE TABLE public.oshub_project_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES public.oshub_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 0,
  UNIQUE (project_id, user_id)
);

ALTER TABLE public.oshub_project_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read oshub_project_ratings" ON public.oshub_project_ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert oshub_project_ratings" ON public.oshub_project_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own oshub_project_ratings" ON public.oshub_project_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- oshub_user_favorites
CREATE TABLE public.oshub_user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.oshub_projects(id) ON DELETE CASCADE,
  UNIQUE (user_id, project_id)
);

ALTER TABLE public.oshub_user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own oshub_user_favorites" ON public.oshub_user_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own oshub_user_favorites" ON public.oshub_user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own oshub_user_favorites" ON public.oshub_user_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- oshub_user_profiles
CREATE TABLE public.oshub_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  interests text[] DEFAULT '{}'
);

ALTER TABLE public.oshub_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own oshub_user_profiles" ON public.oshub_user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own oshub_user_profiles" ON public.oshub_user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own oshub_user_profiles" ON public.oshub_user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
