# 🚀 Social Vibe - Instagram Clone Frontend

## Project Overview
Complete Instagram-like social media application with unique purple/blue gradient theme

### Tech Stack
- ⚛️ React 19 + TypeScript
- 🎨 Tailwind CSS (Custom Theme)
- 🔄 Redux Toolkit (State Management)
- 🌐 React Router DOM
- 📡 Axios + Socket.IO
- 🎭 Framer Motion (Animations)
- 🔥 React Hot Toast (Notifications)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── layout/              # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── Layout.tsx
│   │
│   ├── auth/                # Authentication
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── feed/                # Home Feed
│   │   ├── Feed.tsx
│   │   ├── PostCard.tsx
│   │   ├── StoriesBar.tsx
│   │   └── Suggestions.tsx
│   │
│   ├── post/                # Post Components
│   │   ├── CreatePost.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostActions.tsx
│   │   ├── CommentList.tsx
│   │   └── CommentInput.tsx
│   │
│   ├── story/               # Stories
│   │   ├── StoryViewer.tsx
│   │   ├── CreateStory.tsx
│   │   └── StoryItem.tsx
│   │
│   ├── reel/                # Reels
│   │   ├── ReelsFeed.tsx
│   │   ├── ReelCard.tsx
│   │   └── CreateReel.tsx
│   │
│   ├── profile/             # Profile
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfilePosts.tsx
│   │   ├── EditProfile.tsx
│   │   └── FollowersModal.tsx
│   │
│   ├── message/             # Messages
│   │   ├── MessageList.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageInput.tsx
│   │   └── ConversationList.tsx
│   │
│   ├── search/              # Search
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── ExplorePage.tsx
│   │
│   └── notification/        # Notifications
│       ├── NotificationList.tsx
│       └── NotificationItem.tsx
│
├── pages/                   # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   ├── Explore.tsx
│   ├── Messages.tsx
│   ├── Notifications.tsx
│   ├── Reels.tsx
│   ├── Saved.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
│
├── store/                   # Redux Store
│   ├── index.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── postSlice.ts
│   │   ├── storySlice.ts
│   │   ├── reelSlice.ts
│   │   ├── messageSlice.ts
│   │   ├── notificationSlice.ts
│   │   ├── uiSlice.ts
│   │   └── themeSlice.ts
│   └── hooks.ts
│
├── services/                # API Services
│   ├── api.ts
│   ├── authService.ts
│   ├── postService.ts
│   ├── storyService.ts
│   ├── reelService.ts
│   ├── messageService.ts
│   ├── notificationService.ts
│   ├── userService.ts
│   ├── searchService.ts
│   └── socketService.ts
│
├── hooks/                   # Custom Hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useDebounce.ts
│   ├── useInfiniteScroll.ts
│   ├── useSocket.ts
│   └── useMediaQuery.ts
│
├── types/                   # TypeScript types
│   └── index.ts
│
├── utils/                   # Utility functions
│   └── index.ts
│
├── constants/               # Constants
│   └── index.ts
│
├── App.tsx                  # Main App component
├── main.tsx                 # Entry point
└── index.css                # Global styles

```

---

## 🎨 Features

### ✅ Core Features
1. **Authentication**
   - Login / Register
   - JWT Token Management
   - Protected Routes

2. **Posts**
   - Create, Edit, Delete Posts
   - Like / Unlike
   - Comment
   - Save / Unsave
   - Share

3. **Stories**
   - Create 24h Stories
   - Story Viewer
   - Story Reactions

4. **Reels**
   - Short Video Content
   - Infinite Scroll
   - Like, Comment, Share

5. **Messages**
   - Real-time Chat (Socket.IO)
   - Image/Video Sharing
   - Online Status
   - Typing Indicators

6. **Notifications**
   - Real-time Notifications
   - Like, Comment, Follow alerts
   - In-app + Push

7. **Profile**
   - Edit Profile
   - Profile Privacy
   - Followers / Following
   - Post Grid

8. **Search & Explore**
   - Search Users
   - Search Posts
   - Hashtag Search
   - Trending Content

9. **Follow System**
   - Follow / Unfollow
   - Private Account Requests
   - Followers List

10. **Dark/Light Theme**
    - Theme Toggle
    - Persistent Preference
    - Smooth Transitions

---

## 🎨 Design Theme

### Color Palette
- **Primary**: Blue/Cyan gradient (#0ea5e9 to #38bdf8)
- **Secondary**: Purple (#a855f7 to #9333ea)
- **Accent**: Pink/Rose (#f43f5e)

### Dark Mode
- Background: #0a0a0f
- Card: #141419
- Border: #1f1f28
- Text: #e4e4e7

### Light Mode
- Background: #ffffff
- Card: #f8fafc
- Border: #e2e8f0
- Text: #18181b

---

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Create .env file
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🔌 API Integration

All API endpoints are connected to the NestJS backend:

- Auth: `/auth/login`, `/auth/register`
- Posts: `/posts`, `/posts/:id`
- Comments: `/comments`
- Likes: `/likes`  
- Stories: `/stories`
- Reels: `/reels`
- Messages: `/messages`
- Notifications: `/notifications`
- User: `/users/:username`
- Search: `/search`
- Follow: `/follows`

---

## 🌐 WebSocket Events

Real-time features using Socket.IO:
- `newMessage` - New chat message
- `typing` - User typing indicator
- `onlineStatus` - User online/offline
- `newNotification` - New notification
- `postLiked` - Post liked
- `newFollower` - New follower

---

## 📱 Responsive Design

- Mobile First Approach
- Tablet Optimization
- Desktop Full Features
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

---

## 🚀 Performance Optimizations

1. **Code Splitting** - React.lazy()
2. **Image Optimization** - Lazy loading
3. **Infinite Scroll** - Virtual scrolling
4. **Memoization** - React.memo, useMemo
5. **Debouncing** - Search inputs
6. **Caching** - Redux persist

---

## 🔐 Security Features

1. **JWT Authentication**
2. **Protected Routes**
3. **XSS Prevention**
4. **CSRF Token**
5. **Input Validation**
6. **File Upload Restrictions**

---

## 🧪 Testing Strategy

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📝 File Naming Convention

- Components: PascalCase (Button.tsx)
- Hooks: camelCase with 'use' prefix (useAuth.ts)
- Services: camelCase with 'Service' suffix (authService.ts)
- Utils: camelCase (formatDate.ts)
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase (User, Post)

---

## 🎯 State Management Flow

```
User Action → Dispatch Redux Action → API Call → Update Store → UI Update
```

Example:
```
Click Like → dispatch(likePost(id)) → POST /likes → Update likesCount → Re-render
```

---

## 🎨 Component Architecture

```
Page Component
  └── Layout Component
      ├── Navbar
      ├── Main Content
      │   ├── Feature Component
      │   │   └── Common Components
      │   └── ...
      └── Footer/MobileNav
```

---

## 📚 Key Libraries

| Library | Purpose |
|---------|---------|
| React | UI Framework |
| TypeScript | Type Safety |
| Redux Toolkit | State Management |
| React Router | Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| Socket.IO | WebSockets |
| Framer Motion | Animations |
| React Hot Toast | Notifications |
| Heroicons | Icons |
| date-fns | Date Formatting |

---

## 🔄 Development Workflow

1. Create Redux slice
2. Create API service
3. Create types
4. Build components
5. Connect to store
6. Add styling
7. Test functionality
8. Optimize performance

---

## 🚀 Deployment

```bash
# Build
npm run build

# Preview build
npm run preview

# Deploy to Vercel/Netlify/etc
```

Environment Variables:
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.IO URL

---

## 📌 Best Practices

1. ✅ Use TypeScript strictly
2. ✅ Keep components small and focused
3. ✅ Extract reusable logic to hooks
4. ✅ Use Redux for global state only
5. ✅ Implement error boundaries
6. ✅ Add loading states
7. ✅ Handle errors gracefully
8. ✅ Optimize images
9. ✅ Use semantic HTML
10. ✅ Follow accessibility guidelines

---

## 🎉 Unique Features

Unlike vanilla Instagram, our app includes:
- 🎨 Custom gradient theme
- 🌙 Smooth dark mode transitions
- ✨ Modern glassmorphism effects
- 🎭 Micro-animations
- 🎯 Enhanced UX patterns
- 🚀 Optimized performance

---

**Status**: 🚧 In Development  
**Version**: 1.0.0  
**Last Updated**: 2026-02-06
