import { GoogleAI } from "@google/generative-ai/server";

const ai = new GoogleAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function main() {
  const models = await ai.models.list();
  console.log(models);
}

main();