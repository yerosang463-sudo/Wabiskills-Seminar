# Wabiskills Seminar - Frontend

A modern React-based web application for video conferencing and seminar management, built with Vite, TailwindCSS, and Socket.io for real-time communication.

## Tech Stack

- **React 19** - UI library
- **Vite 8** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.io-client** - Real-time WebSocket communication
- **Lucide React** - Icon library
- **PostCSS + Autoprefixer** - CSS processing

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and static resources
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/        # React components
│   │   ├── Auth.jsx              # Authentication (login/register)
│   │   ├── Dashboard.jsx         # Landing page for non-authenticated users
│   │   ├── MeetingRoom.jsx       # Video conference room interface
│   │   ├── Features.jsx          # Features showcase page
│   │   ├── HowItWorks.jsx        # How it works page
│   │   ├── Pricing.jsx           # Pricing plans page
│   │   ├── FAQ.jsx               # Frequently asked questions
│   │   ├── UserDashboard.jsx     # Authenticated user dashboard
│   │   ├── UserProfile.jsx       # User profile management
│   │   ├── UserSettings.jsx      # User settings
│   │   ├── newUI.jsx             # Alternative UI components
│   │   └── ui/                   # Reusable UI components
│   │       ├── Button.jsx        # Custom button component
│   │       ├── Card.jsx          # Card component
│   │       ├── Footer.jsx        # Application footer
│   │       ├── Header.jsx        # Application header/navigation
│   │       ├── PageTransition.jsx # Page transition animations
│   │       └── ParticleBackground.jsx # Animated background
│   ├── services/          # API and external services
│   │   └── api.js                # API client for backend communication
│   ├── utils/             # Utility functions
│   │   ├── animations.js         # Animation utilities
│   │   └── url.js                # URL utilities
│   ├── App.jsx             # Main application component with routing logic
│   ├── App.css             # Global styles
│   ├── index.css           # TailwindCSS imports and global styles
│   ├── main.jsx            # Application entry point
│   ├── routeUtils.js       # Routing utility functions
│   └── socket.js           # Socket.io client configuration
├── scripts/               # Build and deployment scripts
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
└── eslint.config.js       # ESLint configuration
```

## Key Components

### App.jsx
Main application component that handles:
- Client-side routing using browser history API
- Authentication state management
- View transitions with Framer Motion
- Toast notification system
- Conditional rendering of Header/Footer based on current view

### Routing System
The application uses a custom routing system:
- `dashboard` - Landing page (authenticated users see UserDashboard)
- `auth` - Authentication page
- `meeting` - Video conference room (requires room ID in URL)
- `profile` - User profile (authenticated only)
- `settings` - User settings (authenticated only)
- `features`, `how-it-works`, `pricing`, `faq` - Marketing pages

### MeetingRoom.jsx
Core video conferencing component featuring:
- WebRTC-based video/audio communication
- Socket.io for real-time signaling
- Screen sharing capabilities
- Chat functionality
- Participant management

### Socket Integration
Real-time communication via Socket.io for:
- Meeting room signaling
- Participant presence
- Chat messages
- Screen sharing coordination

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (includes SPA 404 handling)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Configuration

The frontend connects to a backend API. Ensure the backend is running and accessible. The API base URL is configured in `src/services/api.js`.

## Deployment

The application is configured for deployment on:
- **Vercel** - See `vercel.json` and `VERCEL_DEPLOYMENT.md`
- **Render** - See `render.yaml`

The build process includes a custom script to handle SPA routing by copying a 404.html to support client-side routing on static hosts.
