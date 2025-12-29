# Setup SlackBot

## Create a New Slack App

- Go to [https://api.slack.com/apps](https://api.slack.com/apps)
- Click "Create New App"
- Choose "From scratch"
- Enter your app name (e.g., "Alfred Concierge")
- Select your workspace

## Get SLACK_SIGNING_SECRET

- In your app's settings, go to "Basic Information"
- Scroll to "App Credentials"
- Find "Signing Secret" and copy it

## Get SLACK_BOT_TOKEN

- Go to "OAuth & Permissions" in the sidebar
- Add these bot token scopes:
   - `chat:write`
   - `im:history`
   - `reactions:write`
   - `channels:history`
   - `groups:history`
   - `app_mentions:read`
- Click "Install App to Workspace"
- After installation, copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Get SLACK_APP_TOKEN

- Go to "Basic Information"
- Scroll to "App-Level Tokens"
- Click "Generate Token and Scopes"
- Name the token (e.g., "socket-token")
- Add the `connections:write` scope
- Click "Generate"
- Copy the token (starts with `xapp-`)

## Enable Socket Mode

- Go to "Socket Mode" in the sidebar
- Enable Socket Mode
- This requires the app token we just created

## Enable Event Subscriptions

- Go to "Event Subscriptions"
- Turn on "Enable Events"
- Subscribe to these bot events:
   - `message.channels`
   - `message.groups`
   - `message.im`

## Final Steps

- Update your `.env` file with the tokens:
   ```
   SLACK_APP_TOKEN=xapp-1-XXXXX...
   SLACK_BOT_TOKEN=xoxb-XXXXX...
   SLACK_SIGNING_SECRET=XXXXX...
   SLACK_CHANNEL_ID=XXXXX...
   ```
- Invite your bot to channel using `/invite @YourBotName`
