import { ContentItem } from "../types/content";

export class HackerNewsAggregator {
  private baseUrl = "https://hacker-news.firebaseio.com/v0";
  private days: number;

  constructor(days: number = 1) {
    this.days = days;
  }

  async getContent(): Promise<ContentItem[]> {
    try {
      // Get top 500 story IDs
      const response = await fetch(`${this.baseUrl}/topstories.json`);
      const storyIds = await response.json();

      // Get details for first 100 stories with retry logic
      const stories = await Promise.all(
        storyIds.slice(0, 100).map(async (id: number) => {
          // Add retry logic for individual stories
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const storyResponse = await fetch(
                `${this.baseUrl}/item/${id}.json`
              );
              if (!storyResponse.ok)
                throw new Error(`HTTP error! status: ${storyResponse.status}`);
              return await storyResponse.json();
            } catch (error) {
              if (attempt === 2)
                console.warn(`Failed to fetch story ${id} after 3 attempts`);
              if (attempt < 2)
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * (attempt + 1))
                );
            }
          }
          return null; // Return null for failed stories
        })
      );

      // Filter out failed stories before processing
      const validStories = stories.filter((story) => story !== null);

      // Filter stories by configured time period
      const cutoffTime = Date.now() / 1000 - this.days * 24 * 60 * 60;
      const recentStories = validStories
        .filter((story) => story.time > cutoffTime)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      // Transform to ContentItems
      return recentStories.map((story) => ({
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: "hackernews" as const,
        timestamp: new Date(story.time * 1000),
        summary: `${story.score} points | ${story.descendants || 0} comments`,
      }));
    } catch (error) {
      console.error("Error fetching HackerNews content:", error);
      return [];
    }
  }
}
