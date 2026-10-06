// ==========================================
// 2. DOM 요소 선택
// ==========================================

const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('add-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveShortcutBtn = document.getElementById('save-shortcut-btn');

const iconToggle = document.getElementById('icon-toggle');
const customIconGroup = document.getElementById('custom-icon-group');
const shortcutGrid = document.getElementById('shortcut-grid');
const emptyState = document.getElementById('empty-state');

const siteNameInput = document.getElementById('site-name');
const siteUrlInput = document.getElementById('site-url');
const customIconUrlInput =
  document.getElementById('custom-icon-url');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

const modalTitle = document.getElementById('modal-title');

// 오류 알림 모달
const alertModal =
  document.getElementById('alert-modal');

const alertTitle =
  document.getElementById('alert-title');

const alertMessage =
  document.getElementById('alert-message');

const alertConfirmBtn =
  document.getElementById('alert-confirm-btn');


// ==========================================
// 3. 모달 제어
// ==========================================

// 새 바로가기 추가
addBtn.addEventListener('click', () => {
  editingShortcutId = null;

  modalTitle.textContent = '새 바로가기 추가';

  addModal.classList.add('active');

  siteNameInput.focus();
});


// 모달 닫기
function closeModal() {
  addModal.classList.remove('active');

  siteNameInput.value = '';
  siteUrlInput.value = '';
  customIconUrlInput.value = '';

  iconToggle.checked = false;
  customIconGroup.classList.add('hidden');

  editingShortcutId = null;
}

closeModalBtn.addEventListener('click', closeModal);


// 모달 바깥 클릭 시 닫기
addModal.addEventListener('click', (e) => {
  if (e.target === addModal) {
    closeModal();
  }
});


// ==========================================
// 오류 알림 모달
// ==========================================

function showAlert(message, title = '입력 오류') {
  alertTitle.textContent = title;
  alertMessage.textContent = message;

  alertModal.classList.add('active');

  alertConfirmBtn.focus();
}

function closeAlert() {
  alertModal.classList.remove('active');
}

alertConfirmBtn.addEventListener('click', closeAlert);

alertModal.addEventListener('click', (e) => {
  if (e.target === alertModal) {
    closeAlert();
  }
});


// ==========================================
// 4. 커스텀 아이콘 토글
// ==========================================

iconToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    customIconGroup.classList.remove('hidden');
  } else {
    customIconGroup.classList.add('hidden');
    customIconUrlInput.value = '';
  }
});