chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, generateImage } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (generateImage) {
      const response = await client.responses.create({
        model: "gpt-5",
        input: message,
        tools: [
          {
            type: "image_generation"
          }
        ]
      });

      const image = response.output.find(
        item => item.type === "image_generation_call"
      );

      if (!image) {
        return res.status(500).json({
          error: "The image could not be generated."
        });
      }

      return res.status(200).json({
        image: `data:image/png;base64,${image.result}`
      });
    }

    const response = await client.responses.create({
      model: "gpt-5",
      instructions:
        "You are a helpful, friendly AI assistant. Answer clearly and naturally.",
      input: message
    });

    return res.status(200).json({
      reply: response.output_text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "The AI could not respond."
    });
  }
}
