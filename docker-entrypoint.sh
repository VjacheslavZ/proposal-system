#!/bin/sh
set -e

# Generate the Prisma client, apply migrations and seed (idempotent) on every start.
npm run setup

exec npm run dev -- --hostname 0.0.0.0
