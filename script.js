// ==========================================
// 1. 상태 관리 및 데이터 초기화
// ==========================================
let shortcuts = [];

try {
  shortcuts = JSON.parse(localStorage.getItem('my_shortcuts')) || [];
} catch (e) {
  console.error('저장된 바로가기 데이터를 읽지 못했습니다.', e);
  localStorage.removeItem('my_shortcuts');
}

// DOM 요소 선택
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


// ==========================================
// 2. 모달 및 토글 제어 이벤트
// ==========================================

addBtn.addEventListener('click', () => {
  addModal.classList.add('active');
  siteNameInput.focus();
});

function closeModal() {
  addModal.classList.remove('active');

  siteNameInput.value = '';
  siteUrlInput.value = '';
  customIconUrlInput.value = '';

  iconToggle.checked = false;
  customIconGroup.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeModal);

addModal.addEventListener('click', (e) => {
  if (e.target === addModal) {
    closeModal();
  }
});

iconToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    customIconGroup.classList.remove('hidden');
  } else {
    customIconGroup.classList.add('hidden');
    customIconUrlInput.value = '';
  }
});


// ==========================================
// 3. 데이터 추가 및 저장 로직
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

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // URL 형식 확인
  try {
    new URL(url);
  } catch (e) {
    alert('올바른 사이트 주소를 입력해주세요!');
    return;
  }

  let finalIcon = '';

  if (useCustomIcon && customIconUrl) {
    try {
      new URL(customIconUrl);
      finalIcon = customIconUrl;
    } catch (e) {
      alert('올바른 이미지 주소를 입력해주세요!');
      return;
    }
  } else {
    try {
      const domain = new URL(url).hostname;

      finalIcon =
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      console.error('URL을 확인할 수 없습니다.', e);
      finalIcon = '';
    }
  }

  const newShortcut = {
    id: Date.now(),
    name: name,
    url: url,
    icon: finalIcon,
    clicks: 0,
    timestamp: Date.now()
  };

  shortcuts.push(newShortcut);

  saveToStorage();
  renderShortcuts();
  closeModal();
});


// ==========================================
// 4. LocalStorage 저장
// ==========================================

function saveToStorage() {
  localStorage.setItem(
    'my_shortcuts',
    JSON.stringify(shortcuts)
  );
}


// ==========================================
// 5. 화면 렌더링
// ==========================================

function renderShortcuts() {
  const keyword = searchInput.value.toLowerCase();
  const sortType = sortSelect.value;

  let filtered = shortcuts.filter(item =>
    item.name.toLowerCase().includes(keyword) ||
    item.url.toLowerCase().includes(keyword)
  );

  if (sortType === 'latest') {
    filtered.sort(
      (a, b) => b.timestamp - a.timestamp
    );
  } else if (sortType === 'name') {
    filtered.sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  } else if (sortType === 'clicks') {
    filtered.sort(
      (a, b) => b.clicks - a.clicks
    );
  }

  const fragment = document.createDocumentFragment();

  shortcutGrid.innerHTML = '';

  filtered.forEach(item => {
    const card = document.createElement('div');

    card.className = 'shortcut-item-container';

    card.style.position = 'relative';
    card.style.display = 'inline-block';

    // 기본 HTML 구조만 생성
    card.innerHTML = `
      <a
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
        class="delete-shortcut-btn"
        style="
          position: absolute;
          top: -5px;
          right: 5px;

          background: #ff4d4f;
          color: white;

          border: none;
          border-radius: 50%;

          width: 20px;
          height: 20px;

          font-size: 11px;
          cursor: pointer;

          display: none;

          align-items: center;
          justify-content: center;

          z-index: 10;
        "
      >
        X
      </button>
    `;

    const shortcutLink =
      card.querySelector('.shortcut-item');

    const icon =
      card.querySelector('.icon-wrapper img');

    const shortcutName =
      card.querySelector('.shortcut-name');

    // 사용자 입력값은 DOM 속성으로 직접 설정
    shortcutLink.href = item.url;
    icon.src = item.icon;
    shortcutName.textContent = item.name;

    // 아이콘 로딩 실패 시 숨김
    icon.addEventListener('error', () => {
      icon.style.display = 'none';
    });

    // 삭제 버튼 표시
    card.addEventListener('mouseenter', () => {
      card.querySelector(
        '.delete-shortcut-btn'
      ).style.display = 'flex';
    });

    card.addEventListener('mouseleave', () => {
      card.querySelector(
        '.delete-shortcut-btn'
      ).style.display = 'none';
    });

    // 바로가기 클릭
    shortcutLink.addEventListener('click', () => {
      const index = shortcuts.findIndex(
        s => s.id === item.id
      );

      if (index !== -1) {
        shortcuts[index].clicks += 1;
        saveToStorage();
      }

      if (sortSelect.value === 'clicks') {
        setTimeout(
          renderShortcuts,
          500
        );
      }
    });

    // 삭제 버튼
    card.querySelector('.delete-shortcut-btn')
      .addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (
          confirm(
            `'${item.name}' 바로가기를 삭제하시겠습니까?`
          )
        ) {
          shortcuts = shortcuts.filter(
            s => s.id !== item.id
          );

          saveToStorage();
          renderShortcuts();
        }
      });

    fragment.appendChild(card);
  });

  shortcutGrid.appendChild(fragment);
}


// ==========================================
// 6. 검색 / 정렬 이벤트
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
// 7. 초기 화면
// ==========================================

renderShortcuts();
