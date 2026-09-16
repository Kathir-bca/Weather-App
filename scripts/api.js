'use strict';

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

async function request(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
}

export const fetchWeather = (lat, lon) => request(`${WEATHER_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=6`);

export const fetchAirQuality = (lat, lon) => request(`${AIR_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide&timezone=auto`);

export const searchCities = (city) => request(`${GEOCODING_BASE}?name=${encodeURIComponent(city)}&count=8&language=en&format=json`);

export const reverseGeocode = (lat, lon) => request(`${GEOCODING_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&count=1&language=en&format=json`);
