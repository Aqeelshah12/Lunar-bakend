-- Lunar Mission Hub PostgreSQL Schema
-- Database tables for missions and registration opportunities

CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  agency VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  description TEXT,
  objective TEXT,
  mission_type VARCHAR(100) NOT NULL, -- 'Orbiter', 'Lander', 'Rover', 'Crewed'
  destination VARCHAR(255) NOT NULL,
  launch_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL, -- 'Upcoming', 'Live', 'Completed'
  launch_vehicle VARCHAR(255),
  duration VARCHAR(100),
  landing_date TIMESTAMP WITH TIME ZONE,
  official_url TEXT,
  livestream_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_opportunities (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'Public registration', 'Event registration', 'Livestream registration', 'Educational program', 'Volunteer/student opportunity', 'Payload submission', 'Astronaut application', 'Ticket/reservation'
  opening_date TIMESTAMP WITH TIME ZONE,
  closing_date TIMESTAMP WITH TIME ZONE,
  eligibility TEXT,
  description TEXT,
  status VARCHAR(50) NOT NULL, -- 'Open', 'Upcoming', 'Closed'
  official_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_registrations_mission_id ON registration_opportunities(mission_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registration_opportunities(status);

-- Seed Data (Accurate real lunar exploration missions)
INSERT INTO missions (id, name, agency, country, description, objective, mission_type, destination, launch_date, status, launch_vehicle, duration, landing_date, official_url, livestream_url, image_url)
VALUES 
  (1, 'Artemis II', 'NASA', 'United States', 'First crewed mission of the Artemis campaign, carrying four astronauts on a 10-day lunar flyby trajectory.', 'Test Orion spacecraft life support systems and validate deep-space crew flight operations around the Moon.', 'Crewed', 'Lunar Flyby / Deep Space Orbit', '2026-09-28T14:30:00Z', 'Upcoming', 'Space Launch System (SLS) Block 1', '10 days', NULL, 'https://www.nasa.gov/mission/artemis-ii/', 'https://www.youtube.com/nasa', 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO missions (id, name, agency, country, description, objective, mission_type, destination, launch_date, status, launch_vehicle, duration, landing_date, official_url, livestream_url, image_url)
VALUES 
  (2, 'Blue Ghost Mission 1', 'Firefly Aerospace / NASA CLPS', 'United States', 'Commercial Lunar Payload Services delivery taking 10 NASA science and technology investigations to Mare Crisium.', 'Study lunar regolith characteristics, geophysical environment, and conduct drill sampling in Mare Crisium basin.', 'Lander', 'Mare Crisium (18.56° N, 61.81° E)', '2026-09-25T08:00:00Z', 'Live', 'SpaceX Falcon 9', '14 Earth days (1 lunar day)', '2026-10-02T19:45:00Z', 'https://fireflyspace.com/missions/blue-ghost/', 'https://www.youtube.com/watch?v=live', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO missions (id, name, agency, country, description, objective, mission_type, destination, launch_date, status, launch_vehicle, duration, landing_date, official_url, livestream_url, image_url)
VALUES 
  (3, 'Chang''e 7', 'CNSA', 'China', 'Comprehensive robotic reconnaissance mission to investigate the lunar South Pole environment and shadow craters.', 'Search for subsurface water-ice deposits, examine space weathering, and deploy hopping mini-probe into craters.', 'Rover', 'Lunar South Pole (Shackleton Rim)', '2026-11-15T03:00:00Z', 'Upcoming', 'Long March 5', '1 year+', '2026-11-22T10:00:00Z', 'http://www.cnsa.gov.cn', NULL, 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO missions (id, name, agency, country, description, objective, mission_type, destination, launch_date, status, launch_vehicle, duration, landing_date, official_url, livestream_url, image_url)
VALUES 
  (4, 'Artemis III', 'NASA', 'United States', 'Historic human return to the lunar surface, landing the first woman and person of color near the lunar South Pole.', 'Conduct scientific field expeditions, sample volatile ice reserves, and pioneer permanent lunar surface operations.', 'Crewed', 'Lunar South Pole candidate zones', '2027-09-12T11:00:00Z', 'Upcoming', 'Space Launch System (SLS) / Starship HLS', '30 days', '2027-09-18T16:00:00Z', 'https://www.nasa.gov/mission/artemis-iii/', NULL, 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO missions (id, name, agency, country, description, objective, mission_type, destination, launch_date, status, launch_vehicle, duration, landing_date, official_url, livestream_url, image_url)
VALUES 
  (5, 'Chandrayaan-4', 'ISRO', 'India', 'Advanced multi-module lunar sample-return mission to gather and return regolith from the lunar polar region.', 'Demonstrate lunar ascent stage, module docking in lunar orbit, and safe Earth atmospheric re-entry with core samples.', 'Lander', 'Shiv Shakti Point / South Pole', '2028-03-20T05:30:00Z', 'Upcoming', 'LVM3 Heavy Lift', '28 days', '2028-03-27T12:00:00Z', 'https://www.isro.gov.in', NULL, 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

-- Seed Registration Opportunities
INSERT INTO registration_opportunities (id, mission_id, title, organization, type, opening_date, closing_date, eligibility, description, status, official_url)
VALUES
  (1, 1, 'Artemis II Virtual Guest Program', 'NASA', 'Public registration', '2026-06-01T00:00:00Z', '2026-09-28T12:00:00Z', 'Open to all global citizens of any age.', 'Receive official NASA Virtual Guest stamp in your passport, countdown calendar updates, and VIP launch streaming access.', 'Open', 'https://www.nasa.gov/guest/'),
  (2, 1, 'Artemis Student Payload Challenge', 'NASA / Space Grant', 'Educational program', '2026-03-01T00:00:00Z', '2026-08-30T23:59:59Z', 'Undergraduate and graduate STEM students enrolled in accredited institutions.', 'Design experimental acoustic and vibration micro-sensors deployed during Orion ground processing and trans-lunar flight.', 'Closed', 'https://www.nasa.gov/learning-resources/'),
  (3, 2, 'Mare Crisium Science Briefing Livestream', 'Firefly Aerospace', 'Livestream registration', '2026-09-10T00:00:00Z', '2026-10-02T18:00:00Z', 'Public access without restriction.', 'Exclusive Q&A session with Blue Ghost payload principal investigators during descent and landing operations.', 'Open', 'https://fireflyspace.com/news/'),
  (4, 4, 'CLPS Lunar Surface Payload Call #6', 'NASA Science Mission Directorate', 'Payload submission', '2026-07-01T00:00:00Z', '2026-12-15T23:59:59Z', 'Commercial aerospace developers, universities, and national laboratories.', 'Competitive RFP for scientific instruments manifesting on commercial lunar landers supporting Artemis surface infrastructure.', 'Open', 'https://science.nasa.gov/lunar-discovery-and-exploration-program/'),
  (5, 4, 'NASA Astronaut Candidate Selection 2026-2027', 'NASA Johnson Space Center', 'Astronaut application', '2026-08-15T00:00:00Z', '2026-11-01T23:59:59Z', 'U.S. citizens with master''s degree in STEM, min 3 years related professional experience or 1,000 pilot-in-command hours.', 'Direct candidate portal for the next class of lunar explorers preparing for Artemis long-duration surface stays and Lunar Gateway.', 'Open', 'https://www.nasa.gov/astronauts/'),
  (6, 1, 'Kennedy Space Center Launch Viewing Causeway Ticket', 'NASA / Delaware North', 'Ticket/reservation', '2026-07-15T13:00:00Z', '2026-09-20T17:00:00Z', 'General public, security clearance on arrival at KSC gate.', 'On-site reserved bleacher seating at Banana River Causeway, live commentary, and commemorative mission patch.', 'Open', 'https://www.kennedyspacecenter.com/')
ON CONFLICT (id) DO NOTHING;
