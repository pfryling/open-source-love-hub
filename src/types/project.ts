
export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  lovableUrl: string;
  contactEmail?: string;
  contactDiscord?: string;
  goals: string;
  contributionAreas: string;
  tags: string[];
  stars?: number;
  contributorsCount: number;
  lastUpdated: string;
  features?: ProjectFeature[];
  is_demo?: boolean;
  image_url?: string;
  rating_sum?: number;
  rating_count?: number;
  github_url?: string;
}

export interface ProjectFeature {
  id: string;
  name: string;
  description: string;
  votes: number;
  status: "planned" | "in-progress" | "completed" | "suggested";
}

export interface ProjectFormData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  lovableUrl: string;
  contactEmail: string;
  contactDiscord: string;
  goals: string;
  contributionAreas: string;
  tags: string;
  image?: File;
  github_url?: string;
}

export interface FeatureVotes {
  [featureId: string]: number;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user_name?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
  project?: Project;
}
