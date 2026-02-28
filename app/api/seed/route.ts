import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Seed endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Insert users
    const users = [
      { id: 'a0000000-0000-0000-0000-000000000001', email: 'alice@example.com', name: 'Alice Johnson' },
      { id: 'a0000000-0000-0000-0000-000000000002', email: 'bob@example.com', name: 'Bob Martinez' },
      { id: 'a0000000-0000-0000-0000-000000000003', email: 'carol@example.com', name: 'Carol Chen' },
      { id: 'a0000000-0000-0000-0000-000000000004', email: 'david@example.com', name: 'David Kim' },
      { id: 'a0000000-0000-0000-0000-000000000005', email: 'emma@example.com', name: 'Emma Wilson' },
      { id: 'a0000000-0000-0000-0000-000000000006', email: 'frank@example.com', name: 'Frank Brown' },
      { id: 'a0000000-0000-0000-0000-000000000007', email: 'grace@example.com', name: 'Grace Lee' },
      { id: 'a0000000-0000-0000-0000-000000000008', email: 'henry@example.com', name: 'Henry Taylor' },
      { id: 'a0000000-0000-0000-0000-000000000009', email: 'ivy@example.com', name: 'Ivy Patel' },
      { id: 'a0000000-0000-0000-0000-000000000010', email: 'jack@example.com', name: 'Jack Davis' },
    ];

    await supabase.from('users').upsert(users, { onConflict: 'email' });

    // 2. Get category IDs
    const { data: categories } = await supabase.from('categories').select('id, slug');
    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No categories found. Please run schema.sql first.' },
        { status: 500 }
      );
    }

    const catMap: Record<string, string> = {};
    for (const cat of categories) {
      catMap[cat.slug] = cat.id;
    }

    // 3. Insert learning paths
    const pathIds = {
      python: 'd0000000-0000-0000-0000-000000000001',
      guitar: 'd0000000-0000-0000-0000-000000000002',
      react: 'd0000000-0000-0000-0000-000000000003',
      french: 'd0000000-0000-0000-0000-000000000004',
      watercolor: 'd0000000-0000-0000-0000-000000000005',
      startup: 'd0000000-0000-0000-0000-000000000006',
      yoga: 'd0000000-0000-0000-0000-000000000007',
      fiction: 'd0000000-0000-0000-0000-000000000008',
      photo: 'd0000000-0000-0000-0000-000000000009',
      ml: 'd0000000-0000-0000-0000-000000000010',
      piano: 'd0000000-0000-0000-0000-000000000011',
      physics: 'd0000000-0000-0000-0000-000000000012',
    };

    const paths = [
      { id: pathIds.python, user_id: users[0].id, category_id: catMap['technology'], title: 'Python for Data Science', description: 'Master Python from basics to data science applications', topic: 'Python Data Science', difficulty_level: 'beginner', estimated_duration: 40, is_public: true },
      { id: pathIds.guitar, user_id: users[1].id, category_id: catMap['music'], title: 'Beginner Guitar Mastery', description: 'From zero to playing your first songs', topic: 'Guitar', difficulty_level: 'beginner', estimated_duration: 30, is_public: true },
      { id: pathIds.react, user_id: users[2].id, category_id: catMap['technology'], title: 'Modern React Development', description: 'Build production-ready React applications', topic: 'React', difficulty_level: 'intermediate', estimated_duration: 35, is_public: true },
      { id: pathIds.french, user_id: users[3].id, category_id: catMap['languages'], title: 'Conversational French in 6 Months', description: 'Go from zero to having basic conversations in French', topic: 'French', difficulty_level: 'beginner', estimated_duration: 50, is_public: true },
      { id: pathIds.watercolor, user_id: users[4].id, category_id: catMap['visual-arts'], title: 'Watercolor Painting for Beginners', description: 'Learn watercolor techniques from basics to beautiful paintings', topic: 'Watercolor Painting', difficulty_level: 'beginner', estimated_duration: 25, is_public: true },
      { id: pathIds.startup, user_id: users[5].id, category_id: catMap['business'], title: 'Launch Your First Startup', description: 'From idea validation to first customers', topic: 'Startup', difficulty_level: 'intermediate', estimated_duration: 45, is_public: true },
      { id: pathIds.yoga, user_id: users[6].id, category_id: catMap['health-fitness'], title: 'Yoga for Complete Beginners', description: 'Build a daily yoga practice from scratch', topic: 'Yoga', difficulty_level: 'beginner', estimated_duration: 20, is_public: true },
      { id: pathIds.fiction, user_id: users[7].id, category_id: catMap['writing'], title: 'Writing Short Fiction', description: 'Craft compelling short stories from concept to publication', topic: 'Short Fiction Writing', difficulty_level: 'intermediate', estimated_duration: 30, is_public: true },
      { id: pathIds.photo, user_id: users[8].id, category_id: catMap['visual-arts'], title: 'Portrait Photography Mastery', description: 'Master lighting, composition, and editing for portraits', topic: 'Portrait Photography', difficulty_level: 'intermediate', estimated_duration: 35, is_public: true },
      { id: pathIds.ml, user_id: users[9].id, category_id: catMap['technology'], title: 'Machine Learning Fundamentals', description: 'Understand ML from theory to practice', topic: 'Machine Learning', difficulty_level: 'advanced', estimated_duration: 60, is_public: true },
      { id: pathIds.piano, user_id: users[0].id, category_id: catMap['music'], title: 'Piano for Beginners', description: 'Learn to play piano from scratch', topic: 'Piano', difficulty_level: 'beginner', estimated_duration: 25, is_public: true },
      { id: pathIds.physics, user_id: users[2].id, category_id: catMap['science-math'], title: 'Understanding Quantum Physics', description: 'Conceptual foundations for curious minds', topic: 'Quantum Physics', difficulty_level: 'advanced', estimated_duration: 40, is_public: true },
    ];

    await supabase.from('learning_paths').upsert(paths, { onConflict: 'id' });

    // 4. Insert Python nodes
    const pyNodes = [
      { id: 'e0000000-0000-0000-0000-000000000001', path_id: pathIds.python, title: 'Python Basics', description: 'Variables, data types, and control flow', node_type: 'foundation', difficulty: 1, estimated_hours: 4, order_index: 1, prerequisites: '[]', key_takeaways: '["Understand variables and types","Write conditional statements","Use loops effectively"]', practical_exercises: '["Write a number guessing game","Create a simple calculator"]' },
      { id: 'e0000000-0000-0000-0000-000000000002', path_id: pathIds.python, title: 'Functions & Modules', description: 'Define functions and organize code', node_type: 'concept', difficulty: 2, estimated_hours: 4, order_index: 2, prerequisites: '["e0000000-0000-0000-0000-000000000001"]', key_takeaways: '["Create reusable functions","Import and use modules","Handle errors with try/except"]', practical_exercises: '["Build a password generator","Create a file organizer script"]' },
      { id: 'e0000000-0000-0000-0000-000000000003', path_id: pathIds.python, title: 'Data Structures', description: 'Lists, dictionaries, sets, and tuples', node_type: 'concept', difficulty: 2, estimated_hours: 5, order_index: 3, prerequisites: '["e0000000-0000-0000-0000-000000000001"]', key_takeaways: '["Use lists and list comprehensions","Work with dictionaries","Choose the right data structure"]', practical_exercises: '["Implement a contact book","Build a word frequency counter"]' },
      { id: 'e0000000-0000-0000-0000-000000000004', path_id: pathIds.python, title: 'NumPy Fundamentals', description: 'Numerical computing with NumPy arrays', node_type: 'skill', difficulty: 3, estimated_hours: 5, order_index: 4, prerequisites: '["e0000000-0000-0000-0000-000000000002","e0000000-0000-0000-0000-000000000003"]', key_takeaways: '["Create and manipulate arrays","Perform vectorized operations","Use broadcasting"]', practical_exercises: '["Analyze a dataset with NumPy","Implement basic linear algebra"]' },
      { id: 'e0000000-0000-0000-0000-000000000005', path_id: pathIds.python, title: 'Pandas for Data Analysis', description: 'Data manipulation and analysis with Pandas', node_type: 'skill', difficulty: 3, estimated_hours: 6, order_index: 5, prerequisites: '["e0000000-0000-0000-0000-000000000004"]', key_takeaways: '["Load and clean data","Filter and transform DataFrames","Group and aggregate data"]', practical_exercises: '["Clean a messy CSV dataset","Analyze sales data"]' },
      { id: 'e0000000-0000-0000-0000-000000000006', path_id: pathIds.python, title: 'Data Visualization', description: 'Create plots with Matplotlib and Seaborn', node_type: 'skill', difficulty: 3, estimated_hours: 5, order_index: 6, prerequisites: '["e0000000-0000-0000-0000-000000000005"]', key_takeaways: '["Create various plot types","Customize plot aesthetics","Tell stories with data"]', practical_exercises: '["Create a dashboard of charts","Visualize COVID data trends"]' },
      { id: 'e0000000-0000-0000-0000-000000000007', path_id: pathIds.python, title: 'Machine Learning Intro', description: 'Basic ML concepts with scikit-learn', node_type: 'concept', difficulty: 4, estimated_hours: 6, order_index: 7, prerequisites: '["e0000000-0000-0000-0000-000000000005"]', key_takeaways: '["Understand supervised vs unsupervised learning","Train and evaluate models","Avoid overfitting"]', practical_exercises: '["Build a spam classifier","Predict house prices"]' },
      { id: 'e0000000-0000-0000-0000-000000000008', path_id: pathIds.python, title: 'Capstone Project', description: 'End-to-end data science project', node_type: 'project', difficulty: 4, estimated_hours: 5, order_index: 8, prerequisites: '["e0000000-0000-0000-0000-000000000006","e0000000-0000-0000-0000-000000000007"]', key_takeaways: '["Plan a data science project","Present findings effectively","Deploy a simple model"]', practical_exercises: '["Complete an end-to-end analysis on a real dataset"]' },
    ];

    // 5. Insert Guitar nodes
    const gtNodes = [
      { id: 'e0000000-0000-0000-0000-000000000011', path_id: pathIds.guitar, title: 'Guitar Anatomy & Setup', description: 'Learn the parts of the guitar and how to tune it', node_type: 'foundation', difficulty: 1, estimated_hours: 2, order_index: 1, prerequisites: '[]', key_takeaways: '["Name all guitar parts","Tune using a digital tuner","Hold the guitar correctly"]', practical_exercises: '["Tune your guitar 5 times","Practice proper posture for 10 minutes"]' },
      { id: 'e0000000-0000-0000-0000-000000000012', path_id: pathIds.guitar, title: 'Basic Chords', description: 'Learn your first open chords: G, C, D, Em, Am', node_type: 'skill', difficulty: 2, estimated_hours: 6, order_index: 2, prerequisites: '["e0000000-0000-0000-0000-000000000011"]', key_takeaways: '["Play 5 open chords cleanly","Switch between chords smoothly","Develop finger strength"]', practical_exercises: '["Practice each chord for 5 minutes daily","Play G-C-D progression"]' },
      { id: 'e0000000-0000-0000-0000-000000000013', path_id: pathIds.guitar, title: 'Strumming Patterns', description: 'Master essential strumming rhythms', node_type: 'technique', difficulty: 2, estimated_hours: 5, order_index: 3, prerequisites: '["e0000000-0000-0000-0000-000000000011"]', key_takeaways: '["Play 4 strumming patterns","Keep steady tempo","Use a metronome"]', practical_exercises: '["Strum along to 3 simple songs","Practice with metronome at different tempos"]' },
      { id: 'e0000000-0000-0000-0000-000000000014', path_id: pathIds.guitar, title: 'Your First Songs', description: 'Play complete beginner songs', node_type: 'practice', difficulty: 3, estimated_hours: 8, order_index: 4, prerequisites: '["e0000000-0000-0000-0000-000000000012","e0000000-0000-0000-0000-000000000013"]', key_takeaways: '["Play 3 complete songs","Sing and play simultaneously","Perform for someone"]', practical_exercises: '["Learn Wonderwall","Learn Horse With No Name","Learn Knockin on Heavens Door"]' },
      { id: 'e0000000-0000-0000-0000-000000000015', path_id: pathIds.guitar, title: 'Fingerpicking Basics', description: 'Introduction to fingerstyle playing', node_type: 'technique', difficulty: 3, estimated_hours: 5, order_index: 5, prerequisites: '["e0000000-0000-0000-0000-000000000012"]', key_takeaways: '["Play basic fingerpicking patterns","Coordinate thumb and fingers","Play a fingerstyle piece"]', practical_exercises: '["Practice Travis picking","Learn Dust in the Wind intro"]' },
      { id: 'e0000000-0000-0000-0000-000000000016', path_id: pathIds.guitar, title: 'Music Theory for Guitar', description: 'Understand the notes and scales on the fretboard', node_type: 'theory', difficulty: 3, estimated_hours: 4, order_index: 6, prerequisites: '["e0000000-0000-0000-0000-000000000012"]', key_takeaways: '["Name notes on first 5 frets","Play major and minor scales","Understand chord construction"]', practical_exercises: '["Map out the C major scale","Build chords from scale degrees"]' },
    ];

    // 6. Insert React nodes
    const rcNodes = [
      { id: 'e0000000-0000-0000-0000-000000000021', path_id: pathIds.react, title: 'React Fundamentals', description: 'Components, JSX, and props', node_type: 'foundation', difficulty: 2, estimated_hours: 5, order_index: 1, prerequisites: '[]', key_takeaways: '["Create functional components","Use JSX syntax","Pass and use props"]', practical_exercises: '["Build a profile card component","Create a todo list UI"]' },
      { id: 'e0000000-0000-0000-0000-000000000022', path_id: pathIds.react, title: 'State & Hooks', description: 'useState, useEffect, and custom hooks', node_type: 'concept', difficulty: 3, estimated_hours: 6, order_index: 2, prerequisites: '["e0000000-0000-0000-0000-000000000021"]', key_takeaways: '["Manage state with useState","Handle side effects with useEffect","Create custom hooks"]', practical_exercises: '["Build a counter with useState","Fetch data with useEffect"]' },
      { id: 'e0000000-0000-0000-0000-000000000023', path_id: pathIds.react, title: 'Routing & Navigation', description: 'Client-side routing with React Router', node_type: 'skill', difficulty: 3, estimated_hours: 4, order_index: 3, prerequisites: '["e0000000-0000-0000-0000-000000000021"]', key_takeaways: '["Set up React Router","Create nested routes","Handle route parameters"]', practical_exercises: '["Build a multi-page app with navigation"]' },
      { id: 'e0000000-0000-0000-0000-000000000024', path_id: pathIds.react, title: 'State Management', description: 'Context API and Zustand', node_type: 'concept', difficulty: 4, estimated_hours: 5, order_index: 4, prerequisites: '["e0000000-0000-0000-0000-000000000022"]', key_takeaways: '["Use Context API for global state","Implement Zustand stores","Choose the right state solution"]', practical_exercises: '["Build a shopping cart with global state"]' },
      { id: 'e0000000-0000-0000-0000-000000000025', path_id: pathIds.react, title: 'API Integration', description: 'Fetching data and handling async operations', node_type: 'skill', difficulty: 3, estimated_hours: 5, order_index: 5, prerequisites: '["e0000000-0000-0000-0000-000000000022"]', key_takeaways: '["Fetch data from REST APIs","Handle loading and error states","Implement optimistic updates"]', practical_exercises: '["Build a dashboard with real API data"]' },
      { id: 'e0000000-0000-0000-0000-000000000026', path_id: pathIds.react, title: 'Full Stack Project', description: 'Build a complete React application', node_type: 'project', difficulty: 4, estimated_hours: 10, order_index: 6, prerequisites: '["e0000000-0000-0000-0000-000000000023","e0000000-0000-0000-0000-000000000024","e0000000-0000-0000-0000-000000000025"]', key_takeaways: '["Plan and architect a React app","Implement authentication","Deploy to production"]', practical_exercises: '["Build and deploy a full-stack blog platform"]' },
    ];

    const allNodes = [...pyNodes, ...gtNodes, ...rcNodes];
    await supabase.from('learning_nodes').upsert(allNodes, { onConflict: 'id' });

    // 7. Insert resources
    const resources = [
      { node_id: pyNodes[0].id, title: 'Python for Everybody', url: 'https://www.py4e.com/', resource_type: 'course', platform: 'Coursera', is_free: true, estimated_duration: 600, difficulty_level: 'beginner', description: 'Comprehensive intro to Python programming' },
      { node_id: pyNodes[0].id, title: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com/', resource_type: 'book', platform: 'Online', is_free: true, difficulty_level: 'beginner', description: 'Practical Python programming for beginners' },
      { node_id: pyNodes[1].id, title: 'Python Functions Tutorial', url: 'https://realpython.com/defining-your-own-python-function/', resource_type: 'article', platform: 'Real Python', is_free: true, estimated_duration: 30, difficulty_level: 'beginner', description: 'In-depth guide to Python functions' },
      { node_id: pyNodes[3].id, title: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', resource_type: 'documentation', platform: 'NumPy', is_free: true, estimated_duration: 60, difficulty_level: 'intermediate', description: 'Official NumPy getting started guide' },
      { node_id: pyNodes[4].id, title: 'Pandas Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/index.html', resource_type: 'documentation', platform: 'Pandas', is_free: true, estimated_duration: 90, difficulty_level: 'intermediate', description: 'Official Pandas tutorials' },
      { node_id: rcNodes[0].id, title: 'React Official Tutorial', url: 'https://react.dev/learn', resource_type: 'documentation', platform: 'React', is_free: true, estimated_duration: 120, difficulty_level: 'beginner', description: 'Official React getting started guide' },
      { node_id: rcNodes[1].id, title: 'React Hooks Explained', url: 'https://react.dev/reference/react', resource_type: 'documentation', platform: 'React', is_free: true, estimated_duration: 60, difficulty_level: 'intermediate', description: 'Complete hooks reference' },
      { node_id: gtNodes[0].id, title: 'Guitar Basics for Beginners', url: 'https://www.justinguitar.com/categories/beginner-guitar-course', resource_type: 'course', platform: 'JustinGuitar', is_free: true, estimated_duration: 120, difficulty_level: 'beginner', description: 'Free comprehensive beginner course' },
      { node_id: gtNodes[1].id, title: 'How to Play Open Chords', url: 'https://www.youtube.com/watch?v=BSKTSwBRs7g', resource_type: 'video', platform: 'YouTube', is_free: true, estimated_duration: 15, difficulty_level: 'beginner', description: 'Visual guide to basic open chords' },
    ];

    await supabase.from('resources').upsert(resources, { onConflict: 'id', ignoreDuplicates: true });

    // 8. Insert user progress - Alice completed Python path
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

    const progress = [
      // Alice completed all Python nodes
      ...pyNodes.map((node, i) => ({
        user_id: users[0].id,
        path_id: pathIds.python,
        node_id: node.id,
        status: 'completed' as const,
        started_at: daysAgo(30 - i * 3),
        completed_at: daysAgo(27 - i * 3),
        time_spent: 240 + i * 20,
      })),
      // Bob partially through Guitar
      { user_id: users[1].id, path_id: pathIds.guitar, node_id: gtNodes[0].id, status: 'completed' as const, started_at: daysAgo(14), completed_at: daysAgo(12), time_spent: 120 },
      { user_id: users[1].id, path_id: pathIds.guitar, node_id: gtNodes[1].id, status: 'completed' as const, started_at: daysAgo(11), completed_at: daysAgo(7), time_spent: 360 },
      { user_id: users[1].id, path_id: pathIds.guitar, node_id: gtNodes[2].id, status: 'in_progress' as const, started_at: daysAgo(6), completed_at: null, time_spent: 180 },
      // Carol completed React path
      ...rcNodes.map((node, i) => ({
        user_id: users[2].id,
        path_id: pathIds.react,
        node_id: node.id,
        status: 'completed' as const,
        started_at: daysAgo(28 - i * 4),
        completed_at: daysAgo(24 - i * 4),
        time_spent: 300 + i * 30,
      })),
    ];

    await supabase.from('user_progress').upsert(progress, { onConflict: 'user_id,node_id', ignoreDuplicates: true });

    // 9. Insert badges
    const badges = [
      { user_id: users[0].id, path_id: pathIds.python, badge_name: 'Python Data Scientist', badge_icon: '\u{1F40D}', badge_color: '#3776ab' },
      { user_id: users[2].id, path_id: pathIds.react, badge_name: 'React Developer', badge_icon: '\u269B\uFE0F', badge_color: '#61dafb' },
    ];

    await supabase.from('user_badges').upsert(badges, { onConflict: 'user_id,path_id', ignoreDuplicates: true });

    // 10. Insert learning groups
    const groups = [
      { id: 'b0000000-0000-0000-0000-000000000001', name: 'Python Learners', description: 'A community for Python enthusiasts', category_id: catMap['technology'], creator_id: users[0].id, is_public: true, member_count: 5, icon: '\u{1F40D}' },
      { id: 'b0000000-0000-0000-0000-000000000002', name: 'Music Makers', description: 'Share your music journey', category_id: catMap['music'], creator_id: users[1].id, is_public: true, member_count: 4, icon: '\u{1F3B8}' },
      { id: 'b0000000-0000-0000-0000-000000000003', name: 'Creative Arts Hub', description: 'Watercolor, photography, and all visual arts', category_id: catMap['visual-arts'], creator_id: users[4].id, is_public: true, member_count: 4, icon: '\u{1F3A8}' },
      { id: 'b0000000-0000-0000-0000-000000000004', name: 'Language Exchange', description: 'Practice languages together', category_id: catMap['languages'], creator_id: users[3].id, is_public: true, member_count: 3, icon: '\u{1F30D}' },
      { id: 'b0000000-0000-0000-0000-000000000005', name: 'Startup Founders', description: 'Aspiring entrepreneurs sharing knowledge', category_id: catMap['business'], creator_id: users[5].id, is_public: true, member_count: 3, icon: '\u{1F680}' },
      { id: 'b0000000-0000-0000-0000-000000000006', name: 'React & Next.js', description: 'Modern web development with React', category_id: catMap['technology'], creator_id: users[2].id, is_public: true, member_count: 4, icon: '\u269B\uFE0F' },
    ];

    await supabase.from('learning_groups').upsert(groups, { onConflict: 'id' });

    // 11. Insert group members
    const groupMembers = [
      { group_id: groups[0].id, user_id: users[0].id, role: 'admin' },
      { group_id: groups[0].id, user_id: users[2].id, role: 'member' },
      { group_id: groups[0].id, user_id: users[9].id, role: 'member' },
      { group_id: groups[1].id, user_id: users[1].id, role: 'admin' },
      { group_id: groups[1].id, user_id: users[0].id, role: 'member' },
      { group_id: groups[1].id, user_id: users[6].id, role: 'member' },
      { group_id: groups[2].id, user_id: users[4].id, role: 'admin' },
      { group_id: groups[2].id, user_id: users[8].id, role: 'member' },
      { group_id: groups[3].id, user_id: users[3].id, role: 'admin' },
      { group_id: groups[3].id, user_id: users[7].id, role: 'member' },
      { group_id: groups[4].id, user_id: users[5].id, role: 'admin' },
      { group_id: groups[4].id, user_id: users[2].id, role: 'member' },
      { group_id: groups[5].id, user_id: users[2].id, role: 'admin' },
      { group_id: groups[5].id, user_id: users[0].id, role: 'member' },
      { group_id: groups[5].id, user_id: users[9].id, role: 'member' },
    ];

    await supabase.from('group_members').upsert(groupMembers, { onConflict: 'group_id,user_id', ignoreDuplicates: true });

    // 12. Insert friend connections
    const connections = [
      { user_id: users[0].id, friend_id: users[1].id, status: 'accepted' },
      { user_id: users[0].id, friend_id: users[2].id, status: 'accepted' },
      { user_id: users[1].id, friend_id: users[3].id, status: 'accepted' },
      { user_id: users[2].id, friend_id: users[4].id, status: 'accepted' },
      { user_id: users[3].id, friend_id: users[4].id, status: 'pending' },
      { user_id: users[5].id, friend_id: users[6].id, status: 'accepted' },
      { user_id: users[7].id, friend_id: users[8].id, status: 'accepted' },
      { user_id: users[9].id, friend_id: users[0].id, status: 'pending' },
    ];

    await supabase.from('user_connections').upsert(connections, { onConflict: 'user_id,friend_id', ignoreDuplicates: true });

    // 13. Insert path recommendations
    const recommendations = [
      { user_id: users[0].id, recommended_path_id: pathIds.ml, reason: 'Based on your Python Data Science completion, Machine Learning is a natural next step', score: 0.95 },
      { user_id: users[0].id, recommended_path_id: pathIds.react, reason: 'Many data scientists benefit from web development skills to build dashboards', score: 0.7 },
      { user_id: users[1].id, recommended_path_id: pathIds.piano, reason: 'As a guitar learner, piano will help you understand music theory better', score: 0.8 },
      { user_id: users[2].id, recommended_path_id: pathIds.startup, reason: 'With your React skills, you could build your own SaaS product', score: 0.75 },
    ];

    await supabase.from('path_recommendations').upsert(recommendations, { onConflict: 'id', ignoreDuplicates: true });

    // 14. Insert group posts
    const posts = [
      { id: 'c0000000-0000-0000-0000-000000000001', group_id: groups[0].id, user_id: users[0].id, title: 'Just completed my Python Data Science path!', content: 'After 30 days of consistent learning, I finally completed all 8 nodes. The capstone project was the most rewarding part.', post_type: 'text', upvotes: 8, comment_count: 3 },
      { id: 'c0000000-0000-0000-0000-000000000002', group_id: groups[0].id, user_id: users[9].id, title: 'Best resources for learning pandas?', content: 'Im currently on the Pandas node and finding it a bit overwhelming. What resources helped you the most?', post_type: 'discussion', upvotes: 5, comment_count: 2 },
      { id: 'c0000000-0000-0000-0000-000000000003', group_id: groups[1].id, user_id: users[1].id, title: 'Finally played my first song!', content: 'After weeks of chord practice, I can now play Wonderwall all the way through. Not perfectly, but it feels amazing!', post_type: 'text', upvotes: 15, comment_count: 5 },
      { id: 'c0000000-0000-0000-0000-000000000004', group_id: groups[5].id, user_id: users[2].id, title: 'React Server Components changed my life', content: 'After completing the React path, I dove into Next.js App Router. Server Components are a game changer for performance.', post_type: 'text', upvotes: 14, comment_count: 5 },
    ];

    await supabase.from('group_posts').upsert(posts, { onConflict: 'id' });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with test data',
      data: {
        users: users.length,
        paths: paths.length,
        nodes: allNodes.length,
        resources: resources.length,
        groups: groups.length,
        posts: posts.length,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
