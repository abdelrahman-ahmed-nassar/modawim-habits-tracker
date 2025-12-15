# مداوم - Habits Tracker

تطبيق محلي لتتبع العادات الشخصية وتحليل تقدمك عبر الزمن، مستوحى من حديث الرسول ﷺ: "أحب الأعمال إلى الله أدومها وإن قل"

A local desktop application for tracking personal habits and analyzing your progress over time, inspired by the Prophet's ﷺ hadith: "The most beloved deeds to Allah are those done consistently, even if small."

## 🌟 Features

- ✅ Create, manage, and track daily habits
- 📊 Comprehensive analytics (daily, weekly, monthly, yearly views)
- 📝 Journal entries with mood and productivity tracking
- 🎯 Motivation quotes and reminders
- 🌙 Dark mode support
- 🔒 Complete privacy - all data stored locally
- 🎨 Beautiful Arabic-first UI with Cairo font
- 💾 Automatic backups

## 🚀 Quick Start for Users

### Download

Visit the landing page: **https://abdelrahman-ahmed-nassar.github.io/modawim-habits-tracker/**

Download the appropriate version:

- Windows (`.exe`)
- macOS
- Linux

### Run

1. Extract the ZIP file
2. Run the executable:
   - **Windows**: Double-click `habits-tracker-backend.exe`
   - **macOS/Linux**: Run `./habits-tracker-backend` in terminal
3. Open http://localhost:3000 in your browser

That's it! Your data stays on your computer.

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker.git
cd modawim-habits-tracker

# Install dependencies
cd frontend
pnpm install

cd ../backend
pnpm install
```

### Running in Development

#### Backend

```bash
cd backend
pnpm run dev
```

Server runs on http://localhost:5000

#### Frontend

```bash
cd frontend
pnpm run dev
```

App runs on http://localhost:5173

## 📦 Building for Production

### Build Everything

```bash
# From project root
pnpm run build:all
```

This will:

1. Build React frontend
2. Build TypeScript backend
3. Create executables for Windows, macOS, and Linux

Output: `backend/executable/`

## 🚀 Deployment

### Deploy to GitHub Releases

```bash
# 1. Build executables
pnpm run build:all

# 2. Create GitHub Release
pnpm run deploy:release

# 3. Enter version (e.g., v1.0.0)
```

This uploads executables to GitHub Releases automatically.

### Deploy Landing Page to GitHub Pages

```bash
# From project root
cd landing

# Deploy to gh-pages branch
git add .
git commit -m "Update landing page"
git subtree push --prefix landing origin gh-pages
```

Or set up GitHub Actions for automatic deployment (see `.github/workflows/deploy.yml`)

## 📁 Project Structure

```
modawim-habits-tracker/
├── frontend/          # React app (Vite + TypeScript)
├── backend/           # Express API (TypeScript)
├── shared/            # Shared TypeScript types
├── landing/           # Landing page (static HTML)
├── build-all.bat      # Build script
└── deploy-release.bat # GitHub Release deployment
```

## 🔌 API Endpoints

### Habits

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/archive` - Archive a habit
- `POST /api/habits/:id/restore` - Restore a habit

### Completions

- `GET /api/habits/:id/records` - Get completion records
- `POST /api/completions` - Mark habit complete
- `DELETE /api/completions/:id` - Remove completion

### Notes & Journal

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Analytics

- `GET /api/analytics` - Get habit analytics
- `GET /api/analytics/notes` - Get journal analytics

### Settings & Backup

- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update settings
- `POST /api/backup` - Create data backup

See `backend/API-ROUTES.md` for complete documentation.

## 💾 Data Storage

All application data is now stored in **MongoDB** instead of local JSON files.

### MongoDB Setup

- Create a MongoDB database (e.g. on MongoDB Atlas or a local Mongo instance).
- Add a connection string to `backend/.env`:

```bash
MONGO_URI="your-mongodb-connection-string"
JWT_SECRET="your-strong-jwt-secret"
```

- The backend uses Mongoose models to store:
  - Users and settings
  - Habits and their completion history
  - Daily notes / journal entries


## 🌐 Landing Page

The landing page is hosted on GitHub Pages: https://abdelrahman-ahmed-nassar.github.io/modawim-habits-tracker/

### Deploying Landing Page Updates

**Option 1: Manual Push**

```bash
cd landing
git add .
git commit -m "Update landing page"
git push
git subtree push --prefix landing origin gh-pages
```

**Option 2: GitHub Actions (Automatic)**
Push to main branch and GitHub Actions will auto-deploy to gh-pages.

## 📚 Documentation

- `PRODUCTION.md` - Production build guide
- `DEPLOYMENT-GITHUB.md` - GitHub Releases deployment
- `BUILD.md` - Build system details
- `USER-GUIDE.md` - End user guide
- `backend/API-ROUTES.md` - Complete API documentation
- `landing/DEPLOYMENT.md` - Landing page deployment (Netlify/GitHub Pages)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**عبدالرحمن أحمد نصار** (Abdelrahman Ahmed Nassar)

- Email: abdelrhman.ahmed.nassar@gmail.com
- GitHub: [@abdelrahman-ahmed-nassar](https://github.com/abdelrahman-ahmed-nassar)
- WhatsApp: +201003685977

## 🙏 Acknowledgments

Inspired by the hadith: "أحب الأعمال إلى الله أدومها وإن قل"
"The most beloved deeds to Allah are those done consistently, even if small."

---

**مداوم - للمداومة على العادات الصالحة** 🌟
