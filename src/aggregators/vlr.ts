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
      console.log("VLR: Initializing browser...");
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    console.log("VLR: Starting content aggregation...");

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    const content: ContentItem[] = [];
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - 1); // 24 hours ago

    try {
      console.log("VLR: Navigating to vlr.gg...");
      await page.goto("https://www.vlr.gg", {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Get initial news items
      console.log("VLR: Extracting news items from main page...");
      const newsItems = await page.evaluate(() => {
        const newsElements = document.querySelectorAll("a.news-item");
        return Array.from(newsElements).map((article) => {
          const titleElement = article.querySelector(".news-item-title");
          const title = titleElement ? titleElement.textContent?.trim() : "";
          const href = article.getAttribute("href") || "";
          return {
            title: title || "",
            href: href,
          };
        });
      });
      console.log(`VLR: Found ${newsItems.length} news items to process`);

      // Visit each article page to get the timestamp
      for (const [index, item] of newsItems.entries()) {
        const articleUrl = "https://www.vlr.gg" + item.href;
        console.log(
          `VLR: Processing article ${index + 1}/${newsItems.length}: ${
            item.title
          }`
        );

        try {
          await page.goto(articleUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          const timestamp = await page.evaluate(() => {
            const dateElement = document.querySelector(".js-date-toggle");
            return dateElement ? dateElement.getAttribute("title") : null;
          });

          console.log(`VLR: Extracted timestamp: ${timestamp}`);

          if (timestamp) {
            const cleanTimestamp = timestamp
              .replace(" at ", " ")
              .replace(" PST", "");
            const articleDate = new Date(cleanTimestamp);

            if (articleDate < cutoffTime) {
              console.log(
                "VLR: Reached articles older than 24 hours, stopping..."
              );
              break;
            }

            content.push({
              title: item.title,
              url: articleUrl,
              source: "vlr" as const,
              timestamp: articleDate,
              summary: "Valorant News",
            });
            console.log(
              `VLR: Successfully processed article from ${articleDate.toISOString()}`
            );
          }
        } catch (error) {
          console.error(`VLR: Error processing article ${articleUrl}:`, error);
        }

        // Add a small delay between requests to be polite
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("VLR: Error during scraping:", error);
    } finally {
      console.log(
        `VLR: Finished processing. Found ${content.length} articles within last 24 hours`
      );
      await page.close();
    }

    return content.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
}
