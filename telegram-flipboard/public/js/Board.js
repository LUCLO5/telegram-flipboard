/* ─────────────────────────────────────────────────────────────────────────
 *  Board.js
 *  Creates and manages the full grid of Tile instances.
 *  Handles text layout: word-wrap into rows, center each row.
 * ─────────────────────────────────────────────────────────────────────────*/
class Board {
  /**
   * @param {HTMLElement} containerEl  The #board grid element
   */
  constructor(containerEl) {
    this.el   = containerEl;
    this.cols = CONSTANTS.GRID_COLS;
    this.rows = CONSTANTS.GRID_ROWS;
    this.tiles = [];
    this._build();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Display a message on the board.
   * @param {string}  text     Raw message string (may include \n for explicit row breaks)
   * @param {boolean} animate  Whether to run scramble animations
   */
  showMessage(text, animate = true) {
    const chars = this._layout(text);        // flat array, length = rows × cols
    let   anyChanged = false;

    chars.forEach((char, i) => {
      if (i >= this.tiles.length) return;
      const tile = this.tiles[i];

      if (char !== tile.current) {
        anyChanged = true;
        if (animate) {
          tile.animateTo(char, i * CONSTANTS.STAGGER_DELAY);
        } else {
          tile.setImmediate(char);
        }
      }
    });

    if (animate && anyChanged && window.soundEngine) {
      window.soundEngine.play();
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  /** Build tile DOM elements and Tile instances. */
  _build() {
    this.el.style.gridTemplateColumns = `repeat(${this.cols}, var(--tile-w, 36px))`;

    for (let i = 0; i < this.rows * this.cols; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'tile';

      const top = document.createElement('span');
      top.className = 'tile-top';
      top.textContent = '\u00A0';

      const bot = document.createElement('span');
      bot.className = 'tile-bottom';
      bot.textContent = '\u00A0';

      wrap.appendChild(top);
      wrap.appendChild(bot);
      this.el.appendChild(wrap);
      this.tiles.push(new Tile(wrap));
    }
  }

  /**
   * Convert a message string into a flat char array of size rows × cols,
   * word-wrapped and centered per row.
   */
  _layout(text) {
    // Support explicit newlines from Telegram multi-line messages
    const inputLines = text.split(/\n/).map(l => l.trim()).filter((_, i) => i < this.rows);

    // Word-wrap each input line if it's longer than cols
    const allRows = [];
    for (const line of inputLines) {
      const wrapped = this._wordWrap(line);
      for (const row of wrapped) {
        if (allRows.length < this.rows) allRows.push(row);
      }
    }

    // Pad to exactly this.rows
    while (allRows.length < this.rows) allRows.push('');

    // Build flat char array, centering each row
    const flat = [];
    for (let r = 0; r < this.rows; r++) {
      const row  = allRows[r] || '';
      const pad  = Math.floor((this.cols - row.length) / 2);
      for (let c = 0; c < this.cols; c++) {
        const idx = c - pad;
        flat.push(idx >= 0 && idx < row.length ? row[idx] : ' ');
      }
    }
    return flat;
  }

  /** Word-wrap a single string into an array of rows ≤ this.cols chars. */
  _wordWrap(str) {
    if (str.length <= this.cols) return [str];

    const words = str.split(' ');
    const rows  = [];
    let   cur   = '';

    for (const word of words) {
      const candidate = cur ? cur + ' ' + word : word;
      if (candidate.length <= this.cols) {
        cur = candidate;
      } else {
        if (cur) rows.push(cur);
        // Hard-truncate words longer than a full row
        cur = word.length > this.cols ? word.slice(0, this.cols) : word;
      }
    }
    if (cur) rows.push(cur);
    return rows;
  }
}
