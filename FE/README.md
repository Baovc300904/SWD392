# SWD392 - Frontend Application

Student Q&A and Group Management System built with React + Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 API Integration

This application connects to the backend API deployed on Render:
- **API Base URL**: `https://swd392-swagger-pages.onrender.com/api`
- **Swagger Documentation**: https://swd392-swagger-pages.onrender.com/api-docs/

### Environment Variables

The application uses environment variables for API configuration:

- **Production** (Vercel): Uses `.env.production`
- **Local Development**: Create `.env.local` from `.env.example`

```bash
# Create local environment file
cp .env.example .env.local
```

## 📦 Deployment

### Vercel Deployment

The application is configured for Vercel deployment with the following settings:

1. **Environment Variables** (Set in Vercel Dashboard):
   ```
   VITE_API_BASE_URL=https://swd392-swagger-pages.onrender.com/api
   ```

2. **Deploy Commands**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Automatic Deploys**:
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests

### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI, shadcn/ui
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
