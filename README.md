# Group Stay Planner

A modern web app to compare stay options discussed inside a WhatsApp group chat.

## Why PostgreSQL (instead of client-only storage)

For an eventual SaaS use case with multi-user groups, role-based access, chat re-imports, and hosted cloud deployment, a server database is the right foundation. This project uses **PostgreSQL + Prisma** to keep data normalized, updatable, and safe for growth.

## Features

- Public homepage listing all stays with easy image browsing.
- Group name and AI-friendly description at top.
- Admin panel with env-based login credentials.
- Add, edit, delete stay records.
- Bulk import from structured WhatsApp chat export snippets.
- Store: name, address, map link, rating, price, food inclusion, images, recommender, contact details, notes.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Start PostgreSQL locally (or point `DATABASE_URL` to hosted postgres).

4. Generate Prisma client and migrate:

```bash
npx prisma migrate dev --name init
```

5. Run app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Admin login is at `http://localhost:3000/admin/login`.

## WhatsApp import format

Paste blocks separated by `---` in admin panel import box:

```txt
Name: Green Valley Resort
Address: Lonavala
Google Map: https://maps.google.com/example
Rating: 4.5
Price: 5500
Food: Yes
Images: https://img1.jpg, https://img2.jpg
Recommended By: Rahul, Neha
Contact Name: Reception
Contact Phone: +91-9999999999
Notes: Good for families
---
Name: Hill Crest Villa
Address: Mahabaleshwar
...
```

## Future SaaS direction

- Group owner accounts with unique group links and IDs.
- Invite participants from chat-export names.
- First-login password reset flow for invited users.
- Better AI extraction and AI-generated descriptions.
- Fine-grained permissions and billing plans.
