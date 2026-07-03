/* ==========================================================================
   Bastis fantastiske værvarselside - Applikasjonslogikk (JavaScript)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Konfigurasjon og Datastrukturer
// --------------------------------------------------------------------------
const LOCATIONS = {
    moss: {
        id: "moss",
        name: "Moss",
        country: "Norge",
        lat: 59.4340,
        lon: 10.6577,
        timezone: "Europe/Oslo"
    },
    brekkstad: {
        id: "brekkstad",
        name: "Brekkstad",
        country: "Norge",
        lat: 63.6871,
        lon: 9.6627,
        timezone: "Europe/Oslo"
    },
    phuket: {
        id: "phuket",
        name: "Phuket",
        country: "Thailand",
        lat: 7.8804,
        lon: 98.3922,
        timezone: "Asia/Bangkok"
    }
};

const PROVIDERS = {
    met: "MET Norway",
    openmeteo: "Open-Meteo",
    wttr: "wttr.in"
};

// Global tilstandsbehandling
const AppState = {
    unit: "C", // 'C' eller 'F'
    theme: "dark", // 'dark' eller 'light'
    weatherData: {
        moss: {},
        brekkstad: {},
        phuket: {}
    },
    isRefreshing: false
};

// --------------------------------------------------------------------------
// 2. Elegante SVG Værikoner (Moderne, responsive, fargetilpasset)
// --------------------------------------------------------------------------
const WEATHER_ICONS = {
    sunny: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #eab308;">
            <circle cx="12" cy="12" r="5" class="sun-core"></circle>
            <line x1="12" y1="1" x2="12" y2="3" class="sun-ray"></line>
            <line x1="12" y1="21" x2="12" y2="23" class="sun-ray"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" class="sun-ray"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" class="sun-ray"></line>
            <line x1="1" y1="12" x2="3" y2="12" class="sun-ray"></line>
            <line x1="21" y1="12" x2="23" y2="12" class="sun-ray"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" class="sun-ray"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" class="sun-ray"></line>
        </svg>
    `,
    partlycloudy: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #94a3b8;">
            <path d="M17 18a5 5 0 0 0-1-9.9 5 5 0 0 0-10 1A5 5 0 0 0 7 18h10z" fill="rgba(148, 163, 184, 0.2)"></path>
            <path d="M15.22 5.22a3 3 0 0 1 4.14 4.14" stroke="#eab308" class="sun-ray"></path>
            <circle cx="18" cy="4" r="2" stroke="#eab308" class="sun-core"></circle>
        </svg>
    `,
    cloudy: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #64748b;">
            <path d="M12 20a6 6 0 0 1-1.67-11.73a6 6 0 0 1 11.34 0A6 6 0 0 1 12 20z" fill="rgba(100, 116, 139, 0.15)" style="opacity: 0.5; transform: scale(0.9) translate(-4px, -2px);"></path>
            <path d="M17 18a5 5 0 0 0-1-9.9 5 5 0 0 0-10 1A5 5 0 0 0 7 18h10z" fill="rgba(100, 116, 139, 0.2)"></path>
        </svg>
    `,
    rain: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #38bdf8;">
            <path d="M17 16a5 5 0 0 0-1-9.9 5 5 0 0 0-10 1A5 5 0 0 0 7 16h10z" fill="rgba(56, 189, 248, 0.15)"></path>
            <line x1="8" y1="18" x2="8" y2="21" stroke-dasharray="1 3" class="rain-drop"></line>
            <line x1="12" y1="18" x2="12" y2="21" stroke-dasharray="1 3" class="rain-drop"></line>
            <line x1="16" y1="18" x2="16" y2="21" stroke-dasharray="1 3" class="rain-drop"></line>
        </svg>
    `,
    thunder: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #a855f7;">
            <path d="M17 16a5 5 0 0 0-1-9.9 5 5 0 0 0-10 1A5 5 0 0 0 7 16h10z" fill="rgba(168, 85, 247, 0.1)"></path>
            <polyline points="13 16 11 19 14 19 12 23" stroke="#f59e0b" fill="#f59e0b" class="lightning-bolt"></polyline>
        </svg>
    `,
    fog: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #cbd5e1;">
            <line x1="4" y1="8" x2="20" y2="8" class="fog-line-1"></line>
            <line x1="6" y1="12" x2="18" y2="12" class="fog-line-2"></line>
            <line x1="4" y1="16" x2="20" y2="16" class="fog-line-3"></line>
            <line x1="8" y1="20" x2="16" y2="20" class="fog-line-4"></line>
        </svg>
    `,
    snow: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg" style="color: #e2e8f0;">
            <path d="M17 16a5 5 0 0 0-1-9.9 5 5 0 0 0-10 1A5 5 0 0 0 7 16h10z" fill="rgba(226, 232, 240, 0.1)"></path>
            <circle cx="8" cy="18" r="1" fill="currentColor" class="snow-flake-1"></circle>
            <circle cx="12" cy="19" r="1" fill="currentColor" class="snow-flake-2"></circle>
            <circle cx="16" cy="18" r="1" fill="currentColor" class="snow-flake-3"></circle>
        </svg>
    `
};

const WEATHER_DESC_NO = {
    sunny: "Klart og solfylt",
    partlycloudy: "Delvis skyet",
    cloudy: "Overskyet",
    rain: "Regn og byger",
    thunder: "Tordenvær",
    fog: "Tåke",
    snow: "Snø og sludd"
};

// --------------------------------------------------------------------------
// 3. Intelligent Vær-Simulator (Fallback-motor for July 2026)
// --------------------------------------------------------------------------
function generateSimulatedData(locationId) {
    const loc = LOCATIONS[locationId];
    
    // Sesongkorrigerte standardverdier for juli (sommer i Norge, monsun i Thailand)
    let baseTemp, tempVar, baseWind, windVar, baseHumid, weatherPool;

    if (locationId === "moss") {
        baseTemp = 19.5; // Typisk sommer i Moss
        tempVar = 3.5;
        baseWind = 3.2;
        windVar = 1.8;
        baseHumid = 68;
        weatherPool = ["sunny", "sunny", "partlycloudy", "partlycloudy", "cloudy", "rain"];
    } else if (locationId === "brekkstad") {
        baseTemp = 15.2; // Litt kjøligere og friskere på kysten av Trøndelag
        tempVar = 3.0;
        baseWind = 5.5; // Friskere bris
        windVar = 2.5;
        baseHumid = 76;
        weatherPool = ["partlycloudy", "partlycloudy", "cloudy", "cloudy", "rain", "fog"];
    } else if (locationId === "phuket") {
        baseTemp = 29.8; // Tropisk og varmt hele året
        tempVar = 1.5;
        baseWind = 4.0;
        windVar = 2.0;
        baseHumid = 82; // Svært høy luftfuktighet i monsun-juli
        weatherPool = ["rain", "rain", "thunder", "partlycloudy", "cloudy"];
    }

    // Lag unike men realistiske variasjoner per leverandør (så de ikke viser helt like tall)
    const seed = Math.random();
    const temp = parseFloat((baseTemp + (seed * 2 - 1) * tempVar).toFixed(1));
    const wind = parseFloat((baseWind + seed * windVar).toFixed(1));
    const moisture = Math.round(baseHumid + (seed * 2 - 1) * 10);
    const cond = weatherPool[Math.floor(seed * weatherPool.length)];
    
    // Olivia-faktor (UV) simulering basert på værforhold
    const uv = estimateUV(locationId, cond);

    return {
        temp: temp,
        condition: cond,
        wind: wind,
        moisture: moisture, // enten % fukt eller mm regn
        moistureUnit: "%",
        uv: uv,
        status: "simulated" // Markeres som simulert
    };
}

// Hjelpefunksjon for å estimere og finjustere Olivia-faktor (UV-indeks) basert på sted og skyforhold
function estimateUV(locationId, condition) {
    let baseUV = 1.0;
    
    if (locationId === "phuket") {
        // Tropisk (svært sterk sol ved ekvator)
        if (condition === "sunny") baseUV = 11.5;
        else if (condition === "partlycloudy") baseUV = 7.0;
        else if (condition === "cloudy") baseUV = 4.2;
        else baseUV = 1.8; // Regn / Torden
    } else if (locationId === "moss") {
        // Sør-Norge (moderat/sterk sommersol i juli)
        if (condition === "sunny") baseUV = 6.2;
        else if (condition === "partlycloudy") baseUV = 3.8;
        else if (condition === "cloudy") baseUV = 1.5;
        else baseUV = 0.8;
    } else if (locationId === "brekkstad") {
        // Trøndelag (noe lavere solhøyde, men fortsatt merkbar)
        if (condition === "sunny") baseUV = 4.8;
        else if (condition === "partlycloudy") baseUV = 2.8;
        else if (condition === "cloudy") baseUV = 1.2;
        else baseUV = 0.6;
    }
    
    // Legg til en liten tilfeldig variasjon på +/- 0.4 for å virke mer autentisk mellom leverandører
    const variance = (Math.random() * 0.8) - 0.4;
    return parseFloat(Math.max(0, baseUV + variance).toFixed(1));
}

// --------------------------------------------------------------------------
// 4. API-Integrasjon og Parsere
// --------------------------------------------------------------------------

// Fetch med Timeout-hjelper
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5500 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// --- LEVERANDØR 1: MET Norway ---
async function fetchMETNorway(location) {
    // API krever ikke nøkkel, men ber om User-Agent. Siden nettlesere kan blokkere det, fetcher vi rent.
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${location.lat.toFixed(4)}&lon=${location.lon.toFixed(4)}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) throw new Error(`MET Norway status: ${response.status}`);
    const data = await response.json();
    
    const instant = data.properties.timeseries[0].data.instant.details;
    const next1h = data.properties.timeseries[0].data.next_1_hours;
    
    // Kartlegg symbolkoder fra yr.no til våre standard-ikoner
    const symbolCode = next1h ? next1h.summary.symbol_code : "cloudy";
    let cond = "cloudy";
    if (symbolCode.includes("clear") || symbolCode.includes("fair")) cond = "sunny";
    else if (symbolCode.includes("partlycloudy")) cond = "partlycloudy";
    else if (symbolCode.includes("thunder")) cond = "thunder";
    else if (symbolCode.includes("rain") || symbolCode.includes("shower")) cond = "rain";
    else if (symbolCode.includes("snow") || symbolCode.includes("sleet")) cond = "snow";
    else if (symbolCode.includes("fog")) cond = "fog";

    // Estimer Olivia-faktor basert på reelle forhold siden yr.no compact ikke har uvIndex
    const uvVal = estimateUV(location.id, cond);

    return {
        temp: parseFloat(instant.air_temperature.toFixed(1)),
        condition: cond,
        wind: parseFloat(instant.wind_speed.toFixed(1)),
        moisture: Math.round(instant.relative_humidity),
        moistureUnit: "%",
        uv: uvVal,
        status: "live"
    };
}

// --- LEVERANDØR 2: Open-Meteo ---
async function fetchOpenMeteo(location) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat.toFixed(4)}&longitude=${location.lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,uv_index&wind_speed_unit=ms`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) throw new Error(`Open-Meteo status: ${response.status}`);
    const data = await response.json();
    
    const curr = data.current;
    const code = curr.weather_code;
    
    // WMO Weather interpretation codes (WMO)
    let cond = "cloudy";
    if (code === 0) cond = "sunny";
    else if ([1, 2, 3].includes(code)) cond = "partlycloudy";
    else if ([45, 48].includes(code)) cond = "fog";
    else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) cond = "rain";
    else if ([71, 73, 75, 77, 85, 86].includes(code)) cond = "snow";
    else if ([95, 96, 99].includes(code)) cond = "thunder";

    const uvVal = curr.uv_index !== undefined ? parseFloat(curr.uv_index.toFixed(1)) : estimateUV(location.id, cond);

    return {
        temp: parseFloat(curr.temperature_2m.toFixed(1)),
        condition: cond,
        wind: parseFloat(curr.wind_speed_10m.toFixed(1)),
        moisture: curr.precipitation, // Vises i millimeter nedbør
        moistureUnit: "mm",
        uv: uvVal,
        status: "live"
    };
}

// --- LEVERANDØR 3: wttr.in ---
async function fetchWttrIn(location) {
    // Vi bruker koordinater i forespørselen for å sikre nøyaktig svar, spesielt for Brekkstad
    const url = `https://wttr.in/${location.lat.toFixed(4)},${location.lon.toFixed(4)}?format=j1`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) throw new Error(`wttr.in status: ${response.status}`);
    const data = await response.json();
    
    const cond = data.current_condition[0];
    const code = parseInt(cond.weatherCode);
    
    // wttr.in weatherCode mapping
    let iconKey = "cloudy";
    if (code === 113) iconKey = "sunny";
    else if ([116, 119].includes(code)) iconKey = "partlycloudy";
    else if ([122, 143, 248, 260].includes(code)) iconKey = "fog";
    else if ([263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(code)) iconKey = "rain";
    else if ([386, 389, 392, 395].includes(code)) iconKey = "thunder";
    else if ([323, 326, 329, 332, 335, 338, 368, 371].includes(code)) iconKey = "snow";

    // wttr.in vindstyrke kommer i km/h, så vi regner om til m/s (deling på 3.6)
    const windKmph = parseFloat(cond.windspeedKmph);
    const windMs = parseFloat((windKmph / 3.6).toFixed(1));
    
    // Parse uvIndex fra wttr.in
    const uvVal = cond.uvIndex ? parseFloat(cond.uvIndex) : estimateUV(location.id, iconKey);

    return {
        temp: parseFloat(parseFloat(cond.temp_C).toFixed(1)),
        condition: iconKey,
        wind: windMs,
        moisture: parseFloat(cond.precipMM), // wttr.in nedbør i mm
        moistureUnit: "mm",
        uv: uvVal,
        status: "live"
    };
}

// --------------------------------------------------------------------------
// 5. Grensesnitt Oppdatering (DOM-manipulasjon)
// --------------------------------------------------------------------------

// Temperatur-konverterer (Celsius til Fahrenheit)
function formatTemp(celsiusValue) {
    if (AppState.unit === "F") {
        const f = (celsiusValue * 9/5) + 32;
        return `${Math.round(f)}°F`;
    }
    return `${celsiusValue}°C`;
}

// Hjelpefunksjon for å generere et vakkert UV-merke (Olivia-faktor)
function getUVBadgeHTML(uvValue) {
    if (uvValue === undefined || uvValue === null) return "--";
    
    let uvClass = "uv-low";
    let text = "Lav";
    
    if (uvValue >= 8) {
        uvClass = "uv-extreme";
        text = "Ekstrem";
    } else if (uvValue >= 6) {
        uvClass = "uv-high";
        text = "Høy";
    } else if (uvValue >= 3) {
        uvClass = "uv-moderate";
        text = "Moderat";
    }
    
    return `<span class="uv-badge ${uvClass}">${text} (${uvValue})</span>`;
}

// Oppdaterer en spesifikk rad i tabellen
function updateTableRow(locationId, providerId, data) {
    const rowId = `row-${locationId}-${providerId}`;
    const tr = document.getElementById(rowId);
    if (!tr) return;

    // 1. Temperatur-celle
    const tempCell = tr.querySelector(".table-temp");
    if (tempCell) {
        tempCell.textContent = formatTemp(data.temp);
    }

    // 2. Værforhold (Ikon og tekst)
    const iconWrapper = tr.querySelector(".table-icon-wrapper");
    if (iconWrapper) {
        iconWrapper.innerHTML = WEATHER_ICONS[data.condition] || WEATHER_ICONS.cloudy;
    }
    const condSpan = tr.querySelector(".table-condition span");
    if (condSpan) {
        condSpan.textContent = WEATHER_DESC_NO[data.condition] || "Overskyet";
    }

    // 3. Vindcelle
    const windCell = tr.querySelector(".table-wind");
    if (windCell) {
        windCell.textContent = `${data.wind} m/s`;
    }

    // 4. Nedbør / Fuktighet
    const precipCell = tr.querySelector(".table-precip");
    if (precipCell) {
        precipCell.textContent = `${data.moisture} ${data.moistureUnit}`;
    }
    
    // 5. Olivia-faktor (UV)
    const uvCell = tr.querySelector(".table-uv");
    if (uvCell) {
        uvCell.innerHTML = getUVBadgeHTML(data.uv);
    }

    // 6. Status-badge
    const statusCell = tr.querySelector(".status-indicator");
    if (statusCell) {
        statusCell.className = "status-indicator"; // Nullstill
        if (data.status === "live") {
            statusCell.classList.add("status-live");
            statusCell.textContent = "Live";
        } else if (data.status === "simulated") {
            statusCell.classList.add("status-simulated");
            statusCell.textContent = "Simulert";
        } else {
            statusCell.classList.add("status-cached");
            statusCell.textContent = "Cached";
        }
    }
}

// Beregn og vis den konsoliderte/gjennomsnittlige værstatistikk i Herofeltet
function updateHeroSummary(locationId) {
    const locData = AppState.weatherData[locationId];
    const validDataPoints = Object.values(locData).filter(d => d && d.temp !== undefined);
    
    if (validDataPoints.length === 0) return;

    // 1. Beregn gjennomsnittstemperatur
    const sumTemp = validDataPoints.reduce((acc, curr) => acc + curr.temp, 0);
    const avgTemp = parseFloat((sumTemp / validDataPoints.length).toFixed(1));

    // Vis gjennomsnittstemp
    const tempValEl = document.getElementById(`avg-temp-${locationId}`);
    if (tempValEl) {
        if (AppState.unit === "F") {
            const f = (avgTemp * 9/5) + 32;
            tempValEl.textContent = Math.round(f);
        } else {
            tempValEl.textContent = avgTemp.toFixed(1);
        }
    }

    // 2. Bestem dominerende værforhold (modus/flertall)
    const condCounts = {};
    validDataPoints.forEach(d => {
        condCounts[d.condition] = (condCounts[d.condition] || 0) + 1;
    });
    
    let dominantCond = "cloudy";
    let maxCount = 0;
    for (const [cond, count] of Object.entries(condCounts)) {
        if (count > maxCount) {
            maxCount = count;
            dominantCond = cond;
        }
    }

    // Oppdater hero-ikon og beskrivelse
    const iconContainer = document.getElementById(`avg-icon-${locationId}`);
    if (iconContainer) {
        iconContainer.innerHTML = WEATHER_ICONS[dominantCond];
    }

    const descEl = document.getElementById(`avg-desc-${locationId}`);
    if (descEl) {
        descEl.textContent = WEATHER_DESC_NO[dominantCond];
    }

    // 3. Beregn gjennomsnittlig Olivia-faktor (UV) og oppdater heromerket
    const validUvPoints = validDataPoints.filter(d => d.uv !== undefined && d.uv !== null);
    if (validUvPoints.length > 0) {
        const sumUv = validUvPoints.reduce((acc, curr) => acc + curr.uv, 0);
        const avgUv = parseFloat((sumUv / validUvPoints.length).toFixed(1));
        
        const badgeEl = document.getElementById(`olivia-badge-${locationId}`);
        if (badgeEl) {
            const dotEl = badgeEl.querySelector(".olivia-dot");
            const textEl = badgeEl.querySelector(".olivia-text");
            
            let uvColor = "#10b981"; // Lav
            let uvTip = "Lav, trygg";
            
            if (avgUv >= 8) {
                uvColor = "#ec4899"; // Ekstrem (pink)
                uvTip = "Ekstrem, søk skygge!";
            } else if (avgUv >= 6) {
                uvColor = "#f97316"; // Høy (orange)
                uvTip = "Høy, smør deg!";
            } else if (avgUv >= 3) {
                uvColor = "#f59e0b"; // Moderat (gul/oransje)
                uvTip = "Moderat, beskytt øynene";
            }
            
            if (dotEl) {
                dotEl.style.backgroundColor = uvColor;
                dotEl.style.boxShadow = `0 0 10px ${uvColor}`;
            }
            
            if (textEl) {
                textEl.textContent = `Olivia-faktor: ${avgUv.toFixed(1)} (${uvTip})`;
            }
        }
    }
}

// Oppdaterer lokaltidsstemplene for stedene
function updateClocks() {
    Object.keys(LOCATIONS).forEach(id => {
        const loc = LOCATIONS[id];
        const timeEl = document.getElementById(`time-${id}`);
        if (timeEl) {
            try {
                const localStr = new Date().toLocaleTimeString("no-NO", {
                    timeZone: loc.timezone,
                    hour: "2-digit",
                    minute: "2-digit"
                });
                timeEl.textContent = `Kl. ${localStr}`;
            } catch (e) {
                console.error("Feil ved klokkeoppdatering:", e);
            }
        }
    });
}

// --------------------------------------------------------------------------
// 6. Hovedkontroller: Hent Værdata
// --------------------------------------------------------------------------
async function refreshAllWeather() {
    if (AppState.isRefreshing) return;
    AppState.isRefreshing = true;

    const refreshBtn = document.getElementById("refresh-btn");
    const refreshIcon = refreshBtn ? refreshBtn.querySelector(".refresh-icon") : null;
    
    if (refreshBtn) refreshBtn.disabled = true;
    if (refreshIcon) refreshIcon.classList.add("refresh-spinning");

    // Sette alle statusbrikker til "Henter..." i tabellene
    Object.keys(LOCATIONS).forEach(locId => {
        ["met", "openmeteo", "wttr"].forEach(provId => {
            const tr = document.getElementById(`row-${locId}-${provId}`);
            if (tr) {
                const indicator = tr.querySelector(".status-indicator");
                if (indicator) {
                    indicator.className = "status-indicator status-loading";
                    indicator.textContent = "Henter";
                }
            }
        });
    });

    // Loop gjennom alle lokasjoner og hent parallelt
    const fetchPromises = Object.keys(LOCATIONS).map(async (locId) => {
        const loc = LOCATIONS[locId];

        // Definer forespørsler for de tre leverandørene
        const metPromise = fetchMETNorway(loc)
            .then(data => {
                AppState.weatherData[locId].met = data;
                updateTableRow(locId, "met", data);
            })
            .catch(err => {
                console.warn(`[MET Fallback] Feilet for ${loc.name}:`, err.message);
                const sim = generateSimulatedData(locId);
                AppState.weatherData[locId].met = sim;
                updateTableRow(locId, "met", sim);
            });

        const omPromise = fetchOpenMeteo(loc)
            .then(data => {
                AppState.weatherData[locId].openmeteo = data;
                updateTableRow(locId, "openmeteo", data);
            })
            .catch(err => {
                console.warn(`[Open-Meteo Fallback] Feilet for ${loc.name}:`, err.message);
                const sim = generateSimulatedData(locId);
                AppState.weatherData[locId].openmeteo = sim;
                updateTableRow(locId, "openmeteo", sim);
            });

        const wttrPromise = fetchWttrIn(loc)
            .then(data => {
                AppState.weatherData[locId].wttr = data;
                updateTableRow(locId, "wttr", data);
            })
            .catch(err => {
                console.warn(`[wttr.in Fallback] Feilet for ${loc.name}:`, err.message);
                const sim = generateSimulatedData(locId);
                AppState.weatherData[locId].wttr = sim;
                updateTableRow(locId, "wttr", sim);
            });

        // Vent til alle tre er utført (enten løst eller feilet/simulert)
        await Promise.allSettled([metPromise, omPromise, wttrPromise]);
        
        // Oppdater sammendrag i Herokortet
        updateHeroSummary(locId);
    });

    await Promise.allSettled(fetchPromises);

    // Ferdig med oppdatering
    AppState.isRefreshing = false;
    if (refreshBtn) refreshBtn.disabled = false;
    if (refreshIcon) refreshIcon.classList.remove("refresh-spinning");
}

// --------------------------------------------------------------------------
// 7. Event Listeners og Initialisering
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // --- KLOKKER ---
    updateClocks();
    setInterval(updateClocks, 15000); // Oppdater klokkene hvert 15. sekund

    // --- ENHETS-TOGGLE (°C / °F) ---
    const unitToggle = document.getElementById("unit-toggle");
    if (unitToggle) {
        unitToggle.addEventListener("click", () => {
            if (AppState.isRefreshing) return; // Unngå endring midt under innlasting
            
            const isCel = AppState.unit === "C";
            AppState.unit = isCel ? "F" : "C";

            if (AppState.unit === "F") {
                unitToggle.classList.add("fahrenheit");
                unitToggle.querySelector('[data-unit="C"]').classList.remove("active");
                unitToggle.querySelector('[data-unit="F"]').classList.add("active");
            } else {
                unitToggle.classList.remove("fahrenheit");
                unitToggle.querySelector('[data-unit="F"]').classList.remove("active");
                unitToggle.querySelector('[data-unit="C"]').classList.add("active");
            }

            // Oppdater alle temperaturskjermer umiddelbart uten å hente API på nytt
            Object.keys(LOCATIONS).forEach(locId => {
                // Oppdater radene
                ["met", "openmeteo", "wttr"].forEach(provId => {
                    const data = AppState.weatherData[locId][provId];
                    if (data && data.temp !== undefined) {
                        updateTableRow(locId, provId, data);
                    }
                });
                // Oppdater herotempen
                updateHeroSummary(locId);
            });
        });

        // Støtte for tastaturfokus og space/enter
        unitToggle.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                unitToggle.click();
            }
        });
    }

    // --- TEMA-TOGGLE (Lys / Mørk) ---
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.contains("dark-theme");
            if (isDark) {
                document.body.classList.remove("dark-theme");
                document.body.classList.add("light-theme");
                AppState.theme = "light";
            } else {
                document.body.classList.remove("light-theme");
                document.body.classList.add("dark-theme");
                AppState.theme = "dark";
            }
        });
    }

    // --- OPPATERING-KNAPP ---
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", refreshAllWeather);
    }

    // --- START APPLIKASJON ---
    refreshAllWeather();
});
