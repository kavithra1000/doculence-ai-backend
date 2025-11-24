import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize both Gemini and OpenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Utility to remove markdown code fences (```html ... ```)
function stripCodeFence(text) {
  // Remove starting code block like ```html, ```js, or just ```
  let cleaned = text.replace(/^```[a-z]*\s*/i, '').trim();

  // Fallback: remove last 3 characters if they are backticks
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3).trim();
  }

  return cleaned;
}

// Gemini summarizer
async function summarizeWithGemini(plainText) {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash-latest' });

  const prompt = `
You are a helpful assistant that summarizes web page content clearly and concisely.

Please read the following article text and produce a summary that:
- Covers the main points and important details
- Is easy to understand
- Uses short paragraphs or bullet points when appropriate
- Is no longer than 300 words
- Outputs the summary as clean HTML using semantic tags (<section>, <h2>, <p>, <ul>, <li>)
- Add Tailwind CSS classes for styling:
  - Container: "max-w-3xl mx-auto"
  - Headings: "text-2xl font-bold mt-0 mb-4"
  - Paragraphs: "mb-4 text-gray-700 leading-relaxed"
  - Lists: "list-disc list-inside mb-4"
Important: Do NOT include any markdown or code block markers (like \`\`\`html). Just return raw HTML only.

Article text:
${plainText}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = await response.text();
  return stripCodeFence(rawText);
}

// OpenAI fallback summarizer
async function summarizeWithOpenAI(plainText) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes web page content clearly and concisely.',
      },
      {
        role: 'user',
        content: `
Please summarize the following web page content clearly and concisely.

Guidelines:
- Include the main ideas and key information
- Write in easy-to-understand language
- Use short paragraphs or bullet points if helpful
- Keep the summary within 300 words
- Return the summary as clean HTML with semantic tags (<section>, <h2>, <p>, <ul>, <li>)
- Add Tailwind CSS classes for styling:
  - Container: "max-w-3xl mx-auto p-3 rounded-lg shadow-md"
  - Headings: "text-2xl font-bold mb-4"
  - Paragraphs: "mb-4 text-gray-700 leading-relaxed"
  - Lists: "list-disc list-inside mb-4"
Do NOT include any markdown or code block markers (like \`\`\`html). Just return raw HTML only.

Content:
${plainText}
        `,
      },
    ],
    temperature: 0.6,
    max_tokens: 700,
  });

  return stripCodeFence(response.choices[0].message.content.trim());
}

// Main summarizer
async function summarizeContent(htmlContent) {
  // Strip HTML tags to get clean text
  const plainText = htmlContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  try {
    console.log('🔷 Trying Gemini...');
    return await summarizeWithGemini(plainText);
  } catch (geminiError) {
    console.warn('⚠️ Gemini failed:', geminiError.message);
    try {
      console.log('🔁 Falling back to OpenAI...');
      return await summarizeWithOpenAI(plainText);
    } catch (openaiError) {
      console.error('❌ OpenAI also failed:', openaiError.message);
      throw new Error('Both Gemini and OpenAI failed to summarize content.');
    }
  }
}

export default summarizeContent ;
