// ==========================================
// 5. 바로가기 저장 / 수정
// ==========================================

saveShortcutBtn.addEventListener('click', () => {
  const name =
    siteNameInput.value.trim();

  let url =
    siteUrlInput.value
      .trim()
      .replace(/\s+/g, '');

  const useCustomIcon =
    iconToggle.checked;

  const customIconUrl =
    customIconUrlInput.value.trim();


  // 이름 / 주소 입력 확인
  if (!name || !url) {
    showAlert(
      '사이트 이름과 주소를 모두 입력해주세요!'
    );

    return;
  }


  // https://가 없으면 자동 추가
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }


  // URL 검사
  if (!isSafeHttpUrl(url)) {
    showAlert(
      '올바른 사이트 주소를 입력해주세요!'
    );

    return;
  }


  let finalIcon = '';


  // 커스텀 아이콘
  if (useCustomIcon && customIconUrl) {
    const trimmedCustomIconUrl =
      customIconUrl.trim();

    if (!isSafeImageUrl(trimmedCustomIconUrl)) {
      showAlert(
        '올바른 이미지 주소를 입력해주세요!'
      );

      return;
    }

    finalIcon = trimmedCustomIconUrl;

  } else {

    // 사이트 favicon 자동 가져오기
    try {
      const domain =
        new URL(url).hostname;

      finalIcon =
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    } catch (e) {
      console.error(
        'URL을 확인할 수 없습니다.',
        e
      );

      finalIcon = '';
    }
  }


  // 기존 바로가기 수정
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


  // 새로운 바로가기 추가
  else {

    const newShortcut = {
      id: Date.now(),
      name: name,
      url: url,
      icon: finalIcon,

      clicks: 0,
      timestamp: Date.now(),

      // 마지막으로 사용한 시간
      // 아직 사용하지 않았으므로 null
      lastUsed: null
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
      item.name
        .toLowerCase()
        .includes(keyword) ||

      item.url
        .toLowerCase()
        .includes(keyword)
    );


  // 정렬
  if (sortType === 'latest') {

    filtered.sort(
      (a, b) =>
        b.timestamp - a.timestamp
    );

  } else if (sortType === 'recent') {

    // 최근 사용순
    //
    // 1. 마지막으로 사용한 시간이 최신인 순서
    // 2. 한 번도 사용하지 않은 사이트는 맨 뒤
    // 3. 한 번도 사용하지 않은 사이트끼리는 최신 등록순

    filtered.sort((a, b) => {

      if (!a.lastUsed && !b.lastUsed) {
        return b.timestamp - a.timestamp;
      }

      if (!a.lastUsed) {
        return 1;
      }

      if (!b.lastUsed) {
        return -1;
      }

      return b.lastUsed - a.lastUsed;
    });

  } else if (sortType === 'clicks') {

    filtered.sort(
      (a, b) =>
        b.clicks - a.clicks
    );
  }


  // ========================================
  // 빈 상태 화면
  // ========================================

  if (shortcuts.length === 0) {

    shortcutGrid.innerHTML = '';

    if (emptyState) {
      shortcutGrid.appendChild(emptyState);
      emptyState.style.display = 'flex';
    }

    return;
  }


  // ========================================
  // 검색 결과가 없을 때
  // ========================================

  if (filtered.length === 0) {

    shortcutGrid.innerHTML = '';

    const noResultMessage =
      document.createElement('div');

    noResultMessage.className =
      'empty-state';

    noResultMessage.innerHTML = `
      <h2>검색 결과가 없습니다</h2>

      <p>
        다른 사이트 이름이나 URL을 검색해보세요.
      </p>
    `;

    shortcutGrid.appendChild(
      noResultMessage
    );

    return;
  }


  // ========================================
  // 기존 화면 비우기
  // ========================================

  shortcutGrid.innerHTML = '';

  const fragment =
    document.createDocumentFragment();


  // ========================================
  // 카드 생성
  // ========================================

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
      isSafeHttpUrl(item.url)
        ? item.url
        : '#';

    icon.src = item.icon;

    shortcutName.textContent =
      item.name;


    // 아이콘 로딩 실패 시 숨김
    icon.addEventListener('error', () => {
      icon.style.display = 'none';
    });


    // 메뉴 열기 / 닫기
    menuButton.addEventListener('click', (e) => {

      e.preventDefault();
      e.stopPropagation();

      const isOpen =
        menu.style.display === 'flex';

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

      if (!isOpen) {
        menu.style.display = 'flex';

        menuButton.setAttribute(
          'aria-expanded',
          'true'
        );
      }
    });


    // 바로가기 클릭
    shortcutLink.addEventListener('click', (e) => {

      if (!isSafeHttpUrl(item.url)) {
        e.preventDefault();
        return;
      }

      const index =
        shortcuts.findIndex(
          s => s.id === item.id
        );

      if (index !== -1) {

        shortcuts[index].clicks += 1;

        shortcuts[index].lastUsed =
          Date.now();

        saveToStorage();
      }


      // 사용 횟수순 또는 최근 사용순이면
      // 클릭 후 순서 갱신
      if (
        sortSelect.value === 'clicks' ||
        sortSelect.value === 'recent'
      ) {
        setTimeout(
          renderShortcuts,
          500
        );
      }
    });


    // 편집
    editButton.addEventListener('click', (e) => {

      e.preventDefault();
      e.stopPropagation();

      menu.style.display = 'none';

      menuButton.setAttribute(
        'aria-expanded',
        'false'
      );

      editingShortcutId =
        item.id;

      modalTitle.textContent =
        '바로가기 수정';

      siteNameInput.value =
        item.name;

      siteUrlInput.value =
        item.url;

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

        customIconUrlInput.value = '';
      }

      addModal.classList.add('active');

      siteNameInput.focus();
    });


    // 삭제
    deleteButton.addEventListener('click', (e) => {

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
    });


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
// 10. 커스텀 정렬 드롭다운
// ==========================================

const customSortSelect =
  document.getElementById(
    'custom-sort-select'
  );

const customSortButton =
  customSortSelect?.querySelector(
    '.custom-select-button'
  );

const customSortOptions =
  customSortSelect?.querySelectorAll(
    '.custom-select-option'
  );


if (
  customSortSelect &&
  customSortButton &&
  customSortOptions
) {

  // 드롭다운 열기 / 닫기
  customSortButton.addEventListener(
    'click',
    (e) => {

      e.stopPropagation();

      const isOpen =
        customSortSelect.classList.toggle(
          'open'
        );

      customSortButton.setAttribute(
        'aria-expanded',
        isOpen
      );

    }
  );


  // 정렬 항목 선택
  customSortOptions.forEach(option => {

    option.addEventListener(
      'click',
      () => {

        const value =
          option.dataset.value;

        const label =
          option.textContent.trim();


        // 버튼에 선택한 이름 표시
        customSortButton
          .querySelector('span')
          .textContent = label;


        // 선택 상태 변경
        customSortOptions.forEach(item => {

          const isSelected =
            item === option;

          item.classList.toggle(
            'selected',
            isSelected
          );

          item.setAttribute(
            'aria-selected',
            isSelected
          );

        });


        // 기존 select와 연결
        sortSelect.value = value;

        sortSelect.dispatchEvent(
          new Event('change')
        );


        // 드롭다운 닫기
        customSortSelect.classList.remove(
          'open'
        );

        customSortButton.setAttribute(
          'aria-expanded',
          'false'
        );

      }
    );

  });


  // 드롭다운 바깥 클릭 시 닫기
  document.addEventListener(
    'click',
    (e) => {

      if (
        !customSortSelect.contains(
          e.target
        )
      ) {

        customSortSelect.classList.remove(
          'open'
        );

        customSortButton.setAttribute(
          'aria-expanded',
          'false'
        );

      }

    }
  );

}


// ==========================================
// 11. 초기 화면
// ==========================================

renderShortcuts();