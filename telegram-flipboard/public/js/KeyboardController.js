/* ─────────────────────────────────────────────────────────────────────────
 *  KeyboardController.js
 *  Keyboard shortcuts matching the original flipoff project.
 * ─────────────────────────────────────────────────────────────────────────*/
class KeyboardController {
  /**
   * @param {{ soundEngine: SoundEngine }} deps
   */
  constructor({ soundEngine }) {
    this.sound = soundEngine;
    this._handler = this._onKey.bind(this);
    document.addEventListener('keydown', this._handler);
  }

  destroy() {
    document.removeEventListener('keydown', this._handler);
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _onKey(e) {
    switch (e.key) {
      case 'f':
      case 'F':
        this._toggleFullscreen();
        break;

      case 'm':
      case 'M': {
        const muted = this.sound.toggleMute();
        console.info(`[Sound] ${muted ? 'Muted' : 'Unmuted'}`);
        break;
      }

      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen();
        break;
    }
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
}
