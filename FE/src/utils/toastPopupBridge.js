import { toast } from 'sonner';

const INSTALL_FLAG = '__toastPopupBridgeInstalled__';

const toMessage = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    if (typeof value.message === 'string' && value.message.trim()) {
      return value.message.trim();
    }
    if (Array.isArray(value) && value.length > 0) {
      return toMessage(value[0], fallback);
    }
  }
  return fallback;
};

export const setupToastBrowserPopups = () => {
  if (typeof window === 'undefined') return;
  if (window[INSTALL_FLAG]) return;

  const originalError = toast.error?.bind(toast);
  const originalWarning = toast.warning?.bind(toast);

  if (!originalError && !originalWarning) {
    window[INSTALL_FLAG] = true;
    return;
  }

  let lastMessage = '';
  let lastAt = 0;

  const showPopup = (message) => {
    const now = Date.now();
    if (message === lastMessage && now - lastAt < 1200) {
      return;
    }
    lastMessage = message;
    lastAt = now;
    window.alert(message);
  };

  if (originalError) {
    toast.error = (message, ...rest) => {
      showPopup(toMessage(message, 'Co loi xay ra.'));
      return originalError(message, ...rest);
    };
  }

  if (originalWarning) {
    toast.warning = (message, ...rest) => {
      showPopup(toMessage(message, 'Canh bao.'));
      return originalWarning(message, ...rest);
    };
  }

  window[INSTALL_FLAG] = true;
};
