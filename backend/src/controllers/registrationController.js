/**
 * Registration Controller
 * Manages registration opportunities for public, students, payloads, viewing tickets, etc.
 */
const db = require('../db/database');

// GET /api/registrations
async function getAllRegistrations(req, res, next) {
  try {
    const { type, status } = req.query;
    let queryText = 'SELECT * FROM registration_opportunities WHERE 1=1';
    const params = [];

    if (type) {
      params.push(type);
      queryText += ` AND LOWER(type) = LOWER($${params.length})`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND LOWER(status) = LOWER($${params.length})`;
    }

    queryText += ' ORDER BY closing_date ASC NULLS LAST';

    const result = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/registrations/:id
async function getRegistrationById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM registration_opportunities WHERE id = $1', [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration opportunity not found'
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

// GET /api/missions/:id/registrations
async function getRegistrationsByMissionId(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM registration_opportunities WHERE mission_id = $1 ORDER BY closing_date ASC NULLS LAST', [id]);

    return res.status(200).json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/registrations
async function createRegistration(req, res, next) {
  try {
    const {
      mission_id,
      title,
      organization,
      type,
      opening_date,
      closing_date,
      eligibility,
      description,
      status,
      official_url
    } = req.body;

    if (!title || !organization || !type || !official_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, organization, type, official_url'
      });
    }

    const queryText = `
      INSERT INTO registration_opportunities (
        mission_id, title, organization, type,
        opening_date, closing_date, eligibility,
        description, status, official_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      mission_id || null,
      title,
      organization,
      type,
      opening_date || null,
      closing_date || null,
      eligibility || '',
      description || '',
      status || 'Open',
      official_url
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

// PUT /api/registrations/:id
async function updateRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;

    const existing = await db.query('SELECT * FROM registration_opportunities WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration opportunity not found'
      });
    }

    const current = existing.rows[0];
    const updated = {
      mission_id: fields.mission_id !== undefined ? fields.mission_id : current.mission_id,
      title: fields.title !== undefined ? fields.title : current.title,
      organization: fields.organization !== undefined ? fields.organization : current.organization,
      type: fields.type !== undefined ? fields.type : current.type,
      opening_date: fields.opening_date !== undefined ? fields.opening_date : current.opening_date,
      closing_date: fields.closing_date !== undefined ? fields.closing_date : current.closing_date,
      eligibility: fields.eligibility !== undefined ? fields.eligibility : current.eligibility,
      description: fields.description !== undefined ? fields.description : current.description,
      status: fields.status !== undefined ? fields.status : current.status,
      official_url: fields.official_url !== undefined ? fields.official_url : current.official_url
    };

    const queryText = `
      UPDATE registration_opportunities
      SET mission_id = $1, title = $2, organization = $3, type = $4,
          opening_date = $5, closing_date = $6, eligibility = $7,
          description = $8, status = $9, official_url = $10,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      updated.mission_id, updated.title, updated.organization, updated.type,
      updated.opening_date, updated.closing_date, updated.eligibility,
      updated.description, updated.status, updated.official_url, id
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

// DELETE /api/registrations/:id
async function deleteRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM registration_opportunities WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration opportunity not found'
      });
    }

    await db.query('DELETE FROM registration_opportunities WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Registration opportunity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  getRegistrationsByMissionId,
  createRegistration,
  updateRegistration,
  deleteRegistration
};
