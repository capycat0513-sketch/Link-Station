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


  // 필수 입력 확인
  if (!name || !url) {
    alert('사이트 이름과 주소를 모두 입력해주세요!');
    return;
  }


  // http / https가 없으면 https 자동 추가
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


  // ========================================
  // 아이콘 결정
  // ========================================
  let finalIcon = '';


  // 커스텀 아이콘 사용
  if (useCustomIcon && customIconUrl) {

    try {
      new URL(customIconUrl);

      finalIcon = customIconUrl;

    } catch (e) {

      alert('올바른 이미지 주소를 입력해주세요!');
      return;
    }


  // 기본 파비콘 사용
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


  // ========================================
  // 수정 모드
  // ========================================
  if (editingShortcutId !== null) {

    const index = shortcuts.findIndex(
      s => s.id === editingShortcutId
    );


    if (index !== -1) {

      shortcuts[index].name = name;
      shortcuts[index].url = url;
      shortcuts[index].icon = finalIcon;

    }


  // ========================================
  // 추가 모드
  // ========================================
  } else {

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


  // 수정 모드 종료
  editingShortcutId = null;


  // 저장 및 화면 갱신
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
  let filtered = shortcuts.filter(item =>

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
      (a, b) => a.name.localeCompare(b.name)
    );

  } else if (sortType === 'clicks') {

    filtered.sort(
      (a, b) => b.clicks - a.clicks
    );

  }


  const fragment =
    document.createDocumentFragment();


  shortcutGrid.innerHTML = '';


  filtered.forEach(item => {

    const card =
      document.createElement('div');


    card.className =
      'shortcut-item-container';


    card.style.position =
      'relative';

    card.style.display =
      'inline-block';


    // ======================================
    // 기본 HTML 구조
    // ======================================
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


      <!-- 수정 버튼 -->
      <button
        class="edit-shortcut-btn"
        style="
          position: absolute;
          top: -5px;
          right: 30px;

          background: #6d5dfc;
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
        ✎
      </button>


      <!-- 삭제 버튼 -->
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


    // ======================================
    // 요소 선택
    // ======================================
    const shortcutLink =
      card.querySelector('.shortcut-item');

    const icon =
      card.querySelector('.icon-wrapper img');

    const shortcutName =
      card.querySelector('.shortcut-name');

    const editButton =
      card.querySelector('.edit-shortcut-btn');

    const deleteButton =
      card.querySelector('.delete-shortcut-btn');


    // ======================================
    // 사용자 데이터 적용
    // ======================================
    shortcutLink.href =
      item.url;

    icon.src =
      item.icon;

    shortcutName.textContent =
      item.name;


    // ======================================
    // 아이콘 로딩 실패
    // ======================================
    icon.addEventListener('error', () => {

      icon.style.display =
        'none';

    });


    // ======================================
    // 마우스 올렸을 때 버튼 표시
    // ======================================
    card.addEventListener('mouseenter', () => {

      editButton.style.display =
        'flex';

      deleteButton.style.display =
        'flex';

    });


    card.addEventListener('mouseleave', () => {

      editButton.style.display =
        'none';

      deleteButton.style.display =
        'none';

    });


    // ======================================
    // 바로가기 클릭
    // ======================================
    shortcutLink.addEventListener('click', () => {

      const index =
        shortcuts.findIndex(
          s => s.id === item.id
        );


      if (index !== -1) {

        shortcuts[index].clicks += 1;

        saveToStorage();

      }


      // 클릭순 정렬일 경우 갱신
      if (sortSelect.value === 'clicks') {

        setTimeout(
          renderShortcuts,
          500
        );

      }

    });


    // ======================================
    // 수정 버튼
    // ======================================
    editButton.addEventListener('click', (e) => {

      e.preventDefault();
      e.stopPropagation();


      // 수정할 항목 ID 저장
      editingShortcutId =
        item.id;


      // 모달 제목 변경
      modalTitle.textContent =
        '바로가기 수정';


      // 기존 값 불러오기
      siteNameInput.value =
        item.name;

      siteUrlInput.value =
        item.url;


      // 커스텀 아이콘 여부 확인
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


    // ======================================
    // 삭제 버튼
    // ======================================
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
// 8. 검색 / 정렬 이벤트
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
// 9. 초기 화면
// ==========================================

renderShortcuts();
