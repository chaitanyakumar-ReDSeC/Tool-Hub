export type ApplicationTab = 'Web Applications' | 'Windows Applications' | 'Android Applications';

export interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  domain: string;
  ogImage?: string;
}
