# TLRP Discord Bot Dashboard

A free, static web dashboard for managing the TLRP Discord bot. This dashboard allows server administrators to create and manage embeds and reaction roles without using Discord commands.

## Features

- **Server Overview**: View all servers where the bot is present
- **Embed Builder**: Create and send customized embeds to any channel
- **Reaction Roles**: Set up role assignment menus with buttons or reactions
- **Authentication**: Secure API key authentication

## Setup Guide

### Hosting on GitHub Pages (100% Free)

1. Create a GitHub account if you don't have one at [github.com](https://github.com)
2. Create a new repository named `tlrp-dashboard` (or any name you prefer)
3. Upload all the files from this folder to your repository
4. Go to repository Settings > Pages
5. Set source to "main" branch and folder to "/ (root)"
6. Click Save and wait for GitHub to publish your site
7. Your dashboard will be available at `https://YOUR-GITHUB-USERNAME.github.io/tlrp-dashboard`

### Connecting to Your Bot

1. Open the `js/config.js` file in your repository
2. Change the `API_URL` value to your Replit URL
3. Make sure your bot is running the API server (included in the bot code)
4. Get the API key from your bot console when it starts up
5. Enter this API key when prompted on the dashboard

## File Structure

```
dashboard/
├── css/
│   └── style.css            # Dashboard styling
├── img/                     # Image assets (default images are created dynamically)
├── js/
│   ├── app.js               # Main application entry point
│   ├── auth.js              # Authentication handling
│   ├── config.js            # Configuration (API URL, etc.)
│   ├── embed-builder.js     # Embed builder functionality
│   ├── reaction-roles.js    # Reaction roles functionality
│   └── ui.js                # UI management
└── index.html               # Main HTML file
```

## Security

- The dashboard uses a token-based authentication system
- API requests are protected by a secret key
- All data is transmitted securely via HTTPS
- No database or server-side code is needed on the dashboard itself

## Troubleshooting

- If you can't connect to your bot, check that your Replit is running
- Make sure you've updated the API_URL in config.js to your actual Replit URL
- Check that you're using the correct API key from your bot console
- For issues with GitHub Pages, check GitHub's status and documentation

## Credits

- Created for TLRP (The Legend's Roleplay) Discord server
- Uses Bootstrap 5 for responsive design
- Discord.js for bot integration