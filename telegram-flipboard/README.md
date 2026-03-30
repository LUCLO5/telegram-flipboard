# 📺 Telegram FlipBoard

A retro split-flap display you control with a Telegram bot.  
Send a message → it flips onto the board in real time on any browser or TV.

Inspired by [flipoff](https://github.com/magnum6actual/flipoff).

---

## How It Works

```
Telegram ──► Bot (Node.js) ──► WebSocket ──► Browser Display
```

1. You send a message to your Telegram bot
2. The Node.js server receives it and broadcasts via WebSocket
3. Every connected browser plays the split-flap animation

Multiple displays (TVs, monitors, phones) can connect simultaneously — they all update together.

---

## Quick Start

### 1. Create a Telegram bot

1. Open Telegram, search **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the bot token it gives you

### 2. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/telegram-flipboard.git
cd telegram-flipboard
npm install
```

### 3. Configure

```bash
cp .env.example .env
# Open .env and paste your bot token
```

### 4. Run

```bash
npm start
```

Open **http://localhost:3000** in your browser (or on a TV on the same network).  
Open Telegram, find your bot, and send any message.

---

## Bot Commands

| Command   | Action                              |
|-----------|-------------------------------------|
| `/start`  | Welcome message                     |
| `/status` | Show current message + display count|
| `/clear`  | Blank the board                     |
| `/help`   | List commands                       |
| _any text_| Display it on the board             |

**Multi-line messages:** Use newlines in Telegram (shift+enter on desktop) to fill multiple rows on the board.

---

## Customisation

Edit **`public/js/constants.js`**:

```js
GRID_COLS: 26,        // characters per row
GRID_ROWS: 4,         // number of rows
SCRAMBLE_STEPS: 8,    // random chars before settling
SCRAMBLE_INTERVAL: 45 // ms between random chars
```

Change colours, timing, or the default message — all in one file.

---

## File Structure

```
telegram-flipboard/
├── server.js                 — Express + Telegram bot + WebSocket server
├── package.json
├── .env.example              — copy → .env, add your token
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── reset.css
│   │   ├── layout.css        — page skeleton (header, board area, footer)
│   │   ├── board.css         — grid container + accent bars
│   │   ├── tile.css          — flip tile styling + animations
│   │   └── responsive.css    — mobile → 4K scaling
│   └── js/
│       ├── constants.js      — all config in one place
│       ├── SoundEngine.js    — Web Audio API mechanical click
│       ├── Tile.js           — single tile: scramble + flip animation
│       ├── Board.js          — grid manager, word-wrap, layout
│       ├── TelegramReceiver.js — WebSocket client w/ auto-reconnect
│       ├── KeyboardController.js — F = fullscreen, M = mute
│       └── main.js           — entry point
```

---

## Running on a TV / LAN

1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Open `http://YOUR_IP:3000` on the TV browser
3. Press **F** for fullscreen

The display auto-reconnects if the server restarts — no manual refresh needed.

---

## Deploy to a Server (optional)

To control the board from anywhere (not just your LAN):

```bash
# On a VPS (e.g. DigitalOcean, Railway, Render)
git clone https://github.com/YOUR_USERNAME/telegram-flipboard.git
cd telegram-flipboard
npm install
TELEGRAM_BOT_TOKEN=your_token PORT=3000 npm start
```

Point your TV browser at the server's public IP/domain.

---

## Keyboard Shortcuts

| Key      | Action            |
|----------|-------------------|
| `F`      | Toggle fullscreen |
| `M`      | Toggle mute       |
| `Escape` | Exit fullscreen   |

---

## License

MIT — do whatever you want with it.
