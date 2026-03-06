# Women Safety Application - System Architecture

This document provides a high-level overview of the system architecture, structured for easy extraction into PowerPoint presentation slides.

---

## Slide 1: High-Level Architecture Overview

**Client-Server Model**
The system is built on a scalable client-server architecture, ensuring real-time responsiveness and secure data handling.

*   **Client Tier (Frontend):** Mobile Application built with React Native.
*   **Application Tier (Backend):** RESTful API built with Node.js and Express.js.
*   **Data Tier (Database):** MongoDB for persistent data storage.
*   **External Services Tier:** Integration with strictly verified third-party APIs (Mapping, Geocoding, AI).

---

## Slide 2: Frontend Architecture (Mobile App)

**Technology Stack:** React Native, Expo, React Navigation

*   **Presentation Layer:**
    *   Functional Components for modular UI (e.g., `ContactCard`, `MapViewComponent`).
    *   Responsive Design optimized for emergency situations (Dark Mode, Large Touch Targets).
*   **State Management & Logic:**
    *   React Context API for global state (Authentication, Emergency Status).
    *   Custom Hooks (e.g., `useLocation`) for encapsulating complex logic.
*   **Device Integration:**
    *   Native Location Services (GPS/Network positioning).
    *   Intent Handling (Direct Phone Calls, SMS triggers).

---

## Slide 3: Application Server (Backend)

**Technology Stack:** Node.js, Express.js

*   **API Gateway / Routing:** Manages incoming HTTP requests from the mobile app.
*   **Controllers:** Contains the core business logic (User Authentication, Guardian Management, Incident Logging).
*   **Security & Middleware:**
    *   JSON Web Tokens (JWT) for secure, stateless authentication.
    *   CORS policies and Request Validation.
*   **Data Models:** Mongoose schemas defining the structure for Users, Guardians, and SOS Events.

---

## Slide 4: Data & External Services Integrations

**Database:** MongoDB
*   Stores User Profiles, Encrypted Emergency Contacts, and Historical Route Data.

**External API Integrations:**
*   **Mapping & Routing (OSRM):** Open Source Routing Machine for calculating true physical roads and distinct alternatives (Safest, Fastest, Shortcut).
*   **Geocoding (Nominatim):** OpenStreetMap service for converting text addresses into precise latitude/longitude coordinates.
*   **Artificial Intelligence (Google Gemini / Custom AI Logic):** Real-time analysis of route safety based on distance, time, and historical zone data.

---

## Slide 5: Emergency SOS & Live Tracking Flow

**Data Flow during an SOS Event:**

1.  **Trigger:** User presses the physical or on-screen SOS button.
2.  **Location Acquisition:** The `LocationService` fetches high-accuracy GPS coordinates.
3.  **Local Action:** Device initiates SMS intents to pre-loaded guardian numbers.
4.  **Server Action:** App sends an urgent payload to the Backend API.
5.  **Database Update:** Backend logs the incident and updates the user's live status.
6.  **Continuous Tracking:** Background timer actively polls location and updates the server, giving guardians a live tracking link.
