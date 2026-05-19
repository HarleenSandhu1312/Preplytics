/**
 * utils/seeder.js
 * Seeds the database with:
 * - default admin
 * - 3 mock students
 * - default subjects/topics
 * Run once with: node utils/seeder.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Progress = require('../models/Progress');
const StudentStore = require('../models/StudentStore');
const AppConfig = require('../models/AppConfig');

const mockStudents = [
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
    examTarget: 'Campus Placement',
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
    semester: '4',
    acceptedTerms: true,
  },
];

const defaultSubjects = {
  DSA: { id: 'DSA', name: 'Data Structures & Algorithms', icon: '', desc: 'Core coding concepts', weightage: 25 },
  DBMS: { id: 'DBMS', name: 'Database Management Systems', icon: '', desc: 'SQL and database concepts', weightage: 20 },
  OS: { id: 'OS', name: 'Operating Systems', icon: '', desc: 'Processes, memory and scheduling', weightage: 20 },
  CN: { id: 'CN', name: 'Computer Networks', icon: '', desc: 'Network layers and protocols', weightage: 15 },
  TOC: { id: 'TOC', name: 'Theory of Computation', icon: '', desc: 'Automata and formal languages', weightage: 10 },
  OOP: { id: 'OOP', name: 'Object Oriented Programming', icon: '', desc: 'OOP principles and design', weightage: 15 },
  APTI: { id: 'APTI', name: 'Aptitude', icon: '', desc: 'Quantitative and logical aptitude', weightage: 10 },
  SE: { id: 'SE', name: 'Software Engineering', icon: '', desc: 'SDLC and software processes', weightage: 10 },
};

const defaultTopics = {
  DSA: [
    { id: 'DSA-1', name: 'Arrays', difficulty: 'Easy', importance: 'High' },
    { id: 'DSA-2', name: 'Linked List', difficulty: 'Medium', importance: 'High' },
    { id: 'DSA-3', name: 'Trees', difficulty: 'Medium', importance: 'High' },
  ],
  DBMS: [
    { id: 'DBMS-1', name: 'Normalization', difficulty: 'Medium', importance: 'High' },
    { id: 'DBMS-2', name: 'Transactions', difficulty: 'Hard', importance: 'High' },
  ],
  OS: [
    { id: 'OS-1', name: 'CPU Scheduling', difficulty: 'Medium', importance: 'High' },
    { id: 'OS-2', name: 'Deadlocks', difficulty: 'Hard', importance: 'High' },
  ],
  CN: [
    { id: 'CN-1', name: 'OSI Model', difficulty: 'Easy', importance: 'High' },
    { id: 'CN-2', name: 'TCP vs UDP', difficulty: 'Medium', importance: 'High' },
  ],
  TOC: [
    { id: 'TOC-1', name: 'Finite Automata', difficulty: 'Medium', importance: 'High' },
    { id: 'TOC-2', name: 'Context Free Grammar', difficulty: 'Hard', importance: 'High' },
  ],
  OOP: [
    { id: 'OOP-1', name: 'Encapsulation', difficulty: 'Easy', importance: 'High' },
    { id: 'OOP-2', name: 'Polymorphism', difficulty: 'Medium', importance: 'High' },
  ],
  APTI: [
    { id: 'APTI-1', name: 'Percentages', difficulty: 'Easy', importance: 'Medium' },
    { id: 'APTI-2', name: 'Time and Work', difficulty: 'Medium', importance: 'Medium' },
  ],
  SE: [
    { id: 'SE-1', name: 'SDLC Models', difficulty: 'Easy', importance: 'High' },
    { id: 'SE-2', name: 'Requirement Engineering', difficulty: 'Medium', importance: 'High' },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: 'admin@preplytics.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@preplytics.com',
        password: 'admin123',
        role: 'admin',
        acceptedTerms: true,
      });
      console.log('✅ Default admin created: admin@preplytics.com / admin123');
    } else {
      console.log('ℹ Admin already exists');
    }

    for (const studentData of mockStudents) {
      let student = await User.findOne({ email: studentData.email });
      if (!student) {
        student = await User.create(studentData);
        console.log(`✅ Student created: ${student.email} / student123`);
      } else {
        console.log(`ℹ Student already exists: ${student.email}`);
      }

      const progress = await Progress.findOne({ user: student._id });
      if (!progress) {
        await Progress.create({ user: student._id });
      }

      const store = await StudentStore.findOne({ user: student._id });
      if (!store) {
        await StudentStore.create({ user: student._id });
      }
    }

    let appConfig = await AppConfig.findOne({ key: 'global' });
    if (!appConfig) {
      appConfig = await AppConfig.create({
        key: 'global',
        subjects: defaultSubjects,
        topics: defaultTopics,
        notes: [],
        tests: [],
        activityLog: [{ msg: 'Initial mock data seeded by system', time: new Date().toISOString() }],
      });
      console.log('✅ Default subjects/topics created');
    } else {
      appConfig.subjects = { ...(defaultSubjects || {}), ...(appConfig.subjects || {}) };
      appConfig.topics = { ...(defaultTopics || {}), ...(appConfig.topics || {}) };
      await appConfig.save();
      console.log('ℹ App config already exists (merged missing default subjects/topics)');
    }

    console.log('');
    console.log('Seed complete.');
    console.log('Admin:   admin@preplytics.com / admin123');
    console.log('Student: aarav@student.preplytics.com / student123');
    console.log('Student: diya@student.preplytics.com / student123');
    console.log('Student: kabir@student.preplytics.com / student123');
    process.exit(0);
  } catch (err) {
    console.error('Seeder error:', err.message);
    process.exit(1);
  }
};

seed();
