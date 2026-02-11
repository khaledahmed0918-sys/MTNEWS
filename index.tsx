
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress Console Logs
if (process.env.NODE_ENV === 'production' || true) { // Enforced as per request
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
