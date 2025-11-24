import puppeteer from "puppeteer";
import sanitizeHtml from "sanitize-html";

async function extractContent(url) {

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Extract clean content and title
    const extracted = await page.evaluate(() => {
      const content =
        document.querySelector("main")?.outerHTML ||
        document.querySelector("article")?.outerHTML ||
        document.body.outerHTML;

      return {
        html: content,
        text: document.body.innerText,
        title: document.title,
      };
    });

    await browser.close();

    // Sanitize: allow basic tags, no scripts/styles/iframes
    const safeHtml = sanitizeHtml(extracted.html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'blockquote', 'ul', 'ol', 'li'
      ]),
      allowedAttributes: {
        '*': ['href', 'src', 'alt', 'class', 'title', 'target', 'rel'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      disallowedTagsMode: 'discard',
    });


    return {
      content: safeHtml,
      text: extracted.text,
      metadata: {
        title: extracted.title,
        sourceUrl: url,
      },
    };

  } catch (error) {
    if (browser) await browser.close();
    console.error(`❌ Error extracting content from ${url}:`, error.message);

    return {
      content: "<p>Error extracting content. Please check the URL and try again.</p>",
      text: "",
      metadata: { sourceUrl: url },
    };
  }
}

export default extractContent ;
