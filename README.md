# WhatsApp Bot with Baileys

A simple WhatsApp bot that maintains session persistence so you don't lose connection.

## Features

- ✅ **Session Persistence**: Saves authentication data to disk, so you won't lose connection on restart
- ✅ **Auto Reconnect**: Automatically reconnects if connection is lost (unless logged out)
- ✅ **QR Code Login**: Scan QR code with WhatsApp to connect
- ✅ **Simple Commands**: 
  - Send "ping" → Bot responds with "🏓 Pong!"
  - Send "hello" → Bot sends a greeting message

## Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Usage

### Start the Bot

```bash
npm start
```

Or directly:

```bash
node bot.js
```

### First Time Setup

1. Run the bot with `npm start`
2. A QR code will appear in the terminal
3. Open WhatsApp on your phone
4. Go to Settings → Linked Devices → Link a Device
5. Scan the QR code
6. Once connected, you'll see "✅ Connected successfully!"

### Session Management

- Session data is stored in the `session/` folder
- The bot will automatically use saved session on restart
- To logout completely, delete the `session/` folder and restart

## How It Works

1. **Authentication**: Uses `useMultiFileAuthState` to save credentials to disk
2. **Session Persistence**: Credentials are saved every time they update
3. **Auto Reconnect**: Detects disconnections and reconnects automatically (except when logged out)
4. **Message Handling**: Listens for incoming messages and responds based on content

## Customization

Edit the `bot.js` file to add your own commands:

```javascript
// Add your custom logic in the messages.upsert event
if (messageType.toLowerCase() === 'your-command') {
    await sock.sendMessage(senderId, { text: 'Your response' });
}
```

## Troubleshooting

- **QR code not appearing**: Make sure terminal supports it
- **Connection lost**: Check your internet connection
- **Logged out**: Delete the `session/` folder and scan QR again
- **Messages not sending**: Ensure you're connected and the recipient hasn't blocked you

## Dependencies

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) - Display QR codes in terminal
- [pino](https://getpino.io/) - Logging utility
