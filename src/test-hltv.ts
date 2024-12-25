import { HLTVAggregator } from "./aggregators/hltv";
import { EmailService } from "./utils/emailService";

async function testHLTV() {
  const hltvAggregator = new HLTVAggregator();

  try {
    console.log("Initializing HLTV scraper...");
    await hltvAggregator.initialize();

    console.log("Fetching HLTV content...");
    const hltvContent = await hltvAggregator.getContent();

    // Create a mock newsletter content object
    const mockNewsletterContent = {
      hltv: hltvContent,
      instagram: [],
      youtube: [],
      hackernews: [],
      vlr: [],
    };

    // Initialize email service with mock config
    const emailService = new EmailService({
      host: "mock",
      port: 587,
      auth: { user: "mock", pass: "mock" },
    });

    // Generate the HTML template
    const html = emailService["buildTemplate"](mockNewsletterContent);

    // Save the output to a file for viewing
    const fs = require("fs");
    fs.writeFileSync("preview.html", html);

    // Also log the content to console
    console.log("\nHLTV Content Preview:");
    hltvContent.forEach((item) => {
      console.log(`\n-------------------`);
      console.log(`Title: ${item.title}`);
      console.log(`URL: ${item.url}`);
      console.log(`Type: ${item.summary}`);
      console.log(`Time: ${item.timestamp}`);
    });

    console.log("\nHTML preview has been saved to preview.html");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    await hltvAggregator.close();
  }
}

testHLTV();
