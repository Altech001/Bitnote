const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// Directory to store session data
const SESSION_DIR = path.join(__dirname, 'session');

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
}

async function connectToWhatsApp() {
    // Load authentication state from file system
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false, // We'll handle QR code manually
    });

    // Save credentials whenever they change
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Display QR code for scanning
        if (qr) {
            console.log('\n=== SCAN THIS QR CODE WITH WHATSAPP ===');
            qrcode.generate(qr, { small: true });
            console.log('========================================\n');
        }

        // Connection closed
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log('Connection closed. Reconnecting...');
                setTimeout(connectToWhatsApp, 1000);
            } else {
                console.log('Logged out. Please delete session folder and restart.');
                // Delete session folder to force new login
                fs.rmSync(SESSION_DIR, { recursive: true, force: true });
                process.exit(0);
            }
        }

        // Connection opened
        if (connection === 'open') {
            console.log('✅ Connected successfully!');
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        
        if (!message.key.fromMe && m.type === 'notify') {
            const senderId = message.key.remoteJid;
            const messageType = message.message?.conversation || 
                               message.message?.extendedTextMessage?.text || '';

            console.log(`📩 Message from ${senderId}: ${messageType}`);

            // Simple echo bot - responds to "ping" with "pong"
            if (messageType.toLowerCase() === 'ping') {
                await sock.sendMessage(senderId, { text: '🏓 Pong!' });
                console.log(`📤 Sent response to ${senderId}`);
            }

            // Auto-reply example
            if (messageType.toLowerCase().includes('hello')) {
                await sock.sendMessage(senderId, { text: 'Hello! I am a WhatsApp bot. Send "ping" to test me.' });
                console.log(`📤 Sent greeting to ${senderId}`);
            }
        }
    });

    return sock;
}

// Start the bot
console.log('🚀 Starting WhatsApp Bot...');
console.log('📁 Session will be saved in:', SESSION_DIR);
connectToWhatsApp().catch(console.error);
