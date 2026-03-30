/* ─────────────────────────────────────────────────────────────────────────
 *  Tile.js
 *  Manages one split-flap tile element.
 *  Renders a character as two halves (top / bottom) so the horizontal
 *  divider line in the CSS creates the authentic split-flap look.
 * ─────────────────────────────────────────────────────────────────────────*/
class Tile {
  /**
   * @param {HTMLElement} el  The .tile wrapper div
   */
  constructor(el) {
    this.el      = el;
    this.topEl   = el.querySelector('.tile-top');
    this.botEl   = el.querySelector('.tile-bottom');
    this.current = ' ';
    this._timer  = null;
  }

  /** Instantly set char with no animation (used on init). */
  setImmediate(char) {
    this.current = char;
    this._render(char);
  }

  /**
   * Animate from current char to `target`.
   * Only animates if the char is actually changing.
   * @param {string}  target  Single character
   * @param {number}  delay   ms to wait before starting
   */
  animateTo(target, delay = 0) {
    if (target === this.current) return;

    clearTimeout(this._startTimer);
    this._startTimer = setTimeout(() => this._scramble(target), delay);
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _render(char) {
    const display = char === ' ' ? '\u00A0' : char;
    this.topEl.textContent = display;
    this.botEl.textContent = display;
  }

  _scramble(target) {
    const { CHARS, SCRAMBLE_STEPS, SCRAMBLE_INTERVAL, SCRAMBLE_COLORS } = CONSTANTS;
    let step = 0;

    clearInterval(this._timer);

    this._timer = setInterval(() => {
      if (step >= SCRAMBLE_STEPS) {
        clearInterval(this._timer);
        this.current = target;
        this._render(target);
        this.el.classList.remove('scrambling', 'flipping');
        this.el.style.removeProperty('--flash-bg');
        return;
      }

      const rand  = CHARS[Math.floor(Math.random() * CHARS.length)];
      const color = SCRAMBLE_COLORS[Math.floor(Math.random() * SCRAMBLE_COLORS.length)];

      this.el.style.setProperty('--flash-bg', color);
      this.el.classList.add('scrambling');

      // Kick the flip CSS animation on every other step for the tactile feel
      if (step % 2 === 0) {
        this.el.classList.remove('flipping');
        void this.el.offsetWidth; // reflow to re-trigger animation
        this.el.classList.add('flipping');
      }

      this._render(rand);
      step++;
    }, SCRAMBLE_INTERVAL);
  }

  destroy() {
    clearInterval(this._timer);
    clearTimeout(this._startTimer);
  }
}
