/* ─────────────────────────────────────────────────────────────────────────
 *  TelegramReceiver.js
 *  Connects to the Node.js WebSocket server that bridges Telegram → board.
 *  Auto-reconnects with exponential back-off on disconnect.
 * ─────────────────────────────────────────────────────────────────────────*/
class TelegramReceiver {
  /**
   * @param {(text: string)  => void} onMessage      Called with each new message
   * @param {(status: string)=> void} onStatusChange Called with 'connected' | 'disconnected'
   */
  constructor(onMessage, onStatusChange) {
    this.onMessage      = onMessage;
    this.onStatusChange = onStatusChange;

    this._ws      = null;
    this._delay   = 1500;   // initial reconnect delay (ms)
    this._maxDelay= 30000;  // cap reconnect at 30s
    this._timer   = null;
    this._dead    = false;

    this._connect();
  }

  /** Permanently stop reconnecting. */
  destroy() {
    this._dead = true;
    clearTimeout(this._timer);
    if (this._ws) this._ws.close();
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _connect() {
    if (this._dead) return;

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url   = `${proto}//${location.host}`;

    this._ws = new WebSocket(url);

    this._ws.addEventListener('open', () => {
      this._delay = 1500; // reset back-off
      this.onStatusChange('connected');
    });

    this._ws.addEventListener('message', ({ data }) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'message' && typeof msg.text === 'string') {
          this.onMessage(msg.text);
        }
      } catch (e) {
        console.warn('[TelegramReceiver] parse error:', e);
      }
    });

    this._ws.addEventListener('close', () => {
      this.onStatusChange('disconnected');
      this._scheduleReconnect();
    });

    this._ws.addEventListener('error', () => {
      // 'close' fires right after 'error', so reconnect is handled there
    });
  }

  _scheduleReconnect() {
    if (this._dead) return;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._connect(), this._delay);
    this._delay = Math.min(this._delay * 1.5, this._maxDelay);
  }
}
