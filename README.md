# React Router v7 with Better auth.

This template features React Router v7, enhanced authentication, Drizzle ORM, and D1, designed for deployment on Cloudflare Workers.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 [TailwindCSS](https://tailwindcss.com/) for styling
- 🔑 [Better Auth](https://better-auth.com/) for authentication
- 🌧️ [Drizzle ORM](https://orm.drizzle.team/) for database
- 🛢️ Cloudflare D1 for database
- 📁 Cloudflare KV for caching
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
git clone https://github.com/foxlau/react-router-v7-better-auth.git
npm install
```

### Development

Run an initial database migration:

```bash
npm run db:apply
```

If you modify the Drizzle ORM schema, please run `npm run db:generate` first. If you need to delete the generated SQL migrations, execute `npm run db:drop` and select the SQL migration you wish to remove.

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To deploy directly to production:

```sh
npm run db:apply-prod
npm run deploy
```

To deploy a preview URL:

```sh
npm run deploy:version
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npm run deploy:promote
```

## Questions

If you have any questions, please open an issue.
