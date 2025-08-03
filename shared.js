// shared.js

const removed = new Set();
const popupKeywords = ['consent', 'cookie', 'privacy', 'policy', 'banner', 'overlay', 'modal', 'popup'];

function containsPopupKeywords(el) {
  if (!el) return false;
  const text = (el.textContent || '').toLowerCase();
  return popupKeywords.some(k => text.includes(k));
}

function likelyPopup(el) {
  if (!el || removed.has(el)) return false;
  if (el.tagName === 'BODY' || el.tagName === 'HTML') return false;
  if (!(el.offsetParent || el.getClientRects().length)) return false;

  const role = el.getAttribute('role')?.toLowerCase();
  const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
  if (role === 'dialog' || role === 'alertdialog') {
    if (containsPopupKeywords(el) || popupKeywords.some(k => ariaLabel.includes(k))) return true;
  }

  const classId = (el.className + ' ' + el.id).toLowerCase();
  if (popupKeywords.some(k => classId.includes(k))) return true;

  const style = window.getComputedStyle(el);
  if ((style.position === 'fixed' || style.position === 'absolute') &&
      parseInt(style.zIndex) > 1000 &&
      el.offsetWidth > window.innerWidth * 0.3 &&
      el.offsetHeight > window.innerHeight * 0.3) {
    return true;
  }

  return false;
}

export { likelyPopup, containsPopupKeywords, removed, popupKeywords };
