-- ============================================================================
-- LearnPath Seed Data
-- Run this AFTER schema.sql to populate the database for testing
-- ============================================================================

-- ============================================================================
-- 1. USERS (10 users)
-- ============================================================================
INSERT INTO users (id, email, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'alice@example.com', 'Alice Johnson'),
  ('a0000000-0000-0000-0000-000000000002', 'bob@example.com', 'Bob Martinez'),
  ('a0000000-0000-0000-0000-000000000003', 'carol@example.com', 'Carol Chen'),
  ('a0000000-0000-0000-0000-000000000004', 'david@example.com', 'David Kim'),
  ('a0000000-0000-0000-0000-000000000005', 'emma@example.com', 'Emma Wilson'),
  ('a0000000-0000-0000-0000-000000000006', 'frank@example.com', 'Frank Brown'),
  ('a0000000-0000-0000-0000-000000000007', 'grace@example.com', 'Grace Lee'),
  ('a0000000-0000-0000-0000-000000000008', 'henry@example.com', 'Henry Taylor'),
  ('a0000000-0000-0000-0000-000000000009', 'ivy@example.com', 'Ivy Patel'),
  ('a0000000-0000-0000-0000-000000000010', 'jack@example.com', 'Jack Davis')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 2. LEARNING PATHS (12 paths across different categories)
-- ============================================================================

-- Get category IDs
DO $$
DECLARE
  cat_tech UUID;
  cat_music UUID;
  cat_arts UUID;
  cat_languages UUID;
  cat_business UUID;
  cat_fitness UUID;
  cat_writing UUID;
  cat_science UUID;

  path_python UUID;
  path_guitar UUID;
  path_watercolor UUID;
  path_french UUID;
  path_startup UUID;
  path_yoga UUID;
  path_fiction UUID;
  path_react UUID;
  path_photo UUID;
  path_ml UUID;
  path_piano UUID;
  path_physics UUID;

  -- Node IDs for Python path
  node_py1 UUID; node_py2 UUID; node_py3 UUID; node_py4 UUID; node_py5 UUID;
  node_py6 UUID; node_py7 UUID; node_py8 UUID;
  -- Node IDs for Guitar path
  node_gt1 UUID; node_gt2 UUID; node_gt3 UUID; node_gt4 UUID; node_gt5 UUID; node_gt6 UUID;
  -- Node IDs for React path
  node_rc1 UUID; node_rc2 UUID; node_rc3 UUID; node_rc4 UUID; node_rc5 UUID; node_rc6 UUID;
  -- Node IDs for French path
  node_fr1 UUID; node_fr2 UUID; node_fr3 UUID; node_fr4 UUID; node_fr5 UUID;
  -- Node IDs for Watercolor path
  node_wc1 UUID; node_wc2 UUID; node_wc3 UUID; node_wc4 UUID; node_wc5 UUID;
  -- Node IDs for Startup path
  node_su1 UUID; node_su2 UUID; node_su3 UUID; node_su4 UUID; node_su5 UUID;

BEGIN
  SELECT id INTO cat_tech FROM categories WHERE slug = 'technology';
  SELECT id INTO cat_music FROM categories WHERE slug = 'music';
  SELECT id INTO cat_arts FROM categories WHERE slug = 'visual-arts';
  SELECT id INTO cat_languages FROM categories WHERE slug = 'languages';
  SELECT id INTO cat_business FROM categories WHERE slug = 'business';
  SELECT id INTO cat_fitness FROM categories WHERE slug = 'health-fitness';
  SELECT id INTO cat_writing FROM categories WHERE slug = 'writing';
  SELECT id INTO cat_science FROM categories WHERE slug = 'science-math';

  -- Path 1: Python for Data Science (Alice)
  path_python := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_python, 'a0000000-0000-0000-0000-000000000001', cat_tech,
    'Python for Data Science', 'Master Python from basics to data science applications', 'Python Data Science',
    'beginner', 40, TRUE);

  -- Python nodes
  node_py1 := uuid_generate_v4();
  node_py2 := uuid_generate_v4();
  node_py3 := uuid_generate_v4();
  node_py4 := uuid_generate_v4();
  node_py5 := uuid_generate_v4();
  node_py6 := uuid_generate_v4();
  node_py7 := uuid_generate_v4();
  node_py8 := uuid_generate_v4();

  INSERT INTO learning_nodes (id, path_id, title, description, node_type, difficulty, estimated_hours, order_index, prerequisites, key_takeaways, practical_exercises) VALUES
    (node_py1, path_python, 'Python Basics', 'Variables, data types, and control flow', 'foundation', 1, 4, 1, '[]', '["Understand variables and types", "Write conditional statements", "Use loops effectively"]', '["Write a number guessing game", "Create a simple calculator"]'),
    (node_py2, path_python, 'Functions & Modules', 'Define functions and organize code', 'concept', 2, 4, 2, '[]', '["Create reusable functions", "Import and use modules", "Handle errors with try/except"]', '["Build a password generator", "Create a file organizer script"]'),
    (node_py3, path_python, 'Data Structures', 'Lists, dictionaries, sets, and tuples', 'concept', 2, 5, 3, '[]', '["Use lists and list comprehensions", "Work with dictionaries", "Choose the right data structure"]', '["Implement a contact book", "Build a word frequency counter"]'),
    (node_py4, path_python, 'NumPy Fundamentals', 'Numerical computing with NumPy arrays', 'skill', 3, 5, 4, '[]', '["Create and manipulate arrays", "Perform vectorized operations", "Use broadcasting"]', '["Analyze a dataset with NumPy", "Implement basic linear algebra"]'),
    (node_py5, path_python, 'Pandas for Data Analysis', 'Data manipulation and analysis with Pandas', 'skill', 3, 6, 5, '[]', '["Load and clean data", "Filter and transform DataFrames", "Group and aggregate data"]', '["Clean a messy CSV dataset", "Analyze sales data"]'),
    (node_py6, path_python, 'Data Visualization', 'Create plots with Matplotlib and Seaborn', 'skill', 3, 5, 6, '[]', '["Create various plot types", "Customize plot aesthetics", "Tell stories with data"]', '["Create a dashboard of charts", "Visualize COVID data trends"]'),
    (node_py7, path_python, 'Machine Learning Intro', 'Basic ML concepts with scikit-learn', 'concept', 4, 6, 7, '[]', '["Understand supervised vs unsupervised learning", "Train and evaluate models", "Avoid overfitting"]', '["Build a spam classifier", "Predict house prices"]'),
    (node_py8, path_python, 'Capstone Project', 'End-to-end data science project', 'project', 4, 5, 8, '[]', '["Plan a data science project", "Present findings effectively", "Deploy a simple model"]', '["Complete an end-to-end analysis on a real dataset"]');

  -- Python resources
  INSERT INTO resources (node_id, title, url, resource_type, platform, is_free, estimated_duration, difficulty_level, description) VALUES
    (node_py1, 'Python for Everybody', 'https://www.py4e.com/', 'course', 'Coursera', TRUE, 600, 'beginner', 'Comprehensive intro to Python programming'),
    (node_py1, 'Automate the Boring Stuff', 'https://automatetheboringstuff.com/', 'book', 'Online', TRUE, NULL, 'beginner', 'Practical Python programming for beginners'),
    (node_py2, 'Python Functions Tutorial', 'https://realpython.com/defining-your-own-python-function/', 'article', 'Real Python', TRUE, 30, 'beginner', 'In-depth guide to Python functions'),
    (node_py3, 'Python Data Structures', 'https://docs.python.org/3/tutorial/datastructures.html', 'documentation', 'Python Docs', TRUE, 45, 'intermediate', 'Official Python data structures tutorial'),
    (node_py4, 'NumPy Quickstart', 'https://numpy.org/doc/stable/user/quickstart.html', 'documentation', 'NumPy', TRUE, 60, 'intermediate', 'Official NumPy getting started guide'),
    (node_py5, 'Pandas Getting Started', 'https://pandas.pydata.org/docs/getting_started/index.html', 'documentation', 'Pandas', TRUE, 90, 'intermediate', 'Official Pandas tutorials'),
    (node_py5, '10 Minutes to Pandas', 'https://pandas.pydata.org/docs/user_guide/10min.html', 'article', 'Pandas', TRUE, 15, 'intermediate', 'Quick overview of Pandas features'),
    (node_py6, 'Matplotlib Tutorials', 'https://matplotlib.org/stable/tutorials/index.html', 'documentation', 'Matplotlib', TRUE, 60, 'intermediate', 'Official plotting tutorials'),
    (node_py7, 'Intro to ML with scikit-learn', 'https://scikit-learn.org/stable/tutorial/basic/tutorial.html', 'documentation', 'scikit-learn', TRUE, 45, 'advanced', 'ML basics with scikit-learn');

  -- Python prerequisites (edges stored via node prerequisites JSONB)
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py1::text)::jsonb WHERE id = node_py2;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py1::text)::jsonb WHERE id = node_py3;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py2::text, node_py3::text)::jsonb WHERE id = node_py4;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py4::text)::jsonb WHERE id = node_py5;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py5::text)::jsonb WHERE id = node_py6;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py5::text)::jsonb WHERE id = node_py7;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_py6::text, node_py7::text)::jsonb WHERE id = node_py8;

  -- Path 2: Beginner Guitar (Bob)
  path_guitar := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_guitar, 'a0000000-0000-0000-0000-000000000002', cat_music,
    'Beginner Guitar Mastery', 'From zero to playing your first songs', 'Guitar',
    'beginner', 30, TRUE);

  node_gt1 := uuid_generate_v4();
  node_gt2 := uuid_generate_v4();
  node_gt3 := uuid_generate_v4();
  node_gt4 := uuid_generate_v4();
  node_gt5 := uuid_generate_v4();
  node_gt6 := uuid_generate_v4();

  INSERT INTO learning_nodes (id, path_id, title, description, node_type, difficulty, estimated_hours, order_index, prerequisites, key_takeaways, practical_exercises) VALUES
    (node_gt1, path_guitar, 'Guitar Anatomy & Setup', 'Learn the parts of the guitar and how to tune it', 'foundation', 1, 2, 1, '[]', '["Name all guitar parts", "Tune using a digital tuner", "Hold the guitar correctly"]', '["Tune your guitar 5 times", "Practice proper posture for 10 minutes"]'),
    (node_gt2, path_guitar, 'Basic Chords', 'Learn your first open chords: G, C, D, Em, Am', 'skill', 2, 6, 2, '[]', '["Play 5 open chords cleanly", "Switch between chords smoothly", "Develop finger strength"]', '["Practice each chord for 5 minutes daily", "Play G-C-D progression"]'),
    (node_gt3, path_guitar, 'Strumming Patterns', 'Master essential strumming rhythms', 'technique', 2, 5, 3, '[]', '["Play 4 strumming patterns", "Keep steady tempo", "Use a metronome"]', '["Strum along to 3 simple songs", "Practice with metronome at different tempos"]'),
    (node_gt4, path_guitar, 'Your First Songs', 'Play complete beginner songs', 'practice', 3, 8, 4, '[]', '["Play 3 complete songs", "Sing and play simultaneously", "Perform for someone"]', '["Learn Wonderwall", "Learn Horse With No Name", "Learn Knockin on Heavens Door"]'),
    (node_gt5, path_guitar, 'Fingerpicking Basics', 'Introduction to fingerstyle playing', 'technique', 3, 5, 5, '[]', '["Play basic fingerpicking patterns", "Coordinate thumb and fingers", "Play a fingerstyle piece"]', '["Practice Travis picking", "Learn Dust in the Wind intro"]'),
    (node_gt6, path_guitar, 'Music Theory for Guitar', 'Understand the notes and scales on the fretboard', 'theory', 3, 4, 6, '[]', '["Name notes on first 5 frets", "Play major and minor scales", "Understand chord construction"]', '["Map out the C major scale", "Build chords from scale degrees"]');

  UPDATE learning_nodes SET prerequisites = json_build_array(node_gt1::text)::jsonb WHERE id = node_gt2;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_gt1::text)::jsonb WHERE id = node_gt3;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_gt2::text, node_gt3::text)::jsonb WHERE id = node_gt4;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_gt2::text)::jsonb WHERE id = node_gt5;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_gt2::text)::jsonb WHERE id = node_gt6;

  INSERT INTO resources (node_id, title, url, resource_type, platform, is_free, estimated_duration, difficulty_level, description) VALUES
    (node_gt1, 'Guitar Basics for Beginners', 'https://www.justinguitar.com/categories/beginner-guitar-course', 'course', 'JustinGuitar', TRUE, 120, 'beginner', 'Free comprehensive beginner course'),
    (node_gt2, 'How to Play Open Chords', 'https://www.youtube.com/watch?v=BSKTSwBRs7g', 'video', 'YouTube', TRUE, 15, 'beginner', 'Visual guide to basic open chords'),
    (node_gt3, 'Strumming 101', 'https://www.youtube.com/watch?v=DrlF4Tc8qC8', 'video', 'YouTube', TRUE, 12, 'beginner', 'Essential strumming patterns for beginners'),
    (node_gt4, 'Ultimate Guitar Tabs', 'https://www.ultimate-guitar.com/', 'tool', 'Ultimate Guitar', TRUE, NULL, 'beginner', 'Guitar tabs and chords for thousands of songs');

  -- Path 3: React Development (Carol)
  path_react := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_react, 'a0000000-0000-0000-0000-000000000003', cat_tech,
    'Modern React Development', 'Build production-ready React applications', 'React',
    'intermediate', 35, TRUE);

  node_rc1 := uuid_generate_v4();
  node_rc2 := uuid_generate_v4();
  node_rc3 := uuid_generate_v4();
  node_rc4 := uuid_generate_v4();
  node_rc5 := uuid_generate_v4();
  node_rc6 := uuid_generate_v4();

  INSERT INTO learning_nodes (id, path_id, title, description, node_type, difficulty, estimated_hours, order_index, prerequisites, key_takeaways, practical_exercises) VALUES
    (node_rc1, path_react, 'React Fundamentals', 'Components, JSX, and props', 'foundation', 2, 5, 1, '[]', '["Create functional components", "Use JSX syntax", "Pass and use props"]', '["Build a profile card component", "Create a todo list UI"]'),
    (node_rc2, path_react, 'State & Hooks', 'useState, useEffect, and custom hooks', 'concept', 3, 6, 2, '[]', '["Manage state with useState", "Handle side effects with useEffect", "Create custom hooks"]', '["Build a counter with useState", "Fetch data with useEffect"]'),
    (node_rc3, path_react, 'Routing & Navigation', 'Client-side routing with React Router', 'skill', 3, 4, 3, '[]', '["Set up React Router", "Create nested routes", "Handle route parameters"]', '["Build a multi-page app with navigation"]'),
    (node_rc4, path_react, 'State Management', 'Context API and Zustand', 'concept', 4, 5, 4, '[]', '["Use Context API for global state", "Implement Zustand stores", "Choose the right state solution"]', '["Build a shopping cart with global state"]'),
    (node_rc5, path_react, 'API Integration', 'Fetching data and handling async operations', 'skill', 3, 5, 5, '[]', '["Fetch data from REST APIs", "Handle loading and error states", "Implement optimistic updates"]', '["Build a dashboard with real API data"]'),
    (node_rc6, path_react, 'Full Stack Project', 'Build a complete React application', 'project', 4, 10, 6, '[]', '["Plan and architect a React app", "Implement authentication", "Deploy to production"]', '["Build and deploy a full-stack blog platform"]');

  UPDATE learning_nodes SET prerequisites = json_build_array(node_rc1::text)::jsonb WHERE id = node_rc2;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_rc1::text)::jsonb WHERE id = node_rc3;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_rc2::text)::jsonb WHERE id = node_rc4;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_rc2::text)::jsonb WHERE id = node_rc5;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_rc3::text, node_rc4::text, node_rc5::text)::jsonb WHERE id = node_rc6;

  INSERT INTO resources (node_id, title, url, resource_type, platform, is_free, estimated_duration, difficulty_level, description) VALUES
    (node_rc1, 'React Official Tutorial', 'https://react.dev/learn', 'documentation', 'React', TRUE, 120, 'beginner', 'Official React getting started guide'),
    (node_rc2, 'React Hooks Explained', 'https://react.dev/reference/react', 'documentation', 'React', TRUE, 60, 'intermediate', 'Complete hooks reference'),
    (node_rc4, 'Zustand Documentation', 'https://zustand-demo.pmnd.rs/', 'documentation', 'Zustand', TRUE, 30, 'intermediate', 'Simple state management for React');

  -- Path 4: Conversational French (David)
  path_french := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_french, 'a0000000-0000-0000-0000-000000000004', cat_languages,
    'Conversational French in 6 Months', 'Go from zero to having basic conversations in French', 'French',
    'beginner', 50, TRUE);

  node_fr1 := uuid_generate_v4();
  node_fr2 := uuid_generate_v4();
  node_fr3 := uuid_generate_v4();
  node_fr4 := uuid_generate_v4();
  node_fr5 := uuid_generate_v4();

  INSERT INTO learning_nodes (id, path_id, title, description, node_type, difficulty, estimated_hours, order_index, prerequisites, key_takeaways, practical_exercises) VALUES
    (node_fr1, path_french, 'French Pronunciation', 'Master the sounds of French', 'foundation', 2, 8, 1, '[]', '["Pronounce all French vowels", "Master nasal sounds", "Read French phonetically"]', '["Practice with tongue twisters", "Shadow native speakers for 10 min daily"]'),
    (node_fr2, path_french, 'Essential Grammar', 'Basic sentence structure and verb conjugation', 'theory', 3, 12, 2, '[]', '["Conjugate present tense verbs", "Use articles correctly", "Form questions"]', '["Write 10 sentences daily", "Conjugation drills"]'),
    (node_fr3, path_french, 'Everyday Vocabulary', '500 most common words and phrases', 'skill', 2, 10, 3, '[]', '["Know 500 common words", "Introduce yourself fluently", "Order food in French"]', '["Learn 10 new words daily", "Label objects in your house"]'),
    (node_fr4, path_french, 'Listening Comprehension', 'Understand native French speakers', 'practice', 3, 10, 4, '[]', '["Understand slow native speech", "Follow simple TV shows", "Catch key words in conversations"]', '["Watch one French video daily", "Listen to French podcasts while commuting"]'),
    (node_fr5, path_french, 'Speaking Practice', 'Have your first French conversations', 'performance', 4, 10, 5, '[]', '["Hold a 5-minute conversation", "Describe your daily routine", "Express opinions simply"]', '["Find a language exchange partner", "Record yourself speaking and review"]');

  UPDATE learning_nodes SET prerequisites = json_build_array(node_fr1::text)::jsonb WHERE id = node_fr2;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_fr1::text)::jsonb WHERE id = node_fr3;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_fr2::text, node_fr3::text)::jsonb WHERE id = node_fr4;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_fr3::text, node_fr4::text)::jsonb WHERE id = node_fr5;

  INSERT INTO resources (node_id, title, url, resource_type, platform, is_free, estimated_duration, difficulty_level, description) VALUES
    (node_fr1, 'French Pronunciation Guide', 'https://www.youtube.com/watch?v=soeJnBb50ks', 'video', 'YouTube', TRUE, 20, 'beginner', 'Complete French pronunciation overview'),
    (node_fr2, 'Duolingo French', 'https://www.duolingo.com/course/fr/en/Learn-French', 'app', 'Duolingo', TRUE, NULL, 'beginner', 'Gamified French learning'),
    (node_fr3, 'Anki French Vocabulary', 'https://ankiweb.net/shared/decks?search=french', 'app', 'Anki', TRUE, NULL, 'beginner', 'Spaced repetition flashcards'),
    (node_fr4, 'InnerFrench Podcast', 'https://innerfrench.com/', 'podcast', 'InnerFrench', TRUE, 20, 'intermediate', 'French podcast for intermediate learners');

  -- Path 5: Watercolor Painting (Emma)
  path_watercolor := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_watercolor, 'a0000000-0000-0000-0000-000000000005', cat_arts,
    'Watercolor Painting for Beginners', 'Learn watercolor techniques from basics to beautiful paintings', 'Watercolor Painting',
    'beginner', 25, TRUE);

  node_wc1 := uuid_generate_v4();
  node_wc2 := uuid_generate_v4();
  node_wc3 := uuid_generate_v4();
  node_wc4 := uuid_generate_v4();
  node_wc5 := uuid_generate_v4();

  INSERT INTO learning_nodes (id, path_id, title, description, node_type, difficulty, estimated_hours, order_index, prerequisites, key_takeaways, practical_exercises) VALUES
    (node_wc1, path_watercolor, 'Materials & Color Theory', 'Choose supplies and understand color mixing', 'foundation', 1, 3, 1, '[]', '["Select quality beginner supplies", "Mix primary colors", "Create a color wheel"]', '["Create a swatch chart", "Mix 12 secondary and tertiary colors"]'),
    (node_wc2, path_watercolor, 'Basic Techniques', 'Wet-on-wet, wet-on-dry, and washes', 'technique', 2, 5, 2, '[]', '["Apply flat and graded washes", "Control water-to-paint ratio", "Use wet-on-wet for soft effects"]', '["Paint gradient washes", "Practice blooms and textures"]'),
    (node_wc3, path_watercolor, 'Painting Light & Shadow', 'Understand values and create depth', 'skill', 3, 5, 3, '[]', '["Identify light source in a scene", "Paint convincing shadows", "Create depth with values"]', '["Paint a sphere with shadow", "Paint a simple still life"]'),
    (node_wc4, path_watercolor, 'Landscapes', 'Paint skies, water, and nature', 'practice', 3, 6, 4, '[]', '["Paint convincing skies", "Create depth in landscapes", "Paint water reflections"]', '["Paint a sunset sky", "Paint a mountain landscape"]'),
    (node_wc5, path_watercolor, 'Personal Project', 'Create your own watercolor artwork', 'project', 4, 6, 5, '[]', '["Plan a painting from reference", "Apply all learned techniques", "Sign and frame your work"]', '["Complete 3 original watercolor paintings"]');

  UPDATE learning_nodes SET prerequisites = json_build_array(node_wc1::text)::jsonb WHERE id = node_wc2;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_wc2::text)::jsonb WHERE id = node_wc3;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_wc2::text)::jsonb WHERE id = node_wc4;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_wc3::text, node_wc4::text)::jsonb WHERE id = node_wc5;

  INSERT INTO resources (node_id, title, url, resource_type, platform, is_free, estimated_duration, difficulty_level, description) VALUES
    (node_wc1, 'Watercolor Supplies Guide', 'https://www.youtube.com/watch?v=DRkaMpJUDMw', 'video', 'YouTube', TRUE, 15, 'beginner', 'What supplies to buy as a beginner'),
    (node_wc2, 'Basic Watercolor Techniques', 'https://www.skillshare.com/en/classes/watercolor', 'course', 'Skillshare', FALSE, 120, 'beginner', 'Comprehensive beginner watercolor class');

  -- Path 6: Starting a Startup (Frank)
  path_startup := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_startup, 'a0000000-0000-0000-0000-000000000006', cat_business,
    'Launch Your First Startup', 'From idea validation to first customers', 'Startup',
    'intermediate', 45, TRUE);

  node_su1 := uuid_generate_v4();
  node_su2 := uuid_generate_v4();
  node_su3 := uuid_generate_v4();
  node_su4 := uuid_generate_v4();
  node_su5 := uuid_generate_v4();

  INSERT INTO learning_nodes (id, path_id, title, description, node_type, difficulty, estimated_hours, order_index, prerequisites, key_takeaways, practical_exercises) VALUES
    (node_su1, path_startup, 'Idea Validation', 'Test your business idea before building', 'foundation', 2, 8, 1, '[]', '["Identify customer problems", "Conduct customer interviews", "Validate willingness to pay"]', '["Interview 10 potential customers", "Create a landing page test"]'),
    (node_su2, path_startup, 'Business Model Canvas', 'Design your business model', 'concept', 3, 6, 2, '[]', '["Map your value proposition", "Identify revenue streams", "Define key partnerships"]', '["Complete your Business Model Canvas", "Get feedback from 3 mentors"]'),
    (node_su3, path_startup, 'MVP Development', 'Build a minimum viable product', 'project', 4, 15, 3, '[]', '["Define MVP scope ruthlessly", "Ship fast and iterate", "Measure what matters"]', '["Build and launch your MVP in 2 weeks"]'),
    (node_su4, path_startup, 'Marketing & Growth', 'Acquire your first customers', 'skill', 3, 8, 4, '[]', '["Create a go-to-market strategy", "Set up marketing channels", "Track CAC and LTV"]', '["Get your first 10 paying customers"]'),
    (node_su5, path_startup, 'Fundraising Basics', 'Understand funding options and pitch to investors', 'concept', 4, 8, 5, '[]', '["Create a compelling pitch deck", "Understand funding stages", "Network with investors"]', '["Draft a pitch deck", "Practice your pitch 10 times"]');

  UPDATE learning_nodes SET prerequisites = json_build_array(node_su1::text)::jsonb WHERE id = node_su2;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_su2::text)::jsonb WHERE id = node_su3;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_su3::text)::jsonb WHERE id = node_su4;
  UPDATE learning_nodes SET prerequisites = json_build_array(node_su3::text)::jsonb WHERE id = node_su5;

  INSERT INTO resources (node_id, title, url, resource_type, platform, is_free, estimated_duration, difficulty_level, description) VALUES
    (node_su1, 'The Mom Test', 'https://www.momtestbook.com/', 'book', 'Book', FALSE, NULL, 'beginner', 'How to talk to customers and learn if your idea is good'),
    (node_su2, 'Strategyzer BMC', 'https://www.strategyzer.com/library/the-business-model-canvas', 'tool', 'Strategyzer', TRUE, NULL, 'intermediate', 'Business Model Canvas template and guide'),
    (node_su3, 'Lean Startup', 'https://theleanstartup.com/', 'book', 'Book', FALSE, NULL, 'intermediate', 'The definitive guide to building startups');

  -- Additional paths for other users (shorter definitions)
  -- Path 7: Yoga (Grace)
  path_yoga := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_yoga, 'a0000000-0000-0000-0000-000000000007', cat_fitness,
    'Yoga for Complete Beginners', 'Build a daily yoga practice from scratch', 'Yoga', 'beginner', 20, TRUE);

  -- Path 8: Creative Writing (Henry)
  path_fiction := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_fiction, 'a0000000-0000-0000-0000-000000000008', cat_writing,
    'Writing Short Fiction', 'Craft compelling short stories from concept to publication', 'Short Fiction Writing', 'intermediate', 30, TRUE);

  -- Path 9: Photography (Ivy)
  path_photo := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_photo, 'a0000000-0000-0000-0000-000000000009', cat_arts,
    'Portrait Photography Mastery', 'Master lighting, composition, and editing for portraits', 'Portrait Photography', 'intermediate', 35, TRUE);

  -- Path 10: Machine Learning (Jack)
  path_ml := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_ml, 'a0000000-0000-0000-0000-000000000010', cat_tech,
    'Machine Learning Fundamentals', 'Understand ML from theory to practice', 'Machine Learning', 'advanced', 60, TRUE);

  -- Path 11: Piano (Alice, second path)
  path_piano := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_piano, 'a0000000-0000-0000-0000-000000000001', cat_music,
    'Piano for Beginners', 'Learn to play piano from scratch', 'Piano', 'beginner', 25, TRUE);

  -- Path 12: Quantum Physics (Carol, second path)
  path_physics := uuid_generate_v4();
  INSERT INTO learning_paths (id, user_id, category_id, title, description, topic, difficulty_level, estimated_duration, is_public)
  VALUES (path_physics, 'a0000000-0000-0000-0000-000000000003', cat_science,
    'Understanding Quantum Physics', 'Conceptual foundations for curious minds', 'Quantum Physics', 'advanced', 40, TRUE);

  -- ============================================================================
  -- 3. USER PROGRESS (simulate various completion states)
  -- ============================================================================

  -- Alice completed all Python nodes -> earns badge
  INSERT INTO user_progress (user_id, path_id, node_id, status, started_at, completed_at, time_spent) VALUES
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py1, 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '27 days', 240),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py2, 'completed', NOW() - INTERVAL '26 days', NOW() - INTERVAL '23 days', 260),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py3, 'completed', NOW() - INTERVAL '26 days', NOW() - INTERVAL '22 days', 300),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py4, 'completed', NOW() - INTERVAL '21 days', NOW() - INTERVAL '17 days', 280),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py5, 'completed', NOW() - INTERVAL '16 days', NOW() - INTERVAL '12 days', 360),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py6, 'completed', NOW() - INTERVAL '11 days', NOW() - INTERVAL '8 days', 300),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py7, 'completed', NOW() - INTERVAL '11 days', NOW() - INTERVAL '7 days', 360),
    ('a0000000-0000-0000-0000-000000000001', path_python, node_py8, 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days', 300);

  -- Bob partially through Guitar
  INSERT INTO user_progress (user_id, path_id, node_id, status, started_at, completed_at, time_spent) VALUES
    ('a0000000-0000-0000-0000-000000000002', path_guitar, node_gt1, 'completed', NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days', 120),
    ('a0000000-0000-0000-0000-000000000002', path_guitar, node_gt2, 'completed', NOW() - INTERVAL '11 days', NOW() - INTERVAL '7 days', 360),
    ('a0000000-0000-0000-0000-000000000002', path_guitar, node_gt3, 'in_progress', NOW() - INTERVAL '6 days', NULL, 180);

  -- Carol completed React path
  INSERT INTO user_progress (user_id, path_id, node_id, status, started_at, completed_at, time_spent) VALUES
    ('a0000000-0000-0000-0000-000000000003', path_react, node_rc1, 'completed', NOW() - INTERVAL '28 days', NOW() - INTERVAL '24 days', 300),
    ('a0000000-0000-0000-0000-000000000003', path_react, node_rc2, 'completed', NOW() - INTERVAL '23 days', NOW() - INTERVAL '19 days', 360),
    ('a0000000-0000-0000-0000-000000000003', path_react, node_rc3, 'completed', NOW() - INTERVAL '23 days', NOW() - INTERVAL '20 days', 240),
    ('a0000000-0000-0000-0000-000000000003', path_react, node_rc4, 'completed', NOW() - INTERVAL '18 days', NOW() - INTERVAL '14 days', 300),
    ('a0000000-0000-0000-0000-000000000003', path_react, node_rc5, 'completed', NOW() - INTERVAL '18 days', NOW() - INTERVAL '15 days', 300),
    ('a0000000-0000-0000-0000-000000000003', path_react, node_rc6, 'completed', NOW() - INTERVAL '13 days', NOW() - INTERVAL '5 days', 600);

  -- David learning French (midway)
  INSERT INTO user_progress (user_id, path_id, node_id, status, started_at, completed_at, time_spent) VALUES
    ('a0000000-0000-0000-0000-000000000004', path_french, node_fr1, 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '14 days', 480),
    ('a0000000-0000-0000-0000-000000000004', path_french, node_fr2, 'in_progress', NOW() - INTERVAL '13 days', NULL, 360),
    ('a0000000-0000-0000-0000-000000000004', path_french, node_fr3, 'in_progress', NOW() - INTERVAL '13 days', NULL, 300);

  -- Emma completed Watercolor
  INSERT INTO user_progress (user_id, path_id, node_id, status, started_at, completed_at, time_spent) VALUES
    ('a0000000-0000-0000-0000-000000000005', path_watercolor, node_wc1, 'completed', NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days', 180),
    ('a0000000-0000-0000-0000-000000000005', path_watercolor, node_wc2, 'completed', NOW() - INTERVAL '22 days', NOW() - INTERVAL '18 days', 300),
    ('a0000000-0000-0000-0000-000000000005', path_watercolor, node_wc3, 'completed', NOW() - INTERVAL '17 days', NOW() - INTERVAL '13 days', 300),
    ('a0000000-0000-0000-0000-000000000005', path_watercolor, node_wc4, 'completed', NOW() - INTERVAL '17 days', NOW() - INTERVAL '12 days', 360),
    ('a0000000-0000-0000-0000-000000000005', path_watercolor, node_wc5, 'completed', NOW() - INTERVAL '11 days', NOW() - INTERVAL '4 days', 360);

  -- ============================================================================
  -- 4. BADGES (for completed paths)
  -- ============================================================================

  INSERT INTO user_badges (user_id, path_id, badge_name, badge_icon, badge_color) VALUES
    ('a0000000-0000-0000-0000-000000000001', path_python, 'Python Data Scientist', '🐍', '#3776ab'),
    ('a0000000-0000-0000-0000-000000000003', path_react, 'React Developer', '⚛️', '#61dafb'),
    ('a0000000-0000-0000-0000-000000000005', path_watercolor, 'Watercolor Artist', '🎨', '#ec4899');

  -- ============================================================================
  -- 5. LEARNING GROUPS (6 groups)
  -- ============================================================================

  INSERT INTO learning_groups (id, name, description, category_id, creator_id, is_public, member_count, icon) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Python Learners', 'A community for Python enthusiasts learning data science and beyond', cat_tech, 'a0000000-0000-0000-0000-000000000001', TRUE, 5, '🐍'),
    ('b0000000-0000-0000-0000-000000000002', 'Music Makers', 'Share your music journey - guitar, piano, and more', cat_music, 'a0000000-0000-0000-0000-000000000002', TRUE, 4, '🎸'),
    ('b0000000-0000-0000-0000-000000000003', 'Creative Arts Hub', 'Watercolor, photography, and all visual arts', cat_arts, 'a0000000-0000-0000-0000-000000000005', TRUE, 4, '🎨'),
    ('b0000000-0000-0000-0000-000000000004', 'Language Exchange', 'Practice languages together - French, Spanish, and more', cat_languages, 'a0000000-0000-0000-0000-000000000004', TRUE, 3, '🌍'),
    ('b0000000-0000-0000-0000-000000000005', 'Startup Founders', 'Aspiring entrepreneurs sharing knowledge and support', cat_business, 'a0000000-0000-0000-0000-000000000006', TRUE, 3, '🚀'),
    ('b0000000-0000-0000-0000-000000000006', 'React & Next.js', 'Modern web development with React and Next.js', cat_tech, 'a0000000-0000-0000-0000-000000000003', TRUE, 4, '⚛️');

  -- ============================================================================
  -- 6. GROUP MEMBERS
  -- ============================================================================

  INSERT INTO group_members (group_id, user_id, role) VALUES
    -- Python Learners
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin'),
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'member'),
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'member'),
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'member'),
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'moderator'),
    -- Music Makers
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'admin'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'member'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'member'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000009', 'member'),
    -- Creative Arts Hub
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'admin'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', 'member'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 'member'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'member'),
    -- Language Exchange
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'admin'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000008', 'member'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000010', 'member'),
    -- Startup Founders
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'admin'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'member'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000010', 'member'),
    -- React & Next.js
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'admin'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'member'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000010', 'member'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  -- ============================================================================
  -- 7. GROUP PATHS (shared paths in groups)
  -- ============================================================================

  INSERT INTO group_paths (group_id, path_id, shared_by) VALUES
    ('b0000000-0000-0000-0000-000000000001', path_python, 'a0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000001', path_ml, 'a0000000-0000-0000-0000-000000000010'),
    ('b0000000-0000-0000-0000-000000000002', path_guitar, 'a0000000-0000-0000-0000-000000000002'),
    ('b0000000-0000-0000-0000-000000000002', path_piano, 'a0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000003', path_watercolor, 'a0000000-0000-0000-0000-000000000005'),
    ('b0000000-0000-0000-0000-000000000003', path_photo, 'a0000000-0000-0000-0000-000000000009'),
    ('b0000000-0000-0000-0000-000000000004', path_french, 'a0000000-0000-0000-0000-000000000004'),
    ('b0000000-0000-0000-0000-000000000005', path_startup, 'a0000000-0000-0000-0000-000000000006'),
    ('b0000000-0000-0000-0000-000000000006', path_react, 'a0000000-0000-0000-0000-000000000003');

  -- ============================================================================
  -- 8. FRIEND CONNECTIONS
  -- ============================================================================

  INSERT INTO user_connections (user_id, friend_id, status) VALUES
    -- Alice and Bob are friends
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'accepted'),
    -- Alice and Carol are friends
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'accepted'),
    -- Bob and David are friends
    ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'accepted'),
    -- Carol and Emma are friends
    ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'accepted'),
    -- David sent request to Emma (pending)
    ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'pending'),
    -- Frank and Grace are friends
    ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', 'accepted'),
    -- Henry and Ivy are friends
    ('a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000009', 'accepted'),
    -- Jack sent request to Alice (pending)
    ('a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'pending'),
    -- Emma and Grace are friends
    ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000007', 'accepted'),
    -- Frank and Jack are friends
    ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000010', 'accepted'),
    -- Bob and Frank are friends
    ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'accepted'),
    -- Carol and Henry are friends
    ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008', 'accepted'),
    -- Ivy sent request to Carol (pending)
    ('a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'pending'),
    -- Grace and Jack are friends
    ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000010', 'accepted')
  ON CONFLICT (user_id, friend_id) DO NOTHING;

  -- ============================================================================
  -- 9. GROUP POSTS (Forum activity)
  -- ============================================================================

  -- Python Learners posts
  INSERT INTO group_posts (id, group_id, user_id, title, content, post_type, upvotes, comment_count, created_at) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'Just completed my Python Data Science path!',
     'After 30 days of consistent learning, I finally completed all 8 nodes. The capstone project was the most rewarding part. My advice: dont skip the NumPy fundamentals, they make Pandas so much easier to understand!',
     'text', 8, 3, NOW() - INTERVAL '2 days'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010',
     'Best resources for learning pandas?',
     'Im currently on the Pandas node and finding it a bit overwhelming. What resources helped you the most? The official docs are great but I need more practical examples.',
     'discussion', 5, 2, NOW() - INTERVAL '5 days'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
     'Kaggle competition for beginners',
     'Found this great beginner-friendly Kaggle competition. Perfect for practicing what we learn in the ML node!',
     'link', 12, 4, NOW() - INTERVAL '1 day'),

  -- Music Makers posts
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
     'Finally played my first song from start to finish!',
     'After weeks of chord practice, I can now play Wonderwall all the way through. Not perfectly, but it feels amazing! The strumming patterns node was key.',
     'text', 15, 5, NOW() - INTERVAL '3 days'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007',
     'Guitar vs Piano for total beginners?',
     'Im debating whether to start with guitar or piano. For those who have tried both, which do you think is easier to start with?',
     'discussion', 7, 6, NOW() - INTERVAL '7 days'),

  -- Creative Arts Hub posts
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005',
     'My watercolor journey - before and after!',
     'Sharing my progress from when I started the watercolor path to now. The difference is unbelievable. Wet-on-wet technique changed everything for me.',
     'text', 20, 4, NOW() - INTERVAL '4 days'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009',
     'Photography lighting tips',
     'Collected some great tips on natural lighting for portraits. Window light is your best friend as a beginner!',
     'text', 9, 2, NOW() - INTERVAL '6 days'),

  -- Language Exchange posts
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
     'Looking for French conversation partner',
     'Im at the point where I need real practice. Anyone here learning French and want to do weekly video calls? Im around B1 level.',
     'discussion', 6, 3, NOW() - INTERVAL '2 days'),

  -- Startup Founders posts
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006',
     'Customer interview template that works',
     'After 50+ customer interviews, heres the template I use. The key is asking about their past behavior, not hypothetical futures.',
     'text', 11, 3, NOW() - INTERVAL '3 days'),
    ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003',
     'When to pivot vs persevere?',
     'My MVP has been live for 2 weeks with minimal traction. How do you decide when its time to pivot? Looking for advice from experienced founders.',
     'discussion', 8, 4, NOW() - INTERVAL '5 days'),

  -- React & Next.js posts
    ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003',
     'React Server Components changed my life',
     'After completing the React path, I dove into Next.js App Router. Server Components are a game changer for performance. Here is what I learned.',
     'text', 14, 5, NOW() - INTERVAL '1 day'),
    ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'Zustand vs Context API - when to use which?',
     'Ive been using both and found that Context is great for static data like themes, while Zustand shines for frequently-updated state. What are your thoughts?',
     'discussion', 10, 3, NOW() - INTERVAL '4 days');

  -- ============================================================================
  -- 10. POST COMMENTS
  -- ============================================================================

  -- Comments on Alice's Python completion post
  INSERT INTO post_comments (post_id, user_id, content, upvotes, created_at) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
     'Congratulations Alice! Your capstone project was really impressive. The data cleaning part was so thorough.',
     4, NOW() - INTERVAL '1 day'),
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010',
     'This is inspiring! Im about to start the NumPy node. Any specific exercises you recommend?',
     2, NOW() - INTERVAL '1 day'),
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006',
     'Well done! I am halfway through and your tips about NumPy are really helpful.',
     1, NOW() - INTERVAL '12 hours'),

  -- Comments on Pandas discussion
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'I found that working through real Kaggle datasets helped the most. Start with the Titanic dataset - its the classic for a reason!',
     3, NOW() - INTERVAL '4 days'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008',
     'The "10 Minutes to Pandas" guide in the resources is actually really good. I keep going back to it as a reference.',
     2, NOW() - INTERVAL '3 days'),

  -- Comments on Kaggle competition post
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'Great find! I just submitted my first entry. Scored 0.78 accuracy which Im pretty happy with for a first attempt.',
     3, NOW() - INTERVAL '20 hours'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000010',
     'Is this the Spaceship Titanic one? Ive been eyeing it!',
     1, NOW() - INTERVAL '18 hours'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006',
     'Thanks for sharing! Going to try this over the weekend.',
     1, NOW() - INTERVAL '16 hours'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
     'Submitted mine too! Used random forest and got 0.81. Happy to share my notebook if anyone wants to compare approaches.',
     5, NOW() - INTERVAL '10 hours'),

  -- Comments on Bob's guitar post
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'Awesome! I remember that feeling. Next goal: Wish You Were Here by Pink Floyd. Trust me, you will love it.',
     3, NOW() - INTERVAL '2 days'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007',
     'So jealous! Im still struggling with the F chord. Any tips?',
     2, NOW() - INTERVAL '2 days'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000009',
     'The strumming patterns node is where I am now too. Down-up-down-up is deceptively tricky!',
     1, NOW() - INTERVAL '1 day'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002',
     'Thanks everyone! For the F chord, try the mini-F first (just top 4 strings). It builds finger strength gradually.',
     4, NOW() - INTERVAL '1 day'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007',
     'Oh that is a great tip about mini-F! Will try that tonight.',
     1, NOW() - INTERVAL '12 hours'),

  -- Comments on guitar vs piano discussion
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
     'I may be biased but guitar is more portable and social. You can bring it anywhere!',
     3, NOW() - INTERVAL '6 days'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'Piano is great for understanding music theory. Notes are laid out linearly which makes it very visual.',
     4, NOW() - INTERVAL '6 days'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009',
     'I started with piano and then moved to guitar. Piano gave me a solid foundation but guitar is more fun for casual playing.',
     5, NOW() - INTERVAL '5 days'),

  -- Comments on watercolor post
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000009',
     'The improvement is incredible! Your color mixing has really improved. What paper are you using?',
     3, NOW() - INTERVAL '3 days'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007',
     'Beautiful work! Im inspired to start the watercolor path now.',
     2, NOW() - INTERVAL '3 days'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002',
     'Wow these are gorgeous! The landscape with the sunset is my favorite.',
     2, NOW() - INTERVAL '2 days'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005',
     'Thank you all! Im using Arches cold press 140lb paper. It makes a huge difference compared to cheap paper.',
     4, NOW() - INTERVAL '2 days'),

  -- Comments on React Server Components post
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001',
     'Agreed! The initial bundle size reduction alone is worth the migration. Plus streaming makes the UX so much better.',
     4, NOW() - INTERVAL '20 hours'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000010',
     'How did you handle the transition from client to server components? I keep running into the use client boundary issues.',
     2, NOW() - INTERVAL '18 hours'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003',
     'Good question! My rule of thumb: start everything as server components, only add use client when you need interactivity. Keep client components as leaf nodes.',
     6, NOW() - INTERVAL '16 hours'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006',
     'That is a great mental model. Also, you can pass server data as props to client components instead of fetching on the client.',
     3, NOW() - INTERVAL '10 hours'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000010',
     'This thread is gold. Saving it for reference. Thanks everyone!',
     2, NOW() - INTERVAL '6 hours');

  -- ============================================================================
  -- 11. POST REACTIONS (upvotes/downvotes) - manually set since triggers may not fire for bulk insert
  -- ============================================================================

  INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES
    -- Reactions on Alice's Python post
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'upvote'),
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'upvote'),
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'upvote'),
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'upvote'),
    -- Reactions on Kaggle post
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'upvote'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000010', 'upvote'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'upvote'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008', 'upvote'),
    -- Reactions on Bob's guitar post
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'upvote'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'upvote'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000009', 'upvote'),
    -- Reactions on Emma's watercolor post
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000009', 'upvote'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', 'upvote'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'upvote'),
    -- Reactions on React Server Components post
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'upvote'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000010', 'upvote'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'upvote')
  ON CONFLICT (post_id, user_id) DO NOTHING;

  -- ============================================================================
  -- 12. PATH RECOMMENDATIONS
  -- ============================================================================

  INSERT INTO path_recommendations (user_id, recommended_path_id, reason, score) VALUES
    ('a0000000-0000-0000-0000-000000000001', path_ml, 'Based on your Python Data Science completion, Machine Learning is a natural next step', 0.95),
    ('a0000000-0000-0000-0000-000000000001', path_react, 'Many data scientists benefit from web development skills to build dashboards', 0.7),
    ('a0000000-0000-0000-0000-000000000002', path_piano, 'As a guitar learner, piano will help you understand music theory better', 0.8),
    ('a0000000-0000-0000-0000-000000000003', path_startup, 'With your React skills, you could build your own SaaS product', 0.75),
    ('a0000000-0000-0000-0000-000000000004', path_startup, 'Business skills complement language skills for international opportunities', 0.6),
    ('a0000000-0000-0000-0000-000000000005', path_photo, 'Photography and watercolor share composition principles - great synergy', 0.85);

END $$;
