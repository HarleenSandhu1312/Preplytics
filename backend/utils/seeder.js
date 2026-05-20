require('dotenv').config();

const mongoose = require('mongoose');

const User = require('../models/User');
const Progress = require('../models/Progress');
const StudentStore = require('../models/StudentStore');
const AppConfig = require('../models/AppConfig');

const students = [
  {
    name: 'Aarav Sharma',
    email: 'aarav@student.preplytics.com',
    password: 'student123',
    role: 'student',
    branch: 'CSE',
    examTarget: 'GATE',
    semester: '4',
    acceptedTerms: true,
  },

  {
    name: 'Diya Patel',
    email: 'diya@student.preplytics.com',
    password: 'student123',
    role: 'student',
    branch: 'IT',
    examTarget: 'Placements',
    semester: '4',
    acceptedTerms: true,
  },

  {
    name: 'Kabir Verma',
    email: 'kabir@student.preplytics.com',
    password: 'student123',
    role: 'student',
    branch: 'ECE',
    examTarget: 'GATE',
    semester: '6',
    acceptedTerms: true,
  },
];

const subjects = {
  DSA: {
    id: 'DSA',
    name: 'Data Structures & Algorithms',
    desc: 'Core coding concepts',
    weightage: 25,
  },

  DBMS: {
    id: 'DBMS',
    name: 'Database Management System',
    desc: 'SQL and database concepts',
    weightage: 20,
  },

  OS: {
    id: 'OS',
    name: 'Operating Systems',
    desc: 'Processes and scheduling',
    weightage: 20,
  },

  CN: {
    id: 'CN',
    name: 'Computer Networks',
    desc: 'Networking concepts',
    weightage: 15,
  },

  OOP: {
    id: 'OOP',
    name: 'Object Oriented Programming',
    desc: 'OOP principles',
    weightage: 10,
  },
};

const topics = {
  DSA: [
    {
      id: 'DSA-1',
      name: 'Arrays',
      difficulty: 'Easy',
      importance: 'High',
    },

    {
      id: 'DSA-2',
      name: 'Linked Lists',
      difficulty: 'Medium',
      importance: 'High',
    },

    {
      id: 'DSA-3',
      name: 'Trees',
      difficulty: 'Hard',
      importance: 'High',
    },
  ],

  DBMS: [
    {
      id: 'DBMS-1',
      name: 'Normalization',
      difficulty: 'Medium',
      importance: 'High',
    },

    {
      id: 'DBMS-2',
      name: 'Transactions',
      difficulty: 'Hard',
      importance: 'High',
    },
  ],

  OS: [
    {
      id: 'OS-1',
      name: 'CPU Scheduling',
      difficulty: 'Medium',
      importance: 'High',
    },

    {
      id: 'OS-2',
      name: 'Deadlocks',
      difficulty: 'Hard',
      importance: 'High',
    },
  ],
};

const notes = [
  {
    title: 'DBMS Quick Notes',
    subject: 'DBMS',
    uploadedBy: 'Admin',
  },

  {
    title: 'OS Important Topics',
    subject: 'OS',
    uploadedBy: 'Admin',
  },
];

const tests = [
  {
    title: 'DSA Mock Test',
    subject: 'DSA',
    marks: 50,
  },

  {
    title: 'DBMS Quiz',
    subject: 'DBMS',
    marks: 25,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected');

    // Clear old collections
    await User.deleteMany();
    await Progress.deleteMany();
    await StudentStore.deleteMany();
    await AppConfig.deleteMany();

    console.log('Old data removed');

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@preplytics.com',
      password: 'admin123',
      role: 'admin',
      acceptedTerms: true,
    });

    console.log('Admin created');

    // Create students
    for (const data of students) {
      const student = await User.create(data);

      console.log(`Student created: ${student.email}`);

      // Progress
      await Progress.create({
        user: student._id,

        streak: Math.floor(Math.random() * 20),

        totalHours: Math.floor(Math.random() * 200),

        dailyLog: [
          {
            date: '2026-05-18',
            hoursStudied: 3,
            topicsCompleted: 2,
          },

          {
            date: '2026-05-19',
            hoursStudied: 4,
            topicsCompleted: 1,
          },
        ],

        testResults: [
          {
            subject: 'DSA',
            testName: 'DSA Mock Test',
            score: 42,
            total: 50,
          },

          {
            subject: 'DBMS',
            testName: 'DBMS Quiz',
            score: 20,
            total: 25,
          },
        ],

        activityLog: [
          {
            message: 'Completed DSA practice',
          },

          {
            message: 'Read DBMS notes',
          },
        ],
      });

      // Student Store
      await StudentStore.create({
        user: student._id,

        study: {
          currentSubject: 'DSA',
          weeklyGoal: 20,
        },

        activity: {
          lastLogin: new Date(),
          quizzesAttempted: 5,
        },

        revisions: [
          {
            topic: 'Arrays',
            revisionDate: '2026-05-21',
          },
        ],

        manualEvents: [
          {
            title: 'Mock Interview',
            date: '2026-05-25',
          },
        ],
      });

      console.log(`Progress added for ${student.email}`);
    }

    // Global app config
    await AppConfig.create({
      key: 'global',

      subjects,

      topics,

      notes,

      tests,

      activityLog: [
        {
          message: 'Initial system seeded',
          time: new Date(),
        },
      ],

      settings: {
        failThreshold: 50,
        revDays: 3,
        maxStreak: 30,
      },
    });

    console.log('Subjects/topics/tests added');

    console.log('');
    console.log('================================');
    console.log('DATABASE SEEDED SUCCESSFULLY');
    console.log('================================');

    console.log('');
    console.log('ADMIN LOGIN');
    console.log('Email: admin@preplytics.com');
    console.log('Password: admin123');

    console.log('');
    console.log('STUDENT LOGIN');
    console.log('Email: aarav@student.preplytics.com');
    console.log('Password: student123');

    process.exit();

  } catch (error) {
    console.log('Seeder Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();