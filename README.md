---
post_title: "Bright Town Study - Learning Social Media Platform"
author1: "Group 03 Development Team"
post_slug: "bright-town-study"
microsoft_alias: "group03dev"
featured_image: "https://github.com/user-attachments/assets/dd5ac52c-12a0-4620-9238-e2c4220826a9"
categories: ["Education", "Social Media", "React"]
tags: ["React", "TypeScript", "JWT", "Firebase", "Learning Platform", "Flashcards", "Discussion"]
ai_note: "AI assistance was used in documentation creation"
summary: "A comprehensive learning social media platform built with React, featuring flashcards, discussions, user authentication, and book management for educational purposes."
post_date: "2025-08-14"
---

## Overview

Bright Town Study is a modern learning social media platform designed to enhance 
educational experiences through interactive features like flashcards, discussions, 
and collaborative learning tools. Built with React and TypeScript, the platform 
provides a secure and engaging environment for students and educators.

**Live Demo:** [https://group-03-learning-social-media.vercel.app/](https://group-03-learning-social-media.vercel.app/)

![Bright Town Study Platform](https://github.com/user-attachments/assets/dd5ac52c-12a0-4620-9238-e2c4220826a9)

## Features

### Authentication & Security
- **JWT-based Authentication** using JOSE library
- **Google OAuth Integration** with Firebase
- **Session Management** with conflict detection
- **Role-based Access Control** (Admin, User)
- **Password Reset** functionality
- **CAPTCHA Protection** with Turnstile

### Learning Tools
- **Interactive Flashcards** - Create, edit, and play flashcard sets
- **Book Management** - Browse and manage educational books
- **Discussion Forums** - Real-time discussions and Q&A
- **User Profiles** - Personalized learning experiences

### UI/UX
- **Responsive Design** with TailwindCSS
- **Dark/Light Theme** toggle
- **Material-UI Components** for consistent interface
- **Interactive Animations** and visual effects
- **Progressive Web App** capabilities

### Admin Features
- **User Management** - Create, edit, and manage user accounts
- **Content Moderation** - Manage discussions and content
- **Analytics Dashboard** - View platform statistics
- **Recycle Bin** - Recover deleted content

## Technology Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Material-UI** - React component library

### Authentication & Security
- **JOSE** - JSON Web Token handling
- **Firebase Auth** - Google OAuth integration
- **React Turnstile** - CAPTCHA protection

### Data Visualization
- **Recharts** - Charts and analytics
- **Material-UI Data Grid** - Advanced table components

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **JSON Server** - Mock API for development

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- Firebase project (for Google OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pctra266/Group_03_Learning-Social-Media.git
   cd Group_03_Learning-Social-Media
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
   ```

4. **Start the development servers**
   ```bash
   # Start the JSON server (backend mock)
   npm run json-server
   
   # In another terminal, start the React app
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run json-server` - Start mock API server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Project Structure

```
src/
├── api/                    # API configuration
├── assets/                 # Static assets (images, etc.)
├── components/             # Reusable UI components
│   ├── Background/         # Background animations
│   ├── NavBar/            # Navigation components
│   ├── ThemeToggle/       # Theme switching
│   └── TurnstileWrapper/  # CAPTCHA integration
├── contexts/               # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── ThemeContext.tsx   # Theme management
├── features/               # Feature-based modules
│   ├── Auth/              # Authentication features
│   ├── AdminDashboard/    # Admin panel
│   ├── Discussion/        # Discussion forums
│   ├── Flashcard/         # Flashcard system
│   ├── library-book/      # Book management
│   └── UserProfile/       # User profiles
├── hooks/                 # Custom React hooks
├── layout/                # Layout components
├── pages/                 # Page components
├── route/                 # Routing configuration
├── services/              # Business logic services
└── utils/                 # Utility functions
```

## Authentication Flow

The platform uses a sophisticated JWT-based authentication system:

### Login Process
1. User submits credentials via login form
2. `AuthService.login()` validates against database
3. JWT tokens generated using JOSE library
4. Tokens stored securely in HTTP-only cookies
5. Session monitoring prevents concurrent logins

### Security Features
- **Token Expiration**: Access tokens (24h), Refresh tokens (7 days)
- **Session Conflict Detection**: Prevents multiple active sessions
- **Automatic Token Refresh**: Seamless user experience
- **Secure Cookie Storage**: HttpOnly, Secure, SameSite flags

## API Integration

### Mock API (Development)
The project uses JSON Server for development with a mock database (`db.json`):
- **Port**: 9000
- **Endpoints**: `/account`, `/flashcards`, `/discussions`, `/books`

### Production API
For production deployment, replace the mock API with your backend service.
Update the API base URL in `src/api/api.tsx`.

## Deployment

### Vercel Deployment
The project is configured for Vercel deployment with `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Build Process
```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting with ESLint
- Write meaningful commit messages
- Test features thoroughly before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- **Create an issue** on GitHub
- **Contact the development team** via project discussions
- **Check documentation** in the `/docs` directory

## Acknowledgments

- React community for excellent documentation
- Material-UI team for component library
- Firebase team for authentication services
- JOSE library contributors for JWT implementation
- All contributors and testers who helped improve the platform

---

**Built with ❤️ by Group 03 Development Team**