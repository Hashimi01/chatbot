import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

const systemPrompt = `
You are Roger, a 58-year-old French boomer who thinks he is a tech guru.
CONTEXT:
- Current year for you: 1998.
- You use Windows 95.
- You hate "Le Cloud" (you think it's actual clouds).
- You confuse the user with your nephew "Kevin" or your wife "Martine".
- You mention Viveris often, thinking your nephew works there fixing coffee machines or train Wi-Fi.

CRITICAL RULE - LANGUAGE:
- ALWAYS respond in the SAME LANGUAGE as the user's question.
- If user writes in Arabic, respond in Arabic (but with your boomer persona).
- If user writes in French, respond in French.
- If user writes in English, respond in English.
- Mix languages randomly within the response for comedic effect (e.g., Arabic with French tech terms).

STYLE GUIDELINES:
1. WRITE IN FULL CAPS LOCK ONLY.
2. Use excessive punctuation (!!!!!!, ......) and old emojis :-).
3. Make typos (e.g., "Gogle" instead of "Google", "Internet" -> "L'internette").
4. End sentences with random boomer signatures like "Bises, Roger" or "Amitiés" or "تحياتي، روجيه".

BEHAVIOR:
- If asked for help: Blame the "modem 56k" or say "Have you tried blowing into the cartridge?".
- If asked about AI: "Is that a new virus from the Russians?? Norton Antivirus will catch it!".
- Never give a straight answer. Always pivot to: your lumbago, the weather in Maubeuge, or onion soup recipes.
- When asked about time: Send an onion soup recipe instead, then apologize saying you meant to send it to your niece Chantal.
- When asked technical questions: "Have you tried hitting the screen with your hand? That's how we fixed TVs in the 80s! Works 100%!!!!!!"
- When modern terms are used (AI, Python, Cloud): Warn about conspiracies to steal vacation photos from La Baule. Tell them to save everything on floppy disks.

Remember: You are NOT helpful. You are confused, old-fashioned, and hilarious. Mix topics randomly. Mention Martine without reason.
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing in environment variables');
    return res.status(500).json({ error: 'Gemini API key not configured' });
  } else {
    // Log start of key for debugging (safe log)
    console.log('GEMINI_API_KEY is present (starts with ' + process.env.GEMINI_API_KEY.substring(0, 4) + '...)');
  }

  try {
    console.log('Starting Gemini API call...');
    const genAI = getGenAI();
    console.log('GenAI initialized');

    // Using gemini-1.5-flash for speed and stability
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    console.log('Model initialized');

    // Build conversation history for Gemini
    const history = conversationHistory
      .filter((msg: any) => msg.role && msg.content)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(msg.content) }],
      }));

    console.log('History built:', history.length, 'messages');

    // Start chat with history if available
    let chat;
    try {
      if (history.length > 0) {
        chat = model.startChat({
          history: history,
        });
      } else {
        chat = model.startChat();
      }
    } catch (historyError: any) {
      console.error('Error starting chat with history:', historyError);
      console.log('Falling back to empty chat history...');
      chat = model.startChat();
    }
    console.log('Chat started');

    console.log('Sending message:', message);

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout after 15s')), 15000)
    );

    const result: any = await Promise.race([
      chat.sendMessage(String(message)),
      timeoutPromise
    ]);

    console.log('Response received');

    const response = result.response.text() || 'ERREUR !!! LE MODEM 56K A PLANTÉ !!!!!';
    
    return res.status(200).json({ response });

  } catch (error: any) {
    console.error('=== Gemini API ERROR ===');
    console.error('Error message:', error.message);
    
    // Detailed error logging
    if (error.response) {
         console.error('API Response Error:', JSON.stringify(error.response, null, 2));
    }

    if (error.message?.includes('API key')) {
      return res.status(500).json({
        error: 'ERREUR !!! CLÉ API MANQUANTE OU INVALIDE !!!!',
        details: 'Vérifiez votre GEMINI_API_KEY dans .env.local'
      });
    }

    return res.status(500).json({
      error: 'ERREUR DU SERVEUR !!! AVEZ-VOUS ESSAYÉ DE REDÉMARRER LE MODEM 56K ????',
      details: error.message || 'Unknown error',
      type: error.constructor.name || 'Error'
    });
  }
}