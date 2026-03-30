/* ─────────────────────────────────────────────────────────────────────────
 *  constants.js — edit here to customise the board
 * ─────────────────────────────────────────────────────────────────────────*/
window.CONSTANTS = {
  // ── Grid ────────────────────────────────────────────────────────────────
  GRID_COLS: 26,   // characters per row
  GRID_ROWS: 4,    // number of rows

  // ── Character set (must include space) ──────────────────────────────────
  CHARS: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?@#$%&*()+-=/:;\'\"',

  // ── Scramble animation ───────────────────────────────────────────────────
  SCRAMBLE_STEPS:    8,    // random chars before settling
  SCRAMBLE_INTERVAL: 45,   // ms between each random char
  STAGGER_DELAY:     8,    // ms between each tile starting to animate

  // ── Flash colors during scramble ─────────────────────────────────────────
  SCRAMBLE_COLORS: [
    '#7c1010', '#6d1f6d', '#0f3d6d', '#0d5c3a',
    '#7a4500', '#2a2a8a', '#5a0000', '#004444',
  ],

  // ── Default message on load (before first Telegram message) ─────────────
  DEFAULT_MESSAGE: 'WELCOME TO FLIPBOARD\nSEND A TELEGRAM MESSAGE',
};
