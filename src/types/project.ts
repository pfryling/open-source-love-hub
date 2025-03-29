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
  userId?: string;
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
}

export interface FeatureVotes {
  [featureId: string]: number;
}
