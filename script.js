// ==========================================
// 1. 상태 관리 및 데이터 초기화
// ==========================================

let shortcuts = [];
let editingShortcutId = null;

try {
  shortcuts = JSON.parse(localStorage.getItem('my_shortcuts')) || [];
} catch (e) {
  console.error('저장된 바로가기 데이터를 읽지 못했습니다.', e);
  localStorage.removeItem('my_shortcuts');
}

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

const siteNameInput = document.getElementById('site-name');
const siteUrlInput = document.getElementById('site-url');
const customIconUrlInput = document.getElementById('custom-icon-url');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

const modalTitle = document.getElementById('modal-title');

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

// ==========================================
// 5. 바로가기 저장 / 수정
// ==========================================

saveShortcutBtn.addEventListener('click', () => {

  const name = siteNameInput.value.trim();

  let url = siteUrlInput.value
    .trim()
    .replace(/\s+/g, '');

  const useCustomIcon = iconToggle.checked;
  const customIconUrl = customIconUrlInput.value.trim();

  if (!name || !url) {
    alert('사이트 이름과 주소를 모두 입력해주세요!');
    return;
  }

  // https://가 없으면 자동 추가
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // URL 검사
  try {
    new URL(url);
  } catch (e) {
    alert('올바른 사이트 주소를 입력해주세요!');
    return;
  }

  let finalIcon = '';

  // 커스텀 아이콘
  if (useCustomIcon && customIconUrl) {

    try {
      new URL(customIconUrl);

      finalIcon = customIconUrl;

    } catch (e) {
      alert('올바른 이미지 주소를 입력해주세요!');
      return;
    }

  } else {

    // 사이트 favicon 자동 가져오기
    try {

      const domain = new URL(url).hostname;

      finalIcon =
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    } catch (e) {

      console.error('URL을 확인할 수 없습니다.', e);

      finalIcon = '';
    }
  }

  // ========================================
  // 기존 바로가기 수정
  // ========================================

  if (editingShortcutId !== null) {

    const index =
      shortcuts.findIndex(
        s => s.id === editingShortcutId
      );

    if (index !== -1) {

      shortcuts[index].name = name;
      shortcuts[index].url = url;
      shortcuts[index].icon = finalIcon;
    }

  }

  // ========================================
  // 새로운 바로가기 추가
  // ========================================

  else {

    const newShortcut = {

      id: Date.now(),

      name: name,

      url: url,

      icon: finalIcon,

      clicks: 0,

      timestamp: Date.now()
    };

    shortcuts.push(newShortcut);
  }

  editingShortcutId = null;

  saveToStorage();

  renderShortcuts();

  closeModal();
});

// ==========================================
// 6. LocalStorage 저장
// ==========================================

function saveToStorage() {
  localStorage.setItem(
    'my_shortcuts',
    JSON.stringify(shortcuts)
  );
}

// ==========================================
// 7. 화면 렌더링
// ==========================================

function renderShortcuts() {

  const keyword =
    searchInput.value.toLowerCase();

  const sortType =
    sortSelect.value;

  // 검색
  let filtered =
    shortcuts.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.url.toLowerCase().includes(keyword)
    );

  // 정렬
  if (sortType === 'latest') {

    filtered.sort(
      (a, b) => b.timestamp - a.timestamp
    );

  } else if (sortType === 'name') {

    filtered.sort(
      (a, b) =>
        a.name.localeCompare(b.name)
    );

  } else if (sortType === 'clicks') {

    filtered.sort(
      (a, b) => b.clicks - a.clicks
    );
  }

  // 기존 화면 비우기
  shortcutGrid.innerHTML = '';

  const fragment =
    document.createDocumentFragment();

  // 카드 생성
  filtered.forEach(item => {

    const card =
      document.createElement('div');

    card.className =
      'shortcut-item-container';

    card.innerHTML = `
      <a
        href="${item.url}"
        target="_blank"
        rel="noopener noreferrer"
        class="shortcut-item"
      >
        <div
          class="icon-wrapper"
          style="pointer-events: none;"
        >
          <img
            alt=""
            style="pointer-events: none;"
          >
        </div>

        <span
          class="shortcut-name"
          style="pointer-events: none;"
        ></span>
      </a>

      <button
        class="shortcut-menu-btn"
        type="button"
        aria-label="바로가기 메뉴"
        aria-expanded="false"
      >
        ⋮
      </button>

      <div class="shortcut-menu">

        <button
          class="edit-shortcut-btn"
          type="button"
        >
          ✎ 편집
        </button>

        <button
          class="delete-shortcut-btn"
          type="button"
        >
          × 삭제
        </button>

      </div>
    `;

    // 요소 선택
    const shortcutLink =
      card.querySelector('.shortcut-item');

    const icon =
      card.querySelector('.icon-wrapper img');

    const shortcutName =
      card.querySelector('.shortcut-name');

    const menuButton =
      card.querySelector('.shortcut-menu-btn');

    const menu =
      card.querySelector('.shortcut-menu');

    const editButton =
      card.querySelector('.edit-shortcut-btn');

    const deleteButton =
      card.querySelector('.delete-shortcut-btn');

    // 데이터 적용
    shortcutLink.href =
      item.url;

    icon.src =
      item.icon;

    shortcutName.textContent =
      item.name;

    // 아이콘 로딩 실패 시 숨김
    icon.addEventListener('error', () => {
      icon.style.display = 'none';
    });

    // ========================================
    // ⋮ 메뉴 열기 / 닫기
    // ========================================

    menuButton.addEventListener('click', (e) => {

      e.preventDefault();
      e.stopPropagation();

      const isOpen =
        menu.style.display === 'flex';

      // 다른 메뉴 전부 닫기
      document
        .querySelectorAll('.shortcut-menu')
        .forEach(otherMenu => {
          otherMenu.style.display = 'none';
        });

      document
        .querySelectorAll('.shortcut-menu-btn')
        .forEach(otherButton => {
          otherButton.setAttribute(
            'aria-expanded',
            'false'
          );
        });

      // 현재 메뉴 열기
      if (!isOpen) {

        menu.style.display = 'flex';

        menuButton.setAttribute(
          'aria-expanded',
          'true'
        );
      }
    });

    // ========================================
    // 바로가기 클릭
    // ========================================

    shortcutLink.addEventListener('click', () => {

      const index =
        shortcuts.findIndex(
          s => s.id === item.id
        );

      if (index !== -1) {

        shortcuts[index].clicks += 1;

        saveToStorage();
      }

      // 자주 방문한 순으로 정렬 중이면
      // 클릭 후 순서를 갱신
      if (sortSelect.value === 'clicks') {

        setTimeout(
          renderShortcuts,
          500
        );
      }
    });

    // ========================================
    // 편집
    // ========================================

    editButton.addEventListener('click', (e) => {

      e.preventDefault();
      e.stopPropagation();

      // 메뉴 닫기
      menu.style.display = 'none';

      menuButton.setAttribute(
        'aria-expanded',
        'false'
      );

      // 수정 대상 설정
      editingShortcutId =
        item.id;

      modalTitle.textContent =
        '바로가기 수정';

      siteNameInput.value =
        item.name;

      siteUrlInput.value =
        item.url;

      // 커스텀 아이콘인지 확인
      const isCustomIcon =
        item.icon &&
        !item.icon.includes(
          'google.com/s2/favicons'
        );

      iconToggle.checked =
        isCustomIcon;

      if (isCustomIcon) {

        customIconGroup.classList.remove(
          'hidden'
        );

        customIconUrlInput.value =
          item.icon;

      } else {

        customIconGroup.classList.add(
          'hidden'
        );

        customIconUrlInput.value =
          '';
      }

      // 모달 열기
      addModal.classList.add(
        'active'
      );

      siteNameInput.focus();
    });

    // ========================================
    // 삭제
    // ========================================

    deleteButton.addEventListener(
      'click',
      (e) => {

        e.preventDefault();
        e.stopPropagation();

        if (
          confirm(
            `'${item.name}' 바로가기를 삭제하시겠습니까?`
          )
        ) {

          shortcuts =
            shortcuts.filter(
              s => s.id !== item.id
            );

          saveToStorage();

          renderShortcuts();
        }
      }
    );

    fragment.appendChild(card);
  });

  shortcutGrid.appendChild(fragment);
}

// ==========================================
// 8. 메뉴 바깥 클릭 시 닫기
// ==========================================

document.addEventListener('click', () => {

  document
    .querySelectorAll('.shortcut-menu')
    .forEach(menu => {
      menu.style.display = 'none';
    });

  document
    .querySelectorAll('.shortcut-menu-btn')
    .forEach(button => {
      button.setAttribute(
        'aria-expanded',
        'false'
      );
    });
});

// ==========================================
// 9. 검색 / 정렬 이벤트
// ==========================================

searchInput.addEventListener(
  'input',
  renderShortcuts
);

sortSelect.addEventListener(
  'change',
  renderShortcuts
);

// ==========================================
// 10. 초기 화면
// ==========================================

renderShortcuts();

// ==========================================
// 11. 튜토리얼
// ==========================================

const helpBtn =
  document.getElementById('help-btn');

const tutorialConfirmModal =
  document.getElementById(
    'tutorial-confirm-modal'
  );

const tutorialModal =
  document.getElementById(
    'tutorial-modal'
  );

const tutorialYesBtn =
  document.getElementById(
    'tutorial-yes-btn'
  );

const tutorialNoBtn =
  document.getElementById(
    'tutorial-no-btn'
  );

const tutorialCloseBtn =
  document.getElementById(
    'tutorial-close-btn'
  );

const tutorialCloseBottomBtn =
  document.getElementById(
    'tutorial-close-bottom-btn'
  );

// 도움말 버튼
helpBtn.addEventListener('click', () => {

  tutorialConfirmModal.classList.add(
    'active'
  );
});

// 튜토리얼 보기
tutorialYesBtn.addEventListener(
  'click',
  () => {

    tutorialConfirmModal.classList.remove(
      'active'
    );

    tutorialModal.classList.add(
      'active'
    );
  }
);

// 튜토리얼 안 보기
tutorialNoBtn.addEventListener(
  'click',
  () => {

    tutorialConfirmModal.classList.remove(
      'active'
    );
  }
);

// 튜토리얼 닫기
function closeTutorial() {

  tutorialModal.classList.remove(
    'active'
  );
}

tutorialCloseBtn.addEventListener(
  'click',
  closeTutorial
);

tutorialCloseBottomBtn.addEventListener(
  'click',
  closeTutorial
);

// 확인창 바깥 클릭
tutorialConfirmModal.addEventListener(
  'click',
  (e) => {

    if (
      e.target === tutorialConfirmModal
    ) {

      tutorialConfirmModal.classList.remove(
        'active'
      );
    }
  }
);

// 튜토리얼 바깥 클릭
tutorialModal.addEventListener(
  'click',
  (e) => {

    if (
      e.target === tutorialModal
    ) {

      tutorialModal.classList.remove(
        'active'
      );
    }
  }
);
