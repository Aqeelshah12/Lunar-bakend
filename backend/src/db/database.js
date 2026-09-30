/**
 * Database connection module using 'pg' (node-postgres)
 * Manages PostgreSQL connection pool and queries.
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let pool = null;
let isConnected = false;

// Fallback in-memory dataset if PostgreSQL is not yet configured or temporarily offline
const memoryStore = {
  missions: [
    {
      id: 1,
      name: 'Artemis II',
      agency: 'NASA',
      country: 'United States',
      description: 'First crewed mission of the Artemis campaign, carrying four astronauts on a 10-day lunar flyby trajectory.',
      objective: 'Test Orion spacecraft life support systems and validate deep-space crew flight operations around the Moon.',
      mission_type: 'Crewed',
      destination: 'Lunar Flyby / Deep Space Orbit',
      launch_date: '2026-09-28T14:30:00Z',
      status: 'Upcoming',
      launch_vehicle: 'Space Launch System (SLS) Block 1',
      duration: '10 days',
      landing_date: null,
      official_url: 'https://www.nasa.gov/mission/artemis-ii/',
      livestream_url: 'https://www.youtube.com/nasa',
      image_url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Blue Ghost Mission 1',
      agency: 'Firefly Aerospace / NASA CLPS',
      country: 'United States',
      description: 'Commercial Lunar Payload Services delivery taking 10 NASA science and technology investigations to Mare Crisium.',
      objective: 'Study lunar regolith characteristics, geophysical environment, and conduct drill sampling in Mare Crisium basin.',
      mission_type: 'Lander',
      destination: 'Mare Crisium (18.56° N, 61.81° E)',
      launch_date: '2026-09-25T08:00:00Z',
      status: 'Live',
      launch_vehicle: 'Space Launch System / Falcon 9',
      duration: '14 Earth days (1 lunar day)',
      landing_date: '2026-10-02T19:45:00Z',
      official_url: 'https://fireflyspace.com/missions/blue-ghost/',
      livestream_url: 'https://www.youtube.com/watch?v=live',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Chang\'e 7',
      agency: 'CNSA',
      country: 'China',
      description: 'Comprehensive robotic reconnaissance mission to investigate the lunar South Pole environment and shadow craters.',
      objective: 'Search for subsurface water-ice deposits, examine space weathering, and deploy hopping mini-probe into craters.',
      mission_type: 'Rover',
      destination: 'Lunar South Pole (Shackleton Rim)',
      launch_date: '2026-11-15T03:00:00Z',
      status: 'Upcoming',
      launch_vehicle: 'Long March 5',
      duration: '1 year+',
      landing_date: '2026-11-22T10:00:00Z',
      official_url: 'http://www.cnsa.gov.cn',
      livestream_url: null,
      image_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Artemis III',
      agency: 'NASA',
      country: 'United States',
      description: 'Historic human return to the lunar surface, landing the first woman and person of color near the lunar South Pole.',
      objective: 'Conduct scientific field expeditions, sample volatile ice reserves, and pioneer permanent lunar surface operations.',
      mission_type: 'Crewed',
      destination: 'Lunar South Pole candidate zones',
      launch_date: '2027-09-12T11:00:00Z',
      status: 'Upcoming',
      launch_vehicle: 'Space Launch System (SLS) / Starship HLS',
      duration: '30 days',
      landing_date: '2027-09-18T16:00:00Z',
      official_url: 'https://www.nasa.gov/mission/artemis-iii/',
      livestream_url: null,
      image_url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Chandrayaan-4',
      agency: 'ISRO',
      country: 'India',
      description: 'Advanced multi-module lunar sample-return mission to gather and return regolith from the lunar polar region.',
      objective: 'Demonstrate lunar ascent stage, module docking in lunar orbit, and safe Earth atmospheric re-entry with core samples.',
      mission_type: 'Lander',
      destination: 'Shiv Shakti Point / South Pole',
      launch_date: '2028-03-20T05:30:00Z',
      status: 'Upcoming',
      launch_vehicle: 'LVM3 Heavy Lift',
      duration: '28 days',
      landing_date: '2028-03-27T12:00:00Z',
      official_url: 'https://www.isro.gov.in',
      livestream_url: null,
      image_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  registrations: [
    {
      id: 1,
      mission_id: 1,
      title: 'Artemis II Virtual Guest Program',
      organization: 'NASA',
      type: 'Public registration',
      opening_date: '2026-06-01T00:00:00Z',
      closing_date: '2026-09-28T12:00:00Z',
      eligibility: 'Open to all global citizens of any age.',
      description: 'Receive official NASA Virtual Guest stamp in your passport, countdown calendar updates, and VIP launch streaming access.',
      status: 'Open',
      official_url: 'https://www.nasa.gov/guest/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      mission_id: 1,
      title: 'Artemis Student Payload Challenge',
      organization: 'NASA / Space Grant',
      type: 'Educational program',
      opening_date: '2026-03-01T00:00:00Z',
      closing_date: '2026-08-30T23:59:59Z',
      eligibility: 'Undergraduate and graduate STEM students enrolled in accredited institutions.',
      description: 'Design experimental acoustic and vibration micro-sensors deployed during Orion ground processing and trans-lunar flight.',
      status: 'Closed',
      official_url: 'https://www.nasa.gov/learning-resources/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      mission_id: 2,
      title: 'Mare Crisium Science Briefing Livestream',
      organization: 'Firefly Aerospace',
      type: 'Livestream registration',
      opening_date: '2026-09-10T00:00:00Z',
      closing_date: '2026-10-02T18:00:00Z',
      eligibility: 'Public access without restriction.',
      description: 'Exclusive Q&A session with Blue Ghost payload principal investigators during descent and landing operations.',
      status: 'Open',
      official_url: 'https://fireflyspace.com/news/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      mission_id: 4,
      title: 'CLPS Lunar Surface Payload Call #6',
      organization: 'NASA Science Mission Directorate',
      type: 'Payload submission',
      opening_date: '2026-07-01T00:00:00Z',
      closing_date: '2026-12-15T23:59:59Z',
      eligibility: 'Commercial aerospace developers, universities, and national laboratories.',
      description: 'Competitive RFP for scientific instruments manifesting on commercial lunar landers supporting Artemis surface infrastructure.',
      status: 'Open',
      official_url: 'https://science.nasa.gov/lunar-discovery-and-exploration-program/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      mission_id: 4,
      title: 'NASA Astronaut Candidate Selection 2026-2027',
      organization: 'NASA Johnson Space Center',
      type: 'Astronaut application',
      opening_date: '2026-08-15T00:00:00Z',
      closing_date: '2026-11-01T23:59:59Z',
      eligibility: 'U.S. citizens with master\'s degree in STEM, min 3 years related professional experience or 1,000 pilot-in-command hours.',
      description: 'Direct candidate portal for the next class of lunar explorers preparing for Artemis long-duration surface stays and Lunar Gateway.',
      status: 'Open',
      official_url: 'https://www.nasa.gov/astronauts/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 6,
      mission_id: 1,
      title: 'Kennedy Space Center Launch Viewing Causeway Ticket',
      organization: 'NASA / Delaware North',
      type: 'Ticket/reservation',
      opening_date: '2026-07-15T13:00:00Z',
      closing_date: '2026-09-20T17:00:00Z',
      eligibility: 'General public, security clearance on arrival at KSC gate.',
      description: 'On-site reserved bleacher seating at Banana River Causeway, live commentary, and commemorative mission patch.',
      status: 'Open',
      official_url: 'https://www.kennedyspacecenter.com/',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.trim().length > 0) {
    try {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
      });

      pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error:', err.message);
      });

      console.log('PostgreSQL Pool initialized with DATABASE_URL.');
      isConnected = true;
    } catch (err) {
      console.warn('PostgreSQL initialization warning:', err.message);
      pool = null;
      isConnected = false;
    }
  } else {
    console.log('DATABASE_URL is not set. Operating in memory database mode with seed lunar data.');
  }
}

initDatabase();

/**
 * Execute parameterized query with PostgreSQL or fallback in-memory handler
 */
async function query(text, params = []) {
  if (pool) {
    try {
      return await pool.query(text, params);
    } catch (dbError) {
      console.warn(`PostgreSQL query error: ${dbError.message}. Using dataset fallback.`);
    }
  }

  // Memory fallback query engine
  const clean = text.trim().toLowerCase();
  
  if (clean.startsWith('select') && clean.includes('from missions')) {
    if (clean.includes('where id = $1')) {
      const id = parseInt(params[0], 10);
      const mission = memoryStore.missions.find(m => m.id === id);
      return { rows: mission ? [mission] : [] };
    }
    if (clean.includes('where')) {
      // General search/filter
      const term = params[0] ? String(params[0]).replace(/%/g, '').toLowerCase() : '';
      const filtered = memoryStore.missions.filter(m => 
        !term || 
        m.name.toLowerCase().includes(term) ||
        m.agency.toLowerCase().includes(term) ||
        m.destination.toLowerCase().includes(term) ||
        m.objective.toLowerCase().includes(term)
      );
      return { rows: filtered };
    }
    return { rows: [...memoryStore.missions] };
  }

  if (clean.startsWith('select') && clean.includes('from registration_opportunities')) {
    if (clean.includes('where id = $1')) {
      const id = parseInt(params[0], 10);
      const reg = memoryStore.registrations.find(r => r.id === id);
      return { rows: reg ? [reg] : [] };
    }
    if (clean.includes('where mission_id = $1')) {
      const missionId = parseInt(params[0], 10);
      const regs = memoryStore.registrations.filter(r => r.mission_id === missionId);
      return { rows: regs };
    }
    return { rows: [...memoryStore.registrations] };
  }

  if (clean.startsWith('insert into missions')) {
    const newId = memoryStore.missions.length + 1;
    const newMission = {
      id: newId,
      name: params[0] || 'New Mission',
      agency: params[1] || 'Space Agency',
      country: params[2] || '',
      description: params[3] || '',
      objective: params[4] || '',
      mission_type: params[5] || 'Orbiter',
      destination: params[6] || 'Moon',
      launch_date: params[7] || null,
      status: params[8] || 'Upcoming',
      launch_vehicle: params[9] || '',
      duration: params[10] || '',
      official_url: params[11] || '',
      livestream_url: params[12] || '',
      image_url: params[13] || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.missions.push(newMission);
    return { rows: [newMission] };
  }

  if (clean.startsWith('insert into registration_opportunities')) {
    const newId = memoryStore.registrations.length + 1;
    const newReg = {
      id: newId,
      mission_id: params[0],
      title: params[1],
      organization: params[2],
      type: params[3],
      opening_date: params[4] || null,
      closing_date: params[5] || null,
      eligibility: params[6] || '',
      description: params[7] || '',
      status: params[8] || 'Open',
      official_url: params[9] || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.registrations.push(newReg);
    return { rows: [newReg] };
  }

  return { rows: [] };
}

module.exports = {
  query,
  pool,
  memoryStore,
  getPool: () => pool
};
