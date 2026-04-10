export type Screen = 'home' | 'results' | 'history' | 'error';

export interface ScrapeResult {
  id?: string;
  url: string;
  titles: string[];
  headings: string[];
  links: string[];
  summary: string;
  total_items: number;
  scraped_at?: string;
}
