// Basic RACA demo logic

let map;
let userMarker;
let watchId = null;
let lastPosition = null;
let lastUpdateTime = null;
let simulateInterval = null;

// Approximate coordinates around Naga City, Camarines Sur
const NAGA_CENTER = { lat: 13.6233, lng: 123.194 };

// Sample hazards around Naga City with specific cases / signs
const hazards = [
  {
    id: 1,
    name: "Deep pothole – right lane",
    type: "pothole_deep",
    severity: "high",
    lat: 13.6239,
    lng: 123.1932,
    verified: true,
    description:
      "Deep, sharp‑edged pothole on the right lane. Strongly advised to slow down and change lane.",
  },
  {
    id: 2,
    name: "Shallow potholes – left wheel path",
    type: "pothole_shallow",
    severity: "medium",
    lat: 13.6227,
    lng: 123.1951,
    verified: false,
    description: "Cluster of shallow potholes. Reduce speed to avoid tire wear.",
  },
  {
    id: 3,
    name: "Flooded section – low area",
    type: "flooded",
    severity: "high",
    lat: 13.6245,
    lng: 123.1937,
    verified: true,
    description:
      "Road usually floods during heavy rain. Risk of hydroplaning and hidden deep potholes.",
  },
  {
    id: 4,
    name: "Temporary barrier – lane closed",
    type: "barriered",
    severity: "medium",
    lat: 13.6221,
    lng: 123.1925,
    verified: true,
    description:
      "Plastic barriers closing one lane for safety. Merge early and follow traffic signs.",
  },
  {
    id: 5,
    name: "Ongoing road renovation",
    type: "under_renovation",
    severity: "medium",
    lat: 13.6218,
    lng: 123.1948,
    verified: true,
    description:
      "Active roadworks. Uneven surface, loose gravel, and workers present – drive very carefully.",
  },
  {
    id: 6,
    name: "Cracked surface – near intersection",
    type: "crack",
    severity: "low",
    lat: 13.6231,
    lng: 123.196,
    verified: false,
    description: "Fine road cracks that can worsen over time, especially in rain.",
  },
  {
    id: 7,
    name: "Deep pothole – near pedestrian crossing",
    type: "pothole_deep",
    severity: "high",
    lat: 13.6242,
    lng: 123.1955,
    verified: true,
    description:
      "Deep pothole close to the pedestrian lane. Strong braking needed if not anticipated.",
  },
  {
    id: 8,
    name: "Multiple shallow potholes",
    type: "pothole_shallow",
    severity: "medium",
    lat: 13.6224,
    lng: 123.1938,
    verified: false,
    description:
      "Series of shallow potholes along the lane. Maintain low to moderate speed.",
  },
  {
    id: 9,
    name: "Flooded shoulder – avoid right side",
    type: "flooded",
    severity: "medium",
    lat: 13.6236,
    lng: 123.1929,
    verified: true,
    description:
      "Shoulder area collects water after rain. Risky for motorcycles and small vehicles.",
  },
  {
    id: 10,
    name: "Concrete barriers – two-way scheme",
    type: "barriered",
    severity: "medium",
    lat: 13.6215,
    lng: 123.1956,
    verified: true,
    description:
      "Concrete barriers redirect vehicles into a temporary two-way traffic scheme.",
  },
];

const gpsStatusEl = document.getElementById("gps-status");
const hazardListEl = document.getElementById("hazard-list");
const filterSeverityEl = document.getElementById("filter-severity");
const activeAlertEl = document.getElementById("active-alert");
const alertTitleEl = document.getElementById("alert-title");
const alertDistanceEl = document.getElementById("alert-distance");
const alertSeverityEl = document.getElementById("alert-severity");
const speedValueEl = document.getElementById("speed-value");
const nearestDistanceEl = document.getElementById("nearest-distance");
const simulateBtn = document.getElementById("simulate-move");
const alertSoundEl = document.getElementById("alert-sound");
const splashEl = document.getElementById("splash");

function getHazardIcon(type) {
  switch (type) {
    case "pothole_deep":
      return "🕳️";
    case "pothole_shallow":
      return "⚠️";
    case "flooded":
      return "🌧️";
    case "barriered":
      return "🚧";
    case "under_renovation":
      return "👷";
    case "crack":
      return "〰️";
    default:
      return "⚠️";
  }
}

function getHazardTypeLabel(type) {
  switch (type) {
    case "pothole_deep":
      return "Deep pothole";
    case "pothole_shallow":
      return "Shallow potholes";
    case "flooded":
      return "Flooded road";
    case "barriered":
      return "Barriered / blocked";
    case "under_renovation":
      return "Under renovation";
    case "crack":
      return "Cracked surface";
    default:
      return type;
  }
}

function initMap() {
  map = L.map("map", {
    zoomControl: false,
  }).setView([NAGA_CENTER.lat, NAGA_CENTER.lng], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  hazards.forEach((h) => {
    const markerClass =
      h.severity === "high"
        ? "hazard-marker--high"
        : h.severity === "medium"
        ? "hazard-marker--medium"
        : "hazard-marker--low";

    const icon = L.divIcon({
      className: `hazard-marker ${markerClass}`,
      html: `<span class="hazard-marker-emoji">${getHazardIcon(h.type)}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([h.lat, h.lng], { icon }).addTo(map);

    marker.bindPopup(
      `<strong>${h.name}</strong><br>${h.description}<br><small>${getHazardTypeLabel(
        h.type
      )} • Severity: ${h.severity.toUpperCase()} ${
        h.verified ? "· ✓ Verified" : ""
      }</small>`
    );

    h._marker = marker;
  });
}

function setGpsStatus(state, message) {
  gpsStatusEl.textContent = message;
  gpsStatusEl.classList.remove("status-pill--ok", "status-pill--error");

  if (state === "ok") gpsStatusEl.classList.add("status-pill--ok");
  else if (state === "error") gpsStatusEl.classList.add("status-pill--error");
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(meters) {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(2) + " km";
  }
  return Math.round(meters) + " m";
}

function estimateSpeed(current, previous) {
  if (!previous) return null;
  const dt = (current.time - previous.time) / 1000;
  if (dt <= 0) return null;
  const d = haversineDistance(previous.lat, previous.lng, current.lat, current.lng);
  const speedMs = d / dt;
  const speedKmh = speedMs * 3.6;
  return speedKmh;
}

function renderHazardList(position) {
  const filter = filterSeverityEl.value;
  hazardListEl.innerHTML = "";

  const withDistance = hazards.map((h) => {
    let distance = null;
    if (position) {
      distance = haversineDistance(position.lat, position.lng, h.lat, h.lng);
    }
    return { ...h, distance };
  });

  const filtered = withDistance
    .filter((h) => {
      if (filter === "high") return h.severity === "high";
      if (filter === "medium") return h.severity === "medium" || h.severity === "high";
      return true;
    })
    .sort((a, b) => {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

  filtered.forEach((h) => {
    const li = document.createElement("li");
    li.className = "hazard-item";
    li.innerHTML = `
      <div class="hazard-main">
        <div class="hazard-icon">${getHazardIcon(h.type)}</div>
        <div class="hazard-info">
          <span class="hazard-title">${h.name}</span>
          <span class="hazard-meta">${getHazardTypeLabel(h.type)} • ${
      h.severity.charAt(0).toUpperCase() + h.severity.slice(1)
    } severity</span>
        </div>
      </div>
      <div class="hazard-right">
        <span class="distance-tag">${
          h.distance != null ? formatDistance(h.distance) : "–"
        }</span>
        ${
          h.verified
            ? '<span class="verified-badge">✓<span>Verified</span></span>'
            : ""
        }
      </div>
    `;
    li.addEventListener("click", () => {
      if (h._marker) {
        map.setView([h.lat, h.lng], 17);
        h._marker.openPopup();
      }
    });
    hazardListEl.appendChild(li);
  });

  if (position) {
    const nearest = withDistance
      .filter((h) => h.distance != null)
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest) {
      nearestDistanceEl.textContent = formatDistance(nearest.distance);
    } else {
      nearestDistanceEl.textContent = "–";
    }
  } else {
    nearestDistanceEl.textContent = "–";
  }
}

function updateAlert(position) {
  if (!position) {
    activeAlertEl.classList.add("hidden");
    return;
  }

  const thresholds = {
    high: 120,
    medium: 100,
    low: 80,
  };

  let candidate = null;

  hazards.forEach((h) => {
    const d = haversineDistance(position.lat, position.lng, h.lat, h.lng);
    const th = thresholds[h.severity];
    if (d <= th) {
      if (!candidate || d < candidate.distance) {
        candidate = { ...h, distance: d };
      }
    }
  });

  if (candidate) {
    alertTitleEl.textContent = candidate.name;
    alertDistanceEl.textContent = formatDistance(candidate.distance);

    alertSeverityEl.textContent =
      candidate.severity.toUpperCase() +
      (candidate.verified ? " • VERIFIED" : "");

    alertSeverityEl.className = "severity-pill";
    alertSeverityEl.classList.add("severity-pill--" + candidate.severity);

    activeAlertEl.classList.remove("hidden");

    try {
      alertSoundEl.currentTime = 0;
      alertSoundEl.play().catch(() => {});
    } catch (e) {}
  } else {
    activeAlertEl.classList.add("hidden");
  }
}

function handlePosition(position) {
  const { latitude, longitude } = position.coords;
  const posObj = {
    lat: latitude,
    lng: longitude,
    time: position.timestamp,
  };

  if (!userMarker) {
    userMarker = L.circleMarker([latitude, longitude], {
      radius: 9,
      color: "#38bdf8",
      weight: 3,
      fillColor: "#38bdf8",
      fillOpacity: 0.7,
    })
      .addTo(map)
      .bindPopup("You are here");

    map.setView([latitude, longitude], 16);
  } else {
    userMarker.setLatLng([latitude, longitude]);
  }

  const speed = estimateSpeed(posObj, lastPosition);
  if (speed != null) {
    speedValueEl.textContent = `${speed.toFixed(0)} km/h`;
  } else {
    speedValueEl.textContent = "– km/h";
  }

  lastPosition = posObj;
  lastUpdateTime = Date.now();

  setGpsStatus("ok", "GPS locked · Live");
  renderHazardList(posObj);
  updateAlert(posObj);
}

function handlePositionError() {
  setGpsStatus("error", "GPS unavailable – using map only");
}

function startGeolocation() {
  if (!("geolocation" in navigator)) {
    setGpsStatus("error", "GPS not supported on this device");
    return;
  }

  setGpsStatus("searching", "Searching GPS…");

  watchId = navigator.geolocation.watchPosition(handlePosition, handlePositionError, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 10000,
  });
}

function startSimulation() {
  if (simulateInterval) {
    clearInterval(simulateInterval);
    simulateInterval = null;
    simulateBtn.textContent = "▶ Simulate Drive";
    simulateBtn.classList.remove("primary-btn--active");
    return;
  }

  simulateBtn.textContent = "■ Stop Simulation";
  simulateBtn.classList.add("primary-btn--active");

  let t = 0;
  const radius = 0.004;
  const center = { ...NAGA_CENTER };

  simulateInterval = setInterval(() => {
    t += 0.03;
    const lat = center.lat + radius * Math.cos(t);
    const lng = center.lng + radius * Math.sin(t);

    const fakePosition = {
      coords: {
        latitude: lat,
        longitude: lng,
      },
      timestamp: Date.now(),
    };

    handlePosition(fakePosition);
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  renderHazardList(null);
  startGeolocation();

  filterSeverityEl.addEventListener("change", () => {
    renderHazardList(lastPosition);
  });

  simulateBtn.addEventListener("click", startSimulation);

  // Simple intro: fade out splash after a short delay
  if (splashEl) {
    setTimeout(() => {
      splashEl.classList.add("hidden");
    }, 1400);
  }
});


