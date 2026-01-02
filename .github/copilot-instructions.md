# React + Vite + Node.js + MariaDB Todo App

Full-stack todo application with Docker support for development and production environments.

## Project Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MariaDB
- Containerization: Docker & Docker Compose

## Architecture

- `/frontend` - React + Vite application
- `/backend` - Node.js Express API
- Docker configurations for dev and prod environments

## Tailwind / Copilot guidance

When editing frontend code, read `frontend/src/index.css` for CSS custom properties named like:

- `--color-<name>: <value>;`

Treat each `<name>` as a Tailwind v4 color token. Examples:

- `--color-primary: #808080;` → use `bg-primary`, `text-primary`, `border-primary` in JSX `className`.

This workspace contains `frontend/tailwind.config.cjs` which maps `--color-<name>` to `var(--color-<name>)` entries in Tailwind's `theme.colors`. If you suggest new color-based classes, prefer the `bg-<name>`, `text-<name>`, and `border-<name>` patterns.
