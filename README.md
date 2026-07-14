# React Admin Dashboard

## <a href="https://react-admin-dashboard-git-main-fdrive422s-projects.vercel.app">LIVE DEMO</a>

![Screen Shot 2023-06-16 at 17 50 10 PM](https://github.com/fdrive422/React-Admin-Dashboard/assets/72363705/981f78cf-885e-4ed1-a08d-8ee34a0e6c83)

## Backend & Database (Supabase)

The Express API (`server/`) reads its data from **Supabase Postgres**. The API is
read-only and returns the same JSON shape the React client expects.

### 1. Create a Supabase project

Create a free-tier project at [supabase.com](https://supabase.com). Then open
**Project Settings → API** and copy:

- **Project URL** → `SUPABASE_URL`
- **`service_role` secret key** → `SUPABASE_SERVICE_ROLE_KEY`
  (server-side only — it bypasses Row Level Security and must never reach the browser)

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_URL=http://localhost:3000   # optional
PORT=9000                          # optional
```

For deployment, add the same variables in **Vercel → Project → Settings →
Environment Variables**.

### 3. Create the schema

In the Supabase dashboard open **SQL Editor**, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the six
tables, indexes, and enables Row Level Security.

### 4. Import the demo data

From the project root:

```bash
npm install
node scripts/import-data.js
```

The script seeds the tables from `server/data/index.js` and prints the row count
per table. It is idempotent (upsert), so it is safe to re-run.

### 5. Run the API

```bash
npm start        # serves the API (and, in production, the built client)
```

Then start the React client separately (see below) and it will call the API.

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

<!-- ## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify) -->
