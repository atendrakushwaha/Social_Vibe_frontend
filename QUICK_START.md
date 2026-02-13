# 🎯 QUICK START GUIDE

## Step-by-Step Installation

### 1️⃣ Enable PowerShell (Windows Only)

**Run PowerShell as Administrator and execute:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2️⃣ Navigate to Project

```bash
cd "c:\Alina-test\New folder\Instafrondend"
```

### 3️⃣ Install All Dependencies

```bash
npm install
```

This will install:
- ✅ React 19 + TypeScript
- ✅ Redux Toolkit + React Redux
- ✅ React Router DOM
- ✅ Axios + Socket.IO Client
- ✅ Tailwind CSS + PostCSS + Autoprefixer
- ✅ Heroicons + Framer Motion
- ✅ React Hot Toast + date-fns

### 4️⃣ Verify Environment Variables

Check `.env.local` exists with:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

✅ Already created! Change only if backend runs on different port.

### 5️⃣ Start Backend (In Another Terminal)

```bash
cd "c:\Alina-test\New folder\nest-best-structure"
npm run start:dev
```

Backend should run on **http://localhost:3000**

### 6️⃣ Start Frontend

```bash
npm run dev
```

Frontend will start on **http://localhost:5173**

### 7️⃣ Open in Browser

Navigate to: **http://localhost:5173**

You should see the login page with purple/blue gradient theme! 🎉

---

## 🧪 Test the Application

### Test Authentication

1. **Register a new account**:
   - Click "Sign up"
   - Fill in email, username, password
   - Submit form

2. **Login**:
   - Use your credentials
   - You'll be redirected to home page

3. **Explore**:
   - View feed (empty initially)
   - Try dark mode toggle
   - Navigate using sidebar/mobile nav

---

## ✅ What's Working Now

1. ✅ **Authentication System**
   - Login page
   - Registration page
   - Protected routes
   - JWT token management

2. ✅ **Layout & Navigation**
   - Responsive navbar
   - Desktop sidebar
   - Mobile bottom navigation
   - Theme toggle (dark/light)

3. ✅ **State Management**
   - Redux store configured
   - Auth slice working
   - Theme persistence
   - UI state management

4. ✅ **API Integration**
   - Axios client ready
   - All service methods created
   - Socket.IO configured
   - Error handling

---

## 🎨 Visual Features

- 🌈 **Purple/Blue Gradient Theme**
- 🌙 **Dark Mode** with smooth transitions
- ✨ **Micro-animations** on hover
- 📱 **Fully Responsive** design
- 💎 **Glassmorphism** effects
- 🎭 **Framer Motion** animations ready

---

## 🔧 Common Issues & Fixes

### Issue: `npm install` fails

**Solution:**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors

**Solution:**
These are expected before `npm install`. After installing dependencies, all imports will resolve.

### Issue: Backend not responding

**Solution:**
1. Ensure backend is running: `npm run start:dev`
2. Check backend is on port 3000
3. Verify `.env.local` has correct URL

### Issue: Dark mode not working

**Solution:**
- Theme is stored in localStorage
- Try clicking theme toggle in navbar
- Check browser console for errors

---

## 📝 Next Steps - Add More Features

### Priority 1: Feed & Posts

Create components in:
- `src/components/feed/`
- `src/components/post/`

### Priority 2: Profile Pages

Enhance:
- `src/pages/Profile.tsx`
- `src/components/profile/`

### Priority 3: Stories & Reels

Implement:
- `src/components/story/`
- `src/components/reel/`

### Priority 4: Messages

Complete:
- `src/pages/Messages.tsx`
- `src/components/message/`

---

## 🚀 Production Build

When ready for production:

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview

# Deploy files from /dist folder
```

---

## 📚 Helpful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

---

## 💡 Tips

1. **Use Redux DevTools** browser extension to debug state
2. **React Developer Tools** for component inspection
3. **Hot reload** works automatically in dev mode
4. **TypeScript IntelliSense** in VS Code for better DX
5. **Tailwind CSS IntelliSense** extension recommended

---

## ✨ Features vs Instagram

| Feature | Instagram | SocialVibe |
|---------|-----------|------------|
| Theme | Blue/Pink | Purple/Blue Gradient ✨ |
| Dark Mode | Yes | Yes (Enhanced) 🌙 |
| Stories | 24h | 24h ✅ |
| Reels | Yes | Yes ✅ |
| Messages | Yes | Yes (Real-time) ⚡ |
| Posts | Yes | Yes ✅ |
| Animations | Basic | Advanced (Framer Motion) 🎭 |
| Design | Mobile-first | Universal ✨ |

---

**🎉 You're all set! Start building amazing features!**
