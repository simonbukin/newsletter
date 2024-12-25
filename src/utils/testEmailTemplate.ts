import { EmailService } from "./emailService";
import { NewsletterContent } from "../types/content";

// Sample test data
const sampleContent: NewsletterContent = {
  "Top Stories": [
    {
      title: "Sample News Article",
      url: "https://example.com",
      summary:
        "This is a sample summary of the news article that demonstrates how the layout will look.",
      timestamp: new Date().toISOString(),
      imageUrl: "https://picsum.photos/200", // Random sample image
    },
    {
      title: "Another News Story",
      url: "https://example.com",
      summary:
        "Another sample summary to show how multiple articles look in the same section.",
      timestamp: new Date().toISOString(),
    },
  ],
  Technology: [
    {
      title: "Tech News Sample",
      url: "https://example.com",
      summary:
        "A sample technology news article with some longer text to see how it wraps.",
      timestamp: new Date().toISOString(),
      imageUrl: "https://picsum.photos/200",
    },
  ],
};

// Create a simple HTML file with the template
const emailService = new EmailService({
  host: "dummy",
  port: 0,
  auth: { user: "dummy", pass: "dummy" },
});

const template = emailService.buildTemplate(sampleContent);

// Write to a file
import fs from "fs";
fs.writeFileSync("preview.html", template);

console.log(
  "Preview file created! Open preview.html with Live Server to see the result."
);
