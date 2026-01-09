# SmartJob - Supabase Database & i18n Integration

This document outlines the new Supabase database schema and internationalization (i18n) features added to the SmartJob application.

## 🗄️ Supabase Database Schema

### Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Environment Variables**
   Add these to your frontend `.env` file:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the Database Schema**
   - Open the Supabase SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL to create all tables and policies

### Database Tables

#### Profiles
- Stores user profile information linked to Supabase Auth
- Supports both job seekers and employers
- Automatic profile creation on user signup

#### Jobs
- Job postings by employers
- Includes job type, salary range, location
- Row Level Security for employer access control

#### Applications
- Job applications submitted by job seekers
- Tracks application status (pending, reviewed, accepted, rejected)
- Links applicants to jobs with unique constraint

#### Messages
- Real-time messaging between employers and applicants
- Linked to specific applications
- Row Level Security for conversation privacy

### Features
- **Row Level Security**: Users can only access their own data
- **Real-time**: Messages update in real-time
- **Automatic Timestamps**: Created and updated timestamps
- **Triggers**: Automatic profile creation on signup

## 🌐 Internationalization (i18n)

### Supported Languages
- **English** (en) - Default
- **Kinyarwanda** (rw)
- **Français** (fr)

### Translation Files
Located in `src/i18n/locales/`:
- `en.json` - English translations
- `rw.json` - Kinyarwanda translations  
- `fr.json` - French translations

### Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('home.heroTitle')}</h1>;
}
```

### Language Switcher
- Added to the navigation bar
- Dropdown with flag icons
- Persists language preference in localStorage
- Available to all users (logged in or not)

## 🔧 Authentication with Role Selection

### Role Types
- `job_seeker` - Users looking for jobs
- `employer` - Companies posting jobs

### Registration Flow
1. User selects role during signup
2. Profile automatically created in Supabase
3. Role stored in user metadata
4. Redirect based on role after registration

### Existing Features
- Role selection already implemented in registration form
- Profile dropdown with role-based navigation
- Role-based access control throughout the app

## 🏠 Home Page Features

### Hero Section
- Compelling headline and subtitle
- Call-to-action buttons based on user status
- Trust indicators with company logos
- Statistics showcase

### Search Functionality
- Keyword search for job titles and skills
- Location filter (Rwandan provinces)
- Category filter
- Direct navigation to jobs page with search parameters

### Features Section
- Smart Job Search with AI matching
- Easy Applications system
- Direct Messaging
- Professional Profiles

## 📱 Responsive Navigation

### Navbar Features
- Responsive design for mobile and desktop
- User menu with profile dropdown
- Language switcher
- Role-based navigation items
- Login/Signup buttons for guests

### Profile Dropdown
- User avatar and name
- Email display
- Role indicator
- Quick access to settings
- Logout functionality

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Test Features**
   - Try the language switcher in the navbar
   - Register a new account with role selection
   - Test the search functionality on the home page

## 📁 File Structure

```
frontend/src/
├── i18n/
│   ├── index.js              # i18n configuration
│   └── locales/
│       ├── en.json           # English translations
│       ├── rw.json           # Kinyarwanda translations
│       └── fr.json           # French translations
├── components/
│   ├── LanguageSwitcher.jsx  # Language dropdown component
│   └── ProfileDropdown.jsx   # User menu component
├── utils/
│   └── supabase.js          # Supabase client configuration
└── pages/
    ├── home.jsx              # Home page with hero and search
    └── register.jsx          # Registration with role selection
```

## 🔍 What Was Added

### New Files
- `supabase-schema.sql` - Complete database schema
- `frontend/src/i18n/` - Translation system
- `frontend/src/components/LanguageSwitcher.jsx` - Language switcher
- `frontend/src/utils/supabase.js` - Supabase client

### Modified Files
- `frontend/src/main.jsx` - Added i18n import
- `frontend/src/App.jsx` - Added language switcher to navbar
- `frontend/package.json` - Added @supabase/supabase-js dependency

### Existing Features Preserved
- All existing authentication and authorization
- Current MongoDB backend functionality
- Existing UI components and styling
- Current routing and navigation structure

## 🎯 Next Steps

1. **Set up Supabase project** and run the schema
2. **Configure environment variables** for Supabase
3. **Test the new features** in development
4. **Consider migrating** from MongoDB to Supabase gradually
5. **Add more translations** as needed
6. **Implement real-time features** using Supabase subscriptions

The new features are designed to work alongside your existing MongoDB backend, allowing for gradual migration to Supabase if desired.
