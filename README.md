# 🏥 ER Queue Management System

> **Clinical Precision** — An interactive Emergency Room Patient Queue Management System powered by advanced Data Structures & Algorithms.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Data Structures & Algorithms Used](#data-structures--algorithms-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run Locally](#run-locally)
- [Default Login Credentials](#default-login-credentials)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Author](#author)

---

## 📖 About the Project

In an Emergency Room, the traditional **First-Come, First-Served (FCFS)** model is not just inefficient—it's **dangerous**. A patient experiencing cardiac arrest cannot wait behind someone with a minor injury.

This system leverages a **Priority Queue (Min-Heap)** to ensure that medical resources are directed where they are needed most, **instantaneously**. It is a DSA portfolio project that demonstrates real-world application of fundamental data structures and algorithms.

---

## ✨ Features

- 🔐 **Role-Based Authentication** — Separate login for Doctors and Crew Members
- 📝 **User Registration** — Register new accounts stored in Firebase Realtime Database
- 🏥 **Patient Admission Form** — Add patients with name, age, triage level, and condition
- ⚡ **Real-Time Priority Queue** — Min-Heap based triage ensures critical patients are served first
- 🔄 **Live Sync Across Devices** — Firebase Realtime Database keeps all connected browsers in sync
- ↩️ **Undo Functionality** — Stack-based undo for the last triage action
- 🗑️ **Clear / Reset Queue** — Instantly empty the queue
- 📊 **Sample Triage Dataset** — Preloaded data table for reference
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🎨 **Modern UI** — Glassmorphism, micro-animations, and a futuristic dark theme

---

## 🛠️ Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Structure  | HTML5                                    |
| Styling    | Vanilla CSS3 (custom design tokens)     |
| Logic      | Vanilla JavaScript (ES6+)               |
| Database   | Firebase Realtime Database (CDN)         |
| Fonts      | Google Fonts (Inter, Outfit)             |
| Icons      | Remix Icon                               |

---

## 🧠 Data Structures & Algorithms Used

| DS / Algorithm          | Purpose                                       | Time Complexity        |
|-------------------------|-----------------------------------------------|------------------------|
| **Priority Queue (Min-Heap)** | Primary triage ordering                 | Insert/Extract: O(log n) |
| **Circular Queue**      | Entry-stage patient inflow management         | Enqueue/Dequeue: O(1) |
| **Doubly Linked List**  | Master patient history log                    | Append/Delete: O(1)   |
| **Hash Table**          | Instant patient lookup by ID                  | Search: O(1) avg      |
| **Stack**               | Undo functionality for triage actions         | Push/Pop: O(1)        |
| **Binary Search**       | Efficient sorted array traversal              | O(log n)              |
| **Merge Sort**          | Sorting discharge history                     | O(n log n)            |
| **Insertion Sort**      | Nearly-sorted small dataset ordering          | O(n²)                 |
| **Linear Search**       | Exhaustive search on non-indexed arrays       | O(n)                  |

---

## 🚀 Getting Started

### Prerequisites

You only need a **modern web browser** — no Node.js, npm, or any build tools required.

- Google Chrome (recommended), Firefox, Edge, or Safari
- An active internet connection (for Firebase sync & CDN resources)

### Run Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/er-queue-managment-system.git
   ```

2. **Navigate into the project folder**

   ```bash
   cd er-queue-managment-system-main
   ```

3. **Open `index.html` in your browser**

   You have several options:

   ---

   #### Option A — Double-click (simplest)

   Just double-click the `index.html` file in your file explorer. It will open in your default browser.

   ---

   #### Option B — VS Code Live Server (recommended for development)

   If you use **Visual Studio Code**:

   1. Install the **Live Server** extension by Ritwick Dey.
   2. Open the project folder in VS Code.
   3. Right-click on `index.html` → **"Open with Live Server"**.
   4. The app will launch at `http://127.0.0.1:5500`.

   ---

   #### Option C — Python HTTP Server

   If you have Python installed:

   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Then open `http://localhost:8000` in your browser.

   ---

   #### Option D — Node.js HTTP Server

   If you have Node.js installed:

   ```bash
   npx -y serve .
   ```

   Then open the URL shown in the terminal (usually `http://localhost:3000`).

4. **Login with the default credentials** (see below) and start using the ER Queue Simulator!

---

## 🔑 Default Login Credentials

The system comes with built-in accounts for testing. You can also **register new accounts** via the Register tab.

### Doctor Accounts

| User ID  | Password       | Name            |
|----------|----------------|-----------------|
| `doc01`  | `clinical123`  | Dr. Admin       |
| `doc02`  | `doctor456`    | Dr. Specialist  |

### Crew Member Accounts

| User ID   | Password     | Name            |
|-----------|--------------|-----------------|
| `crew01`  | `triage456`  | Nurse Station   |
| `crew02`  | `crew789`    | Paramedic Unit  |

---

## 📁 Project Structure

```
er-queue-managment-system-main/
│
├── index.html                  # Main HTML entry point
├── style.css                   # All styles (design tokens, components, animations)
├── script.js                   # Application logic (auth, heap, Firebase sync)
├── doctor_tablet_1774882013907.png  # Hero section image asset
└── README.md                   # This file
```

---

## 📸 Screenshots

After launching the application, you will see:

1. **Login Screen** — A modern auth portal with animated particles and role-based sign-in.
2. **Hero Section** — "Clinical Precision" landing with live system vitals.
3. **Data Structures Section** — Visual cards explaining each DS used.
4. **Interactive Simulator** — Admit patients and watch the Min-Heap reorder in real-time.
5. **Technical Audit** — Time & space complexity breakdown.

---

## 👤 Author

**Satyam Kumar Thakur**
- ID: 0251CS191
- Institution: NIET
- Course: B.Tech (Computer Science)
- Mentor: Mr. Aman Prasad, Dept. Computer Science

---

## 📄 License

This project is for **educational purposes** as part of a DSA course portfolio.

---

<p align="center">
  Made with ❤️ by Satyam Kumar Thakur &nbsp;|&nbsp; © 2026
</p>
