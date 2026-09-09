'use strict';

export const weatherIcons = {
    0: '01d',
    1: '02d', 2: '02d', 3: '04d',
    45: '50d', 48: '50d',
    51: '09d', 53: '09d', 55: '09d',
    56: '09d', 57: '09d',
    61: '10d', 63: '10d', 65: '10d',
    66: '10d', 67: '10d',
    71: '13d', 73: '13d', 75: '13d', 77: '13d',
    80: '09d', 81: '09d', 82: '09d',
    85: '13d', 86: '13d',
    95: '11d', 96: '11d', 99: '11d'
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
