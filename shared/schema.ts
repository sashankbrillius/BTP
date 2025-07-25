import { pgTable, text, serial, boolean, timestamp, jsonb, uuid, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table - Core user information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").unique().notNull(),
  currentRole: text("current_role"),
  yearsExperience: text("years_experience"),
  interest: text("interest"), // AIOps or MLOps
  resumeUrl: text("resume_url"),
  profileCompleted: boolean("profile_completed").default(false),
  assessmentCompleted: boolean("assessment_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// MCQ Questions table - Multiple choice questions for assessments
export const mcqQuestions = pgTable("mcq_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of answer options
  correctAnswer: text("correct_answer").notNull(),
  category: text("category").notNull(),
  domain: text("domain").notNull(), // AIOps or MLOps
  experienceLevel: text("experience_level").notNull(), // beginner, intermediate, advanced
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Code Questions table - Coding challenges for assessments
export const codeQuestions = pgTable("code_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull(),
  domain: text("domain").notNull(), // AIOps or MLOps
  experienceLevel: text("experience_level").notNull(),
  category: text("category").notNull(),
  starterCode: text("starter_code"),
  testCases: jsonb("test_cases").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assessments table - User assessment results
export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mcqScore: text("mcq_score"),
  codingScore: text("coding_score"),
  totalScore: text("total_score"),
  mcqAnswers: jsonb("mcq_answers"), // Store MCQ answers and counts
  codeAnswer: text("code_answer"), // Store submitted code
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Courses table - User course enrollment and progress
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(), // AIOps or MLOps
  currentChapter: text("current_chapter").default("1").notNull(),
  progress: jsonb("progress").notNull(), // Object tracking chapter completion
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chapters table - Course chapters
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(), // 'AIOps' or 'MLOps'
  chapterNumber: integer("chapterNumber").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalLessons: integer("totalLessons").notNull()
});

// Lessons table - Individual video lessons
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapterId").notNull().references(() => chapters.id),
  domain: text("domain").notNull(),
  lessonNumber: integer("lessonNumber").notNull(),
  title: text("title").notNull(),
  videoUrl: text("videoUrl").notNull(),
  videoId: text("videoId").notNull(), // YouTube video ID
  duration: text("duration"),
  description: text("description")
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  lessonId: integer("lessonId").notNull().references(() => lessons.id),
  chapterId: integer("chapterId").notNull().references(() => chapters.id),
  domain: text("domain").notNull(),
  completed: boolean("completed").default(false),
  watchedDuration: integer("watchedDuration").default(0),
  lastWatched: timestamp("lastWatched").defaultNow()
});

// Relations for proper foreign key handling
export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  courses: many(courses),
  progress: many(userProgress),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  chapter: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id],
  }),
  userProgress: many(userProgress),
}));

// Zod schemas for validation
export const insertChapterSchema = createInsertSchema(chapters);
export const selectChapterSchema = createSelectSchema(chapters);
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type SelectChapter = z.infer<typeof selectChapterSchema>;

export const insertLessonSchema = createInsertSchema(lessons);
export const selectLessonSchema = createSelectSchema(lessons);
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type SelectLesson = z.infer<typeof selectLessonSchema>;

export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type SelectUserProgress = z.infer<typeof selectUserProgressSchema>;

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
  }),
}));

// Insert schemas - exclude auto-generated fields
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMcqQuestionSchema = createInsertSchema(mcqQuestions).omit({ id: true, createdAt: true });
export const insertCodeQuestionSchema = createInsertSchema(codeQuestions).omit({ id: true, createdAt: true });
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, completedAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectMcqQuestionSchema = createSelectSchema(mcqQuestions);
export const selectCodeQuestionSchema = createSelectSchema(codeQuestions);
export const selectAssessmentSchema = createSelectSchema(assessments);
export const selectCourseSchema = createSelectSchema(courses);

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertMcqQuestion = z.infer<typeof insertMcqQuestionSchema>;
export type McqQuestion = z.infer<typeof selectMcqQuestionSchema>;
export type InsertCodeQuestion = z.infer<typeof insertCodeQuestionSchema>;
export type CodeQuestion = z.infer<typeof selectCodeQuestionSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = z.infer<typeof selectAssessmentSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = z.infer<typeof selectCourseSchema>;