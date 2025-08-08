# Cloudflare Turnstile Captcha Configuration

This project uses Cloudflare Turnstile for bot protection on the login form.

## Setup

1. Create a Cloudflare account and navigate to [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Create a new site and get your Site Key
3. Create a `.env` file in the project root:
   ```
   VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key_here
   ```

## Testing

For development and testing, you can use these test keys:
- **Always passes**: `1x00000000000000000000AA`
- **Always fails**: `2x00000000000000000000AB`
- **Invisible mode**: `1x00000000000000000000BB`

## Production

Replace the test key with your actual production site key from Cloudflare Turnstile dashboard.

## Features

- Prevents form submission until captcha is completed
- Automatic captcha reset on login failures
- User-friendly error messages
- Responsive design that matches the existing UI