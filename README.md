 
<div align="left">
<h1>GearGuard: The Ultimate Maintenance Tracker</h1>
<img src="https://github.com/user-attachments/assets/38d1eb65-8a81-4922-b87b-896851290552" width="300" alt="GearGuard Logo"/>



</div>


**An intelligent Odoo-style maintenance management system for modern enterprises**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](https://gearguard-demo.vercel.app) • [📖 Documentation](docs/) • [🐛 Report Bug](issues/) • [✨ Request Feature](issues/)

</div>

---


## About The Project

GearGuard revolutionizes how manufacturing companies manage equipment maintenance. Built as a comprehensive Odoo-style ERP module, it seamlessly connects **Equipment** (assets), **Teams** (technicians), and **Requests** (maintenance work) with intelligent automation and real-time collaboration [web:71][web:73].

###  Problem Statement

Companies lose **$260 billion annually** due to unplanned equipment downtime. Traditional maintenance tracking relies on spreadsheets, paper logs, and fragmented communication—resulting in:
- ⏱️ Missed preventive maintenance schedules
- 📉 Inefficient technician allocation
- 🔍 Poor equipment health visibility
- 💸 Budget overruns from emergency repairs

###  Our Solution

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
## UI Preview

<img width="1468" height="886" alt="image" src="https://github.com/user-attachments/assets/9f94274c-3473-4ebe-902b-eb4b82e21b63" />
<img width="1470" height="846" alt="image" src="https://github.com/user-attachments/assets/28b00b54-de91-4a80-9e90-72f49ef89212" />
<img width="1470" height="842" alt="image" src="https://github.com/user-attachments/assets/9501e4b0-c4a9-420e-82f0-8824a1d977d9" />
<img width="1293" height="801" alt="image" src="https://github.com/user-attachments/assets/b4e833ff-65ab-4976-8a7c-09f7dbcd4af7" />
<img width="1470" height="885" alt="image" src="https://github.com/user-attachments/assets/be739c2b-57f9-415f-be16-5a3fbb9bbe7c" />
<img width="1470" height="841" alt="image" src="https://github.com/user-attachments/assets/9b5b6f95-65dc-4aea-a25f-16d64a955156" />
<img width="1470" height="846" alt="image" src="https://github.com/user-attachments/assets/712d3fc4-0569-4e4c-aec2-735397189444" />
<img width="1019" height="841" alt="image" src="https://github.com/user-attachments/assets/6e39f503-a270-40d8-91c8-bab09a4c6d62" />
<img width="1410" height="542" alt="image" src="https://github.com/user-attachments/assets/a5e0f3c7-0100-447a-87a0-e03e3e161067" />
<img width="1003" height="841" alt="image" src="https://github.com/user-attachments/assets/f9094b23-73dc-43c3-a527-5336d6c58b13" />
<img width="1465" height="784" alt="image" src="https://github.com/user-attachments/assets/f66202fd-af8f-4be7-8f1a-933399825519" />


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


---

## 👥 Team Members

- **Aaryan Kamdar ** (Team Leader)  
  🔗 GitHub: https://github.com/aaryankamdar2005

- **Darshan Purohit**  
  🔗 GitHub: https://github.com/darshanpurohit20

- **Atharv Kulkarni**  
  🔗 GitHub: https://github.com/Atharvkulkarni

- **Ashutosh Shetty**  
  🔗 GitHub: https://github.com/AshutoshShetty


