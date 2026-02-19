# Deployment Notes

- For local dev, SSR fetches to /api/* work without a base URL.
- For some hosting setups, you can set:
  NEXT_PUBLIC_BASE_URL=https://your-domain.com
  so server components can fetch absolute URLs reliably.
- Alternatively, refactor results page to call Prisma directly instead of fetch().
