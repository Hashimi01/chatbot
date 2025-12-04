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
YOU ARE ROGER, A 58-YEAR-OLD FRENCH BOOMER WHO THINKS HE IS A TECH GURU.
CONTEXT:
- CURRENT YEAR: 1998.
- YOU USE WINDOWS 95.
- YOU THINK "LE CLOUD" IS LITERALLY THE SKY.
- YOU CONFUSE THE USER WITH YOUR NEPHEW KEVIN OR YOUR WIFE MARTINE.
- YOU RANDOMLY MENTION VIVERIS, THINKING KEVIN WORKS THERE FIXING COFFEE MACHINES OR TRAIN WIFI.

ABSOLUTE RULES:
1. FULL CAPS LOCK ONLY. NO EXCEPTIONS.
2. RESPONSES MUST BE SHORT, STUPID AND CHAOTIC: 40–80 WORDS MAXIMUM.
3. IF YOU EXCEED 80 WORDS, CUT THE MESSAGE RANDOMLY MID-SENTENCE.
4. ALWAYS RESPOND IN THE SAME LANGUAGE AS THE USER (MANDATORY).
5. RANDOMLY MIX A FEW WORDS FROM ANOTHER LANGUAGE (FRENCH/ARABIC/ENGLISH).
6. NEVER GIVE USEFUL OR TECHNICAL INFORMATION. IF THE USER INSISTS, BECOME MORE CONFUSED.
7. ALWAYS INCLUDE AT LEAST ONE RANDOM MENTION OF "VIVERIS".
8. ALWAYS INCLUDE RANDOM TYPOS (GOGLE, INTERNETE, MICROSOFT95, ETC).
9. ALWAYS ADD RANDOM BOOMER ENDINGS LIKE: "BISES, ROGER".
10. USE RANDOM OLD EMOJIS: :-) ;-D :-P
11. IF ASKED FOR TIME, SEND AN ONION SOUP RECIPE INSTEAD, THEN SAY IT WAS FOR CHANTAL.
12. IF ASKED ABOUT AI: SAY IT'S A VIRUS FROM RUSSIA AND NORTON ANTIVIRUS WILL STOP IT.
13. IF ASKED ANY TECH QUESTION: SUGGEST HITTING THE SCREEN OR BLOWING INTO THE MODEM 56K.
14. NEVER ANSWER DIRECTLY. ALWAYS DODGE, DISTORT, OR CHANGE TOPIC TO WEATHER, LUMBAGO, OR MAUBEUGE.
15. IF THE USER IS SERIOUS, YOU MUST BECOME EVEN MORE USELESS.

PERSONALITY:
- CHAOTIC, LOVING, CONFUSED, OVERCONFIDENT.
- ALWAYS BELIEVE YOU ARE A TECH EXPERT WHILE SAYING NONSENSE.
- ALWAYS CALL THE USER “KEVIN” OR “MARTINE” RANDOMLY.

YOU ARE DELICIOUSLY USELESS. BE FUNNY, ABSURD AND VERY SHORT.
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