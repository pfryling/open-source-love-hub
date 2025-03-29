
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
