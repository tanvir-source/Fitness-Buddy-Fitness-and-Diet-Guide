# Copilot / AI developer guidance for Fitness-Buddy

Purpose: quick, actionable guidance so an AI coding agent is immediately productive in this repository.

## Big picture
- Monorepo with 2 main apps:
  - Backend/ — Express + Mongoose REST API (CommonJS, `require`/`module.exports`). Entry: `Backend/index.js`.
  - frontend/ — React (Create React App) UI. Entry: `frontend/src/index.js` and `frontend/src/config.js` for API URL.
- Communication: frontend calls backend REST endpoints under `/api/*`. Many endpoints accept `?email=...` query params (see examples below).

## Key files & examples (start here)
- Backend routes & controllers: `Backend/routes/*.js` and `Backend/controllers/*.js` (pattern: route -> controller function -> model).
  - Example: `GET /api/water/total/:date?email=...` implemented in `Backend/controllers/waterController.js#getTotalByDate`.
  - Example: `GET /api/stats?email=...&range=daily` used by `frontend/src/components/Home.js`.
- Models: `Backend/models/*.js` — note convention: many models use `user_email` (not `email`) as the join key (Profile, Weight, Water).
  - Weight sorting expectation: `Weight.find(...).sort({ date: 1 })` (oldest -> newest) so front-end graphs draw left-to-right.
- Frontend API base: `frontend/src/config.js` (reads `REACT_APP_API_URL` or defaults to `http://localhost:5000`).
  - Example usage: `fetch(`${API_BASE_URL}/api/water/total/${today}?email=${user.email}`)` (see `Home.js`).

## Local dev & common commands
- Backend:
  - Install: `cd Backend && npm install`
  - Dev (auto-restart): `npm run dev` (needs `nodemon` globally or installed in your environment)
  - Start: `npm start`
  - Requires: environment variable `MONGO_URI` pointing at MongoDB. Optional `PORT` (defaults to 5000).
- Frontend:
  - Install: `cd frontend && npm install`
  - Dev: `npm start` (CRA dev server on :3000)
  - Build: `npm run build`
  - Set API URL: `REACT_APP_API_URL=http://localhost:5000` when needed.
- Running both: run backend and frontend in separate terminals (root package.json contains helper entries but are not standard; prefer running per-folder commands).

## Data conventions & patterns to follow
- Email-as-key: prefer `user_email` for controllers that support unauthenticated calls — many endpoints accept `?email=` to make features work without auth.
- Date format: use `YYYY-MM-DD` for `date` fields (Water, Weight) — aggregations and streak logic expect string dates in this format.
- Hydration logic: goal determined by `profile.goals.water` or fallback to `Math.round(latestWeight * 35)` (35 ml/kg). See `waterController.getGoalRecommendation`.
- Mongoose model guard: models export with `module.exports = mongoose.models.Name || mongoose.model('Name', schema)` to avoid OverwriteModelError in hot reload / tests — follow this pattern.

## API & integration gotchas
- Auth: `Backend/middleware/authMiddleware.js` is a no-op protector right now (it simply calls `next()`). Do not assume JWT/secure auth is enabled; if you implement auth, update routes and tests carefully.
- Duplicate/inline schemas: some routes may define inline schemas (see `Backend/routes/userRoutes.js`) while `Backend/models/User.js` also exists — be mindful of duplication when changing user behavior.
- Root `package.json` is nonstandard (contains some helper-like keys under dependencies). Prefer running scripts from `Backend/` and `frontend/`.

## Tests & quality
- Backend currently has no test suite (package.json `test` is a placeholder). Frontend uses CRA test scripts. If adding tests, target controller logic with unit tests and route-level integration tests (mock Mongoose or use an in-memory Mongo instance).

## How to add a new feature (recommended steps)
1. Add or extend a Mongoose model in `Backend/models` (use `user_email` when data must be accessible without auth).
2. Add controller function in `Backend/controllers`, keeping try/catch and JSON error responses consistent with existing controllers.
3. Register a route in `Backend/routes` and add it to `Backend/index.js`.
4. Call from frontend using `API_BASE_URL` (`frontend/src/config.js`) and pass `?email=` or authenticated user info as appropriate.

## When editing code, watch for
- Date string formats and sort order in weight/hydration (affects charts and streaks).
- OverwriteModelError — use existing model export pattern.
- Side effects in controllers (aggregation pipelines assume `user_email` and date shapes).

## TODOs for maintainers (notes an agent might create PRs for)
- Replace the auth no-op with a secure authentication flow (and migrate endpoints to use `req.user.id` where appropriate).
- Add backend unit and integration tests (controllers + routes).
- Normalize user schema usage (remove inline schema in routes to use `Backend/models/User.js`).

---
If anything here is unclear or you'd like additional examples (sample curl calls, or a short checklist for PRs), tell me what to expand and I will iterate. Thank you.