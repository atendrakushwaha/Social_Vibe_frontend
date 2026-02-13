# 🎨 SocialVibe - Instagram Clone Frontend

> A modern, feature-rich social media application with a unique purple/blue gradient theme

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.1-blue.svg)

## ✨ Features

- 🔐 **Authentication** - JWT-based login and registration
- 📱 **Posts** - Create, like, comment, and share posts
- 📖 **Stories** - 24-hour ephemeral content
- 🎥 **Reels** - Short video content
- 💬 **Real-time Messaging** - WebSocket-powered chat
- 🔔 **Notifications** - Real-time updates
- 👥 **Follow System** - Follow users and manage connections
- 🔍 **Search & Explore** - Discover users and content
- 🌙 **Dark Mode** - Beautiful dark theme with smooth transitions
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop

## 🎨 Unique Design

Unlike standard Instagram clones, SocialVibe features:
- Custom purple/blue gradient color scheme
- Glassmorphism effects
- Smooth micro-animations
- Modern, premium UI/UX
- Unique branding

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. **Enable PowerShell Scripts** (Windows - Run as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. **Navigate to project directory**:
```bash
cd "c:\Alina-test\New folder\Instafrondend"
```

3. **Install dependencies**:
```bash
npm install
```

4. **Configure environment variables**:
```bash
# .env.local is already created with default values
# Update if your backend runs on a different port
```

5. **Start development server**:
```bash
npm run dev
```

6. **Open in browser**:
```
http://localhost:5173
```

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Redux Toolkit | State Management |
| React Router DOM | Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| Socket.IO Client | Real-time Communication |
| Framer Motion | Animations |
| React Hot Toast | Notifications |
| Heroicons | Icons |
| date-fns | Date Utilities |

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/          # Login, Register, Protected Route
│   ├── common/        # Reusable components (Button, Input, Avatar, etc.)
│   ├── layout/        # Navbar, Sidebar, Layout
│   ├── feed/          # Feed components (coming soon)
│   ├── post/          # Post components (coming soon)
│   ├── story/         # Story components (coming soon)
│   └── ...
│
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   └── ...
│
├── store/             # Redux store
│   ├── slices/        # Redux slices
│   │   ├── authSlice.ts
│   │   ├── postSlice.ts
│   │   ├── themeSlice.ts
│   │   └── uiSlice.ts
│   ├── index.ts       # Store configuration
│   └── hooks.ts       # Typed hooks
│
├── services/          # API services
│   ├── api.ts         # Axios instance
│   ├── authService.ts
│   ├── postService.ts
│   ├── userService.ts
│   ├── messageService.ts
│   ├── storyService.ts
│   └── socketService.ts
│
├── hooks/             # Custom hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useDebounce.ts
│   └── ...
│
├── types/             # TypeScript types
├── utils/             # Utility functions
├── constants/         # App constants
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🌈 Theme System

The app supports light and dark modes:

```typescript
import { useTheme } from './hooks/useTheme';

const { mode, isDark, toggle, setMode } = useTheme();

// Toggle theme
toggle();

// Set specific theme
setMode('dark');
```

## 🔌 API Integration

Backend URL is configured in `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

All API calls go through the centralized Axios instance with:
- Automatic token injection
- Error handling
- Response interceptors

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token stored in localStorage
3. Token sent with every API request
4. Protected routes check authentication
5. Socket.IO connects with token

```typescript
// Protected Route Usage
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Home />} />
</Route>
```

## 📱 Responsive Breakpoints

| Device | Breakpoint |
|--------|-----------|
| Mobile | < 768px |
| Tablet | 768px - 1024px |
| Desktop | > 1024px |

## 🎨 Color Palette

### Light Mode
- Background: `#ffffff`
- Card: `#f8fafc`
- Text: `#18181b`
- Border: `#e2e8f0`

### Dark Mode
- Background: `#0a0a0f`
- Card: `#141419`
- Text: `#e4e4e7`
- Border: `#1f1f28`

### Accent Colors
- Primary: Blue/Cyan gradient
- Secondary: Purple gradient
- Accent: Pink/Rose

## 🔧 Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration
- `.env.local` - Environment variables

## 📚 Key Components

### Common Components
- `Button` - Customizable button with variants
- `Input` - Form input with label and error
- `Avatar` - User avatar with online status
- `Modal` - Reusable modal component
- `Loading` - Loading spinner and skeleton
- `ThemeToggle` - Dark/light mode toggle

### Layout Components
- `Navbar` - Top navigation bar
- `Sidebar` - Desktop sidebar navigation
- `MobileNav` - Mobile bottom navigation
- `Layout` - Main layout wrapper

### Auth Components
- `LoginForm` - Login form with validation
- `RegisterForm` - Registration form
- `ProtectedRoute` - Route guard

## 🚧 Development Status

✅ **Completed:**
- Project setup and configuration
- Redux store with auth, theme, UI, and post slices
- API services layer
- Authentication flow
- Layout components (Navbar, Sidebar, Mobile Nav)
- Common components library
- Custom hooks
- Routing setup
- Dark/light theme system
- Type definitions

🔨 **In Progress:**
- Feed components
- Post creation and display
- Stories feature
- Reels feature
- Messaging system
- Profile pages
- Search functionality

## 🐛 Troubleshooting

### Dependencies Not Found Error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
The lint errors you see are normal before running `npm install`.
After installation, all imports will resolve correctly.

### Port Already in Use
```bash
# Change port in vite.config.ts or kill the process
npx kill-port 5173
```

## 📖 Documentation

- [Project Guide](./PROJECT_GUIDE.md) - Comprehensive project documentation
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md) - Development roadmap
- [Backend API Documentation](../nest-best-structure/README.md) - API reference

## 🤝 Contributing

This is a learning project. Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning!

## 👨‍💻 Author

Created with ❤️ as a modern Instagram clone

## 🙏 Acknowledgments

- NestJS for the amazing backend framework
- React team for React 19
- Tailwind CSS for the utility-first CSS framework
- Heroicons for beautiful icons

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the implementation checklist
3. Ensure backend is running on port 3000
4. Verify all dependencies are installed

---

**Happy coding! 🚀**
"# Social_Vibe_frontend" 
#   S o c i a l _ V i b e _ f r o n t e n d  
 