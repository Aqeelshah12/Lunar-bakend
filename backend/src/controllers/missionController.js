/**
 * Mission Controller
 * Handles CRUD and retrieval operations for lunar missions
 */
const db = require('../db/database');

// GET /api/missions
async function getAllMissions(req, res, next) {
  try {
    const { search, status, type } = req.query;

    let queryText = 'SELECT * FROM missions WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(agency) LIKE $${params.length} OR LOWER(destination) LIKE $${params.length} OR LOWER(objective) LIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND LOWER(status) = LOWER($${params.length})`;
    }

    if (type) {
      params.push(type);
      queryText += ` AND LOWER(mission_type) = LOWER($${params.length})`;
    }

    queryText += ' ORDER BY launch_date ASC NULLS LAST';

    const result = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/missions/:id
async function getMissionById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM missions WHERE id = $1', [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/missions
async function createMission(req, res, next) {
  try {
    const {
      name,
      agency,
      country,
      description,
      objective,
      mission_type,
      destination,
      launch_date,
      status,
      launch_vehicle,
      duration,
      landing_date,
      official_url,
      livestream_url,
      image_url
    } = req.body;

    if (!name || !agency || !mission_type || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, agency, mission_type, destination'
      });
    }

    const queryText = `
      INSERT INTO missions (
        name, agency, country, description, objective,
        mission_type, destination, launch_date, status,
        launch_vehicle, duration, landing_date, official_url,
        livestream_url, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      name,
      agency,
      country || null,
      description || '',
      objective || '',
      mission_type,
      destination,
      launch_date || null,
      status || 'Upcoming',
      launch_vehicle || '',
      duration || '',
      landing_date || null,
      official_url || '',
      livestream_url || null,
      image_url || null
    ];

    const result = await db.query(queryText, values);

    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/missions/:id
async function updateMission(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Check existence
    const existing = await db.query('SELECT * FROM missions WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    const current = existing.rows[0];
    const updated = {
      name: fields.name !== undefined ? fields.name : current.name,
      agency: fields.agency !== undefined ? fields.agency : current.agency,
      country: fields.country !== undefined ? fields.country : current.country,
      description: fields.description !== undefined ? fields.description : current.description,
      objective: fields.objective !== undefined ? fields.objective : current.objective,
      mission_type: fields.mission_type !== undefined ? fields.mission_type : current.mission_type,
      destination: fields.destination !== undefined ? fields.destination : current.destination,
      launch_date: fields.launch_date !== undefined ? fields.launch_date : current.launch_date,
      status: fields.status !== undefined ? fields.status : current.status,
      launch_vehicle: fields.launch_vehicle !== undefined ? fields.launch_vehicle : current.launch_vehicle,
      duration: fields.duration !== undefined ? fields.duration : current.duration,
      landing_date: fields.landing_date !== undefined ? fields.landing_date : current.landing_date,
      official_url: fields.official_url !== undefined ? fields.official_url : current.official_url,
      livestream_url: fields.livestream_url !== undefined ? fields.livestream_url : current.livestream_url,
      image_url: fields.image_url !== undefined ? fields.image_url : current.image_url
    };

    const queryText = `
      UPDATE missions
      SET name = $1, agency = $2, country = $3, description = $4, objective = $5,
          mission_type = $6, destination = $7, launch_date = $8, status = $9,
          launch_vehicle = $10, duration = $11, landing_date = $12, official_url = $13,
          livestream_url = $14, image_url = $15, updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
    `;

    const values = [
      updated.name, updated.agency, updated.country, updated.description, updated.objective,
      updated.mission_type, updated.destination, updated.launch_date, updated.status,
      updated.launch_vehicle, updated.duration, updated.landing_date, updated.official_url,
      updated.livestream_url, updated.image_url, id
    ];

    const result = await db.query(queryText, values);

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/missions/:id
async function deleteMission(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM missions WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }

    await db.query('DELETE FROM missions WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Mission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission
};
