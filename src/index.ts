import { HackerNewsAggregator } from "./aggregators/hackernews";
import { HLTVAggregator } from "./aggregators/hltv";
import { VLRAggregator } from "./aggregators/vlr";
import { EmailService } from "./utils/emailService";
import { NewsletterContent } from "./types/content";
import dotenv from "dotenv";

dotenv.config();

async function generateNewsletter() {
  const hltvAggregator = new HLTVAggregator();
  const vlrAggregator = new VLRAggregator();
  const hackernewsAggregator = new HackerNewsAggregator();

  try {
    await hltvAggregator.initialize();
    await vlrAggregator.initialize();

    const hltvContent = await hltvAggregator.getContent();
    const vlrContent = await vlrAggregator.getContent();
    const hackernewsContent = await hackernewsAggregator.getContent();

    const newsletterContent: NewsletterContent = {
      hltv: hltvContent,
      vlr: vlrContent,
      hackernews: hackernewsContent,
      instagram: [],
      youtube: [],
    };

    console.log("Email configuration:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER?.substring(0, 3) + "...",
    });

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

    console.log("Newsletter content collected:", {
      hltvCount: hltvContent.length,
      vlrCount: vlrContent.length,
      hackernewsCount: hackernewsContent.length,
    });

    await emailService.sendNewsletter(newsletterContent, process.env.EMAIL_TO!);

    console.log("Newsletter generated and sent successfully!");
  } catch (error) {
    console.error("Error generating newsletter:", error);
    throw error;
  } finally {
    await hltvAggregator.close();
    await vlrAggregator.close();
  }
}

generateNewsletter();
