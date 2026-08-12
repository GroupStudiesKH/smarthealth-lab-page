/**
 * cmio-apply (adpage) 獨立頁面完整互動邏輯 (Pure Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  initVhHeight();
  initDomainAnimations();
  initCountUpAnimations();
  initMobileFooterMenu();
  initModalEscKey();
});

/**
 * 0. 解決 iOS 行動裝置網址列滾動動態展開/隱藏導致 Banner 高度與影片重組縮放 Bug
 */
function initVhHeight() {
  let lastWidth = window.innerWidth;

  function updateVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  updateVh();

  window.addEventListener('resize', () => {
    // 僅當寬度改變（如螢幕旋轉）時才重新計算 --vh，避免 iOS 上下滾動隱藏網址列時視窗高度微調觸發 Resize 導致影片縮放
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      updateVh();
    }
  });
}

/**
 * 1. 三大認證賽道區塊 (動態載入效果已取消，靜態呈現)
 */
function initDomainAnimations() {
  // 動態載入效果已取消，卡片內容直接靜態呈現
}

/**
 * 2. 課程數量數字累加動畫 (48 門課程 / 12 門線上課程)
 */
function initCountUpAnimations() {
  const planLeftSection = document.querySelector('.plan-left');
  const courseCountEl = document.getElementById('displayCourseCount');
  const onlineCountEl = document.getElementById('displayOnlineCount');

  if (!planLeftSection || !courseCountEl || !onlineCountEl) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateNumber(courseCountEl, 0, 48, 1500);
        animateNumber(onlineCountEl, 0, 12, 1200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(planLeftSection);
}

function animateNumber(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.floor(progress * (end - start) + start);
    element.textContent = currentValue;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end;
    }
  };
  window.requestAnimationFrame(step);
}

/**
 * 3. 影片彈出視窗 (Video Modal) 邏輯
 */
function openVideoModal(speakerName, speakerRole, speakerPhoto, videoUrl) {
  const modal = document.getElementById('videoModal');
  const nameEl = document.getElementById('modalSpeakerName');
  const roleEl = document.getElementById('modalSpeakerRole');
  const photoEl = document.getElementById('modalPersonPhoto');
  const iframeEl = document.getElementById('modalIframe');

  if (!modal || !iframeEl) return;

  if (nameEl) nameEl.textContent = speakerName;
  if (roleEl) roleEl.textContent = speakerRole;
  if (photoEl) photoEl.src = speakerPhoto;
  iframeEl.src = videoUrl;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVideoModalDirect() {
  const modal = document.getElementById('videoModal');
  const iframeEl = document.getElementById('modalIframe');

  if (!modal) return;

  modal.classList.remove('active');
  if (iframeEl) iframeEl.src = '';
  document.body.style.overflow = '';
}

function closeVideoModal(event) {
  if (event.target && event.target.classList.contains('modal-overlay')) {
    closeVideoModalDirect();
  }
}

function initModalEscKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModalDirect();
    }
  });
}

/**
 * 4. 手機版 Footer 折疊選單 (Accordion)
 */
function initMobileFooterMenu() {
  const mobileHeaders = document.querySelectorAll('.mobile-menu-header');

  mobileHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const arrow = header.querySelector('.menu-arrow');

      if (content) {
        const isOpen = content.classList.contains('open');
        if (isOpen) {
          content.classList.remove('open');
          if (arrow) arrow.classList.remove('rotated');
        } else {
          content.classList.add('open');
          if (arrow) arrow.classList.add('rotated');
        }
      }
    });
  });
}
