# Project Overview

## Purpose
React-based portal landing page for Servicoop's Telecommunications and Automation services. This SPA provides authentication, role-based access control, and navigation to all infrastructure services.

**Live URL**: https://10.10.9.252/

## Tech Stack
- **Frontend Framework**: React 19.1.1 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS v4.1.14 with @tailwindcss/postcss
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Server**: Nginx (serves built files from /var/www/portal-servicios/dist/)

## Architecture
Single-page application (SPA) with:
- Client-side routing handled by React
- No backend API - authentication is client-side only (localStorage)
- Nginx serves static files and reverse-proxies service URLs
- All state persists in browser localStorage (no database)

## Key Features
- Client-side authentication (admin/guest roles)
- Role-based service access control
- Dark/light theme toggle
- Responsive 3-column grid layout for service cards
- Minimalist design aesthetic

## Service Reverse Proxying
Nginx reverse proxies these services:
- `/guardias/` → Flask (localhost:5000)
- `/monitor/` → FastAPI (localhost:8000)
- `/reporte/` → External (10.10.3.50:3000)
- `/dash/` → Dashboard (10.10.4.125:8050)
- `/gis/` → GIS (10.10.5.98)
- `/sitio2/` → Static site
