// Dark mode manager — synced to cloud (user entity field `theme`)
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
  // Persist to cloud silently
  import('@/api/base44Client').then(({ base44 }) => {
    base44.auth.updateMe({ theme }).catch(() => {});
  });
}

export function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
  return current === 'dark' ? 'light' : 'dark';
}

// Apply on load — reads from cloud if available, falls back to localStorage
export async function initTheme() {
  // Apply cached value immediately (no flash)
  setThemeLocal(getTheme());
  // Then try to load from cloud
  try {
    const { base44 } = await import('@/api/base44Client');
    const user = await base44.auth.me();
    if (user?.theme && user.theme !== getTheme()) {
      localStorage.setItem(KEY, user.theme);
      setThemeLocal(user.theme);
    }
  } catch {}
}

function setThemeLocal(theme) {
  localStorage.setItem(KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}