/**
 * AI Controller
 * Manages chat interactions with the Groq-powered Lunar Mission Assistant
 */
const db = require('../db/database');
const groqService = require('../services/groqService');

// POST /api/ai/chat
async function handleChat(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'A valid "message" string is required in the request body.'
      });
    }

    const trimmedMsg = message.trim();
    const lowerMsg = trimmedMsg.toLowerCase();

    // 1. Database-aware contextual retrieval:
    // Identify if specific missions or terms are mentioned
    let missionContext = [];
    let registrationContext = [];

    // Fetch all missions to see if any names or agencies are targeted
    const allMissionsRes = await db.query('SELECT * FROM missions ORDER BY launch_date ASC');
    const allMissions = allMissionsRes.rows || [];

    // Filter relevant missions: name, agency, or destination match
    const targetedMissions = allMissions.filter(m => {
      const nameMatch = lowerMsg.includes(m.name.toLowerCase());
      const agencyMatch = lowerMsg.includes(m.agency.toLowerCase());
      const typeMatch = lowerMsg.includes(m.mission_type.toLowerCase());
      const destMatch = lowerMsg.includes(m.destination.toLowerCase());
      return nameMatch || agencyMatch || typeMatch || destMatch;
    });

    if (targetedMissions.length > 0) {
      missionContext = targetedMissions.slice(0, 3);
      // Fetch registrations linked to these missions
      for (const m of missionContext) {
        const regsRes = await db.query('SELECT * FROM registration_opportunities WHERE mission_id = $1', [m.id]);
        if (regsRes.rows && regsRes.rows.length > 0) {
          registrationContext.push(...regsRes.rows);
        }
      }
    } else if (lowerMsg.includes('register') || lowerMsg.includes('apply') || lowerMsg.includes('opportunity') || lowerMsg.includes('ticket')) {
      // General registration query: attach open registrations
      const regsRes = await db.query("SELECT * FROM registration_opportunities WHERE status = 'Open' LIMIT 5");
      registrationContext = regsRes.rows || [];
    } else {
      // General inquiry: supply compact upcoming missions summary
      missionContext = allMissions.slice(0, 4);
    }

    // 2. Invoke Groq service with isolated context
    const aiResponse = await groqService.generateLunarResponse(
      trimmedMsg,
      missionContext,
      registrationContext
    );

    return res.status(200).json({
      success: true,
      message: aiResponse
    });
  } catch (error) {
    console.error('AI chat endpoint error:', error.message);

    // Return clean JSON without exposing sensitive details
    return res.status(500).json({
      success: false,
      error: error.message || 'AI service temporarily unavailable'
    });
  }
}

module.exports = {
  handleChat
};
