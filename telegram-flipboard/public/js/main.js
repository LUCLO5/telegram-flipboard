/* ─────────────────────────────────────────────────────────────────────────
 *  main.js — entry point
 *  Instantiates all modules and wires them together.
 * ─────────────────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  // ── DOM refs ────────────────────────────────────────────────────────────
  const boardEl  = document.getElementById('board');
  const statusEl = document.getElementById('status');

  // ── Initialise modules ───────────────────────────────────────────────────
  window.soundEngine = new SoundEngine();
  const board        = new Board(boardEl);

  new KeyboardController({ soundEngine: window.soundEngine });

  // ── Show default message instantly (no animation) ─────────────────────
  board.showMessage(CONSTANTS.DEFAULT_MESSAGE, false);

  // ── Connect to Telegram WebSocket bridge ─────────────────────────────
  new TelegramReceiver(
    // onMessage: display it on the board
    (text) => {
      board.showMessage(text, true);
    },
    // onStatusChange: update header indicator
    (status) => {
      statusEl.textContent = status === 'connected' ? '● CONNECTED' : '● DISCONNECTED';
      statusEl.className   = `status ${status}`;
    }
  );
});
