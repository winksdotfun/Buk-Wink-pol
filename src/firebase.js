import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDyzIuow1wVwnysfY2WHGUeBhKBGDXVZuc",
  authDomain: "ultimate-analytics-9d0be.firebaseapp.com",
  projectId: "ultimate-analytics-9d0be",
  storageBucket: "ultimate-analytics-9d0be.firebasestorage.app",
  messagingSenderId: "108249184507",
  appId: "1:108249184507:web:d4653164cec30c6fecd85e",
  measurementId: "G-85NGN7TB3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// App identifier constants
export const APP_ID = 'buk-wink-pol';
export const APP_NAME = 'Buk Wink Pol';
export const APP_TYPE = 'web-app';

// Custom analytics event logger
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  // Add app identifier to every event
  const enrichedParams = {
    ...eventParams,
    app_id: APP_ID,
    app_name: APP_NAME,
    app_type: APP_TYPE,
    app_version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    platform: 'web'
  };
  
  // Prefix event name with app identifier for easier filtering
  const prefixedEventName = `${APP_ID}_${eventName}`;
  
  logEvent(analytics, prefixedEventName, enrichedParams);
};

export default analytics;
