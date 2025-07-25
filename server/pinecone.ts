import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is required');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'devops';

export interface KnowledgeDocument {
  id: string;
  text: string;
  metadata: {
    title: string;
    domain: string;
    chapter?: string;
    type: 'course' | 'documentation' | 'tutorial' | 'faq';
    source?: string;
  };
}

export class RAGService {
  private index: any;

  constructor() {
    this.index = pinecone.index(indexName);
  }

  // Generate embeddings using OpenAI with 384 dimensions to match Pinecone index
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 384 // Match Pinecone index dimension
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  // Store documents in Pinecone
  async storeDocuments(documents: KnowledgeDocument[]): Promise<void> {
    try {
      const vectors = await Promise.all(
        documents.map(async (doc) => {
          const embedding = await this.generateEmbeddings(doc.text);
          return {
            id: doc.id,
            values: embedding,
            metadata: {
              text: doc.text,
              ...doc.metadata,
            },
          };
        })
      );

      // Upsert vectors in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
      }

      console.log(`Successfully stored ${documents.length} documents in Pinecone`);
    } catch (error) {
      console.error('Error storing documents in Pinecone:', error);
      throw error;
    }
  }

  // Search for relevant documents
  async searchDocuments(
    query: string,
    domain?: string,
    topK: number = 5
  ): Promise<Array<{ text: string; metadata: any; score: number }>> {
    try {
      const queryEmbedding = await this.generateEmbeddings(query);

      const filter: any = {};
      if (domain) {
        filter.domain = domain;
      }

      const searchRequest: any = {
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false,
      };

      if (Object.keys(filter).length > 0) {
        searchRequest.filter = filter;
      }

      const response = await this.index.query(searchRequest);

      return response.matches.map((match: any) => ({
        text: match.metadata.text,
        metadata: match.metadata,
        score: match.score,
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  // Generate RAG response
  async generateRAGResponse(
    userQuery: string,
    domain?: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      // Search for relevant documents
      const relevantDocs = await this.searchDocuments(userQuery, domain, 5);

      // Build context from retrieved documents
      const context = relevantDocs
        .map((doc, index) => `[${index + 1}] ${doc.text}`)
        .join('\n\n');

      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Create system prompt
      const systemPrompt = `You are an AI assistant for the Brillius learning platform, specializing in AIOps and MLOps education. You help students understand concepts, troubleshoot issues, and navigate their learning journey.

Context from knowledge base:
${context}

Previous conversation:
${conversationContext}

Guidelines:
- Provide accurate, helpful responses based on the context above
- If the context doesn't contain relevant information, acknowledge this and provide general guidance
- Focus on practical, actionable advice for ${domain || 'DevOps/MLOps/AIOps'} learning
- Suggest relevant course chapters or videos when appropriate
- Be encouraging and supportive of the student's learning journey
- Keep responses concise but comprehensive`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return response.choices[0].message.content || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';
    } catch (error) {
      console.error('Error generating RAG response:', error);
      throw error;
    }
  }

  // Initialize knowledge base with course content
  async initializeKnowledgeBase(): Promise<void> {
    try {
      // Check if knowledge base already exists
      const stats = await this.index.describeIndexStats();
      if (stats.totalVectorCount && stats.totalVectorCount > 0) {
        console.log(`Knowledge base already exists with ${stats.totalVectorCount} vectors`);
        return;
      }
      
      console.log('Setting up knowledge base for first time');
      const knowledgeDocuments: KnowledgeDocument[] = [
        // AIOps Knowledge Base
        {
          id: 'aiops-intro-1',
          text: 'AIOps (Artificial Intelligence for IT Operations) is the application of machine learning and AI technologies to automate and enhance IT operations. It combines big data, analytics, and machine learning to identify and resolve IT issues proactively.',
          metadata: {
            title: 'Introduction to AIOps',
            domain: 'AIOps',
            chapter: '1',
            type: 'course',
            source: 'Chapter 1: AIOps Fundamentals',
          },
        },
        {
          id: 'aiops-monitoring-2',
          text: 'AIOps monitoring involves collecting and analyzing massive amounts of data from various IT infrastructure components including servers, networks, applications, and cloud services. This data is processed using machine learning algorithms to detect anomalies and predict potential issues.',
          metadata: {
            title: 'AIOps Monitoring and Data Collection',
            domain: 'AIOps',
            chapter: '2',
            type: 'course',
            source: 'Chapter 2: Monitoring Systems',
          },
        },
        {
          id: 'aiops-analytics-3',
          text: 'Advanced analytics in AIOps includes real-time stream processing, pattern recognition, correlation analysis, and predictive modeling. These techniques help identify root causes of issues and predict future problems before they impact users.',
          metadata: {
            title: 'AIOps Analytics and Pattern Recognition',
            domain: 'AIOps',
            chapter: '3',
            type: 'course',
            source: 'Chapter 3: Analytics Engine',
          },
        },
        {
          id: 'aiops-automation-4',
          text: 'AIOps automation includes automated incident response, self-healing systems, and intelligent remediation. This reduces manual intervention and ensures faster resolution of IT issues while maintaining system reliability.',
          metadata: {
            title: 'AIOps Automation and Self-Healing',
            domain: 'AIOps',
            chapter: '4',
            type: 'course',
            source: 'Chapter 4: Automation Systems',
          },
        },

        // MLOps Knowledge Base
        {
          id: 'mlops-intro-1',
          text: 'MLOps (Machine Learning Operations) is a set of practices that combines Machine Learning, DevOps, and Data Engineering to deploy and maintain ML systems in production reliably and efficiently. It focuses on automation, monitoring, and governance of ML workflows.',
          metadata: {
            title: 'Introduction to MLOps',
            domain: 'MLOps',
            chapter: '1',
            type: 'course',
            source: 'Chapter 1: MLOps Fundamentals',
          },
        },
        {
          id: 'mlops-pipeline-2',
          text: 'MLOps pipelines include data ingestion, data preprocessing, feature engineering, model training, model validation, model deployment, and monitoring. These pipelines ensure reproducible and scalable ML workflows.',
          metadata: {
            title: 'MLOps Pipeline Architecture',
            domain: 'MLOps',
            chapter: '2',
            type: 'course',
            source: 'Chapter 2: Pipeline Design',
          },
        },
        {
          id: 'mlops-versioning-3',
          text: 'Model versioning and experiment tracking in MLOps involves tracking data versions, code versions, model versions, and hyperparameters. Tools like MLflow, DVC, and Weights & Biases help manage this complexity.',
          metadata: {
            title: 'Model Versioning and Experiment Tracking',
            domain: 'MLOps',
            chapter: '3',
            type: 'course',
            source: 'Chapter 3: Version Control',
          },
        },
        {
          id: 'mlops-deployment-4',
          text: 'Model deployment in MLOps includes containerization with Docker, orchestration with Kubernetes, API development, A/B testing, and gradual rollouts. This ensures safe and scalable model deployment to production.',
          metadata: {
            title: 'Model Deployment and Serving',
            domain: 'MLOps',
            chapter: '4',
            type: 'course',
            source: 'Chapter 4: Deployment Strategies',
          },
        },

        // General DevOps Knowledge
        {
          id: 'devops-ci-cd-1',
          text: 'CI/CD (Continuous Integration/Continuous Deployment) is a DevOps practice that automates the integration of code changes and deployment to production. It includes automated testing, code quality checks, and deployment pipelines.',
          metadata: {
            title: 'CI/CD Fundamentals',
            domain: 'DevOps',
            type: 'documentation',
            source: 'DevOps Best Practices',
          },
        },
        {
          id: 'devops-monitoring-2',
          text: 'DevOps monitoring includes application performance monitoring (APM), infrastructure monitoring, log aggregation, and alerting. Tools like Prometheus, Grafana, ELK stack, and Datadog are commonly used.',
          metadata: {
            title: 'DevOps Monitoring and Observability',
            domain: 'DevOps',
            type: 'documentation',
            source: 'Monitoring Best Practices',
          },
        },

        // Learning and Career Guidance
        {
          id: 'learning-path-1',
          text: 'To master AIOps, start with understanding IT operations fundamentals, then learn machine learning basics, data analytics, and automation tools. Practice with real-world scenarios and case studies.',
          metadata: {
            title: 'AIOps Learning Path',
            domain: 'AIOps',
            type: 'tutorial',
            source: 'Career Guidance',
          },
        },
        {
          id: 'learning-path-2',
          text: 'For MLOps mastery, begin with machine learning fundamentals, then learn DevOps practices, containerization, cloud platforms, and ML-specific tools like MLflow, Kubeflow, and Apache Airflow.',
          metadata: {
            title: 'MLOps Learning Path',
            domain: 'MLOps',
            type: 'tutorial',
            source: 'Career Guidance',
          },
        },
      ];

      await this.storeDocuments(knowledgeDocuments);
      console.log('Knowledge base initialized successfully');
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();