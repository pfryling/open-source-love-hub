
-- This file contains seed data for the application
-- You can run this file manually through the Supabase SQL editor

-- Add demo projects
INSERT INTO public.oshub_projects 
(name, short_description, full_description, lovable_url, contact_email, contact_discord, goals, contribution_areas, tags, stars, contributors_count, is_demo, last_updated)
VALUES
('Lovable Hub', 
'An open source project showcase and collaboration platform', 
'Lovable Hub is a platform designed to connect open source projects built with Lovable to potential contributors. Project maintainers can showcase their work, while contributors can discover interesting projects to work on.',
'https://lovable.dev/showcase', 
'hello@lovable.dev', 
'lovable', 
'Our goal is to foster a thriving community around Lovable projects by making it easy to discover and contribute to open source work.',
'UI enhancements, feature implementation, documentation, and testing',
ARRAY['react', 'typescript', 'supabase', 'open-source'], 
42, 
5, 
true, 
NOW()),

('Lovable Chat', 
'Real-time chat application built with Lovable', 
'A fully-featured chat application that demonstrates real-time capabilities using Supabase and React. Features include direct messaging, channels, and file sharing.',
'https://lovable.dev/chat', 
'chat@lovable.dev', 
'lovable-chat', 
'Create an intuitive, responsive chat experience that can be easily customized and extended.',
'Performance optimization, mobile responsiveness, and adding new features like voice messages',
ARRAY['react', 'typescript', 'supabase', 'real-time'], 
31, 
3, 
true, 
NOW()),

('Lovable Docs', 
'Documentation site generator for Lovable projects', 
'An easy-to-use documentation generator that pulls from your codebase and README files to create beautiful, searchable documentation sites.',
'https://lovable.dev/docs', 
'docs@lovable.dev', 
'lovable-docs', 
'Simplify the process of creating and maintaining documentation for any project.',
'Search functionality, dark mode, and internationalization support',
ARRAY['react', 'mdx', 'documentation', 'static-site'], 
24, 
4, 
true, 
NOW());

-- Add demo features for projects
INSERT INTO public.oshub_project_features
(project_id, name, description, votes, status)
VALUES
((SELECT id FROM oshub_projects WHERE name = 'Lovable Hub'), 
'Project Analytics', 
'Add analytics dashboard for project maintainers to track views, stars, and contributor engagement', 
12, 
'planned'),

((SELECT id FROM oshub_projects WHERE name = 'Lovable Hub'), 
'Integration with GitHub', 
'Allow syncing projects with GitHub repositories to automatically update stats and features', 
18, 
'in-progress'),

((SELECT id FROM oshub_projects WHERE name = 'Lovable Hub'), 
'Contributor Matching', 
'Implement an algorithm to match contributors with projects based on skills and interests', 
9, 
'suggested'),

((SELECT id FROM oshub_projects WHERE name = 'Lovable Chat'), 
'End-to-End Encryption', 
'Implement end-to-end encryption for private messages and channels', 
15, 
'planned'),

((SELECT id FROM oshub_projects WHERE name = 'Lovable Chat'), 
'Voice and Video Calls', 
'Add support for voice and video calls between users', 
21, 
'suggested'),

((SELECT id FROM oshub_projects WHERE name = 'Lovable Docs'), 
'API Reference Generator', 
'Automatically generate API reference documentation from TypeScript files', 
11, 
'completed'),

((SELECT id FROM oshub_projects WHERE name = 'Lovable Docs'), 
'Interactive Code Examples', 
'Add support for interactive code examples that users can edit and run', 
16, 
'in-progress');
