require('dotenv').config();
const express = require('express');
const path    = require('path');
const http    = require('http');
const { WebSocketServer } = require('ws');
const TelegramBot = require('node-telegram-bot-api');

// ─── Validate env ────────────────────────────────────────────────────────────
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT  = process.env.PORT || 3000;

if (!TOKEN) {
  console.error('❌  TELEGRAM_BOT_TOKEN is not set. Copy .env.example → .env and add your token.');
  process.exit(1);
}

// ─── HTTP + static files ──────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, 'public')));

// ─── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Set();
let lastMessage = 'WELCOME TO FLIPBOARD';

wss.on('connection', (ws) => {
  clients.add(ws);
  // New display immediately gets the current message
  ws.send(JSON.stringify({ type: 'message', text: lastMessage }));

  ws.on('close', () => clients.delete(ws));
  ws.on('error', ()  => clients.delete(ws));
});

function broadcast(payload) {
  const json = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(json);
  }
}

// ─── Telegram bot ─────────────────────────────────────────────────────────────
const bot = new TelegramBot(TOKEN, { polling: true });

const HELP = `
📺 *FlipBoard Commands*

Just send any text and it'll appear on the board.

/status – current message + connected displays
/clear  – blank the board
/help   – this message

Newlines split into rows (max 4 rows).
Text is automatically uppercased.
`.trim();

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '👋 FlipBoard is connected\\! Send any text to display it\\.', {
    parse_mode: 'MarkdownV2'
  });
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, HELP, { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📺 *Current message:*\n\`${lastMessage}\`\n\n` +
    `👥 Connected displays: *${clients.size}*`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/clear/, (msg) => {
  lastMessage = ' ';
  broadcast({ type: 'message', text: lastMessage });
  bot.sendMessage(msg.chat.id, '🧹 Board cleared.');
  console.log('[Board] Cleared');
});

// Catch-all: any non-command text → display it
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const text = msg.text.toUpperCase().trim();
  if (!text) return;

  lastMessage = text;
  broadcast({ type: 'message', text });
  bot.sendMessage(msg.chat.id, `✅ Displayed: _${text}_`, { parse_mode: 'Markdown' });
  console.log(`[Telegram → Board] ${text.replace(/\n/g, ' | ')}`);
});

bot.on('polling_error', (err) => {
  console.error('[Telegram polling error]', err.code, err.message);
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀  FlipBoard running at http://localhost:${PORT}`);
  console.log(`📱  Telegram bot active — send messages to control the board`);
});
