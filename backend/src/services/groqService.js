/**
 * Groq AI Service for Lunar Mission Hub
 * Handles communication with Groq API, prompt engineering, context injection, and error handling.
 */
const { Groq } = require('groq-sdk');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let groqClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Ask Lunar Mission Assistant with mission context
 * @param {string} userMessage - User question
 * @param {Array} missionContext - Relevant missions from PostgreSQL
 * @param {Array} registrationContext - Relevant registration opportunities from PostgreSQL
 * @returns {Promise<string>}
 */
async function generateLunarResponse(userMessage, missionContext = [], registrationContext = []) {
  const client = getGroqClient();

  if (!client) {
    throw new Error('GROQ_API_KEY is not configured on the server.');
  }

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  // Build targeted system instructions
  let systemPrompt = `You are the Lunar Mission Hub AI Assistant — a specialized, highly accurate aerospace intelligence advisor for lunar exploration.

ROLE & CAPABILITIES:
- Provide clear, empirical answers regarding lunar missions, space agencies, destinations, payloads, launch vehicles, mission timelines, and registration programs.
- You must strictly distinguish between verified database records from the Lunar Mission Hub database and general spaceflight knowledge.
- DO NOT invent or hallucinate mission dates, registration deadlines, URLs, or crew assignments.
- If specific database records are provided below, prioritize them as the ground truth.
- Maintain an authoritative, modern, and inspiring tone appropriate for space exploration.
- STRICT RULE: NEVER mention the words "Groq" or "PostgreSQL" in your output under any circumstances. Refer to yourself only as the Lunar Mission Hub Assistant and your data source as the Verified Lunar Mission Database.`;

  if (missionContext && missionContext.length > 0) {
    systemPrompt += `\n\n[VERIFIED DATABASE MISSIONS]:\n${JSON.stringify(
      missionContext.map(m => ({
        name: m.name,
        agency: m.agency,
        country: m.country,
        objective: m.objective,
        mission_type: m.mission_type,
        destination: m.destination,
        launch_date: m.launch_date,
        landing_date: m.landing_date,
        status: m.status,
        launch_vehicle: m.launch_vehicle,
        duration: m.duration,
        official_url: m.official_url
      })),
      null,
      2
    )}`;
  }

  if (registrationContext && registrationContext.length > 0) {
    systemPrompt += `\n\n[VERIFIED REGISTRATION OPPORTUNITIES]:\n${JSON.stringify(
      registrationContext.map(r => ({
        title: r.title,
        mission_id: r.mission_id,
        organization: r.organization,
        type: r.type,
        opening_date: r.opening_date,
        closing_date: r.closing_date,
        eligibility: r.eligibility,
        description: r.description,
        status: r.status,
        official_url: r.official_url
      })),
      null,
      2
    )}`;
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      model: model,
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.95
    });

    const reply = chatCompletion.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Empty response received from Groq AI.');
    }

    return reply;
  } catch (error) {
    console.error('Groq API invocation error:', error.message);
    
    // Categorize errors without exposing sensitive credentials
    if (error.status === 401 || error.message.includes('401')) {
      throw new Error('Authentication failure: AI service key is invalid or unauthorized.');
    }
    if (error.status === 429 || error.message.includes('rate limit')) {
      throw new Error('Rate limit exceeded on AI service. Please retry in a moment.');
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Network timeout connecting to AI service.');
    }
    
    throw new Error('AI service temporarily unavailable');
  }
}

module.exports = {
  generateLunarResponse,
  getGroqClient
};
