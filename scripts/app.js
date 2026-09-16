'use strict';

import { fetchAirQuality, fetchWeather, reverseGeocode, searchCities } from './api.js';
import { aqiInfo, formatDate, formatDay, formatTime, kmh, weatherIcons, weatherText } from './module.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const els = {
    article: $('article.container'),
    searchView: $('[data-search-view]'),
    searchField: $('[data-search-field]'),
    searchResult: $('[data-search-result]'),
    loading: $('[data-loading]'),
    error: $('[data-error-content]'),
    errorMessage: $('[data-error-message]'),
    currentWeather: $('[data-current-weather]'),
    forecast: $('[data-5-day-forecast]'),
    highlights: $('[data-highlights]'),
    hourly: $('[data-hourly-forecast]'),
    locationButton: $('[data-current-location-btn]'),
    searchOpen: $('[data-search-open]'),
    searchClose: $('[data-search-close]')
};

let searchTimer;
let requestId = 0;
let searchRequestId = 0;

function setLoading(show) {
    els.loading.classList.toggle('active', show);
    els.loading.setAttribute('aria-hidden', String(!show));
}

function showError(message = 'We could not load weather data right now.') {
    els.errorMessage.textContent = message;
    els.error.classList.add('active');
    els.error.setAttribute('aria-hidden', 'false');
}

function hideError() {
    els.error.classList.remove('active');
    els.error.setAttribute('aria-hidden', 'true');
}

function toggleSearch(open) {
    els.searchView.classList.toggle('active', open);
    els.searchView.setAttribute('aria-hidden', String(!open));
    els.searchOpen.setAttribute('aria-expanded', String(open));
    if (open) {
        els.searchField.focus();
    } else {
        els.searchField.value = '';
        els.searchResult.innerHTML = '';
        els.searchResult.classList.remove('active');
    }
}

function icon(code) {
    const mapped = weatherIcons[code] || weatherIcons[0];
    return `images/weather_icons/${mapped}.png`;
}

function renderCurrent(data, location) {
    const c = data.current;
    const unit = data.current_units;
    const description = weatherText[c.weather_code] || 'Unknown conditions';
    els.currentWeather.innerHTML = `
        <div class="card card-lg current-weather-card">
            <div class="section-heading-row">
                <h2 class="title-2">Now</h2>
                <span class="status-pill">${c.is_day ? 'Daytime' : 'Night'}</span>
            </div>
            <div class="current-main">
                <div>
                    <p class="heading">${Math.round(c.temperature_2m)}<sup>${unit.temperature_2m}</sup></p>
                    <p class="body-3 condition">${description}</p>
                </div>
                <img src="${icon(c.weather_code)}" alt="${description}" width="88" height="88" class="weather-icon">
            </div>
            <ul class="meta-list">
                <li class="meta-item"><span class="m-icon">calendar_today</span><p class="title-3 meta-text">${formatDate(c.time, data.timezone)}</p></li>
                <li class="meta-item"><span class="m-icon">location_on</span><p class="title-3 meta-text">${escapeHtml(location.name || 'Current location')}${location.country ? `, ${escapeHtml(location.country)}` : ''}</p></li>
            </ul>
        </div>`;
}

function renderForecast(data) {
    const d = data.daily;
    const count = Math.min(5, d.time.length);
    els.forecast.innerHTML = `
        <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
        <div class="card card-lg forecast-card"><ul>
            ${Array.from({ length: count }, (_, i) => `
                <li class="card-item">
                    <div class="icon-wrapper"><img src="${icon(d.weather_code[i])}" width="42" height="42" class="weather-icon" alt="${weatherText[d.weather_code[i]] || 'Weather'}"><p class="title-2">${Math.round(d.temperature_2m_max[i])}°</p></div>
                    <p class="label-1">${formatDay(d.time[i], data.timezone)}</p>
                    <p class="temp-range">${Math.round(d.temperature_2m_min[i])}° / ${Math.round(d.temperature_2m_max[i])}°</p>
                </li>`).join('')}
        </ul></div>`;
}

function renderHighlights(weather, air) {
    const c = weather.current;
    const d = weather.daily;
    const aqi = air?.current?.us_aqi ?? null;
    const aqiData = aqiInfo(aqi ?? 0);
    const visibilityKm = Math.max(0, (Number(c.visibility) || 0) / 1000);

    els.highlights.innerHTML = `
        <div class="card card-lg">
            <div class="section-heading-row"><h2 class="title-2" id="highlights-label">Today's Highlights</h2><span class="updated">Live data</span></div>
            <div class="highlight-list">
                <div class="card card-sm highlight-card one">
                    <h3 class="title-3">Air Quality Index</h3>
                    <div class="wrapper"><span class="m-icon">air</span><ul class="card-list">
                        <li class="card-item"><p class="title-1">${aqi ?? '—'}</p><p class="label-1">US AQI</p></li>
                        <li class="card-item"><p class="title-1">${air?.current?.pm2_5 != null ? Math.round(air.current.pm2_5) : '—'}</p><p class="label-1">PM<sub>2.5</sub></p></li>
                        <li class="card-item"><p class="title-1">${air?.current?.pm10 != null ? Math.round(air.current.pm10) : '—'}</p><p class="label-1">PM<sub>10</sub></p></li>
                        <li class="card-item"><p class="title-1">${air?.current?.nitrogen_dioxide != null ? Math.round(air.current.nitrogen_dioxide) : '—'}</p><p class="label-1">NO₂</p></li>
                    </ul></div>
                    <span class="badge ${aqiData.className}" title="${aqiData.message}">${aqi != null ? aqiData.level : 'Unavailable'}</span>
                </div>
                <div class="card card-sm highlight-card two"><h3 class="title-3">Sunrise & Sunset</h3><div class="card-list">
                    <div class="card-item"><span class="m-icon">clear_day</span><div><p class="label-1">Sunrise</p><p class="title-1">${formatTime(d.sunrise[0], weather.timezone)}</p></div></div>
                    <div class="card-item"><span class="m-icon">clear_night</span><div><p class="label-1">Sunset</p><p class="title-1">${formatTime(d.sunset[0], weather.timezone)}</p></div></div>
                </div></div>
                ${[
                    ['Humidity', 'humidity_percentage', `${Math.round(c.relative_humidity_2m)}%`],
                    ['Pressure', 'airwave', `${Math.round(c.pressure_msl)} hPa`],
                    ['Visibility', 'visibility', visibilityKm ? `${visibilityKm.toFixed(1)} km` : '—'],
                    ['Feels Like', 'thermostat', `${Math.round(c.apparent_temperature)}°C`]
                ].map(([title, symbol, value]) => `<div class="card card-sm highlight-card"><h3 class="title-3">${title}</h3><div class="wrapper"><span class="m-icon">${symbol}</span><p class="title-1">${value}</p></div></div>`).join('')}
            </div>
        </div>`;
}

function renderHourly(data) {
    const h = data.hourly;
    const start = Math.max(0, h.time.findIndex((time) => time >= data.current.time));
    const times = h.time.slice(start, start + 12);
    const temps = h.temperature_2m.slice(start, start + 12);
    const codes = h.weather_code.slice(start, start + 12);
    const winds = h.wind_speed_10m.slice(start, start + 12);
    const directions = h.wind_direction_10m.slice(start, start + 12);
    const probs = h.precipitation_probability.slice(start, start + 12);

    const cards = times.map((time, i) => `
        <li class="slider-item"><div class="card card-sm slider-card">
            <p class="body-3">${formatTime(time, data.timezone)}</p>
            <img src="${icon(codes[i])}" alt="${weatherText[codes[i]] || 'Weather'}" width="48" height="48" class="weather-icon">
            <p class="body-3"><strong>${Math.round(temps[i])}°</strong></p>
            <p class="label-2">Rain ${probs[i] ?? 0}%</p>
        </div></li>`).join('');

    const windCards = times.map((time, i) => `
        <li class="slider-item"><div class="card card-sm slider-card wind-card">
            <p class="body-3">${formatTime(time, data.timezone)}</p>
            <img src="images/weather_icons/direction.png" alt="Wind direction ${Math.round(directions[i] || 0)} degrees" width="48" height="48" class="weather-icon" style="transform:rotate(${directions[i] || 0}deg)">
            <p class="body-3"><strong>${kmh(winds[i])}</strong></p>
        </div></li>`).join('');

    els.hourly.innerHTML = `
        <h2 class="title-2" id="hourly-forecast">Today at</h2>
        <div class="card card-lg hourly-card"><div class="slider-container"><ul class="slider-list">${cards}</ul><ul class="slider-list">${windCards}</ul></div></div>`;
}

function renderSearchResults(results) {
    const list = results.filter((item) => item.latitude != null && item.longitude != null);
    els.searchResult.classList.add('active');
    els.searchResult.innerHTML = list.length ? `<ul class="view-list">${list.map((item) => `
        <li class="view-item"><span class="m-icon">location_on</span><div><p class="item-title">${escapeHtml(item.name)}</p><p class="label-2 item-subtitle">${escapeHtml([item.admin1, item.country].filter(Boolean).join(', '))}</p></div><a href="#/weather?lat=${item.latitude}&lon=${item.longitude}&name=${encodeURIComponent(item.name)}&country=${encodeURIComponent(item.country || '')}" class="item-link" data-search-link aria-label="Show weather for ${escapeHtml(item.name)}"></a></li>`).join('')}</ul>` : '<div class="search-empty">No matching cities found.</div>';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

async function searchCity(value) {
    const currentSearch = ++searchRequestId;
    try {
        const data = await searchCities(value);
        if (currentSearch !== searchRequestId) return;
        renderSearchResults(data.results || []);
    } catch {
        if (currentSearch !== searchRequestId) return;
        els.searchResult.classList.add('active');
        els.searchResult.innerHTML = '<div class="search-empty">Search is temporarily unavailable.</div>';
    } finally {
        els.searchField.classList.remove('searching');
    }
}

async function loadWeather(lat, lon, location = {}) {
    const currentRequest = ++requestId;
    hideError();
    setLoading(true);
    try {
        const [weather, air] = await Promise.all([fetchWeather(lat, lon), fetchAirQuality(lat, lon).catch(() => null)]);
        if (currentRequest !== requestId) return;
        const resolved = location.name ? location : ((await reverseGeocode(lat, lon).catch(() => ({ results: [] }))).results?.[0] || {});
        renderCurrent(weather, { name: resolved.name || 'Current location', country: resolved.country || '' });
        renderForecast(weather);
        renderHighlights(weather, air);
        renderHourly(weather);
        els.article.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error(error);
        showError('Weather data could not be loaded. Check your internet connection and try again.');
    } finally {
        if (currentRequest === requestId) setLoading(false);
    }
}

function getLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser. Search for a city instead.');
        return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            window.location.hash = `#/weather?lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}`;
        },
        () => {
            setLoading(false);
            showError('Location access was unavailable. Search for your city instead.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
}

function route() {
    const hash = window.location.hash || '#/current-location';
    const [path, queryString = ''] = hash.slice(1).split('?');
    const params = new URLSearchParams(queryString);

    if (path === '/current-location') {
        getLocation();
        return;
    }
    if (path === '/weather') {
        const lat = Number(params.get('lat'));
        const lon = Number(params.get('lon'));
        if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            toggleSearch(false);
            loadWeather(lat, lon, { name: params.get('name'), country: params.get('country') });
            return;
        }
    }
    showError('That page could not be found.');
}

els.searchView.setAttribute('aria-hidden', 'true');
els.searchOpen.setAttribute('aria-expanded', 'false');

els.searchField.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const value = els.searchField.value.trim();
    if (!value) {
        els.searchResult.classList.remove('active');
        els.searchResult.innerHTML = '';
        els.searchField.classList.remove('searching');
        return;
    }
    els.searchField.classList.add('searching');
    searchTimer = setTimeout(() => searchCity(value), 350);
});

els.searchOpen.addEventListener('click', () => toggleSearch(true));
els.searchClose.addEventListener('click', () => toggleSearch(false));
els.locationButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (window.location.hash === '#/current-location') getLocation();
    else window.location.hash = '#/current-location';
});

const errorSearchButton = $('[data-search-open-error]');
errorSearchButton.addEventListener('click', () => {
    hideError();
    toggleSearch(true);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && els.searchView.classList.contains('active')) toggleSearch(false);
});

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
    if (!window.location.hash) window.location.hash = '#/current-location';
    else route();
});
