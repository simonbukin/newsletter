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
      subject: `Your Daily Newsletter - ${new Date().toLocaleDateString()}`,
      html,
    });
  }

  private buildTemplate(content: NewsletterContent): string {
    // Build a responsive email template using Tailwind classes
    return `
      <div class="max-w-2xl mx-auto p-4">
        ${Object.entries(content)
          .map(
            ([source, items]) => `
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4 text-gray-800">${source.toUpperCase()}</h2>
            ${items
              .map(
                (item) => `
              <div class="mb-4 p-4 bg-white rounded-lg shadow">
                <a href="${item.url}" class="text-blue-600 hover:text-blue-800">
                  <h3 class="font-semibold">${item.title}</h3>
                </a>
                ${
                  item.imageUrl
                    ? `<img src="${item.imageUrl}" class="mt-2 rounded" />`
                    : ""
                }
                ${
                  item.summary
                    ? `<p class="text-gray-600 mt-2">${item.summary}</p>`
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }
}
