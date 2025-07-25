# Brillius AI Tutor Platform

## Overview

Brillius is an AI-powered learning platform designed for IT professionals and developers interested in AIOps and MLOps. The platform provides personalized learning paths through adaptive assessments, AI-driven course generation, interactive coding practice, and continuous AI assistance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 24, 2025 - COMPLETE RAG WORKFLOW WITH PINECONE INTEGRATION
- ✅ **PINECONE RAG IMPLEMENTATION**: Integrated Pinecone vector database for knowledge base with comprehensive AIOps/MLOps content
- ✅ **VECTOR EMBEDDINGS**: Implemented OpenAI text-embedding-3-small for semantic search capabilities
- ✅ **KNOWLEDGE BASE SEEDING**: Pre-populated Pinecone with domain-specific educational content for both AIOps and MLOps
- ✅ **CONTEXT-AWARE RESPONSES**: RAG system uses conversation history and user domain for personalized assistance
- ✅ **FALLBACK MECHANISM**: Robust error handling with direct LLM fallback when RAG is unavailable
- ✅ **ASSISTANT PAGE INTEGRATION**: Updated assistant interface to use RAG workflow with knowledge base search
- ✅ **PINECONE SEARCH API**: Created dedicated endpoint for searching internal knowledge base content
- ✅ **CHAT ENHANCEMENT**: Enhanced chat system with conversation context and domain-specific responses

### January 24, 2025 - PROFESSIONAL 6-ISSUE RESOLUTION COMPLETE
- ✅ **IDE DIVIDING LINES REMOVED**: Fixed Monaco Editor rulers configuration to eliminate screen-dividing vertical lines
- ✅ **MCQ DYNAMIC COUNTER**: Removed static "20/20 answered" text, replaced with dynamic progress tracking
- ✅ **COURSE NAVIGATION FIXED**: Enhanced back to dashboard button with proper console logging and navigation debugging
- ✅ **CHAPTER DISPLAY CORRECTED**: Fixed chapter naming to use chapterNumber instead of id for proper "Chapter 1:" format
- ✅ **HAMBURGER MENU IMPLEMENTED**: Created ResizableSidebar component with collapsible functionality and smooth layout adjustments
- ✅ **RESIZABLE ASSISTANT LAYOUT**: Built ResizableAssistant component with sticky toggles, manual adjustments, and professional multi-panel management
- ✅ **CONSISTENT SIDEBAR INTEGRATION**: Unified all pages to use ResizableSidebar for consistent navigation experience
- ✅ **PROFESSIONAL CODE QUALITY**: Maintained existing functionality while implementing enterprise-grade UI improvements

### January 23, 2025 - Dashboard Sidebar Integration & Hamburger Menu Implementation
- ✓ **Sidebar Integration**: Added consistent sidebar navigation to dashboard matching other pages
- ✓ **Hamburger Menu**: Implemented collapsible sidebar with hamburger menu for mobile/space optimization
- ✓ **Responsive Design**: Mobile-first approach with overlay and smooth transitions
- ✓ **Space Optimization**: Main content area now more spacious with collapsible navigation
- ✓ **Consistent UX**: Dashboard now matches navigation pattern of other learning pages

### January 23, 2025 - Modern Responsive Header Component Complete Redesign
- ✓ **COMPLETE HEADER OVERHAUL**: Redesigned entire header with modern, responsive design and enhanced user experience
- ✓ **User Profile Dropdown**: Implemented animated dropdown with avatar, user info, dashboard, settings, and logout options
- ✓ **Responsive Navigation**: Created comprehensive navigation with proper desktop/tablet/mobile breakpoints
- ✓ **Enhanced Mobile Experience**: Built slide-in mobile menu with user profile section and intuitive navigation
- ✓ **Sticky Header Effects**: Added scroll-based header transparency, blur effects, and shadow transitions
- ✓ **Accessibility Features**: Implemented focus states, keyboard navigation, and proper ARIA attributes
- ✓ **Brand Consistency**: Enhanced logo display with company name and consistent brand theming
- ✓ **Interactive Elements**: Added hover states, smooth transitions, and visual feedback for all clickable elements

### January 23, 2025 - PROFESSIONAL ASSESSMENT SYSTEM COMPLETE OVERHAUL
- ✅ **Monaco Editor Integration**: Implemented VS Code-style Monaco Editor with dark theme and professional IDE features
- ✅ **Professional MCQ Interface**: Complete redesign with gradient headers, improved option selection, and progress tracking
- ✅ **Fixed-Height Layout Design**: No-scroll interface with perfectly fitted content sections and proper space allocation
- ✅ **Function Name Consistency**: Fixed language-specific function naming (calculateAccuracy vs calculate_accuracy)
- ✅ **Pre-loaded Test Results**: Test cases always visible with placeholder states before running, updates in-place
- ✅ **Compact Example Display**: Grid-based examples with input/output clearly shown, space-efficient design
- ✅ **Assessment Timer**: Real-time timer tracking total assessment duration for comprehensive evaluation
- ✅ **Enhanced Visual Design**: Professional gradients, proper spacing, and enterprise-grade UI components
- ✅ **IDE-Quality Features**: Monaco Editor with syntax highlighting, intellisense, bracket matching, and proper theming
- ✅ **Confetti Animation**: Added celebratory confetti animation for successful test case completion with toast notifications

### January 23, 2025 - AIOPS 68-VIDEO STRUCTURE & SIDEBAR LOGOUT IMPLEMENTATION
- ✅ **CORRECTED AIOPS VIDEO STRUCTURE**: Fixed AIOps to have exactly 68 videos (9 chapters with 7 videos each + 1 final chapter with 8 videos)
- ✅ **COMPLETE DOMAIN SEPARATION**: Both MLOps and AIOps have independent chapter numbering (1-10 each) with no sequential conflicts
- ✅ **USER PROGRESS PRESERVATION**: Fixed video seeding to preserve all user progress data across server restarts
- ✅ **SIDEBAR LOGOUT BUTTON**: Added logout button below dashboard button in sidebar for easy user logout functionality
- ✅ **STRICT DOMAIN ISOLATION**: Users can only access content for their chosen domain with verified cross-contamination prevention
- ✅ **PRODUCTION VERIFIED**: Domain-specific routing and progress tracking confirmed working with live user testing

### January 23, 2025 - USER PROGRESS PERSISTENCE COMPLETELY FIXED
- ✅ **CRITICAL DATA PERSISTENCE ISSUE RESOLVED**: Fixed video data seeding to preserve user progress across server restarts
- ✅ **Progress Preservation**: Modified seedVideoData() to check for existing data before clearing tables
- ✅ **Automatic Chapter Unlocking**: Enhanced dashboard refresh system with aggressive cache invalidation
- ✅ **Sequential Video Progression**: Videos auto-advance with 2-second delay and automatic chapter unlocking
- ✅ **Real-time Updates**: Dashboard refreshes every 3 seconds to catch progress changes immediately
- ✅ **Domain Case Sensitivity**: Fixed MLOps vs MLOPS domain matching for consistent progress tracking

### January 23, 2025 - CRITICAL ASSESSMENT BUG COMPLETELY FIXED
- ✅ **MAJOR ISSUE RESOLVED**: Fixed MCQ scoring bug where frontend was sending numeric indices (0,1,2,3) instead of option keys (A,B,C,D)
- ✅ **Root Cause Identified**: Database stores options as arrays but frontend expected object format with letter keys
- ✅ **Solution Implemented**: Enhanced frontend to convert array options to proper A,B,C,D letter format
- ✅ **Verification Complete**: Server logs now show correct format: "User answered 'B', Correct is 'B'"
- ✅ **Scoring Fixed**: MCQ answers now match correctly, enabling accurate assessment scoring

### January 23, 2025 - Assessment Scoring System Complete Fix
- ✓ **CRITICAL ISSUE RESOLVED**: Fixed MCQ scoring bug where frontend was sending numeric indices (0,1,2,3) instead of option keys (A,B,C,D)
- ✓ Frontend now correctly sends option letters matching database format for accurate scoring
- ✓ Enhanced assessment storage to include detailed question data with correct/incorrect flags
- ✓ Results page now displays comprehensive MCQ review showing each question, user answer, and correct answer
- ✓ Added detailed test case results display with input/expected/actual output breakdown
- ✓ Fixed assessment scoring logic to calculate MCQ scores from actual correct answers vs total questions
- ✓ Implemented proper error handling for assessment result parsing and data display
- ✓ Assessment system now provides accurate scoring and detailed feedback for both MCQ and coding challenges

### January 23, 2025 - Course Page Layout Fix & Sidebar Consistency
- ✓ Fixed Course page layout to use consistent sidebar navigation across all pages
- ✓ Implemented unified sidebar design matching Learning Path page style
- ✓ Added proper course content loading with chapter and lesson navigation
- ✓ Integrated embedded YouTube video player for course lessons
- ✓ Created secondary sidebar for chapter/lesson navigation within courses
- ✓ Fixed course data API integration with proper authentication checks
- ✓ Ensured course page no longer appears as standalone - properly integrated with main app layout

### January 23, 2025 - Complete Assessment System & Full User Flow Implementation
- ✓ Fixed critical MCQ scoring bug: Frontend now sends option keys (A,B,C,D) instead of full text
- ✓ Assessment scoring now works correctly comparing user answers with correct answers
- ✓ Expanded question database to 90 total questions: 30 MLOps + 30 AIOps + 30 DevOps
- ✓ Fixed all database schema issues and user flow routing problems
- ✓ Dashboard assessment status now shows "Completed" correctly for finished assessments
- ✓ Fixed "Start Learning Course" button to navigate to proper learning path route
- ✓ Both AIOps and MLOps user flows work identically with balanced question distribution
- ✓ Real-time code test case execution with authentic pass/fail evaluation
- ✓ Complete user journey functional: signup → profile → assessment → dashboard → learning

### January 22, 2025 - Complete Learning Platform Implementation
- ✓ Built 3-page assessment flow: Basic Details → Assessment → Results  
- ✓ Created profile completion form with role, experience, interest, and resume upload
- ✓ Implemented 20 personalized MCQ questions filtered by domain and experience level
- ✓ Added real-time JavaScript code execution using Piston API
- ✓ Integrated OpenAI GPT-4o for AI-powered personalized feedback generation
- ✓ Created intelligent routing: signup→basic-details, login→dashboard (if complete) or assessment (if incomplete)
- ✓ Built comprehensive dashboard showing assessment results and learning progress
- ✓ Populated database with 20+ AIOps/MLOps questions and coding challenges
- ✓ Added completion flags tracking (profileCompleted, assessmentCompleted)
- ✓ Enhanced dashboard with interactive S-curve showing 10 chapters with unlock/completion states
- ✓ Built Learning Path page with horizontally scrollable chapter videos and progress tracking
- ✓ Created Course page with video player controls and toggleable Assistant/IDE panels
- ✓ Implemented Assistant page with chat interface, knowledge base integration, and video suggestions
- ✓ Built Code Playground with multi-language support (JS, Python, Java, C++, Go) using Piston API
- ✓ Created Video Resources page with YouTube-style grid/list view and filtering capabilities
- ✓ Added fixed left sidebar navigation across all learning pages
- ✓ Integrated all external APIs: OpenAI, Piston, Pinecone, YouTube
- ✓ Maintained brand consistency with orange/dark gray theme throughout using theme.css

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom brand theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development**: Hot module replacement with Vite middleware integration

### Data Storage Solutions
- **Database**: Supabase PostgreSQL (fully integrated and operational)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Complete 5-table schema deployed (users, assessments, courses, mcq_questions, code_questions)
- **Storage**: DatabaseStorage implementation with live Supabase connection
- **Session Storage**: Express sessions with persistent user authentication

## Key Components

### Authentication System
- User registration and login with form validation
- Password strength requirements and confirmation matching
- Session-based authentication with PostgreSQL storage
- Planned OAuth integration for Google and LinkedIn

### Learning Management System
- **Dashboard**: Interactive S-curve with 10 unlockable chapters showing completion status
- **Learning Path**: Horizontally scrollable chapter videos with detailed progress tracking
- **Course Player**: Video player with controls (play/pause/fullscreen/volume) and dual panels
- **AI Assistant**: Chat interface with knowledge base integration and video suggestions
- **Code Playground**: Multi-language code editor with live execution via Piston API
- **Video Resources**: YouTube-style video browser with search, filtering, and grid/list views
- **Navigation**: Fixed sidebar across all learning pages with consistent branding

### Landing Page Components
- **Header**: Navigation with responsive mobile menu
- **Hero**: Gradient background with call-to-action buttons
- **Features**: Grid layout showcasing platform capabilities
- **Technology Focus**: Specialized AIOps/MLOps content sections
- **Footer**: Multi-column layout with platform links

### UI Component Library
- Comprehensive shadcn/ui component set including:
  - Form controls (inputs, selects, checkboxes, radio groups)
  - Navigation components (menus, tabs, breadcrumbs)
  - Feedback components (toasts, alerts, progress bars)
  - Layout components (cards, sheets, dialogs)
  - Data display components (tables, charts, calendars)

### Styling System
- Custom CSS variables for brand colors (orange primary, dark secondary)
- Responsive design with mobile-first approach
- Typography system using Poppins and Open Sans fonts
- Component-based styling with Tailwind utility classes

## Data Flow

### Client-Server Communication
- RESTful API pattern with `/api` prefix for backend routes
- Fetch-based HTTP client with credential inclusion
- TanStack Query for caching and synchronization
- Error handling with custom error boundaries

### Form Processing
- React Hook Form for form state management
- Zod schemas for runtime validation
- Type-safe form handling with TypeScript inference
- Server-side validation planning for security

### Database Operations
- Drizzle ORM for type-safe database queries
- Schema-first approach with shared type definitions
- Migration-based database evolution
- Connection pooling for production scalability

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, ReactDOM, React Hook Form)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)

### UI and Styling Dependencies
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component variants

### Development Dependencies
- Vite for fast development and building
- TypeScript for type safety
- PostCSS with Autoprefixer for CSS processing
- ESBuild for server-side bundling

### Utility Dependencies
- Zod for schema validation
- TanStack Query for server state management
- date-fns for date manipulation
- clsx and tailwind-merge for conditional styling

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild compiles TypeScript server to `dist/index.js`
- Static assets served from build output directory

### Environment Configuration
- Database URL configuration via environment variables
- Production/development mode detection
- TypeScript path mapping for clean imports

### Production Considerations
- Static file serving in production mode
- Database connection pooling
- Error handling and logging
- Session management with PostgreSQL store

The application follows a monorepo structure with shared schema definitions, enabling type safety across the full stack while maintaining clear separation between client and server concerns.