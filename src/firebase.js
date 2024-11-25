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

// App identifier constant
export const APP_ID = 'buk-wink-pol';

// Custom analytics event logger
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  // Add app identifier to every event
  const enrichedParams = {
    ...eventParams,
    app_id: APP_ID,
    app_version: '1.0.0', // You can update this as needed
    environment: process.env.NODE_ENV || 'development'
  };
  
  logEvent(analytics, eventName, enrichedParams);
};

export default analytics;
