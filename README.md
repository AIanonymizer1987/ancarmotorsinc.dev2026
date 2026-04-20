# ancarmotorsinc.dev2026
Major Overhaul for Ancar Motors Inc Website, a capstone project for 2025-2026

## Environment variables

The project uses Netlify environment variables for both frontend and serverless function configuration.

### Required variables

- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `NETLIFY_SECURE_JWT_SECRET`
- `NETLIFY_DATABASE_URL`
- `NETLIFY_DATABASE_URL_UNPOOLED`
- `NETLIFY_NEON_API_URL`
- `NETLIFY_NEON_API_KEY`
- `NETLIFY_NEON_AUTH_URL`

### Local development

Create a `.env` file in the project root and populate it with the same values used in Netlify.

Example:

```env
VITE_CLOUDINARY_CLOUD_NAME=dy3vb87qz
VITE_CLOUDINARY_UPLOAD_PRESET=upload_images
NETLIFY_SECURE_JWT_SECRET=MyneGCV+O8hzvWoznUTVqEhIT76t4RxsFZpu7iSHQl8=
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_WrKkpdj8Uns2@ep-calm-snow-a14go076-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_WrKkpdj8Uns2@ep-calm-snow-a14go076.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NETLIFY_NEON_API_URL=https://ep-calm-snow-a14go076.apirest.ap-southeast-1.aws.neon.tech/neondb/rest/v1
NETLIFY_NEON_API_KEY=napi_azd8gp2876mvcgecuwp24hhhmuciqtzy3od4ge1up5n4uu0556jd30zc4ilwu2fl
NETLIFY_NEON_AUTH_URL=https://ep-calm-snow-a14go076.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
```

### Notes

- `VITE_` variables are exposed to the frontend.
- `NETLIFY_*` variables are used by Netlify functions.
- Restart `netlify dev` after changing `.env`.
