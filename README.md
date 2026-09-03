# Supreme Adventures — Full-Stack Tour Website

This project is an original safari/tour website implementation inspired by the structure and visual language of modern East African tour websites. It is not a copy of the reference site's source code, branding, or proprietary assets.

## Included

### Public website
- Responsive homepage
- Hero section
- Destination/trip search
- Tour cards
- Individual tour modal
- Itinerary display
- Booking/enquiry form
- Destination section
- Testimonials
- About/why-us section
- Contact/footer

### Admin dashboard
Open `/admin.html`.

Default development admin key:

`admin123`

Admin features:
- Dashboard statistics
- Add tours
- Edit tours
- Delete tours
- View bookings
- View enquiries

### Backend
- Node.js + Express
- REST API
- JSON file persistence
- No external database required to run locally

Data is stored in `data/db.json`.

## Run locally

1. Install Node.js.
2. Open a terminal in this project folder.
3. Run:

```bash
npm install
npm start
```

4. Open:

`http://localhost:3000`

Admin:

`http://localhost:3000/admin.html`

## Change admin password

Set an environment variable before starting the server.

Windows PowerShell:

```powershell
$env:ADMIN_KEY="your-secure-password"
npm start
```

Linux/macOS:

```bash
ADMIN_KEY="your-secure-password" npm start
```

## Production upgrades recommended

Before public deployment:
- Replace JSON storage with Supabase/PostgreSQL.
- Add proper hashed admin/user authentication.
- Add CSRF/rate-limit/security middleware.
- Store images in Supabase Storage or another image CDN.
- Add payment integration if online payments are required.
- Add email notifications for booking enquiries.
- Move secrets to environment variables.
- Add SEO metadata and sitemap.
# Supreme-adventures-
