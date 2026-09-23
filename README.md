# Tile Co. Bill Uploader — Frontend

This is just the React frontend. It expects a backend API running with two endpoints:

- `POST /bills` — multipart form with fields `employee_name`, `bill_amount` (optional), `photo` (file). Should save the photo and a database row, and return the created bill as JSON.
- `GET /bills` — returns a JSON array of bills, each with at least: `id`, `employee_name`, `bill_amount`, `photo_url`, `created_at`.

This matches a FastAPI + PostgreSQL backend (built separately). See `src/api.js` for the exact request shapes.

## Run it

```bash
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:8000

npm install
npm run dev
```

Open the printed local URL in your browser. To test the camera on your phone, use the "Network" URL Vite prints (both devices need to be on the same wifi).

## Pages

- `/` — Upload page: take a photo with the camera, enter your name and (optionally) the bill amount, upload.
- `/dashboard` — Live-searchable list of all uploaded bills.

## Note

Right now this will show a "Couldn't reach the backend" message on the dashboard and fail on upload, until the backend is running. That's expected — build/run the backend next and point `VITE_API_URL` at it.
