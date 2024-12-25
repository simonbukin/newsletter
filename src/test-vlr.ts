import { VLRAggregator } from "./aggregators/vlr";
import { EmailService } from "./utils/emailService";

async function testVLR() {
  const vlrAggregator = new VLRAggregator();

  try {
    console.log("Initializing VLR scraper...");
    await vlrAggregator.initialize();

    console.log("Fetching VLR content...");
    const vlrContent = await vlrAggregator.getContent();

    // Create a mock newsletter content object
    const mockNewsletterContent = {
      hltv: [],
      instagram: [],
      youtube: [],
      hackernews: [],
      vlr: vlrContent,
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
    fs.writeFileSync("preview-vlr.html", html);

    // Also log the content to console
    console.log("\nVLR Content Preview:");
    vlrContent.forEach((item) => {
      console.log(`\n-------------------`);
      console.log(`Title: ${item.title}`);
      console.log(`URL: ${item.url}`);
      console.log(`Type: ${item.summary}`);
      console.log(`Time: ${item.timestamp}`);
    });

    console.log("\nHTML preview has been saved to preview-vlr.html");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    await vlrAggregator.close();
  }
}

testVLR();
