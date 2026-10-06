// ==========================================
// 1. 상태 관리 및 데이터 초기화
// ==========================================

let shortcuts = [];
let editingShortcutId = null;

function isSafeHttpUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(value.trim());
    return ['http:', 'https:'].includes(parsed.protocol.toLowerCase());
  } catch (e) {
    return false;
  }
}

function isSafeImageUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(value.trim());
    return ['http:', 'https:', 'data:', 'blob:'].includes(
      parsed.protocol.toLowerCase()
    );
  } catch (e) {
    return false;
  }
}

try {
  const storedShortcuts =
    JSON.parse(localStorage.getItem('my_shortcuts')) || [];

  shortcuts = Array.isArray(storedShortcuts)
    ? storedShortcuts.filter(shortcut => {
        return shortcut &&
          typeof shortcut === 'object' &&
          typeof shortcut.name === 'string' &&
          typeof shortcut.url === 'string' &&
          isSafeHttpUrl(shortcut.url);
      })
    : [];
} catch (e) {
  console.error('저장된 바로가기 데이터를 읽지 못했습니다.', e);
  localStorage.removeItem('my_shortcuts');
  shortcuts = [];
}