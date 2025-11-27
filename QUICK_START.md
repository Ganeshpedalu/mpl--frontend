# Quick Start Guide

## Current Setup
- **Backend**: Deployed at `https://mpl-xlcm.onrender.com`
- **Frontend**: Running locally

## Default Behavior
The app **automatically uses the production API URL** (`https://mpl-xlcm.onrender.com`) by default, even when running locally.

## Running the App

### Option 1: Use Production API (Default - Recommended)
Just run:
```bash
npm run dev
```
The app will automatically connect to `https://mpl-xlcm.onrender.com`

### Option 2: Use Localhost API (If you have backend running locally)
Create a `.env` file in the root directory:
```
VITE_USE_LOCALHOST=true
```
Then restart:
```bash
npm run dev
```

### Option 3: Custom API URL
Create a `.env` file:
```
VITE_API_URL=https://your-custom-api-url.com
```

## Verify Which API is Being Used

When you run `npm run dev`, check the browser console. You'll see:
```
🔧 API Configuration: {
  baseUrl: "https://mpl-xlcm.onrender.com",
  environment: "Production (Live)",
  endpoints: {...}
}
```

## Troubleshooting

### If API calls are failing:
1. Check the browser console for the API configuration
2. Verify the backend is accessible at `https://mpl-xlcm.onrender.com`
3. Check Network tab in DevTools to see the actual API requests

### If you want to switch to localhost:
1. Create `.env` file with: `VITE_USE_LOCALHOST=true`
2. Restart the dev server
3. Make sure your local backend is running on port 4000

