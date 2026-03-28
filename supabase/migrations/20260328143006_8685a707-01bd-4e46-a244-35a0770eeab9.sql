
INSERT INTO public.oshub_projects 
(name, short_description, full_description, lovable_url, contact_email, goals, contribution_areas, tags, stars, contributors_count, is_demo, last_updated)
VALUES
('Open Source Love Hub', 
'A platform to connect open source Lovable projects with contributors', 
'Open Source Love Hub is a community-driven platform where Lovable project owners can showcase their work and find passionate contributors. Browse projects, vote for your favorites, leave comments, rate projects, and discover new ways to contribute to the Lovable ecosystem.',
'https://open-source-love-hub.lovable.app', 
'', 
'Build a thriving community around Lovable open source projects by making discovery and collaboration effortless.',
'UI/UX improvements, new features, documentation, testing, accessibility, and community engagement',
ARRAY['react', 'typescript', 'supabase', 'open-source', 'lovable', 'community'], 
0, 
1, 
false, 
NOW());
