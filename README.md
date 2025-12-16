# RACA – Road Condition Alert App (Prototype)

RACA is a prototype application for your research project that demonstrates how **real‑time road hazard alerts** can help drivers avoid potholes, cracks, and uneven surfaces.

This version is a **mobile‑friendly web app** you can open in a browser on a phone, tablet, or laptop. It showcases:

- Live GPS tracking (where supported)
- An interactive map with road hazards
- Distance + severity indicators
- Immediate alert banner when you are very close to a hazard
- “Inspector verified” hazards to show collaboration with road inspectors

---

## 1. How to run the app

You don’t need any special tools – just a modern browser (Chrome, Edge, Firefox, etc.).

1. Go to the project folder:
   - `C:\Grade 10 Research Papers\Research Nila Budy\raca-app`
2. Double‑click `index.html`  
   - Or right‑click `index.html` → **Open with** → choose your browser.
3. On a phone, you can:
   - Copy the `raca-app` folder to your phone or a USB, or host it on a simple server, then open `index.html` in the browser.

> For live GPS tracking, open it on a phone and **allow location access** when the browser asks.

---

## 2. What you can show in your presentation

- **Map view**
  - Shows your current location (blue marker) using GPS.
  - Shows potholes, cracks, and uneven road **as colored hazard markers**.
  - Uses a clean, minimal dark theme so hazards stand out.

- **Hazard list & indicators**
  - Each hazard has:
    - Name (e.g., “Deep pothole – right lane”)
    - Type (pothole, crack, uneven)
    - Severity: Low, Medium, or High
    - Distance from your current location (updates in real time)
    - A green **“Verified ✓” badge** when it comes from a road inspector.

- **Real‑time distance and speed**
  - Shows **estimated speed (km/h)** based on movement.
  - Shows **distance to the nearest hazard**.

- **Alert banner (collision avoidance idea)**
  - When you get very close to a hazard (within a few meters), a red banner appears:
    - “Immediate Hazard”
    - Hazard name
    - Exact distance
    - Severity pill (Low / Medium / High)
  - A short audio “beep” plays to simulate an in‑car warning sound.

- **Inspector Mode (concept)**
  - The footer explains that hazards with ✓ are **verified by road inspectors**.
  - In a full version, inspectors could log in and confirm or classify hazards.

---

## 3. Feature details (for your research write‑up)

- **Map**
  - Uses OpenStreetMap tiles via the Leaflet library (an alternative to Google Maps).
  - You can say: *“The prototype currently uses an open‑source map, but it can be replaced with Google Maps in a future version.”*

- **Real‑time GPS**
  - Uses the browser’s `navigator.geolocation.watchPosition`.
  - Continuously updates your position and recomputes distances to hazards.

- **Hazard model**
  - Each hazard has:
    - `type` (pothole, crack, uneven)
    - `severity` (low, medium, high)
    - `lat`, `lng` (location)
    - `verified: true/false` (inspector collaboration)
  - Distances are calculated using the **Haversine formula** (great‑circle distance on Earth).

- **Alert logic**
  - For each GPS update:
    - The app finds the **nearest hazard**.
    - If the distance is under a severity‑specific threshold (e.g., 120 m for high severity), it shows the alert banner and plays a sound.

- **Simulation mode**
  - Button: **“Simulate Drive”**
  - Simulates a circular driving path around the hazards so you can demo alerts even indoors or on a laptop with no GPS.

---

## 4. How this supports your RACA research

You can explain in your paper or defense that this prototype:

- Demonstrates how **real‑time road condition data** can be delivered to drivers.
- Encourages drivers to **slow down or change lanes** before reaching dangerous road defects.
- Shows how **collaboration with road inspectors** increases reliability:
  - Verified hazards are visually distinct.
  - In a full system, inspectors would validate and classify hazards before they appear as “verified” to users.
- Can be extended to:
  - Crowdsource new hazard reports from drivers.
  - Integrate with city databases of road maintenance schedules.
  - Provide analytics on which areas have the worst road conditions.

---

## 5. Files overview

- `index.html` – Main page layout and structure.
- `style.css` – Clean, modern dark‑mode UI styling.
- `app.js` – All the logic:
  - Map setup
  - GPS tracking
  - Hazard data and distance calculations
  - Alert triggering
  - Simulation mode

You can adjust hazard locations and names inside `app.js` to match **actual roads and defects** from your study area.


