import { HackerNewsAggregator } from "./aggregators/hackernews";
import { HLTVAggregator } from "./aggregators/hltv";
import { VLRAggregator } from "./aggregators/vlr";
import { EmailService } from "./utils/emailService";
import { NewsletterContent } from "./types/content";
import dotenv from "dotenv";
import { parseArgs } from "node:util";
import { InstagramAggregator } from "./aggregators/instagram";

dotenv.config();

interface NewsletterConfig {
  sources: string[];
  period: "daily" | "weekly" | "monthly";
  days: number;
}

const DEFAULT_CONFIG: Record<string, NewsletterConfig> = {
  daily: {
    sources: ["hackernews"],
    period: "daily",
    days: 1,
  },
  weekly: {
    sources: ["hltv", "vlr"],
    period: "weekly",
    days: 7,
  },
};

async function generateNewsletter(config: NewsletterConfig) {
  const content: NewsletterContent = {
    hltv: [],
    vlr: [],
    hackernews: [],
    instagram: [],
    youtube: [],
  };

  try {
    // Only initialize aggregators that are needed
    if (config.sources.includes("hackernews")) {
      const hackernewsAggregator = new HackerNewsAggregator(config.days);
      content.hackernews = await hackernewsAggregator.getContent();
    }

    if (config.sources.includes("hltv")) {
      const hltvAggregator = new HLTVAggregator(config.days);
      await hltvAggregator.initialize();
      content.hltv = await hltvAggregator.getContent();
      await hltvAggregator.close();
    }

    if (config.sources.includes("vlr")) {
      const vlrAggregator = new VLRAggregator(config.days);
      await vlrAggregator.initialize();
      content.vlr = await vlrAggregator.getContent();
      await vlrAggregator.close();
    }

    const emailService = new EmailService({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    await emailService.sendNewsletter(
      content,
      process.env.EMAIL_TO!,
      config.period
    );
  } catch (error) {
    console.error("Error generating newsletter:", error);
    throw error;
  }
}

// Parse command line arguments
const { values } = parseArgs({
  options: {
    sources: {
      type: "string",
    },
    period: {
      type: "string",
    },
  },
});

const sources = values.sources?.split(",") || [];
const period = (values.period as "daily" | "weekly" | "monthly") || "daily";

// Use default config or override with CLI args
const config = {
  ...DEFAULT_CONFIG[period],
  sources: sources.length ? sources : DEFAULT_CONFIG[period].sources,
};

generateNewsletter(config);
