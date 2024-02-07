# Airwave
This project aims to provide a sync between a ![Directus](https://directus.io) managed database and ![Quickbooks Online](https://quickbooks.intuit.com/). Most offerings cost way too much or are severly bloated from terrible programming.

# Features
- Encryption of stored tokens
- OAuth2 handling
- Webhook endpoint with validation key
- Customer data sync

# Environment
```
# App
NITRO_APP_KEY="" # 32 character limit
NITRO_DEBUG=false
# Main Redirect
NITRO_MAIN_REDIRECT="" # Your main website
# OAuth
NITRO_CLIENT_ID="" # Intuit app id
NITRO_CLIENT_SECRET="" # Intuit app key
NITRO_REDIRECT_URI="" # Path to callback endpoint
NITRO_COMPANY_ID="" # Optional: Restricts application to one company
# Webhook
NITRO_VERIFY_TOKEN="" # Intuit provided webhook verification token
# Directus
NITRO_DIRECTUS_URL="" # URL of Directus instance
NITRO_DIRECTUS_TOKEN="" # API token for Directus instance
```
