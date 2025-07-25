import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import passport from "./auth";
import { storage } from "./storage";
import { insertUserSchema, mcqQuestions, codeQuestions, assessments, users, courses, chapters, lessons, userProgress } from "../shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import { db } from "./db";
import { eq, and, sql, inArray, or, ilike } from "drizzle-orm";
import OpenAI from "openai";
import { ragService } from './pinecone';

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  
  // Local signup
  app.post("/api/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: fromZodError(result.error).toString()
        });
      }

      const { username, password, fullName, email, currentRole, yearsExperience, interest, resumeUrl } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      if (storage.getUserByEmail) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email,
        currentRole,
        yearsExperience,
        interest,
        resumeUrl
      });

      // Auto login after signup
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after signup" });
        }
        res.json({ 
          user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email },
          redirectTo: '/basic-details' // After signup, always go to basic details
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Local login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(400).json({ message: info?.message || "Login failed" });
      }
      
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login session error" });
        }
        
        // Check user completion status to determine redirect and message
        let redirectTo = '/dashboard'; // Default
        let message = 'Welcome back!';
        
        if (!user.profileCompleted) {
          redirectTo = '/basic-details';
          message = 'Please complete your profile to continue.';
        } else if (!user.assessmentCompleted) {
          redirectTo = '/assessment';
          message = 'Please complete your assessment to access the dashboard.';
        } else {
          message = `Welcome back to your dashboard!`;
        }
        
        res.json({ 
          user: { 
            id: user.id, 
            username: user.username, 
            fullName: user.fullName, 
            email: user.email,
            profileCompleted: user.profileCompleted,
            assessmentCompleted: user.assessmentCompleted
          },
          redirectTo,
          message
        });
      });
    })(req, res, next);
  });

  // Google OAuth routes
  app.get("/auth/google", passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get("/auth/google/callback", 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication
      res.redirect('/'); // Redirect to dashboard or home
    }
  );

  // LinkedIn OAuth routes
  app.get("/auth/linkedin", passport.authenticate('linkedin', {
    state: 'SOME STATE'
  }));

  app.get("/auth/linkedin/callback",
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication
      res.redirect('/'); // Redirect to dashboard or home
    }
  );

  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Logout (GET route for direct navigation)
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      // Redirect to homepage after logout
      res.redirect('/');
    });
  });

  // Get current user with complete profile data
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get fresh user data from database to ensure consistency
      const user = req.user as any;
      const freshUserData = await storage.getUser(user.id);
      
      if (!freshUserData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: freshUserData.id,
        username: freshUserData.username,
        fullName: freshUserData.fullName,
        email: freshUserData.email,
        currentRole: freshUserData.currentRole,
        yearsExperience: freshUserData.yearsExperience,
        interest: freshUserData.interest,
        profileCompleted: freshUserData.profileCompleted,
        assessmentCompleted: freshUserData.assessmentCompleted,
        resumeUrl: freshUserData.resumeUrl
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // User Profile Routes
  
  // Update user details
  app.post("/api/user/update-details", upload.single('resume'), async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const { currentRole, yearsExperience, interest } = req.body;
      const resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;

      // Update user in database
      await db.update(users)
        .set({
          currentRole,
          yearsExperience,
          interest,
          resumeUrl: resumeUrl || undefined,
          profileCompleted: true
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update details error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Assessment Routes
  
  // Get assessment questions based on user profile
  app.get("/api/assessment/questions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      
      // Get user details
      const [userDetails] = await db.select().from(users).where(eq(users.id, user.id));
      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }

      // Determine experience level based on years
      let experienceLevel = 'beginner';
      const years = userDetails.yearsExperience || '0-1';
      if (years.includes('2-5') || years.includes('5-10')) {
        experienceLevel = 'intermediate';
      } else if (years.includes('10+')) {
        experienceLevel = 'advanced';
      }

      // Get 10 MCQ questions from user's interest domain (AIOps/MLOps)
      const interestMcqResults = await db.select()
        .from(mcqQuestions)
        .where(and(
          eq(mcqQuestions.domain, userDetails.interest || 'AIOps'),
          eq(mcqQuestions.experienceLevel, experienceLevel)
        ))
        .limit(10);

      // Get 10 MCQ questions from user's role domain (DevOps)
      const roleMcqResults = await db.select()
        .from(mcqQuestions)
        .where(and(
          eq(mcqQuestions.domain, 'DevOps'),
          eq(mcqQuestions.experienceLevel, experienceLevel)
        ))
        .limit(10);

      // Combine both sets of questions
      const mcqResults = [...interestMcqResults, ...roleMcqResults];

      // Get 1 coding question and fix language if needed
      const [codeResult] = await db.select()
        .from(codeQuestions)
        .where(and(
          eq(codeQuestions.domain, userDetails.interest || 'AIOps'),
          eq(codeQuestions.experienceLevel, experienceLevel)
        ))
        .limit(1);
      
      // Comprehensive language detection and correction
      if (codeResult && codeResult.starterCode) {
        let detectedLanguage = codeResult.language || 'javascript';
        
        if (codeResult.starterCode.includes('def ') || codeResult.starterCode.includes('python')) {
          detectedLanguage = 'python';
        } else if (codeResult.starterCode.includes('function ') || codeResult.starterCode.includes('=>')) {
          detectedLanguage = 'javascript';
        } else if (codeResult.starterCode.includes('class ') && codeResult.starterCode.includes('public static void main')) {
          detectedLanguage = 'java';
        } else if (codeResult.starterCode.includes('#include') || codeResult.starterCode.includes('int main()')) {
          detectedLanguage = 'cpp';
        } else if (codeResult.starterCode.includes('func ') && codeResult.starterCode.includes('package main')) {
          detectedLanguage = 'go';
        }
        
        if (detectedLanguage !== codeResult.language) {
          console.log(`Primary: Detected ${detectedLanguage} code but stored as ${codeResult.language}, updating database`);
          await db.update(codeQuestions)
            .set({ language: detectedLanguage })
            .where(eq(codeQuestions.id, codeResult.id));
          codeResult.language = detectedLanguage; // Update in memory too
        }
      }

      console.log(`Fetching questions for interest: ${userDetails.interest}, role: DevOps, experience: ${experienceLevel}`);
      console.log(`Found ${interestMcqResults.length} interest MCQ + ${roleMcqResults.length} role MCQ + ${codeResult ? 1 : 0} coding questions`);

      // Ensure we have exactly 20 questions: 10 from interest domain + 10 from DevOps
      let mcqQuestionsList = mcqResults;
      let codeQuestion = codeResult;

      // Fill interest questions to 10 if needed
      if (interestMcqResults.length < 10) {
        console.log(`Only found ${interestMcqResults.length} ${userDetails.interest} questions, trying to fill to 10`);
        const interestRemaining = 10 - interestMcqResults.length;
        const additionalInterestQuestions = await db.select()
          .from(mcqQuestions)
          .where(eq(mcqQuestions.domain, userDetails.interest || 'AIOps'))
          .limit(interestRemaining);
        
        // Update interest questions
        const filledInterestQuestions = [...interestMcqResults, ...additionalInterestQuestions];
        console.log(`Filled ${userDetails.interest} questions: ${filledInterestQuestions.length}`);
        
        mcqQuestionsList = [...filledInterestQuestions, ...roleMcqResults];
      }

      // Fill DevOps questions to 10 if needed
      if (roleMcqResults.length < 10) {
        console.log(`Only found ${roleMcqResults.length} DevOps questions, trying to fill to 10`);
        const devopsRemaining = 10 - roleMcqResults.length;
        const additionalDevOpsQuestions = await db.select()
          .from(mcqQuestions)
          .where(eq(mcqQuestions.domain, 'DevOps'))
          .limit(devopsRemaining);
        
        // Update role questions  
        const filledDevOpsQuestions = [...roleMcqResults, ...additionalDevOpsQuestions];
        console.log(`Filled DevOps questions: ${filledDevOpsQuestions.length}`);
        
        mcqQuestionsList = [...interestMcqResults, ...filledDevOpsQuestions];
      }

      console.log(`Final question mix: ${interestMcqResults.length} ${userDetails.interest} + ${roleMcqResults.length} DevOps = ${mcqQuestionsList.length} total`);

      if (!codeQuestion) {
        console.log(`No coding questions found for ${userDetails.interest}/${experienceLevel}, trying domain only`);
        const codeResults = await db.select()
          .from(codeQuestions)
          .where(eq(codeQuestions.domain, userDetails.interest || 'AIOps'))
          .limit(1);
        codeQuestion = codeResults[0];
        
        // Fix language detection for all question types
        if (codeQuestion && codeQuestion.starterCode) {
          let detectedLanguage = codeQuestion.language || 'javascript';
          
          if (codeQuestion.starterCode.includes('def ') || codeQuestion.starterCode.includes('python')) {
            detectedLanguage = 'python';
          } else if (codeQuestion.starterCode.includes('function ') || codeQuestion.starterCode.includes('=>')) {
            detectedLanguage = 'javascript';
          } else if (codeQuestion.starterCode.includes('class ') && codeQuestion.starterCode.includes('public static void main')) {
            detectedLanguage = 'java';
          } else if (codeQuestion.starterCode.includes('#include') || codeQuestion.starterCode.includes('int main()')) {
            detectedLanguage = 'cpp';
          } else if (codeQuestion.starterCode.includes('func ') && codeQuestion.starterCode.includes('package main')) {
            detectedLanguage = 'go';
          }
          
          if (detectedLanguage !== codeQuestion.language) {
            console.log(`Detected ${detectedLanguage} code but stored as ${codeQuestion.language}, updating database`);
            await db.update(codeQuestions)
              .set({ language: detectedLanguage })
              .where(eq(codeQuestions.id, codeQuestion.id));
            codeQuestion.language = detectedLanguage; // Update in memory too
          }
        }
        
        console.log(`Found ${codeResults.length} coding questions with domain-only filter`);
      }

      res.json({
        mcqQuestions: mcqQuestionsList.map(q => ({
          id: q.id,
          question: q.question,
          options: Object.values(q.options || {}),
          category: q.category,
        })),
        codeQuestion: codeQuestion ? {
          id: codeQuestion.id,
          title: codeQuestion.title,
          description: codeQuestion.description,
          language: codeQuestion.language,
          starterCode: codeQuestion.starterCode,
          testCases: codeQuestion.testCases,
        } : null
      });

    } catch (error) {
      console.error("Get questions error:", error);
      res.status(500).json({ message: "Failed to load questions" });
    }
  });

  // Run code using Piston API
  app.post("/api/assessment/run-code", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { language, code } = req.body;

      // Call Piston API
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language === 'javascript' ? 'node' : language,
          version: '*',
          files: [{ content: code }]
        })
      });

      const result = await response.json();
      
      res.json({
        output: result.run?.stdout || '',
        stderr: result.run?.stderr || '',
        exitCode: result.run?.code || 0,
      });

    } catch (error) {
      console.error("Run code error:", error);
      res.status(500).json({ message: "Failed to execute code" });
    }
  });

  // Run code with test cases for enhanced assessment
  app.post("/api/assessment/run-code-tests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { language, code, testCases } = req.body;
      
      if (!testCases || testCases.length === 0) {
        return res.status(400).json({ message: 'No test cases provided' });
      }

      let testResults = [];
      let generalOutput = '';
      
      // Run each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
          // Build language-specific test code
          let testCode = '';
          
          if (language === 'python') {
            testCode = `
${code}

# Test case ${i + 1}
try:
    result = ${testCase.input}
    print(str(result))
except Exception as error:
    print("ERROR: " + str(error))`;
          } else if (language === 'java') {
            testCode = `
${code}

public class Main {
    public static void main(String[] args) {
        try {
            System.out.println(${testCase.input});
        } catch (Exception error) {
            System.out.println("ERROR: " + error.getMessage());
        }
    }
}`;
          } else if (language === 'cpp') {
            testCode = `
#include <iostream>
#include <string>
using namespace std;

${code}

int main() {
    try {
        cout << ${testCase.input} << endl;
    } catch (const exception& error) {
        cout << "ERROR: " << error.what() << endl;
    }
    return 0;
}`;
          } else if (language === 'go') {
            testCode = `
package main

import "fmt"

${code}

func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("ERROR:", r)
        }
    }()
    
    result := ${testCase.input}
    fmt.Println(result)
}`;
          } else {
            // Default to JavaScript/Node.js
            testCode = `
${code}

// Test case ${i + 1}
try {
  const result = ${testCase.input};
  console.log(result.toString());
} catch (error) {
  console.log("ERROR: " + error.message);
}`;
          }
          
          const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: language === 'javascript' ? 'javascript' : language,
              version: language === 'javascript' ? '18.15.0' : '*',
              files: [{ content: testCode }]
            })
          });

          const result = await response.json();
          const output = (result.run?.stdout || '').trim();
          const errorOutput = result.run?.stderr || result.compile?.stderr || '';
          const expected = testCase.expectedOutput?.toString().trim() || testCase.expected?.toString().trim() || '';
          const passed = output === expected && !errorOutput;
          
          testResults.push({
            testCase: i + 1,
            input: testCase.input,
            expected: expected,
            actual: output || (errorOutput ? `Error: ${errorOutput}` : 'No output'),
            passed: passed
          });
          
          // Capture general output from first test case
          if (i === 0) {
            generalOutput = output || errorOutput || 'Code executed';
          }
          
        } catch (testError) {
          console.error('Test case execution error:', testError);
          testResults.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput || testCase.expected || '',
            actual: `Error: ${(testError as Error).message || String(testError)}`,
            passed: false
          });
        }
      }

      res.json({ 
        output: generalOutput,
        testResults: testResults,
        passed: testResults.filter(t => t.passed).length,
        total: testResults.length
      });
    } catch (error) {
      console.error('Code execution error:', error);
      res.status(500).json({ message: 'Failed to execute code with tests' });
    }
  });

  // Submit assessment
  app.post("/api/assessment/submit", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const { mcqAnswers, codeAnswer, codeLanguage, timeSpent } = req.body;
      console.log('Submission received - codeLanguage:', codeLanguage, 'codeAnswer length:', codeAnswer?.length);

      // Get correct answers for MCQ questions
      let correctMcqAnswers = 0;
      let totalMcqQuestions = 0;

      if (mcqAnswers && Object.keys(mcqAnswers).length > 0) {
        const questionIds = Object.keys(mcqAnswers);
        totalMcqQuestions = questionIds.length;

        // Fetch correct answers from database
        const questions = await db.select()
          .from(mcqQuestions)
          .where(inArray(mcqQuestions.id, questionIds));

        // Check each answer
        for (const question of questions) {
          const userAnswer = mcqAnswers[question.id];
          console.log(`Question ${question.id}: User answered "${userAnswer}", Correct is "${question.correctAnswer}"`);
          if (userAnswer === question.correctAnswer) {
            correctMcqAnswers++;
          }
        }
      }

      // Calculate MCQ score as percentage
      const mcqScore = totalMcqQuestions > 0 ? Math.round((correctMcqAnswers / totalMcqQuestions) * 100) : 0;

      // Get userDetails first for domain
      const [userDetails] = await db.select().from(users).where(eq(users.id, user.id));
      
      // Calculate coding score with actual test case evaluation
      let codingScore = 0;
      let testCaseResults: any[] = [];
      
      if (codeAnswer) {
        try {
          // Get the coding question to run test cases
          const { codeQuestionId } = req.body;
          if (codeQuestionId) {
            const [question] = await db.select()
              .from(codeQuestions)
              .where(eq(codeQuestions.id, codeQuestionId))
              .limit(1);

            if (question && question.testCases) {
              const testCases = question.testCases as any[];
              let passedTests = 0;
              
              // Run each test case using Piston API  
              for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                try {
                  // Build language-specific test code (using the language from frontend or question)
                  const execLanguage = codeLanguage || question.language;
                  console.log(`Test ${i + 1}: Using language "${execLanguage}" for code execution`);
                  let testCode = '';
                  
                  if (execLanguage === 'python') {
                    testCode = `
${codeAnswer}

# Test case ${i + 1}
try:
    result = ${testCase.input}
    print(str(result))
except Exception as error:
    print("ERROR: " + str(error))`;
                  } else if (execLanguage === 'java') {
                    testCode = `
${codeAnswer}

public class Main {
    public static void main(String[] args) {
        try {
            System.out.println(${testCase.input});
        } catch (Exception error) {
            System.out.println("ERROR: " + error.getMessage());
        }
    }
}`;
                  } else if (execLanguage === 'cpp') {
                    testCode = `
#include <iostream>
#include <string>
using namespace std;

${codeAnswer}

int main() {
    try {
        cout << ${testCase.input} << endl;
    } catch (const exception& error) {
        cout << "ERROR: " << error.what() << endl;
    }
    return 0;
}`;
                  } else if (execLanguage === 'go') {
                    testCode = `
package main

import "fmt"

${codeAnswer}

func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("ERROR:", r)
        }
    }()
    
    result := ${testCase.input}
    fmt.Println(result)
}`;
                  } else {
                    // JavaScript (default)
                    testCode = `
${codeAnswer}

// Test case ${i + 1}
try {
  const result = ${testCase.input};
  console.log(result);
} catch (error) {
  console.log("ERROR: " + error.message);
}`;
                  }
                  
                  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      language: execLanguage === 'javascript' ? 'javascript' : execLanguage,
                      version: execLanguage === 'javascript' ? '18.15.0' : '*',
                      files: [{ content: testCode }]
                    })
                  });

                  const result = await response.json();
                  const output = (result.run?.stdout || '').trim();
                  const errorOutput = (result.run?.stderr || '').trim();
                  const expected = (testCase.expectedOutput || testCase.expected || '').toString().trim();
                  const actualOutput = output || (errorOutput ? `Error: ${errorOutput}` : 'No output');
                  const passed = output === expected;
                  
                  console.log(`Submission Test ${i + 1}: Expected="${expected}", Got="${output}", Passed=${passed}`);
                  
                  testCaseResults.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expected: expected,
                    actual: actualOutput,
                    passed: passed
                  });
                  
                  if (passed) {
                    passedTests++;
                  }
                  
                } catch (testError) {
                  console.error('Test case execution error:', testError);
                  testCaseResults.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expected: testCase.expectedOutput || testCase.expected || '',
                    actual: `Error: ${(testError as Error).message || String(testError)}`,
                    passed: false
                  });
                }
              }

              // Calculate score based on passed tests
              const testPassRate = testCases.length > 0 ? (passedTests / testCases.length) : 0;
              codingScore = Math.round(testPassRate * 100);
              
              console.log(`Code evaluation: ${passedTests}/${testCases.length} tests passed, score: ${codingScore}%`);
              console.log('Test case results:', testCaseResults);
            } else {
              // Fallback to basic scoring if no test cases
              codingScore = Math.min(60 + (codeAnswer.length > 50 ? 20 : 0), 80);
            }
          } else {
            // Fallback scoring
            codingScore = Math.min(60 + (codeAnswer.length > 50 ? 20 : 0), 80);
          }
        } catch (error) {
          console.error('Code scoring error:', error);
          // Fallback to basic scoring
          codingScore = Math.min(60 + (codeAnswer.length > 50 ? 20 : 0), 80);
        }
      }

      const totalScore = Math.round((mcqScore + codingScore) / 2);

      // Save assessment result with actual counts
      await db.insert(assessments).values({
        userId: user.id,
        mcqScore: mcqScore.toString(),
        codingScore: codingScore.toString(),
        totalScore: totalScore.toString(),
        mcqAnswers: JSON.stringify({
          correct: correctMcqAnswers,
          total: totalMcqQuestions,
          answers: mcqAnswers,
          testCaseResults: testCaseResults
        }),

        codeAnswer: codeAnswer || null,
      });

      // Mark assessment as completed
      
      await db.update(users)
        .set({ assessmentCompleted: true })
        .where(eq(users.id, user.id));

      // Assessment completed successfully - skip course creation for now

      res.json({ message: "Assessment submitted successfully" });

    } catch (error) {
      console.error("Submit assessment error:", error);
      res.status(500).json({ message: "Failed to submit assessment" });
    }
  });

  // Dashboard API
  app.get("/api/dashboard", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;

      // Get user details
      const [userDetails] = await db.select().from(users).where(eq(users.id, user.id));
      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get latest assessment results if they exist
      const assessmentResults = await db.execute(sql`
        SELECT mcq_score, coding_score, total_score, mcq_answers, code_answer, completed_at 
        FROM assessments 
        WHERE user_id = ${user.id}
        ORDER BY completed_at DESC 
        LIMIT 1
      `);
      
      const assessmentResult = assessmentResults.rows?.[0] || null;

      // Skip course progress for now due to schema mismatch
      const courseProgress = null;

      res.json({
        user: {
          id: userDetails.id,
          username: userDetails.username,
          fullName: userDetails.fullName,
          email: userDetails.email,
          currentRole: userDetails.currentRole,
          interest: userDetails.interest,
        },
        assessmentResults: assessmentResult ? {
          totalScore: parseInt(String(assessmentResult.total_score) || '0'),
          mcqScore: parseInt(String(assessmentResult.mcq_score) || '0'),
          codingScore: parseInt(String(assessmentResult.coding_score) || '0'),
          completedAt: assessmentResult.completed_at,
          status: 'completed'
        } : {
          status: userDetails.assessmentCompleted ? 'completed' : 'pending'
        },
        courseProgress: null, // Temporarily disabled due to schema mismatch
      });

    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  // Get assessment results with AI feedback
  app.get("/api/assessment/results", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;

      // Get latest assessment result
      const [result] = await db.select()
        .from(assessments)
        .where(eq(assessments.userId, user.id))
        .orderBy(assessments.completedAt)
        .limit(1);

      if (!result) {
        return res.status(404).json({ message: "No assessment found" });
      }

      // Parse stored MCQ answers data
      let mcqData: any = { correct: 0, total: 20, answers: {}, testCaseResults: [] };
      try {
        // Handle both string and object cases
        if (typeof result.mcqAnswers === 'string') {
          mcqData = JSON.parse(result.mcqAnswers);
        } else if (typeof result.mcqAnswers === 'object' && result.mcqAnswers !== null) {
          mcqData = result.mcqAnswers;
        }
      } catch (error) {
        console.error('Error parsing MCQ answers:', error);
        mcqData = { correct: 0, total: 20, answers: {}, testCaseResults: [] };
      }

      // Get question details separately
      const answerKeys = Object.keys(mcqData.answers || {});
      const questionDetails = answerKeys.length > 0 ? await db.select()
        .from(mcqQuestions)
        .where(inArray(mcqQuestions.id, answerKeys)) : [];
      
      const mcqDetailsWithAnswers = questionDetails.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: mcqData.answers[q.id],
        isCorrect: mcqData.answers[q.id] === q.correctAnswer
      }));
      
      // Get user details for personalized feedback
      const [userDetails] = await db.select().from(users).where(eq(users.id, user.id));

      // Generate AI feedback using OpenAI
      const prompt = `
        Analyze this assessment result for a ${userDetails?.interest || 'DevOps'} learner:
        - MCQ Score: ${result.mcqScore}%
        - Coding Score: ${result.codingScore}%
        - Total Score: ${result.totalScore}%
        - Experience Level: ${userDetails?.yearsExperience || 'Beginner'}
        - Current Role: ${userDetails?.currentRole || 'Student'}

        Provide personalized feedback in JSON format:
        {
          "strengths": ["strength1", "strength2", "strength3"],
          "improvements": ["area1", "area2", "area3"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "overallPerformance": "detailed analysis paragraph"
        }
      `;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const feedback = JSON.parse(aiResponse.choices[0].message.content || '{}');

      // Parse MCQ answers to get actual counts
      let mcqCorrect = 0;
      let mcqTotal = 20; // Default fallback
      
      try {
        if (result.mcqAnswers) {
          const mcqData = JSON.parse(result.mcqAnswers as string);
          mcqCorrect = mcqData.correct || 0;
          mcqTotal = mcqData.total || 20;
        } else {
          // Fallback: calculate from percentage
          mcqCorrect = Math.floor((parseInt(result.mcqScore || '0') / 100) * mcqTotal);
        }
      } catch (e) {
        // Fallback calculation
        mcqCorrect = Math.floor((parseInt(result.mcqScore || '0') / 100) * 20);
      }

      res.json({
        mcqScore: parseInt(result.mcqScore || '0'),
        codingScore: parseInt(result.codingScore || '0'),
        totalScore: parseInt(result.totalScore || '0'),
        mcqCorrect: mcqData.correct || mcqCorrect,
        mcqTotal: mcqData.total || mcqTotal,
        mcqDetails: mcqDetailsWithAnswers || [],
        testCaseResults: mcqData.testCaseResults || [],
        feedback,
        completedAt: result.completedAt,
      });

    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({ message: "Failed to load results" });
    }
  });

  // Course Routes
  
  // Get chapters by domain
  app.get("/api/courses/:domain/chapters", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { domain } = req.params;
      if (domain !== 'AIOps' && domain !== 'MLOps') {
        return res.status(400).json({ message: "Invalid domain" });
      }

      const chapterList = await storage.getChaptersByDomain(domain);
      res.json(chapterList);
    } catch (error) {
      console.error("Get chapters error:", error);
      res.status(500).json({ message: "Failed to get chapters" });
    }
  });

  // Get lessons by chapter
  app.get("/api/chapters/:chapterId/lessons", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const chapterId = parseInt(req.params.chapterId);
      const lessonList = await storage.getLessonsByChapter(chapterId);
      res.json(lessonList);
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ message: "Failed to get lessons" });
    }
  });

  // Get all lessons by domain
  app.get("/api/courses/:domain/lessons", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { domain } = req.params;
      if (domain !== 'AIOps' && domain !== 'MLOps') {
        return res.status(400).json({ message: "Invalid domain" });
      }

      const lessonList = await storage.getLessonsByDomain(domain);
      res.json(lessonList);
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ message: "Failed to get lessons" });
    }
  });

  // Get user progress for a domain
  app.get("/api/courses/:domain/progress", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const { domain } = req.params;
      if (domain !== 'AIOps' && domain !== 'MLOps') {
        return res.status(400).json({ message: "Invalid domain" });
      }

      const progress = await storage.getUserProgress(user.id, domain);
      res.json(progress);
    } catch (error) {
      console.error("Get user progress error:", error);
      res.status(500).json({ message: "Failed to get user progress" });
    }
  });

  // Update user progress for a lesson
  app.post("/api/lessons/:lessonId/progress", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const lessonId = parseInt(req.params.lessonId);
      const { completed, watchedDuration, chapterId, domain } = req.body;

      await storage.updateUserProgress(user.id, lessonId, {
        userId: user.id,
        lessonId,
        chapterId,
        domain,
        completed: completed || false,
        watchedDuration: watchedDuration || 0,
        lastWatched: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Enhanced Video Learning System Routes

  // Get user's last watched lesson for resume functionality  
  app.get("/api/learning/:domain/last-watched", isAuthenticated, async (req, res) => {
    try {
      const { domain } = req.params;
      const user = req.user as any;
      const userId = parseInt(user.id);

      // Get the most recent progress entry for this user and domain
      const lastWatchedResult = await db.execute(sql`
        SELECT up.chapter_id, up.lesson_id, up.last_watched, up.completed,
               c."chapterNumber", l."lessonNumber"
        FROM user_progress up
        LEFT JOIN lessons l ON up.lesson_id = l.id
        LEFT JOIN chapters c ON up.chapter_id = c.id
        WHERE up.user_id = ${userId} AND up.domain = ${domain}
        ORDER BY up.last_watched DESC
        LIMIT 1
      `);

      if (lastWatchedResult.rows.length > 0) {
        const lastWatched = lastWatchedResult.rows[0] as any;
        res.json({
          chapterId: lastWatched.chapter_id,
          lessonId: lastWatched.lesson_id,
          chapterNumber: lastWatched.chapterNumber,
          lessonNumber: lastWatched.lessonNumber,
          completed: lastWatched.completed
        });
      } else {
        // No progress found, return first chapter and lesson
        const firstChapterResult = await db.execute(sql`
          SELECT id, "chapterNumber" FROM chapters 
          WHERE domain = ${domain} 
          ORDER BY "chapterNumber" LIMIT 1
        `);
        
        if (firstChapterResult.rows.length > 0) {
          const firstChapter = firstChapterResult.rows[0] as any;
          res.json({
            chapterId: firstChapter.id,
            lessonId: null,
            chapterNumber: firstChapter.chapterNumber,
            lessonNumber: 1,
            completed: false
          });
        } else {
          res.json({
            chapterId: 1,
            lessonId: null,
            chapterNumber: 1,
            lessonNumber: 1,
            completed: false
          });
        }
      }
    } catch (error) {
      console.error("Error fetching last watched:", error);
      res.status(500).json({ message: "Failed to fetch last watched lesson" });
    }
  });

  // Get chapters with progress and unlock status for dashboard S-curve
  app.get("/api/learning/:domain/chapters", isAuthenticated, async (req, res) => {
    try {
      const { domain } = req.params;
      const user = req.user as any;

      // Normalize domain case for database lookup (MLOps, AIOps)
      const normalizedDomain = domain.toLowerCase() === 'mlops' ? 'MLOps' : 
                               domain.toLowerCase() === 'aiops' ? 'AIOps' : domain;

      // Get all chapters for domain
      const allChapters = await db.execute(sql`
        SELECT * FROM chapters 
        WHERE domain = ${normalizedDomain}
        ORDER BY "chapterNumber"
      `);

      // Get user's progress to determine unlocked chapters - handle missing table
      let userProgressData = { rows: [] };
      try {
        userProgressData = await db.execute(sql`
          SELECT * FROM user_progress 
          WHERE user_id = ${user.id}
        `);
        
        // Filter by domain manually since we need to check both cases
        userProgressData.rows = userProgressData.rows.filter((p: any) => 
          p.domain === normalizedDomain || p.domain === normalizedDomain.toUpperCase()
        );
        
      } catch (error) {
        console.log("User progress table doesn't exist yet, starting fresh");
        userProgressData = { rows: [] };
      }

      // Calculate chapter progress and unlock status
      console.log(`User ${user.id} progress for domain ${normalizedDomain}:`, userProgressData.rows.length, 'records');
      
      const chaptersWithProgress = allChapters.rows.map((chapter: any) => {
        const chapterProgress = userProgressData.rows.filter((p: any) => p.chapter_id === chapter.id);
        const completedLessons = chapterProgress.filter((p: any) => p.completed).length;
        const totalLessons = chapter.totalLessons;
        const isCompleted = completedLessons === totalLessons;
        
        console.log(`Chapter ${chapter.chapterNumber}: ${completedLessons}/${totalLessons} completed`);
        
        
        // Chapter 1 is always unlocked, others unlock when previous chapter is completed
        let isUnlocked = chapter.chapterNumber === 1;
        if (chapter.chapterNumber > 1) {
          const previousChapter = allChapters.rows.find((c: any) => c.chapterNumber === chapter.chapterNumber - 1);
          if (previousChapter) {
            const prevChapterProgress = userProgressData.rows.filter((p: any) => p.chapter_id === previousChapter.id);
            const prevChapterCompleted = prevChapterProgress.filter((p: any) => p.completed).length;
            isUnlocked = prevChapterCompleted >= (previousChapter as any).totalLessons;
            
            console.log(`Chapter ${chapter.chapterNumber} unlock check:`, {
              prevChapter: previousChapter.chapterNumber,
              prevCompleted: prevChapterCompleted,
              prevTotal: previousChapter.totalLessons,
              isUnlocked
            });
          }
        }

        return {
          id: chapter.id,
          domain: chapter.domain,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          description: chapter.description,
          totalLessons: chapter.totalLessons,
          progress: Math.round((completedLessons / totalLessons) * 100),
          completedLessons,
          isCompleted,
          isUnlocked
        };
      });

      res.json(chaptersWithProgress);
    } catch (error) {
      console.error("Get chapters error:", error);
      res.status(500).json({ message: "Failed to get chapters" });
    }
  });

  // Get lessons for a specific chapter with sequential unlock logic
  app.get("/api/learning/:domain/chapters/:chapterId/lessons", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { domain, chapterId } = req.params;
      const user = req.user as any;

      // Normalize domain case for database lookup (MLOps, AIOps)
      const normalizedDomain = domain.toLowerCase() === 'mlops' ? 'MLOps' : 
                               domain.toLowerCase() === 'aiops' ? 'AIOps' : domain;
      
      // Get lessons for this chapter - check actual column names
      const chapterLessons = await db.execute(sql`
        SELECT * FROM lessons 
        WHERE "chapterId" = ${parseInt(chapterId)} AND domain = ${normalizedDomain}
        ORDER BY "lessonNumber"
      `);

      // Get user's progress for these lessons - check if table exists and get data
      let progressData = { rows: [] };
      try {
        progressData = await db.execute(sql`
          SELECT * FROM user_progress 
          WHERE user_id = ${user.id} AND chapter_id = ${parseInt(chapterId)}
        `);
      } catch (error) {
        console.log("User progress table doesn't exist yet, starting fresh");
        progressData = { rows: [] };
      }

      // Add progress information to lessons with sequential unlock
      const lessonsWithProgress = chapterLessons.rows.map((lesson: any, index: number) => {
        const lessonProgress = progressData.rows.find((p: any) => p.lesson_id === lesson.id);
        
        // First lesson is always unlocked, others unlock when previous is completed
        let isUnlocked = index === 0;
        if (index > 0) {
          const previousLesson = chapterLessons.rows[index - 1];
          const prevProgress = progressData.rows.find((p: any) => p.lesson_id === previousLesson.id);
          isUnlocked = Boolean((prevProgress as any)?.completed) || false;
        }

        return {
          id: lesson.id,
          chapterId: lesson.chapterId,
          domain: lesson.domain,
          lessonNumber: lesson.lessonNumber,
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          videoId: lesson.videoId,
          duration: lesson.duration,
          description: lesson.description,
          completed: Boolean((lessonProgress as any)?.completed) || false,
          watchedDuration: Number((lessonProgress as any)?.watched_duration) || 0,
          lastWatched: (lessonProgress as any)?.last_watched,
          isUnlocked
        };
      });

      res.json(lessonsWithProgress);
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ message: "Failed to get lessons" });
    }
  });

  // Get lessons for a specific chapter using chapter NUMBER (not database ID)
  app.get("/api/learning/:domain/chapters/number/:chapterNumber/lessons", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { domain, chapterNumber } = req.params;
      const user = req.user as any;

      // Normalize domain case for database lookup (MLOps, AIOps)
      const normalizedDomain = domain.toLowerCase() === 'mlops' ? 'MLOps' : 
                               domain.toLowerCase() === 'aiops' ? 'AIOps' : domain;
      
      // First, find the chapter by chapter number to get the database ID
      const chapterResult = await db.execute(sql`
        SELECT id FROM chapters 
        WHERE domain = ${normalizedDomain} AND "chapterNumber" = ${parseInt(chapterNumber)}
        LIMIT 1
      `);

      if (chapterResult.rows.length === 0) {
        return res.status(404).json({ message: `Chapter ${chapterNumber} not found for domain ${normalizedDomain}` });
      }

      const chapterId = (chapterResult.rows[0] as any).id;
      
      // Get lessons for this chapter using the database ID
      const chapterLessons = await db.execute(sql`
        SELECT * FROM lessons 
        WHERE "chapterId" = ${chapterId} AND domain = ${normalizedDomain}
        ORDER BY "lessonNumber"
      `);

      // Get user's progress for these lessons
      let progressData = { rows: [] };
      try {
        progressData = await db.execute(sql`
          SELECT * FROM user_progress 
          WHERE user_id = ${user.id} AND chapter_id = ${chapterId}
        `);
      } catch (error) {
        console.log("User progress table doesn't exist yet, starting fresh");
        progressData = { rows: [] };
      }

      // Add progress information to lessons with sequential unlock
      const lessonsWithProgress = chapterLessons.rows.map((lesson: any, index: number) => {
        const lessonProgress = progressData.rows.find((p: any) => p.lesson_id === lesson.id);
        
        // First lesson is always unlocked, others unlock when previous is completed
        let isUnlocked = index === 0;
        if (index > 0) {
          const previousLesson = chapterLessons.rows[index - 1];
          const prevProgress = progressData.rows.find((p: any) => p.lesson_id === previousLesson.id);
          isUnlocked = Boolean((prevProgress as any)?.completed) || false;
        }

        return {
          id: lesson.id,
          chapterId: lesson.chapterId,
          domain: lesson.domain,
          lessonNumber: lesson.lessonNumber,
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          videoId: lesson.videoId,
          duration: lesson.duration,
          description: lesson.description,
          completed: Boolean((lessonProgress as any)?.completed) || false,
          watchedDuration: Number((lessonProgress as any)?.watched_duration) || 0,
          lastWatched: (lessonProgress as any)?.last_watched,
          isUnlocked
        };
      });

      console.log(`Chapter ${chapterNumber} (ID: ${chapterId}) lessons for ${normalizedDomain}:`, lessonsWithProgress.length);
      res.json(lessonsWithProgress);
    } catch (error) {
      console.error("Get lessons by chapter number error:", error);
      res.status(500).json({ message: "Failed to get lessons" });
    }
  });

  // Update lesson progress with automatic chapter unlock
  app.post("/api/learning/lessons/:lessonId/progress", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { lessonId } = req.params;
      const { completed, watchedDuration } = req.body;
      const user = req.user as any;

      // Get lesson details using raw SQL with correct column names
      const lessonResult = await db.execute(sql`
        SELECT * FROM lessons WHERE id = ${parseInt(lessonId)} LIMIT 1
      `);
      
      if (lessonResult.rows.length === 0) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const lesson = lessonResult.rows[0] as any;

      // Check if progress record exists, then update or insert
      const existingProgress = await db.execute(sql`
        SELECT id FROM user_progress 
        WHERE user_id = ${user.id} AND lesson_id = ${parseInt(lessonId)}
        LIMIT 1
      `);

      if (existingProgress.rows.length > 0) {
        // Update existing record
        await db.execute(sql`
          UPDATE user_progress 
          SET completed = ${completed || false}, 
              watched_duration = ${watchedDuration || 0}, 
              last_watched = NOW()
          WHERE user_id = ${user.id} AND lesson_id = ${parseInt(lessonId)}
        `);
      } else {
        // Insert new record
        await db.execute(sql`
          INSERT INTO user_progress (user_id, lesson_id, chapter_id, domain, completed, watched_duration, last_watched)
          VALUES (${user.id}, ${parseInt(lessonId)}, ${lesson.chapterId}, ${lesson.domain}, ${completed || false}, ${watchedDuration || 0}, NOW())
        `);
      }

      // Check if this completion unlocks the next chapter
      if (completed) {
        const chapterLessons = await db.execute(sql`
          SELECT COUNT(*) as total FROM lessons WHERE "chapterId" = ${lesson.chapterId}
        `);
        
        const completedInChapter = await db.execute(sql`
          SELECT COUNT(*) as completed FROM user_progress 
          WHERE user_id = ${user.id} AND chapter_id = ${lesson.chapterId} AND completed = true
        `);
        
        const totalLessons = chapterLessons.rows[0] as any;
        const completedLessons = completedInChapter.rows[0] as any;
        
        if (completedLessons.completed >= totalLessons.total) {
          console.log(`🎉 User ${user.id} completed Chapter ${lesson.chapterId}! Next chapter should unlock.`);
        }
      }

      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // AI Assistant Routes

  // Code execution using Piston API
  app.post("/api/assistant/execute", async (req, res) => {
    try {
      const { code, language, input } = req.body;

      // Language mapping for Piston API
      const languageMap: { [key: string]: string } = {
        'javascript': 'javascript',
        'python': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c++': 'cpp',
        'go': 'go',
        'typescript': 'typescript'
      };

      const pistonLanguage = languageMap[language.toLowerCase()] || 'javascript';

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonLanguage,
          version: '*',
          files: [
            {
              name: pistonLanguage === 'python' ? 'main.py' : 
                    pistonLanguage === 'java' ? 'Main.java' :
                    pistonLanguage === 'cpp' ? 'main.cpp' : 'main.js',
              content: code
            }
          ],
          stdin: input || '',
          compile_timeout: 10000,
          run_timeout: 3000,
        }),
      });

      const result = await response.json();
      
      res.json({
        output: result.run?.stdout || '',
        error: result.run?.stderr || result.compile?.stderr || '',
        success: !result.run?.stderr && !result.compile?.stderr
      });

    } catch (error) {
      console.error('Code execution error:', error);
      res.status(500).json({ 
        output: '',
        error: 'Failed to execute code',
        success: false
      });
    }
  });

  // RAG-based AI response generation using Pinecone knowledge base
  app.post("/api/rag/generate", isAuthenticated, async (req, res) => {
    try {
      const { query, domain, conversationHistory } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Get user's domain from their profile if not provided
      let userDomain = domain;
      if (!userDomain && req.user) {
        const user = req.user as any;
        const userProfile = await storage.getUser(user.id);
        userDomain = userProfile?.interest; // AIOps or MLOps
      }

      // Generate RAG response using Pinecone knowledge base
      const response = await ragService.generateRAGResponse(
        query, 
        userDomain, 
        conversationHistory || []
      );

      res.json({ response });

    } catch (error) {
      console.error('RAG generation error:', error);
      
      // Fallback to direct LLM if RAG fails
      try {
        const fallbackPrompt = `You are an expert AI assistant for the Brillius learning platform specializing in DevOps, MLOps, and AIOps education. 

User question: ${query}

Provide a helpful, educational response following these guidelines:
- Give practical, actionable advice
- Include code examples when relevant  
- Suggest learning concepts when appropriate
- Keep explanations clear and beginner-friendly
- Focus on best practices and real-world applications`;

        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: fallbackPrompt }],
          max_tokens: 800,
          temperature: 0.7,
        });

        const fallbackResponse = aiResponse.choices[0].message.content || "I'm having trouble generating a response right now.";
        res.json({ response: fallbackResponse });
      } catch (fallbackError) {
        console.error('Fallback generation error:', fallbackError);
        res.status(500).json({ message: "Failed to generate AI response" });
      }
    }
  });

  // Direct LLM response generation
  app.post("/api/llm/generate", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Direct OpenAI call without RAG enhancement
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful programming tutor. Provide clear, concise answers to programming questions."
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 600,
        temperature: 0.5,
      });

      const response = aiResponse.choices[0].message.content || "I'm having trouble generating a response right now.";

      res.json({ response });

    } catch (error) {
      console.error('LLM generation error:', error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  // YouTube search using actual course database
  app.post("/api/youtube/search", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Search actual course videos from database
      const searchResults = await db.select({
        id: lessons.id,
        title: lessons.title,
        videoUrl: lessons.videoUrl,
        videoId: lessons.videoId,
        duration: lessons.duration,
        description: lessons.description,
        domain: lessons.domain,
        chapterNumber: chapters.chapterNumber
      })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(
        or(
          ilike(lessons.title, `%${query}%`),
          ilike(lessons.description, `%${query}%`),
          ilike(chapters.title, `%${query}%`)
        )
      )
      .limit(10);

      const videos = searchResults.map(lesson => ({
        id: lesson.videoId,
        title: lesson.title,
        url: lesson.videoUrl,
        thumbnail: `https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg`,
        duration: lesson.duration || '10 min',
        channel: `${lesson.domain} Course - Chapter ${lesson.chapterNumber}`,
        description: lesson.description || `Learn ${lesson.title} in this comprehensive video lesson.`
      }));

      console.log(`Found ${videos.length} videos for query: ${query}`);
      res.json({ videos });

    } catch (error) {
      console.error('YouTube search error:', error);
      res.status(500).json({ message: "Failed to search videos" });
    }
  });

  // Pinecone knowledge base search
  app.post("/api/pinecone/search", isAuthenticated, async (req, res) => {
    try {
      const { query, domain, topK } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Get user's domain from their profile if not provided
      let searchDomain = domain;
      if (!searchDomain && req.user) {
        const user = req.user as any;
        const userProfile = await storage.getUser(user.id);
        searchDomain = userProfile?.interest; // AIOps or MLOps
      }

      // Search Pinecone knowledge base
      const searchResults = await ragService.searchDocuments(
        query, 
        searchDomain, 
        topK || 5
      );

      // Transform search results into video-like format for frontend compatibility
      const transformedResults = searchResults.map((result, index) => ({
        id: result.metadata.id || `search-${index}`,
        title: result.metadata.title,
        url: result.metadata.source || '#',
        score: result.score,
        content: result.text,
        domain: result.metadata.domain,
        type: result.metadata.type,
        chapter: result.metadata.chapter || null,
        description: result.text.substring(0, 200) + '...'
      }));

      res.json({ 
        results: transformedResults,
        query: query,
        domain: searchDomain,
        count: transformedResults.length
      });

    } catch (error) {
      console.error('Pinecone search error:', error);
      res.status(500).json({ message: "Failed to search knowledge base" });
    }
  });

  // Initialize Pinecone knowledge base
  app.post("/api/admin/init-knowledge-base", async (req, res) => {
    try {
      await ragService.initializeKnowledgeBase();
      res.json({ message: "Knowledge base initialized successfully" });
    } catch (error) {
      console.error('Knowledge base initialization error:', error);
      res.status(500).json({ message: "Failed to initialize knowledge base" });
    }
  });

  // Enhanced chat endpoint with conversation history
  app.post("/api/assistant/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get user's domain for contextual responses
      const user = req.user as any;
      const userProfile = await storage.getUser(user.id);
      const userDomain = userProfile?.interest; // AIOps or MLOps

      // Generate RAG response with conversation context
      const response = await ragService.generateRAGResponse(
        message, 
        userDomain, 
        conversationHistory || []
      );

      res.json({ 
        response,
        timestamp: new Date().toISOString(),
        domain: userDomain 
      });

    } catch (error) {
      console.error('Assistant chat error:', error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
