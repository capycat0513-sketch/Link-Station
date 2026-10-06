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
tutorialYesBtn.addEventListener('click', () => {

  tutorialConfirmModal.classList.remove(
    'active'
  );

  tutorialModal.classList.add(
    'active'
  );
});


// 튜토리얼 안 보기
tutorialNoBtn.addEventListener('click', () => {

  tutorialConfirmModal.classList.remove(
    'active'
  );
});


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