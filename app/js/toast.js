// A single confirmation/error message line near the bottom of the screen (import, export, refusals).
import { byId } from './dom.js';

let hideTimer = null;

export function showToast(message, tone = 'info') {
  const toast = byId('toast');
  toast.textContent = message;
  toast.className = `toast toast-${tone}`;
  toast.hidden = false;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { toast.hidden = true; }, tone === 'error' ? 9000 : 5000);
}
