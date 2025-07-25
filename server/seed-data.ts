import { db } from "./db";
import { mcqQuestions, codeQuestions } from "../shared/schema";

export async function seedAssessmentData() {
  try {
    // Check if data already exists
    const existingMCQ = await db.select().from(mcqQuestions).limit(1);
    if (existingMCQ.length > 0) {
      console.log('Assessment data already exists');
      return;
    }

    // AIOps MCQ Questions - Beginner Level
    const aiopsBeginnerMCQs = [
      {
        question: 'What does AIOps stand for?',
        options: ['Artificial Intelligence Operations', 'Automated IT Operations', 'Advanced Infrastructure Ops', 'Application Intelligence Operations'],
        correctAnswer: 'Artificial Intelligence Operations',
        category: 'Fundamentals',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which is the primary benefit of implementing AIOps?',
        options: ['Reducing hardware costs', 'Predicting and preventing IT issues', 'Eliminating human jobs', 'Increasing network speed'],
        correctAnswer: 'Predicting and preventing IT issues',
        category: 'Benefits',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What type of data does AIOps primarily analyze?',
        options: ['Financial data', 'Machine logs and metrics', 'Customer feedback', 'Marketing data'],
        correctAnswer: 'Machine logs and metrics',
        category: 'Data Analysis',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which technology is essential for AIOps implementation?',
        options: ['Virtual reality', 'Machine learning', 'Blockchain', '3D printing'],
        correctAnswer: 'Machine learning',
        category: 'Technology',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is anomaly detection in AIOps?',
        options: ['Detecting hardware failures', 'Identifying unusual patterns in IT data', 'Finding software bugs', 'Monitoring user behavior'],
        correctAnswer: 'Identifying unusual patterns in IT data',
        category: 'Monitoring',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which metric is most important for measuring system availability?',
        options: ['CPU usage', 'Uptime percentage', 'Network bandwidth', 'Disk space'],
        correctAnswer: 'Uptime percentage',
        category: 'Metrics',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is the purpose of log aggregation in AIOps?',
        options: ['To delete old logs', 'To centralize logs from multiple sources', 'To compress log files', 'To encrypt log data'],
        correctAnswer: 'To centralize logs from multiple sources',
        category: 'Log Management',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which of these is a common AIOps use case?',
        options: ['Social media management', 'Predictive maintenance', 'E-commerce sales', 'Content creation'],
        correctAnswer: 'Predictive maintenance',
        category: 'Use Cases',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What does MTTR stand for in IT operations?',
        options: ['Maximum Time To Response', 'Mean Time To Recovery', 'Minimum Time To Restart', 'Monthly Technical Time Report'],
        correctAnswer: 'Mean Time To Recovery',
        category: 'Metrics',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which component is crucial for real-time monitoring in AIOps?',
        options: ['Data warehouse', 'Streaming analytics', 'Backup systems', 'User interfaces'],
        correctAnswer: 'Streaming analytics',
        category: 'Monitoring',
        domain: 'AIOps',
        experienceLevel: 'beginner',
      },
    ];

    // MLOps MCQ Questions - Beginner Level  
    const mlopsBeginnerMCQs = [
      {
        question: 'What does MLOps stand for?',
        options: ['Machine Learning Operations', 'Multi-Level Operations', 'Modern Logic Operations', 'Managed Learning Operations'],
        correctAnswer: 'Machine Learning Operations',
        category: 'Fundamentals',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is the primary goal of MLOps?',
        options: ['To create ML models', 'To streamline ML model deployment and lifecycle', 'To collect training data', 'To visualize results'],
        correctAnswer: 'To streamline ML model deployment and lifecycle',
        category: 'Goals',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which stage comes after model training in MLOps?',
        options: ['Data collection', 'Model validation', 'Feature engineering', 'Problem definition'],
        correctAnswer: 'Model validation',
        category: 'Lifecycle',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is model drift in MLOps?',
        options: ['Moving models to different servers', 'Gradual decline in model performance', 'Changing model architecture', 'Updating training data'],
        correctAnswer: 'Gradual decline in model performance',
        category: 'Model Management',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which tool is commonly used for ML model versioning?',
        options: ['Excel', 'Git/DVC', 'PowerPoint', 'Calculator'],
        correctAnswer: 'Git/DVC',
        category: 'Tools',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is A/B testing in MLOps?',
        options: ['Testing model accuracy', 'Comparing two model versions in production', 'Testing data quality', 'Testing server performance'],
        correctAnswer: 'Comparing two model versions in production',
        category: 'Testing',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which metric is important for classification models?',
        options: ['Temperature', 'Precision and Recall', 'Network speed', 'Disk usage'],
        correctAnswer: 'Precision and Recall',
        category: 'Metrics',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is continuous integration in MLOps?',
        options: ['Continuously collecting data', 'Automatically testing and integrating model changes', 'Running models 24/7', 'Continuously training models'],
        correctAnswer: 'Automatically testing and integrating model changes',
        category: 'CI/CD',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'Which environment should be used before production deployment?',
        options: ['Development', 'Staging/Testing', 'Personal laptop', 'Customer environment'],
        correctAnswer: 'Staging/Testing',
        category: 'Deployment',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
      {
        question: 'What is feature engineering in MLOps?',
        options: ['Building software features', 'Transforming raw data into model inputs', 'Engineering team features', 'Product feature planning'],
        correctAnswer: 'Transforming raw data into model inputs',
        category: 'Data Preparation',
        domain: 'MLOps',
        experienceLevel: 'beginner',
      },
    ];

    // Insert MCQ questions
    console.log('Seeding AIOps MCQ questions...');
    for (const mcq of aiopsBeginnerMCQs) {
      await db.insert(mcqQuestions).values(mcq);
    }

    console.log('Seeding MLOps MCQ questions...');
    for (const mcq of mlopsBeginnerMCQs) {
      await db.insert(mcqQuestions).values(mcq);
    }

    // AIOps Code Questions
    const aiopsCodeQuestions = [
      {
        title: 'System Health Monitor',
        description: 'Create a function that monitors system health by checking if CPU, memory, and disk usage are within acceptable thresholds. Return true if all metrics are healthy, false otherwise.\n\nHealthy thresholds:\n- CPU: < 80%\n- Memory: < 85% \n- Disk: < 90%',
        language: 'javascript',
        domain: 'AIOps',
        experienceLevel: 'beginner',
        category: 'Monitoring',
        starterCode: `function checkSystemHealth(metrics) {
  // metrics = { cpu: 75, memory: 60, disk: 45 }
  // Return true if all metrics are within healthy thresholds
  
  return true; // Replace with your implementation
}`,
        testCases: [
          {
            input: '{"cpu": 75, "memory": 60, "disk": 45}',
            expectedOutput: 'true',
            description: 'All metrics within healthy range'
          },
          {
            input: '{"cpu": 85, "memory": 60, "disk": 45}',
            expectedOutput: 'false', 
            description: 'CPU exceeds threshold'
          },
          {
            input: '{"cpu": 75, "memory": 90, "disk": 95}',
            expectedOutput: 'false',
            description: 'Memory and disk exceed thresholds'
          }
        ],
      }
    ];

    // MLOps Code Questions  
    const mlopsCodeQuestions = [
      {
        title: 'Model Performance Validator',
        description: 'Create a function that validates if a machine learning model performance meets minimum requirements. The function should check accuracy, precision, and recall metrics.\n\nMinimum requirements:\n- Accuracy: >= 0.8 (80%)\n- Precision: >= 0.75 (75%)\n- Recall: >= 0.7 (70%)',
        language: 'javascript', 
        domain: 'MLOps',
        experienceLevel: 'beginner',
        category: 'Model Validation',
        starterCode: `function validateModelPerformance(metrics) {
  // metrics = { accuracy: 0.85, precision: 0.78, recall: 0.72 }
  // Return true if all metrics meet minimum requirements
  
  return true; // Replace with your implementation
}`,
        testCases: [
          {
            input: '{"accuracy": 0.85, "precision": 0.78, "recall": 0.72}',
            expectedOutput: 'true',
            description: 'All metrics meet requirements'
          },
          {
            input: '{"accuracy": 0.75, "precision": 0.78, "recall": 0.72}',
            expectedOutput: 'false',
            description: 'Accuracy below threshold'
          },
          {
            input: '{"accuracy": 0.85, "precision": 0.65, "recall": 0.60}',
            expectedOutput: 'false', 
            description: 'Precision and recall below thresholds'
          }
        ],
      }
    ];

    // Insert code questions
    console.log('Seeding AIOps code questions...');
    for (const codeQ of aiopsCodeQuestions) {
      await db.insert(codeQuestions).values(codeQ);
    }

    console.log('Seeding MLOps code questions...');
    for (const codeQ of mlopsCodeQuestions) {
      await db.insert(codeQuestions).values(codeQ);
    }

    console.log('Assessment data seeded successfully!');

  } catch (error) {
    console.error('Error seeding assessment data:', error);
  }
}