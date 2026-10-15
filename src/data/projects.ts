/** Server/build-only content. Never import this file from a client script. */
export interface Project {
  slug: string;
  title: string;
  sector: string;
  task: string;
  role: string;
  work: string[];
  images: { src: string; alt: string }[];
  url?: string;
  result?: { text: string; source: string };
  publicationApproved: boolean;
  status: 'draft' | 'published';
}

const projects: Project[] = [];
export const publishedProjects = projects.filter(
  (project) => project.status === 'published' && project.publicationApproved,
);
