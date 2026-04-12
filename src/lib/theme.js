// Simple dark mode manager — no external deps
const KEY = 'stensor_theme';

export function getTheme() {
  return localStorage.getItem(KEY) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
  return current === 'dark' ? 'light' : 'dark';
}

// Apply on load
export function initTheme() {
  setTheme(getTheme());
}