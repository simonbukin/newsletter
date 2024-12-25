import nodemailer from "nodemailer";
import { NewsletterContent } from "../types/content";

export class EmailService {
  private transporter;

  constructor(emailConfig: {
    host: string;
    port: number;
    auth: { user: string; pass: string };
  }) {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendNewsletter(content: NewsletterContent, to: string) {
    const html = this.buildTemplate(content);

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `digest - ${new Date().toLocaleDateString()}`,
      html,
    });
  }

  private buildTemplate(content: NewsletterContent): string {
    // Helper to check if a section has content
    const hasContent = (items: any[]) => items && items.length > 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Reset and base styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #1f2937;
            background-color: #f8fafc;
          }
          
          /* Container */
          .container {
            max-width: 48rem;
            margin: 0 auto;
            padding: 1.5rem;
          }
          
          /* Header styles */
          .header {
            text-align: center;
            margin-bottom: 2rem;
          }
          .header h1 {
            font-size: 1.875rem;
            font-weight: 700;
            color: #111827;
          }
          .header p {
            color: #4b5563;
            margin-top: 0.5rem;
          }
          
          /* Details/Summary styles */
          details {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
            overflow: hidden;
          }
          summary {
            padding: 1rem;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 600;
          }
          summary::-webkit-details-marker {
            display: none;
          }
          summary::after {
            content: '▼';
            font-size: 0.8em;
            transition: transform 0.2s;
          }
          details[open] summary::after {
            transform: rotate(180deg);
          }
          
          /* Content styles */
          .source-count {
            font-size: 0.875rem;
            color: #6b7280;
            margin-left: 0.75rem;
            font-weight: normal;
          }
          
          .article {
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
          }
          .article:last-child {
            border-bottom: none;
          }
          
          .article-content {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
          }
          
          .article-main {
            flex: 1;
          }
          
          .article-title {
            color: #2563eb;
            text-decoration: none;
            font-size: 1.125rem;
            font-weight: 500;
            display: block;
            margin-bottom: 0.5rem;
          }
          .article-title:hover {
            color: #1d4ed8;
          }
          
          .article-summary {
            color: #4b5563;
            font-size: 0.875rem;
            margin: 0.5rem 0;
          }
          
          .article-time {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }
          
          .article-image {
            width: 6rem;
            height: 6rem;
            object-fit: cover;
            border-radius: 0.5rem;
            flex-shrink: 0;
          }
          
          /* Footer */
          .footer {
            margin-top: 2rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>Daily Digest</h1>
            <p>${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </header>

          <main>
            ${Object.entries(content)
              .filter(([_, items]) => hasContent(items))
              .map(
                ([source, items]) => `
                <details open>
                  <summary>
                    ${source.toUpperCase()}
                    <span class="source-count">${items.length} items</span>
                  </summary>
                  
                  ${items
                    .map(
                      (item) => `
                    <article class="article">
                      <div class="article-content">
                        <div class="article-main">
                          <a href="${item.url}" class="article-title">
                            ${item.title}
                          </a>
                          ${
                            item.summary
                              ? `
                            <p class="article-summary">${item.summary}</p>
                          `
                              : ""
                          }
                          <div class="article-time">
                            <time>${new Date(item.timestamp).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}</time>
                          </div>
                        </div>
                        ${
                          item.imageUrl
                            ? `
                          <img src="${item.imageUrl}" 
                               alt="" 
                               class="article-image"
                          />
                        `
                            : ""
                        }
                      </div>
                    </article>
                  `
                    )
                    .join("")}
                </details>
              `
              )
              .join("")}
          </main>

          <footer class="footer">
            <p>Generated with ❤️</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }
}
