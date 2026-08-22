# NexaCart

A premium full-stack e-commerce and circular resale marketplace built for the CodeAlpha Full Stack internship.

## Features

- Responsive React storefront with search, filters, cart and checkout
- Nexa ReLoved: condition-graded circular-resale collection
- JWT authentication, MongoDB users and protected order creation
- Auction-ready data model and admin analytics endpoint
- Installable PWA foundation for Android packaging

## Run locally

1. Install packages: `npm run install:all`
2. In one terminal, run `npm run dev`
3. In a second terminal, run `npm run server`

The frontend opens through Vite; the API runs at `http://localhost:5001`.

## Deployment

- Deploy `backend` as a Node web service on Render. Add `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` environment variables.
- Deploy `frontend` on Vercel with root directory `frontend`. Add `VITE_API_URL` with the Render backend URL.
- After Vercel provides its URL, update Render's `CLIENT_URL` to that URL and redeploy.
