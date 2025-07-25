import { 
  users, type User, type InsertUser,
  chapters, type SelectChapter, type InsertChapter,
  lessons, type SelectLesson, type InsertLesson,
  userProgress, type SelectUserProgress, type InsertUserProgress
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail?(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOrUpdateOAuthUser?(oauthData: {
    email: string;
    fullName: string;
    username: string;
    provider: string;
  }): Promise<User>;
  
  // Course methods
  getChaptersByDomain(domain: string): Promise<SelectChapter[]>;
  getLessonsByChapter(chapterId: number): Promise<SelectLesson[]>;
  getLessonsByDomain(domain: string): Promise<SelectLesson[]>;
  getUserProgress(userId: number, domain: string): Promise<SelectUserProgress[]>;
  updateUserProgress(userId: number, lessonId: number, data: Partial<InsertUserProgress>): Promise<void>;
  initializeCourseData(): Promise<void>;
}

// Supabase Database Storage Implementation
import { db } from "./db";
import { eq, or, and, sql } from "drizzle-orm";
import { 
  generateAIOpsChapters, 
  generateMLOpsChapters, 
  generateAIOpsLessons, 
  generateMLOpsLessons 
} from "./data/course-data";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createOrUpdateOAuthUser(oauthData: {
    email: string;
    fullName: string;
    username: string;
    provider: string;
  }): Promise<User> {
    // Check if user exists by email
    const existingUser = await this.getUserByEmail(oauthData.email);
    
    if (existingUser) {
      return existingUser;
    }

    // Create new user for OAuth
    return this.createUser({
      username: oauthData.username,
      password: `oauth_${oauthData.provider}_${Date.now()}`, // OAuth users don't need passwords
      fullName: oauthData.fullName,
      email: oauthData.email,
      currentRole: null,
      yearsExperience: null,
      interest: null,
      resumeUrl: null,
    });
  }

  // Course-related methods
  async getChaptersByDomain(domain: string): Promise<SelectChapter[]> {
    return await db.select().from(chapters).where(eq(chapters.domain, domain));
  }

  async getLessonsByChapter(chapterId: number): Promise<SelectLesson[]> {
    return await db.select().from(lessons).where(eq(lessons.chapterId, chapterId));
  }

  async getLessonsByDomain(domain: string): Promise<SelectLesson[]> {
    return await db.select().from(lessons).where(eq(lessons.domain, domain));
  }

  async getUserProgress(userId: number, domain: string): Promise<SelectUserProgress[]> {
    return await db.select().from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.domain, domain)
      ));
  }

  async updateUserProgress(userId: number, lessonId: number, data: Partial<InsertUserProgress>): Promise<void> {
    const existing = await db.select().from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.lessonId, lessonId)
      ));

    if (existing.length > 0) {
      await db.update(userProgress)
        .set(data)
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.lessonId, lessonId)
        ));
    } else {
      await db.insert(userProgress).values({
        userId,
        lessonId,
        ...data
      } as InsertUserProgress);
    }
  }

  async initializeCourseData(): Promise<void> {
    // Course data is now handled by the video seeding function
    // Check if data already exists using correct column names
    try {
      const existingChapters = await db.execute(sql`SELECT * FROM chapters LIMIT 1`);
      if (existingChapters.rows.length > 0) {
        console.log('Course data already exists');
        return;
      }
    } catch (error) {
      console.log('Course data will be handled by video seeding function');
      return;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser,
      currentRole: insertUser.currentRole ?? null,
      yearsExperience: insertUser.yearsExperience ?? null,
      interest: insertUser.interest ?? null,
      resumeUrl: insertUser.resumeUrl ?? null,
      profileCompleted: insertUser.profileCompleted ?? false,
      assessmentCompleted: insertUser.assessmentCompleted ?? false,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Course methods - Stub implementations for MemStorage
  async getChaptersByDomain(domain: string): Promise<SelectChapter[]> {
    return [];
  }

  async getLessonsByChapter(chapterId: number): Promise<SelectLesson[]> {
    return [];
  }

  async getLessonsByDomain(domain: string): Promise<SelectLesson[]> {
    return [];
  }

  async getUserProgress(userId: number, domain: string): Promise<SelectUserProgress[]> {
    return [];
  }

  async updateUserProgress(userId: number, lessonId: number, data: Partial<InsertUserProgress>): Promise<void> {
    // No-op for MemStorage
  }

  async initializeCourseData(): Promise<void> {
    // No-op for MemStorage
  }
}

// Switch to DatabaseStorage for Supabase integration
export const storage = new DatabaseStorage();
