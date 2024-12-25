import puppeteer from "puppeteer";
import { ContentItem } from "../types/content";

export class VLRAggregator {
  private browser: puppeteer.Browser | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1920,1080",
      ],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getContent(): Promise<ContentItem[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    // Add random user agent to avoid blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    const content: ContentItem[] = [];

    try {
      // Navigate to VLR
      await page.goto("https://www.vlr.gg", {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Get news
      const news = await page.evaluate(() => {
        const newsElements = document.querySelectorAll("a.news-item");
        return Array.from(newsElements).map((article) => {
          const titleElement = article.querySelector(".news-item-title");
          const title = titleElement ? titleElement.textContent?.trim() : "";
          const href = article.getAttribute("href") || "";
          const url = "https://www.vlr.gg" + href;

          return {
            title: title || "",
            url: url,
          };
        });
      });

      content.push(
        ...news.map((item) => ({
          title: item.title,
          url: item.url,
          source: "vlr" as const,
          summary: "Valorant News",
        }))
      );
    } catch (error) {
      console.error("Error scraping VLR:", error);
    } finally {
      await page.close();
    }

    return content;
  }
}
