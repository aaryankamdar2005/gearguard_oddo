 
<div align="center">
<h1>🛠️ GearGuard: The Ultimate Maintenance Tracker</h1>
<img src="https://github.com/user-attachments/assets/38d1eb65-8a81-4922-b87b-896851290552" width="300" alt="GearGuard Logo"/>



</div>


**An intelligent Odoo-style maintenance management system for modern enterprises**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🚀 Live Demo](https://gearguard-demo.vercel.app) • [📖 Documentation](docs/) • [🐛 Report Bug](issues/) • [✨ Request Feature](issues/)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Architecture](#project-architecture)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About The Project

GearGuard revolutionizes how manufacturing companies manage equipment maintenance. Built as a comprehensive Odoo-style ERP module, it seamlessly connects **Equipment** (assets), **Teams** (technicians), and **Requests** (maintenance work) with intelligent automation and real-time collaboration [web:71][web:73].

### 🚨 Problem Statement

Companies lose **$260 billion annually** due to unplanned equipment downtime. Traditional maintenance tracking relies on spreadsheets, paper logs, and fragmented communication—resulting in:
- ⏱️ Missed preventive maintenance schedules
- 📉 Inefficient technician allocation
- 🔍 Poor equipment health visibility
- 💸 Budget overruns from emergency repairs

### ✅ Our Solution

GearGuard provides a **single source of truth** for all maintenance operations with:
- 🤖 **Smart Auto-Fill Logic** - Equipment selection automatically populates category, team, and technician
- 📊 **Visual Kanban Boards** - Drag-and-drop request management across stages (New → In Progress → Repaired → Scrap)
- 📅 **Calendar Scheduling** - Preventive maintenance planning with date-specific visibility
- 📈 **Real-Time Dashboards** - Critical equipment alerts, technician workload, and overdue request tracking

**Built for**: Maintenance managers, technicians, and facility operators in manufacturing, healthcare, logistics, and property management [file:1].

---

## ✨ Key Features

### Core Functionality [file:1][web:50]

| Feature | Description |
|---------|-------------|
| **🏭 Equipment Registry** | Central database for all assets with serial numbers, warranty tracking, department/employee assignment, and location management |
| **👥 Team Management** | Define specialized teams (Mechanics, Electricians, IT) with member assignments and workload distribution |
| **📝 Request Lifecycle** | Complete workflow from creation → assignment → execution → completion with duration tracking |
| **🎨 Kanban Board** | Visual stage management with drag-and-drop, technician avatars, priority indicators, and overdue highlighting |
| **📆 Calendar View** | Week/month views for preventive maintenance scheduling with click-to-create functionality |
| **📊 Smart Dashboard** | KPI cards for critical equipment, technician utilization, and open request metrics |
| **🔗 Smart Buttons** | Equipment detail pages show maintenance history count with filtered request lists |
| **🔄 Auto-Fill Logic** | Equipment selection triggers automatic category and team population |

### Advanced Features [web:51][web:54]

- ⚡ **Real-Time Updates** - Live collaboration with Supabase Realtime subscriptions
- 📧 **Email Notifications** - Automated alerts for assignments, deadlines, and critical equipment


---

## 🛠️ Tech Stack

**Frontend** [web:69][web:73]
- ⚛️ [Next.js 14](https://nextjs.org/) - React framework with App Router
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- 🧩 [shadcn/ui](https://ui.shadcn.com/) - Accessible component library
- 📋 [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Form validation
- 📅 [React Big Calendar](https://jquense.github.io/react-big-calendar/) - Calendar view
- 🎯 [@dnd-kit](https://dndkit.com/) - Drag-and-drop Kanban

**Backend**
- 🗄️ [MongoDb](https://cloud.mongodb.com/) - PostgreSQL database + Auth + Realtime
- 🔐 [NextAuth.js](https://next-auth.js.org/) - Authentication
- 🔄 Next.js API Routes - Serverless functions



**DevOps**
- 🚀 [Vercel](https://vercel.com/) - Deployment and hosting
- 📊 Vercel Analytics - Performance monitoring

---

## 🚀 Getting Started

### Prerequisites

