'use strict';

export const weatherIcons = {
    0: '0-clear-sky',
    1: '1-mainly-clear',
    2: '2-partly-cloudy',
    3: '3-overcast',
    45: '45-fog',
    48: '48-rime-fog',
    51: '51-light-drizzle',
    53: '53-moderate-drizzle',
    55: '55-dense-drizzle',
    56: '56-light-freezing-drizzle',
    57: '57-dense-freezing-drizzle',
    61: '61-slight-rain',
    63: '63-moderate-rain',
    65: '65-heavy-rain',
    66: '66-light-freezing-rain',
    67: '67-heavy-freezing-rain',
    71: '71-slight-snowfall',
    73: '73-moderate-snowfall',
    75: '75-heavy-snowfall',
    77: '77-snow-grains',
    80: '80-slight-rain-showers',
    81: '81-moderate-rain-showers',
    82: '82-violent-rain-showers',
    85: '85-slight-snow-showers',
    86: '86-heavy-snow-showers',
    95: '95-thunderstorm',
    96: '96-thunderstorm-light-hail',
    99: '99-thunderstorm-heavy-hail'
};

export const weatherText = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
};

export const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateString, timeZone) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'short', timeZone }).format(date);
}

export function formatDay(dateString, timeZone) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone }).format(new Date(dateString));
}

export function formatTime(dateString, timeZone) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone }).format(new Date(dateString));
}

export function kmh(value) {
    return `${Math.round(Number(value) || 0)} km/h`;
}

export function aqiInfo(aqi) {
    const value = Number(aqi);
    if (value <= 50) return { level: 'Good', className: 'aqi-1', message: 'Air quality is considered good.' };
    if (value <= 100) return { level: 'Moderate', className: 'aqi-2', message: 'Air quality is acceptable, but sensitive people may be affected.' };
    if (value <= 150) return { level: 'Unhealthy for sensitive groups', className: 'aqi-3', message: 'Sensitive groups may experience health effects.' };
    if (value <= 200) return { level: 'Unhealthy', className: 'aqi-4', message: 'Some people may experience health effects.' };
    if (value <= 300) return { level: 'Very unhealthy', className: 'aqi-5', message: 'Health alert: increased risk for everyone.' };
    return { level: 'Hazardous', className: 'aqi-5', message: 'Health warning of emergency conditions.' };
}
