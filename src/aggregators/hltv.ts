import puppeteer from "puppeteer";
import { ContentItem } from "../types/content";

export class HLTVAggregator {
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
      // Navigate to HLTV
      await page.goto("https://www.hltv.org", {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Handle cookie consent
      try {
        const cookieButton = await page.waitForSelector(
          "#CybotCookiebotDialogBodyButtonDecline"
        );
        if (cookieButton) {
          await cookieButton.click();
        }
      } catch (error) {
        console.log("Cookie consent button not found or already accepted");
      }

      // Get news
      const news = await page.evaluate(() => {
        const newsElements = document.querySelectorAll("a[href^='/news/']");
        return Array.from(newsElements).map((article) => {
          const href = article.getAttribute("href") || "";
          const slug = href.split("/").pop() || ""; // Get last part after final slash
          const title = slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          const url = "https://www.hltv.org" + href;

          return {
            title: title || "",
            url: url || "",
          };
        });
      });

      // Transform news to ContentItems
      content.push(
        ...news.map((item) => ({
          title: item.title,
          url: item.url,
          source: "hltv" as const,
          timestamp: new Date(item.timestamp),
          summary: "News Article",
        }))
      );
    } catch (error) {
      console.error("Error scraping HLTV:", error);
    } finally {
      await page.close();
    }

    return content;
  }
}
