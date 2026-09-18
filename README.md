# Multi-Window Media Sequencer

A full-stack, deterministic multi-window media playback and synchronization application built with **Spring Boot 3 (Java 17, Maven)**, **PostgreSQL**, and **React (Vite)**.

---

## 1. Core Architecture & Design

### Deterministic Clock-Based Playback
Instead of using heavy server-side video streaming or per-item polling WebSockets, this system uses a **clock-driven deterministic model**:
- Each `DisplayWindow` has a constant `cycleAnchor` (epoch seconds).
- `CYCLE_SECONDS = 18000` (5 hours).
- On initial page load, the frontend hits `GET /api/time` once to calculate clock skew:
  $$\text{offset} = \text{serverNowMs} - \text{clientNowMs}$$
  This offset is applied to `Date.now()` on every tick to maintain accurate server time locally without ongoing network calls.
- Every second, each window calculates its active media item locally using:
  $$\text{elapsed} = (\text{serverNow} - \text{cycleAnchor}) \pmod{\text{CYCLE\_SECONDS}}$$
  $$\text{posInList} = \text{elapsed} \pmod{\sum \text{playlist durations}}$$
- The frontend walks the ordered playlist to find the current item and the exact seconds already elapsed into it.
- Videos auto-seek to the computed elapsed second (`muted` + `autoplay`).
- **Benefits**: Playback is 100% continuous, refresh-safe, and requires zero polling per media change.

### Global Sync Override
- A singleton database table `SyncState(id=1, mediaId, startEpoch, durationSec)` stores scheduled sync events.
- `POST /api/sync` updates this row with a media item and duration.
- The frontend polls `GET /api/sync` every 2 seconds.
- While `serverNow >= startEpoch` and `serverNow < (startEpoch + durationSec)`:
  - **Every** window tile immediately overrides its display to show the synchronized item.
  - An alert banner with a real-time countdown is rendered across the application.
- When the sync window expires, all windows automatically fall back to the deterministic formula. **No playlist state or window position is lost.**

---

## 2. Project Setup & Local Run

### Prerequisites
- **Java 17+** (OpenJDK 17 or higher)
- **Maven** (included via `./mvnw` wrapper)
- **Node.js 18+** & **npm**
- **PostgreSQL 14+** running locally on port 5432

### Backend Setup (Spring Boot)
1. Ensure PostgreSQL is running and database exists:
   ```sql
   CREATE DATABASE media_sequencer;
   ```
2. Configure credentials in `src/main/resources/application.properties` (or set environment variables `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`). Default is `postgres / 0000`.
3. Build and run:
   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run

   # Linux/macOS
   ./mvnw spring-boot:run
   ```
   The backend starts at `http://localhost:8080`.
   Initial seed data (3 windows, 6 media items, and sync state) is automatically populated via `data.sql` and `DataInitializer`.

### Frontend Setup (React + Vite)
1. Navigate into `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at `http://localhost:5173`.
   Vite proxies `/api/*` requests to the backend running on port 8080.

---

## 3. API Documentation

### 1. Clock Skew Calibration
- **`GET /api/time`**
  - **Response**:
    ```json
    {
      "epochMillis": 1789655896895,
      "epochSeconds": 1789655896
    }
    ```

### 2. Display Windows & Playlists
- **`GET /api/windows`**
  - Returns all display windows with their ordered playlist entries, media items, and cycle anchors.
- **`POST /api/windows/{id}/media`**
  - Appends a media item to the window's playlist.
  - **Payload Option A (Existing Media)**:
    ```json
    {
      "mediaId": 4
    }
    ```
  - **Payload Option B (Inline Custom Media)**:
    ```json
    {
      "name": "Promotional Clip",
      "type": "VIDEO",
      "url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      "durationSec": 15
    }
    ```

### 3. Media Items Library
- **`GET /api/media`**: Lists all available media items.
- **`POST /api/media`**: Creates a new media item (`name`, `type [IMAGE|VIDEO|BLANK]`, `url`, `durationSec`).

### 4. Global Sync Override
- **`GET /api/sync`**
  - Returns current sync state and whether it is currently active.
  - **Response**:
    ```json
    {
      "id": 1,
      "mediaId": 2,
      "mediaItem": {
        "id": 2,
        "name": "Blooming Flower",
        "type": "VIDEO",
        "url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        "durationSec": 10
      },
      "startEpoch": 1789655970,
      "durationSec": 30,
      "startEpochMillis": 1789655970000,
      "endEpochMillis": 1789656000000,
      "serverTimeMillis": 1789655975000,
      "active": true
    }
    ```
- **`POST /api/sync`**
  - Triggers a global sync override.
  - **Payload**:
    ```json
    {
      "mediaId": 2,
      "durationSec": 30
    }
    ```

---

## 4. Assumptions & Tradeoffs

| Feature / Area | Decision & Rationale | Tradeoff |
| :--- | :--- | :--- |
| **Clock-Driven Playback** | Client computes playback from elapsed clock time modulo playlist duration. | Eliminates server streaming bandwidth, but clients must have reliable clocks (solved via one-time clock skew calibration). |
| **Video Seeking** | Video elements seek to `computedOffset` with a 1.5s tolerance threshold. | Prevents frame stutter caused by strict 1Hz seeks while retaining cross-client visual synchronization. |
| **Sync State** | Singleton row (`id=1`) polled every 2 seconds. | Extremely simple, lightweight, and fault-tolerant; avoids WebSocket connection drops while giving near-instantaneous global overrides. |
| **Playlist Mutation** | Appending items preserves past anchors; next cycle accounts for newly appended items smoothly. | Dynamic changes during an active loop shift subsequent indices without abrupt jumps. |

---

## 5. Production Deployment Guide

### A. Deploy Backend & PostgreSQL on Render
1. **Create PostgreSQL Database on Render**:
   - Go to Render Dashboard -> **New** -> **PostgreSQL**.
   - Note the **Internal Database URL** (or External URL).
2. **Deploy Spring Boot Backend on Render**:
   - Go to **New** -> **Web Service** -> Connect this repository.
   - **Environment**: Java / Docker.
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/media-sequencer-0.0.1-SNAPSHOT.jar`
   - **Environment Variables**:
     - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:5432/<dbname>`
     - `SPRING_DATASOURCE_USERNAME`: `<db_user>`
     - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
     - `PORT`: `8080`

### B. Deploy Frontend on Vercel
1. In the Vercel Dashboard -> **Add New Project** -> Import this repository.
2. Configure Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. If connecting to a remote backend on Render:
   - Add a `vercel.json` rewrites file or configure `VITE_API_URL` environment variable:
     ```json
     {
       "rewrites": [
         {
           "source": "/api/:path*",
           "destination": "https://your-render-backend.onrender.com/api/:path*"
         }
       ]
     }
     ```
4. Click **Deploy**. The sequencer frontend is live globally on Vercel CDN.
