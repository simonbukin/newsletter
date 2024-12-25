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
    const content: ContentItem[] = [];

    // Add console message listeners
    page.on("console", (msg) => console.log("Browser console:", msg.text()));
    page.on("error", (err) => console.error("Browser error:", err));
    page.on("pageerror", (err) => console.error("Page error:", err));

    try {
      console.log("Starting HLTV content aggregation...");
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

      // Get all news items from Today's news section
      const newsItems = await page.evaluate(() => {
        const todaysNewsHeading = Array.from(
          document.querySelectorAll("h2")
        ).find((h2) => h2.textContent?.trim() === "Today's news");

        if (!todaysNewsHeading) return [];

        const newsContainer = todaysNewsHeading.nextElementSibling;
        if (!newsContainer) return [];

        const newsLinks = newsContainer.querySelectorAll("a[href^='/news/']");

        return Array.from(newsLinks).map((link) => ({
          title: link.textContent?.trim() || "",
          url: "https://www.hltv.org" + (link.getAttribute("href") || ""),
        }));
      });

      // Add items to content array
      content.push(
        ...newsItems.map((item) => ({
          title: item.title,
          url: item.url,
          source: "hltv" as const,
          timestamp: new Date(), // Current time since we're getting today's news
          summary: "News Article",
        }))
      );

      console.log(
        `Successfully collected ${content.length} articles from Today's news`
      );
    } catch (error) {
      console.error("Error scraping HLTV:", error);
    } finally {
      await page.close();
    }

    return content;
  }
}
