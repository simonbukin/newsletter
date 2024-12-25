export interface ContentItem {
  title: string;
  url: string;
  source: "instagram" | "youtube" | "hackernews" | "hltv" | "vlr";
  timestamp: Date;
  summary?: string;
  imageUrl?: string;
}

export interface NewsletterContent {
  instagram: ContentItem[];
  youtube: ContentItem[];
  hackernews: ContentItem[];
  hltv: ContentItem[];
  vlr: ContentItem[];
}
