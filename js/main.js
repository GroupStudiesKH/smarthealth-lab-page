/**
 * cmio-apply (adpage) 獨立頁面完整互動邏輯 (Pure Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  initVhHeight();
  initDisableDoubleTapZoom();
  initDomainAnimations();
  initCountUpAnimations();
  initMobileFooterMenu();
  initModalEscKey();
  initCourseModal();
  initTreeNavigation();
  initNavbarNavigation();
  initSubmissionSystem();
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
 * 0.1 關閉行動裝置雙擊放大 (Disable Double Tap Zoom)
 */
function initDisableDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      // 避免阻止預設點擊表單輸入或連結，僅對快速連點雙擊做限制
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, { passive: false });
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

/**
 * 4. 課程大綱資料庫 (4 大領域 / 10 門學程 / 100 堂單元 / 100 小時)
 */
const courseCurriculumData = [
  {
    id: "course-1",
    domainBadge: "Domain A",
    domainName: "FHIR BOX Infrastructure Engineer",
    domainZh: "基礎設施與系統維運工程",
    courseCategory: "硬體規格、安裝與擴充",
    courseTitle: "硬體規格、安裝與擴充",
    totalHours: 10,
    totalLessons: 10,
    description: "全面掌握 FHIR BOX 邊緣運算定位與硬體規格需求分析、現場機房環境與電力保護機制、BIOS/UEFI 底層韌體調校、儲存子系統 RAID/NVMe 配置、硬體壓力燒機測試及現場安裝與 RMA 保固維修 SOP。",
    lessons: [
      { num: "01", title: "FHIR BOX 系統架構與硬體認識", hours: "1 小時" },
      { num: "02", title: "邊緣運算定位與硬體規格需求分析", hours: "1 小時" },
      { num: "03", title: "安裝、機房環境與電力異常保護機制", hours: "1 小時" },
      { num: "04", title: "BIOS / UEFI 底層韌體配置與安全性最佳化", hours: "1 小時" },
      { num: "05", title: "容器化基礎設施建置（Docker / Container Runtime）", hours: "1 小時" },
      { num: "06", title: "儲存子系統架構與 RAID / NVMe 磁碟陣列配置", hours: "1 小時" },
      { num: "07", title: "硬體壓力測試、燒機檢驗與效能基準評估", hours: "1 小時" },
      { num: "08", title: "實體網路介面規劃與多網卡/光纖介面配置", hours: "1 小時" },
      { num: "09", title: "現場安裝作業規範、機櫃理線與環境佈建 SOP", hours: "1 小時" },
      { num: "10", title: "硬體故障診斷、備品管理與保固維修（RMA）流程", hours: "1 小時" }
    ]
  },
  {
    id: "course-2",
    domainBadge: "Domain A",
    domainName: "FHIR BOX Infrastructure Engineer",
    domainZh: "基礎設施與系統維運工程",
    courseCategory: "作業系統與維運",
    courseTitle: "作業系統與維運",
    totalHours: 10,
    totalLessons: 10,
    description: "深入實作作業系統安裝與最小化核心部署、OS Hardening 資安硬化、核心效能調優、網路架構與防火牆配置、Kubernetes / RKE2 容器叢集架構、FHIR BOX 核心服務部署、HA/DR 災難復原策略與 CI/CD 自動化升級。",
    lessons: [
      { num: "01", title: "作業系統安裝與最小化核心部署", hours: "1 小時" },
      { num: "02", title: "資安與系統硬化（OS Hardening）", hours: "1 小時" },
      { num: "03", title: "系統效能調優與核心參數最佳化", hours: "1 小時" },
      { num: "04", title: "網路架構規劃與防火牆配置", hours: "1 小時" },
      { num: "05", title: "容器化基礎設施建置（Docker / Container Runtime）", hours: "1 小時" },
      { num: "06", title: "Kubernetes / RKE2 基礎", hours: "1 小時" },
      { num: "07", title: "FHIR BOX 核心服務部署實務", hours: "1 小時" },
      { num: "08", title: "系統資源監控與日誌收集", hours: "1 小時" },
      { num: "09", title: "資料庫備份、高可用性（HA）與災難復原（DR）策略", hours: "1 小時" },
      { num: "10", title: "系統更新、漏洞修補與 CI/CD 自動化升級", hours: "1 小時" }
    ]
  },
  {
    id: "course-3",
    domainBadge: "Domain B",
    domainName: "Healthcare Data Standardization Engineer",
    domainZh: "醫療資料標準化工程",
    courseCategory: "TWDS 資料標準化 (FHIR IG、TWCDI 以及病歷對應等等)",
    courseTitle: "TWDS 資料標準化 (FHIR IG、TWCDI 以及病歷對應等等)",
    totalHours: 10,
    totalLessons: 10,
    description: "聚焦台灣健康資料標準（TWDS）與 TW Core IG 規範，涵蓋傳統 HIS 欄位 Mapping、TWCDI 臨床資料集對應、Terminology Binding、FHIR Validation 與資料品質管理實戰。",
    lessons: [
      { num: "01", title: "台灣健康資料標準（TWDS）與 TW Core IG 發展脈絡", hours: "1 小時" },
      { num: "02", title: "TWCDI（台灣核心臨床資料集）規範總覽", hours: "1 小時" },
      { num: "03", title: "傳統 HIS 資料庫與 TWCDI 欄位 Mapping 實務", hours: "1 小時" },
      { num: "04", title: "臨床病歷摘要與文件結構化（Composition & ClinicalDocument）", hours: "1 小時" },
      { num: "05", title: "台灣在地特定代碼集（CodeSystem / ValueSet）整合", hours: "1 小時" },
      { num: "06", title: "Terminology Binding 、FHIR StructureDefinition與 FHIR Validation", hours: "1 小時" },
      { num: "07", title: "多來源病歷 Mapping 衝突與資料品質（Data Quality）管理", hours: "1 小時" },
      { num: "08", title: "FHIR BOX : TWCDI Tool使用", hours: "1 小時" },
      { num: "09", title: "FHIR BOX : FHIR Converter使用與除錯", hours: "1 小時" },
      { num: "10", title: "TWDS 標準化專案實作", hours: "1 小時" }
    ]
  },
  {
    id: "course-4",
    domainBadge: "Domain B",
    domainName: "Healthcare Data Standardization Engineer",
    domainZh: "醫療資料標準化工程",
    courseCategory: "SNOMED CT 臨床術語標準",
    courseTitle: "SNOMED CT 國際臨床術語標準",
    totalHours: 10,
    totalLessons: 10,
    description: "全面學習 SNOMED CT 邏輯結構與概念模型、後組合（Post-Coordination）與 ECL 約束語言、台灣 SNOMED CT National Release、ICD-10-CM 對映及 Terminology Server (Snowstorm) 串接。",
    lessons: [
      { num: "01", title: "SNOMED CT 基礎概念與國際發展趨勢", hours: "1 小時" },
      { num: "02", title: "SNOMED CT 邏輯結構與語意模型", hours: "1 小時" },
      { num: "03", title: "SNOMED CT 階層架構（Hierarchy）與 is_a 關係", hours: "1 小時" },
      { num: "04", title: "後組合（Post-Coordination）與 ECL（Expression Constraint Language）", hours: "1 小時" },
      { num: "05", title: "SNOMED CT 在 FHIR 資源中的套用實務", hours: "1 小時" },
      { num: "06", title: "台灣 SNOMED CT National Release 與 Reference Set (Refset)", hours: "1 小時" },
      { num: "07", title: "ICD-10-CM 與 SNOMED CT 之對映（Mapping）策略", hours: "1 小時" },
      { num: "08", title: "診斷用語集（Problem List）與臨床詞彙庫管理", hours: "1 小時" },
      { num: "09", title: "Terminology Server（如 Snowstorm）建置與 FHIR API 串接", hours: "1 小時" },
      { num: "10", title: "SNOMED CT 版本更新、維護與常見對應錯誤排查", hours: "1 小時" }
    ]
  },
  {
    id: "course-5",
    domainBadge: "Domain B",
    domainName: "Healthcare Data Standardization Engineer",
    domainZh: "醫療資料標準化工程",
    courseCategory: "LOINC 檢驗與量表編碼標準",
    courseTitle: "LOINC 臨床檢驗與評估量表標準",
    totalHours: 10,
    totalLessons: 10,
    description: "剖析 LOINC 六大軸向核心架構、實驗室檢驗與臨床測量生命徵象代碼、健保代碼至 LOINC 對映實務、5050 資料庫查詢應用、LOINC Document Ontology 與問卷量表 Panels 整合。",
    lessons: [
      { num: "01", title: "LOINC 系統簡介與國際應用標準", hours: "1 小時" },
      { num: "02", title: "LOINC 核心結構：六大軸向（6 Axes）剖析", hours: "1 小時" },
      { num: "03", title: "臨床一般檢驗（Laboratory LOINC）代碼實務", hours: "1 小時" },
      { num: "04", title: "臨床測量與生命徵象（Clinical LOINC）代碼實務", hours: "1 小時" },
      { num: "05", title: "LOINC 與 FHIR Observation / DiagnosticReport 整合", hours: "1 小時" },
      { num: "06", title: "台灣健保檢驗代碼/醫院 LIS 碼至 LOINC 之 Mapping 實務", hours: "1 小時" },
      { num: "07", title: "如何使用5050資料庫進行查詢", hours: "1 小時" },
      { num: "08", title: "LOINC Document Ontology（病歷文件類別編碼）", hours: "1 小時" },
      { num: "09", title: "LOINC Panels 與 Survey（問卷與評估量表）代碼應用", hours: "1 小時" },
      { num: "10", title: "LOINC × FHIR 實作", hours: "1 小時" }
    ]
  },
  {
    id: "course-6",
    domainBadge: "Domain B",
    domainName: "Healthcare Data Standardization Engineer",
    domainZh: "醫療資料標準化工程",
    courseCategory: "RxNorm 國際藥品標準",
    courseTitle: "RxNorm 國際藥品標準與交互作用",
    totalHours: 10,
    totalLessons: 10,
    description: "掌握 RxNorm 藥品實體模型、健保藥品代碼 (NHI Code) 對映至 RxNorm 策略、RxNav RESTful API 呼叫、跨院處方箋成分歸一化、藥物過敏與藥品交互作用 (DDI) 邏輯資料基礎。",
    lessons: [
      { num: "01", title: "RxNorm 架構原理與國際藥品標準概觀", hours: "1 小時" },
      { num: "02", title: "RxNorm 藥品實體模型（Entity Model）解析", hours: "1 小時" },
      { num: "03", title: "RxNorm 與其他藥品編碼（ATC, SNOMED CT, NDC）之比較與關聯", hours: "1 小時" },
      { num: "04", title: "台灣健保藥品代碼（NHI Code）對映至 RxNorm 策略", hours: "1 小時" },
      { num: "05", title: "RxNorm 在 FHIR 藥品資源（Medication / MedicationRequest）之實作", hours: "1 小時" },
      { num: "06", title: "RxNav 工具與 RxNorm RESTful API 實作", hours: "1 小時" },
      { num: "07", title: "跨國/跨院處方箋成分歸一化（Active Ingredients Mapping）", hours: "1 小時" },
      { num: "08", title: "藥品過敏（AllergyIntolerance）與 RxNorm 類別對應", hours: "1 小時" },
      { num: "09", title: "藥品交互作用（Drug-Drug Interaction, DDI）邏輯資料基礎", hours: "1 小時" },
      { num: "10", title: "RxNorm × FHIR 實作", hours: "1 小時" }
    ]
  },
  {
    id: "course-7",
    domainBadge: "Domain C",
    domainName: "Clinical Application & CDS Engineer",
    domainZh: "臨床應用與決策支援工程",
    courseCategory: "CQL & CDS Hooks 臨床決策支援",
    courseTitle: "CQL & CDS Hooks 臨床決策支援",
    totalHours: 10,
    totalLessons: 10,
    description: "精通 CQL 臨床邏輯語言語法、FHIR Data Model 綁定、CDS Hooks 觸發點 (Hook Types) 與 Cards 設計，並於 FHIR BOX 部署 CDS Hooks Service 引擎與前端 EHR 臨床介面整合。",
    lessons: [
      { num: "01", title: "臨床決策支援（CDS）概述與 CQL / CDS Hooks 架構", hours: "1 小時" },
      { num: "02", title: "CQL（Clinical Quality Language）語法基礎", hours: "1 小時" },
      { num: "03", title: "CQL 與 FHIR Data Model 綁定", hours: "1 小時" },
      { num: "04", title: "實作第一支 CQL 臨床邏輯", hours: "1 小時" },
      { num: "05", title: "CDS Hooks 規範解析與 API 規格", hours: "1 小時" },
      { num: "06", title: "CDS Hooks 常見觸發點（Hook Types）實作", hours: "1 小時" },
      { num: "07", title: "CDS Cards 設計與臨床互動體驗", hours: "1 小時" },
      { num: "08", title: "FHIR BOX 內建 CDS Hooks Service 引擎部署", hours: "1 小時" },
      { num: "09", title: "CQL 邏輯測試、除錯與效能最佳化", hours: "1 小時" },
      { num: "10", title: "CDS Hooks 在 UCC/EHR 前端介面之整合與臨床導入", hours: "1 小時" }
    ]
  },
  {
    id: "course-8",
    domainBadge: "Domain C",
    domainName: "Clinical Application & CDS Engineer",
    domainZh: "臨床應用與決策支援工程",
    courseCategory: "SMART on FHIR 醫療應用整合",
    courseTitle: "SMART on FHIR 醫療應用整合",
    totalHours: 10,
    totalLessons: 10,
    description: "全面學習 SMART on FHIR 應用生態、OAuth 2.0 / OIDC 醫療資安、SMART App Launch Framework、細粒度權限控制、FHIR BOX 授權伺服器建置、EHR 介面嵌入與 App Gallery 上架管理。",
    lessons: [
      { num: "01", title: "SMART on FHIR 架構原理與應用生態圈", hours: "1 小時" },
      { num: "02", title: "OAuth 2.0 與 OpenID Connect (OIDC) 醫療資安基礎", hours: "1 小時" },
      { num: "03", title: "SMART App Launch Framework 解析", hours: "1 小時" },
      { num: "04", title: "SMART Scopes 與細粒度權限控制（Granular Permissions）", hours: "1 小時" },
      { num: "05", title: "FHIR BOX SMART App 授權伺服器（Authorization Server）", hours: "1 小時" },
      { num: "06", title: "開發第一個 SMART App", hours: "1 小時" },
      { num: "07", title: "後端服務授權（Backend Services Specification）", hours: "1 小時" },
      { num: "08", title: "SMART App 嵌入 UCC/EHR 介面之 UI/UX整合", hours: "1 小時" },
      { num: "09", title: "SMART App 資安審查與安全資產管理", hours: "1 小時" },
      { num: "10", title: "SMART App Gallery 上架規範與 FHIR BOX App Store 管理", hours: "1 小時" }
    ]
  },
  {
    id: "course-9",
    domainBadge: "Domain D",
    domainName: "Healthcare AI Engineer",
    domainZh: "智慧醫療 AI 工程",
    courseCategory: "AI 治理 (AI Governance)",
    courseTitle: "AI 治理 (AI Governance)",
    totalHours: 10,
    totalLessons: 10,
    description: "聚焦三大 AI 中心核心任務、TFDA / FDA 醫療 AI/ML 軟體上市前驗證、MLOps 生命週期、FHIR 去識別化隱私保護、可解釋性 AI (XAI)、聯邦學習與 ISO 14971 / ISO 42001 風險管理。",
    lessons: [
      { num: "01", title: "智慧醫療 AI 治理概述(三大AI中心的核心任務)與國際法規趨勢", hours: "1 小時" },
      { num: "02", title: "TFDA / US FDA 醫療 AI/ML 軟體上市前驗證", hours: "1 小時" },
      { num: "03", title: "醫療 AI 生命週期管理與 MLOps 基礎", hours: "1 小時" },
      { num: "04", title: "醫療資料隱私保護與 FHIR 去識別化（De-identification）", hours: "1 小時" },
      { num: "05", title: "臨床數據偏差（Bias）評估與 AI 模型公平性", hours: "1 小時" },
      { num: "06", title: "可解釋性 AI（XAI）與臨床輔助溝通設計", hours: "1 小時" },
      { num: "07", title: "AI 模型臨床績效監測與數據漂移（Data/Model Drift）偵測", hours: "1 小時" },
      { num: "08", title: "聯邦學習優勢與應用", hours: "1 小時" },
      { num: "09", title: "醫療院所/衛生所 AI 風險管理（ISO 14971 / ISO 42001）", hours: "1 小時" },
      { num: "10", title: "AI 臨床責任歸屬、例外通報與 AI 治理委員會實務", hours: "1 小時" }
    ]
  },
  {
    id: "course-10",
    domainBadge: "Domain D",
    domainName: "Healthcare AI Engineer",
    domainZh: "智慧醫療 AI 工程",
    courseCategory: "LLM 病歷編碼",
    courseTitle: "LLM 病歷編碼",
    totalHours: 10,
    totalLessons: 10,
    description: "探索大型語言模型在自由文本病歷解析之應用，包含醫療 Prompt Engineering、RAG 標準術語庫檢索、地端專用 LLM 微調、FHIR CodeableConcept 自動對接、幻覺校驗與端側輕量化部署。",
    lessons: [
      { num: "01", title: "LLM 在醫療病歷自動編碼之應用趨勢與架構", hours: "1 小時" },
      { num: "02", title: "門診/住院自由文本病歷（Free-Text Notes）解析", hours: "1 小時" },
      { num: "03", title: "Prompt Engineering 於醫療編碼之實務設計", hours: "1 小時" },
      { num: "04", title: "RAG（檢索增強生成）架構於標準術語庫之整合", hours: "1 小時" },
      { num: "05", title: "地端（On-Premise）醫療專用 LLM 微調（Fine-tuning）", hours: "1 小時" },
      { num: "06", title: "LLM 輸出格式化與 FHIR CodeableConcept 自動對接", hours: "1 小時" },
      { num: "07", title: "幻覺（Hallucination）防制與編碼確定性校驗機制", hours: "1 小時" },
      { num: "08", title: "人機協作（Human-in-the-Loop, HITL）審核介面設計", hours: "1 小時" },
      { num: "09", title: "LLM 病歷編碼準確率評估與稽核指標", hours: "1 小時" },
      { num: "10", title: "FHIR BOX 端側 LLM 輕量化部署與效能優化", hours: "1 小時" }
    ]
  }
];

/**
 * 5. 課程詳細課綱 Modal 互動邏輯 (Course Syllabus Modal)
 */
function initCourseModal() {
  const modal = document.getElementById('courseDetailModal');
  if (!modal) return;

  // 綁定課程卡片點擊事件
  const courseCards = document.querySelectorAll('[data-course-target]');
  courseCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const courseId = card.getAttribute('data-course-target');
      if (courseId) {
        openCourseModal(courseId);
      }
    });
  });
}

function openCourseModal(courseId) {
  const modal = document.getElementById('courseDetailModal');
  if (!modal) return;

  const course = courseCurriculumData.find((c) => c.id === courseId);
  if (!course) return;

  const domainBadgeEl = document.getElementById('courseModalDomainBadge');
  const domainNameEl = document.getElementById('courseModalDomainName');
  const courseTitleEl = document.getElementById('courseModalTitle');
  const courseDescEl = document.getElementById('courseModalDesc');
  const totalHoursEl = document.getElementById('courseModalTotalHours');
  const lessonsListEl = document.getElementById('courseModalLessonsList');

  if (domainBadgeEl) domainBadgeEl.textContent = course.domainBadge;
  if (domainNameEl) domainNameEl.textContent = `${course.domainName} (${course.domainZh})`;
  if (courseTitleEl) courseTitleEl.textContent = course.courseTitle;
  if (courseDescEl) courseDescEl.textContent = course.description;
  if (totalHoursEl) totalHoursEl.textContent = `共 ${course.totalLessons} 堂課 · 總計 ${course.totalHours} 小時`;

  if (lessonsListEl) {
    lessonsListEl.innerHTML = '';
    course.lessons.forEach((lesson) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'syllabus-lesson-row';
      itemEl.innerHTML = `
        <div class="lesson-num-badge">${lesson.num}</div>
        <div class="lesson-name">${lesson.title}</div>
        <div class="lesson-duration-pill">${lesson.hours}</div>
      `;
      lessonsListEl.appendChild(itemEl);
    });
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCourseModalDirect() {
  const modal = document.getElementById('courseDetailModal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function closeCourseModal(event) {
  if (event.target && event.target.classList.contains('course-modal-overlay')) {
    closeCourseModalDirect();
  }
}

function initModalEscKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModalDirect();
      closeCourseModalDirect();
      closeSubmissionModalDirect();
    }
  });
}

/**
 * 7. 技術授權樹 (Tree Portfolio) 藍色 Tag 雙向平滑滾動與高亮聚焦導航
 */
function initTreeNavigation() {
  const treeTags = document.querySelectorAll('.license-tag[data-scroll-target]');
  const backButtons = document.querySelectorAll('.back-to-tree-btn, [data-back-to-tree]');
  const treeSection = document.getElementById('tree-license-portfolio');

  treeTags.forEach((tag) => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tag.getAttribute('data-scroll-target');
      if (!targetId) return;

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        // 平滑滾動至目標學程卡片
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 移除現有的高亮動畫 class
        document.querySelectorAll('.course-item-card.highlight-focus').forEach(el => {
          el.classList.remove('highlight-focus');
        });

        // 加上高亮聚焦呼吸燈效果
        targetEl.classList.add('highlight-focus');
        setTimeout(() => {
          targetEl.classList.remove('highlight-focus');
        }, 2200);
      }
    });
  });

  backButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // 避免點擊返回時冒泡觸發卡片的開啟課綱 Modal
      if (treeSection) {
        treeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        treeSection.classList.add('tree-highlight-focus');
        setTimeout(() => {
          treeSection.classList.remove('tree-highlight-focus');
        }, 1800);
      }
    });
  });
}

/**
 * 8. 手機版 Footer 折疊選單 (Accordion)
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

/**
 * 9. 全站導覽列 (Navbar) 互動與手機快速選單邏輯
 */
function initNavbarNavigation() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawerOverlay = document.getElementById('mobileDrawerOverlay');
  const drawerClose = document.getElementById('mobileDrawerClose');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileDrawerLinks = document.querySelectorAll('.mobile-drawer-link');
  const quickTabs = document.querySelectorAll('.quick-tab-pill');

  // 開啟 / 關閉手機抽屜選單
  function openDrawer() {
    if (drawerOverlay && toggleBtn) {
      drawerOverlay.classList.add('active');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawerOverlay && toggleBtn) {
      drawerOverlay.classList.remove('active');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawerOverlay && drawerOverlay.classList.contains('active');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) {
        closeDrawer();
      }
    });
  }

  // 點擊手機抽屜選單連結自動關閉選單
  mobileDrawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // ESC 鍵關閉抽屜
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });

  // Scrollspy: 監聽滾動並動態更新各選單當前 Active 狀態
  const sections = [
    document.getElementById('policy-concept'),
    document.getElementById('certification-tracks'),
    document.getElementById('tech-architecture'),
    document.getElementById('training-curriculum'),
    document.getElementById('lab-testing-section'),
    document.getElementById('software-submission'),
    document.getElementById('hardware-submission'),
    document.getElementById('certification-apply-form'),
    document.getElementById('download-section')
  ].filter(sec => sec && sec.offsetParent !== null);

  function updateActiveNav() {
    const scrollPos = window.scrollY + 140; // 考慮 Header 高度 offset

    let currentSectionId = '';
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = sections[i];
      if (sec && sec.offsetTop <= scrollPos) {
        currentSectionId = sec.getAttribute('id');
        break;
      }
    }

    // 更新桌機選單
    desktopLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 更新手機快速橫向標籤列
    quickTabs.forEach(tab => {
      const href = tab.getAttribute('href').replace('#', '');
      if (href === currentSectionId) {
        tab.classList.add('active');
        // 手機版標籤自動微調滾動到可視區域
        tab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      } else {
        tab.classList.remove('active');
      }
    });

    // 更新抽屜選單
    mobileDrawerLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // 節流滾動事件
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // 初始觸發一次
  updateActiveNav();
}

/**
 * 10. 軟硬體認證收件申請、費用試算、後台 Webhook 串接與自動轉信/回覆邏輯
 */
const LAB_OFFICIAL_EMAIL = 'medstandard@itri.org.tw';
// 若已部署 Google Apps Script (backend/google-apps-script-webhook.gs)，可填入 Web App URL 即時寫入雲端後台與自動寄送雙向確認信
const LAB_SUBMISSION_WEBHOOK_URL = window.LAB_SUBMISSION_WEBHOOK_URL || '';

const SUBMISSION_TIER_CONFIG = {
  S1: {
    track: 'software',
    trackBadge: '💻 軟體認證收件',
    name: '類別 S1：CQL 臨床決策支援模組檢測',
    basePrice: 30000,
    unit: '件',
    deliverables: [
      '工研院國家級沙盒技術驗證（CQL 語法 / ELM JSON / TWCDI 對映）',
      '長庚 / 三總等醫學中心臨床團隊真實病歷情境測試 1 次',
      '完整測試 Log 稽核報告與未通過項目輔導補正建議',
      '通過後核發國家認證標章並登錄 THRS 臨床規則空間白名單'
    ]
  },
  S2: {
    track: 'software',
    trackBadge: '💻 軟體認證收件',
    name: '類別 S2：SMART on FHIR 應用程式檢測',
    basePrice: 60000,
    unit: '式',
    deliverables: [
      '工研院國家級沙盒技術驗證（TW Core IG / OAuth 2.0 / SMART Launch）',
      '長庚 / 三總等醫學中心真實 HIS 嵌入與虛擬病歷臨床驗證 1 次',
      '完整測試 Log 稽核報告與未通過項目輔導補正建議',
      '通過後核發國家認證標章並開放國家 App Marketplace 上架'
    ]
  },
  S3: {
    track: 'software',
    trackBadge: '💻 軟體認證收件',
    name: '類別 S3：智慧醫療 AI / LLM 複合應用檢測',
    basePrice: 80000,
    unit: '式',
    deliverables: [
      '含 S2 全項 SMART on FHIR / CDS 授權資安與互通性驗證',
      'FHIR 醫療資料去識別化合規、AI 推論延遲與臨床準確度實測',
      '醫學中心臨床工作流壓力測試與確定性校驗評估報告',
      '通過後核發國家智慧醫療 AI 認證標章並登錄官方白名單'
    ]
  },
  H1: {
    track: 'hardware',
    trackBadge: '🖥️ 硬體認證收件',
    name: '等級 H1：基層診所 / 地區醫院級硬體效能認證',
    basePrice: 50000,
    unit: '台',
    deliverables: [
      '工研院實驗室機房上架與標準 FHIR Box OS (K8s/RKE2) 裸機部署',
      '10 萬～20 萬筆標準病歷資料集 · 20～80 併發數燒機壓測',
      '7 大量化指標（API 成功率 >99%、Latency <500ms 等）完整評估報告',
      '公開登錄於衛福部基層診所 / 地區醫院合格硬體採購白名單'
    ]
  },
  H2: {
    track: 'hardware',
    trackBadge: '🖥️ 硬體認證收件',
    name: '等級 H2：區域醫院級中大型硬體效能認證',
    basePrice: 80000,
    unit: '台',
    deliverables: [
      '含 H1 全項標準環境部署與 7 大量化指標檢測',
      '30 萬～50 萬筆標準病歷資料集 · 80～150 併發數高負載壓測',
      'Bulk Data 大規模批次匯入與多網卡 I/O 吞吐量基準報告',
      '公開登錄於衛福部區域醫院級合格硬體採購白名單'
    ]
  },
  H3: {
    track: 'hardware',
    trackBadge: '🖥️ 硬體認證收件',
    name: '等級 H3：醫學中心級高通量硬體效能認證',
    basePrice: 120000,
    unit: '台',
    deliverables: [
      '含 H2 全項標準環境部署與 Bulk Data 批次交換壓測',
      '50 萬～100 萬筆標準病歷資料集 · 150～200+ 併發數極限壓測',
      '2,500～3,000 bundle resources/s 吞吐量與 HA 高可用性容錯驗證',
      '獲頒最高等級硬體效能認證標章並登錄醫學中心採購白名單'
    ]
  }
};

/**
 * 表單互動後驗證 Fallback 與 ARIA 狀態同步 (遵循 validate-input-after-interaction 規範)
 */
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = (input) => {
    if (!input.checkValidity) return;
    const isValid = input.checkValidity();
    input.classList.toggle('user-invalid-fallback', !isValid);
    input.classList.toggle('user-valid-fallback', isValid);
    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  };

  const handleEvent = (event) => {
    const input = event.target;
    if (event.type === 'reset') {
      const controls = input.elements || [];
      for (const control of controls) {
        dirtyState.delete(control);
        control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
        control.removeAttribute('aria-invalid');
      }
      return;
    }
    if (!input || !input.checkValidity) return;

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred) {
        updateState(input);
      }
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted) {
        updateState(input);
      }
    }
  };

  const init = (root = document) => {
    // 同步原生 :user-invalid 與 aria-invalid 屬性
    const syncAria = (el) => {
      if (!el || !el.matches || !el.checkValidity) return;
      try {
        if (CSS.supports('selector(:user-invalid)')) {
          el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
        }
      } catch (_) {
        // 忽略不支援 :user-invalid 之舊瀏覽器
      }
    };

    root.addEventListener('blur', (e) => syncAria(e.target), true);
    root.addEventListener('input', (e) => {
      if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
        syncAria(e.target);
      }
    });

    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('selector(:user-invalid)')) {
      return;
    }

    root.addEventListener('blur', handleEvent, true);
    root.addEventListener('input', handleEvent);
    root.addEventListener('change', handleEvent);
    root.addEventListener('reset', handleEvent, true);
  };

  return { init, updateState };
})();

function initSubmissionSystem() {
  const form = document.getElementById('labSubmissionForm');
  if (!form) return;

  UserInvalidFallback.init(form);

  const trackRadios = form.querySelectorAll('input[name="submissionTrack"]');
  const tierItems = form.querySelectorAll('.tier-radio-item[data-track-option]');
  const tierRadios = form.querySelectorAll('input[name="submissionTier"]');
  const natureRadios = form.querySelectorAll('input[name="applicationNature"]');
  const softwareFieldsGroup = document.getElementById('softwareFieldsGroup');
  const hardwareFieldsGroup = document.getElementById('hardwareFieldsGroup');

  // 摘要側欄 DOM
  const summaryTrackBadge = document.getElementById('summaryTrackBadge');
  const summaryTierName = document.getElementById('summaryTierName');
  const summaryPriceDisplay = document.getElementById('summaryPriceDisplay');
  const summaryNatureDisplay = document.getElementById('summaryNatureDisplay');
  const summaryDeliverablesList = document.getElementById('summaryDeliverablesList');
  const submitBtnText = document.getElementById('submitBtnText');

  function getSelectedTrack() {
    const checked = form.querySelector('input[name="submissionTrack"]:checked');
    return checked ? checked.value : 'software';
  }

  function getSelectedTier() {
    const checked = form.querySelector('input[name="submissionTier"]:checked');
    return checked ? checked.value : 'S2';
  }

  function getSelectedNature() {
    const checked = form.querySelector('input[name="applicationNature"]:checked');
    return checked ? checked.value : '首次送檢認證';
  }

  function computeEffectivePrice(tierCode, natureVal) {
    const cfg = SUBMISSION_TIER_CONFIG[tierCode] || SUBMISSION_TIER_CONFIG.S2;
    if (natureVal === '輔導補正後複驗') {
      return cfg.track === 'hardware' ? 20000 : 15000;
    }
    if (natureVal === '年度續證或衍生機型登錄') {
      return 15000;
    }
    return cfg.basePrice;
  }

  function updateTrackUI(track, preferredTier) {
    tierItems.forEach((item) => {
      const itemTrack = item.getAttribute('data-track-option');
      if (itemTrack === track) {
        item.classList.remove('is-hidden');
      } else {
        item.classList.add('is-hidden');
      }
    });

    // 切換專屬欄位群組並設定 disabled 以確保瀏覽器原生驗證只檢查當前賽道必填項
    if (track === 'software') {
      if (softwareFieldsGroup) {
        softwareFieldsGroup.classList.remove('is-hidden');
        softwareFieldsGroup.disabled = false;
      }
      if (hardwareFieldsGroup) {
        hardwareFieldsGroup.classList.add('is-hidden');
        hardwareFieldsGroup.disabled = true;
      }
    } else {
      if (softwareFieldsGroup) {
        softwareFieldsGroup.classList.add('is-hidden');
        softwareFieldsGroup.disabled = true;
      }
      if (hardwareFieldsGroup) {
        hardwareFieldsGroup.classList.remove('is-hidden');
        hardwareFieldsGroup.disabled = false;
      }
    }

    // 確認當前選中的 Tier 是否屬於該 Track，若否則自動選取預設 Tier
    const currentTier = getSelectedTier();
    const targetTier = preferredTier || (
      (track === 'software' && !currentTier.startsWith('S')) ? 'S2' :
        (track === 'hardware' && !currentTier.startsWith('H')) ? 'H2' :
          currentTier
    );

    const targetRadio = form.querySelector(`input[name="submissionTier"][value="${targetTier}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
    }

    updateSummarySidebar();
  }

  function updateSummarySidebar() {
    const tierCode = getSelectedTier();
    const natureVal = getSelectedNature();
    const cfg = SUBMISSION_TIER_CONFIG[tierCode] || SUBMISSION_TIER_CONFIG.S2;
    const price = computeEffectivePrice(tierCode, natureVal);
    const formattedPrice = `NT$ ${price.toLocaleString('en-US')}`;

    if (summaryTrackBadge) {
      summaryTrackBadge.textContent = cfg.trackBadge;
    }
    if (summaryTierName) {
      summaryTierName.textContent = cfg.name;
    }
    if (summaryPriceDisplay) {
      summaryPriceDisplay.textContent = formattedPrice;
    }
    if (summaryNatureDisplay) {
      summaryNatureDisplay.textContent = `${natureVal} · 計價單位：每${cfg.unit}`;
    }
    if (summaryDeliverablesList) {
      summaryDeliverablesList.innerHTML = cfg.deliverables
        .map(item => `<li>${item}</li>`)
        .join('');
    }
    if (submitBtnText) {
      submitBtnText.textContent = `送出收件申請並取得檢測資訊回覆信 (預估費用 ${formattedPrice})`;
    }
  }

  trackRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      updateTrackUI(getSelectedTrack());
    });
  });

  tierRadios.forEach((radio) => {
    radio.addEventListener('change', updateSummarySidebar);
  });

  natureRadios.forEach((radio) => {
    radio.addEventListener('change', updateSummarySidebar);
  });

  // 綁定軟體收件 / 硬體收件區塊的快速申請 CTA 按鈕
  const applyTrackButtons = document.querySelectorAll('[data-apply-track]');
  applyTrackButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTrack = btn.getAttribute('data-apply-track') || 'software';
      const targetTier = btn.getAttribute('data-apply-tier') || (targetTrack === 'hardware' ? 'H2' : 'S2');

      const trackRadio = form.querySelector(`input[name="submissionTrack"][value="${targetTrack}"]`);
      if (trackRadio) {
        trackRadio.checked = true;
      }
      updateTrackUI(targetTrack, targetTier);

      const formSection = document.getElementById('certification-apply-form');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 表單送出處理
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 觸發所有啟用欄位的有效性檢查
    const activeControls = Array.from(form.elements).filter(el => !el.disabled && el.checkValidity);
    let firstInvalid = null;

    activeControls.forEach((control) => {
      UserInvalidFallback.updateState(control);
      if (!control.checkValidity() && !firstInvalid) {
        firstInvalid = control;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      if (typeof firstInvalid.reportValidity === 'function') {
        firstInvalid.reportValidity();
      }
      return;
    }

    const submitBtn = document.getElementById('submitApplicationBtn');
    if (submitBtn) {
      submitBtn.disabled = true; // 有效送出後鎖定按鈕避免重複送件
    }

    const track = getSelectedTrack();
    const tierCode = getSelectedTier();
    const natureVal = getSelectedNature();
    const cfg = SUBMISSION_TIER_CONFIG[tierCode] || SUBMISSION_TIER_CONFIG.S2;
    const estimatedFee = computeEffectivePrice(tierCode, natureVal);

    // 產生專屬收件單號 (如 SW-20261101-842 或 HW-20261101-519)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randSuffix = String(Math.floor(100 + Math.random() * 900));
    const prefix = track === 'hardware' ? 'HW' : 'SW';
    const caseId = `${prefix}-${yyyy}${mm}${dd}-${randSuffix}`;

    const standardsChecked = Array.from(form.querySelectorAll('input[name="swStandards"]:checked'))
      .map(cb => cb.value)
      .join('、');

    const payload = {
      caseId,
      submittedAt: now.toISOString(),
      track,
      trackLabel: cfg.trackBadge,
      tierCode,
      tierName: cfg.name,
      applicationNature: natureVal,
      estimatedFee: `NT$ ${estimatedFee.toLocaleString('en-US')}`,
      companyName: (document.getElementById('companyName')?.value || '').trim(),
      taxId: (document.getElementById('taxId')?.value || '').trim(),
      contactName: (document.getElementById('contactName')?.value || '').trim(),
      contactRole: (document.getElementById('contactRole')?.value || '').trim(),
      contactEmail: (document.getElementById('contactEmail')?.value || '').trim(),
      contactPhone: (document.getElementById('contactPhone')?.value || '').trim(),
      swProductName: track === 'software' ? (document.getElementById('swProductName')?.value || '').trim() : '',
      swDocUrl: track === 'software' ? (document.getElementById('swDocUrl')?.value || '').trim() : '',
      swStandards: track === 'software' ? (standardsChecked || 'TW Core IG') : '',
      hwModelName: track === 'hardware' ? (document.getElementById('hwModelName')?.value || '').trim() : '',
      hwSpecs: track === 'hardware' ? (document.getElementById('hwSpecs')?.value || '').trim() : '',
      hwDeliveryMethod: track === 'hardware'
        ? (form.querySelector('input[name="hwDeliveryMethod"]:checked')?.value || '')
        : '',
      submissionNotes: (document.getElementById('submissionNotes')?.value || '').trim(),
      officialRecipient: LAB_OFFICIAL_EMAIL
    };

    // 1. 儲存至瀏覽器本地收件紀錄備份
    try {
      const existing = JSON.parse(localStorage.getItem('smarthealth_lab_submissions') || '[]');
      existing.unshift(payload);
      localStorage.setItem('smarthealth_lab_submissions', JSON.stringify(existing.slice(0, 30)));
    } catch (_) {
      // 忽略無痕模式或 Storage 限制
    }

    // 2. 若已設定雲端收件後台 Webhook (Google Apps Script / API)，自動非同步送出以觸發轉信與自動回信
    let webhookDispatched = false;
    if (LAB_SUBMISSION_WEBHOOK_URL) {
      try {
        const res = await fetch(LAB_SUBMISSION_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        webhookDispatched = res.ok;
      } catch (_) {
        webhookDispatched = false;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
    }

    openSubmissionModal(payload, webhookDispatched);
  });

  // 初始化預設顯示
  updateTrackUI('software', 'S2');
}

function escapeHtmlSafe(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function openSubmissionModal(payload, webhookDispatched) {
  const modal = document.getElementById('submissionSuccessModal');
  if (!modal) return;

  const caseIdEl = document.getElementById('receiptCaseId');
  const statusEl = document.getElementById('receiptModalStatus');
  const detailsGrid = document.getElementById('receiptDetailsGrid');
  const nextStepsEl = document.getElementById('receiptNextStepsList');
  const mailtoLink = document.getElementById('receiptMailtoLink');
  const copyBtn = document.getElementById('copyReceiptBtn');

  if (caseIdEl) caseIdEl.textContent = payload.caseId;
  if (statusEl) {
    statusEl.textContent = webhookDispatched
      ? '已同步至雲端後台並寄發確認信'
      : '收件單號已產生 · 可一鍵轉信至官方信箱';
  }

  const targetItemLabel = payload.track === 'software' ? '送檢軟體名稱與版號' : '送檢硬體型號與尺寸';
  const targetItemVal = payload.track === 'software' ? payload.swProductName : payload.hwModelName;
  const specLabel = payload.track === 'software' ? '遵循標準與規格連結' : '硬體配置與進場方式';
  const specVal = payload.track === 'software'
    ? `${payload.swStandards}${payload.swDocUrl ? ` (${payload.swDocUrl})` : ''}`
    : `${payload.hwSpecs} ｜ ${payload.hwDeliveryMethod}`;

  if (detailsGrid) {
    detailsGrid.innerHTML = `
      <div class="receipt-detail-item">
        <span class="receipt-detail-label">收件賽道與檢測等級</span>
        <div class="receipt-detail-val">${escapeHtmlSafe(payload.tierName)}</div>
      </div>
      <div class="receipt-detail-item">
        <span class="receipt-detail-label">申請性質與預估檢測費用</span>
        <div class="receipt-detail-val">${escapeHtmlSafe(payload.applicationNature)}（${escapeHtmlSafe(payload.estimatedFee)}）</div>
      </div>
      <div class="receipt-detail-item">
        <span class="receipt-detail-label">申請機構與統一編號</span>
        <div class="receipt-detail-val">${escapeHtmlSafe(payload.companyName)}（統編：${escapeHtmlSafe(payload.taxId)}）</div>
      </div>
      <div class="receipt-detail-item">
        <span class="receipt-detail-label">專案聯絡人與回覆信箱</span>
        <div class="receipt-detail-val">${escapeHtmlSafe(payload.contactName)} ${escapeHtmlSafe(payload.contactRole)} · ${escapeHtmlSafe(payload.contactEmail)}</div>
      </div>
      <div class="receipt-detail-item full-span">
        <span class="receipt-detail-label">${escapeHtmlSafe(targetItemLabel)}</span>
        <div class="receipt-detail-val">${escapeHtmlSafe(targetItemVal)}</div>
      </div>
      <div class="receipt-detail-item full-span">
        <span class="receipt-detail-label">${escapeHtmlSafe(specLabel)}</span>
        <div class="receipt-detail-val">${escapeHtmlSafe(specVal)}</div>
      </div>
    `;
  }

  if (nextStepsEl) {
    if (payload.track === 'software') {
      nextStepsEl.innerHTML = `
        <p><strong>1. 官方信箱收件與排程回覆：</strong>實驗室收件小組（<code>${LAB_OFFICIAL_EMAIL}</code>）將於收到申請後 <strong>3 個工作天內</strong>，寄發「軟體檢測排程確認單、繳費通知單与沙盒連線憑證」至 <strong>${escapeHtmlSafe(payload.contactEmail)}</strong>。</p>
        <p><strong>2. 第一階段技術驗證準備：</strong>請備妥「廠商自我評估檢核表（Self-Assessment）」、「TW Core IG / TWCDI 欄位對映規格書」與測試環境 Endpoint 或 Docker 容器映像檔。</p>
        <p><strong>3. 第二階段臨床驗證移交：</strong>通過工研院沙盒技術驗證後，實驗室將自動安排長庚醫院或三軍總醫院臨床驗證團隊進行真實 HIS 與虛擬病歷環境測試。</p>
      `;
    } else {
      nextStepsEl.innerHTML = `
        <p><strong>1. 核發設備進場通知單（Lab Entry Ticket）：</strong>實驗室收件小組（<code>${LAB_OFFICIAL_EMAIL}</code>）將於 <strong>3 個工作天內</strong>完成規格初審，並寄發「機房進場通知單、收件地址與繳費單」至 <strong>${escapeHtmlSafe(payload.contactEmail)}</strong>。</p>
        <p><strong>2. 實體伺服器寄送與上架準備：</strong>請於收到進場通知單後，隨箱附上標準 19 吋機櫃滑軌、雙電源線、10GbE/25GbE 光纖模組及預設 BMC/IPMI 與 BIOS 管理帳號密碼。</p>
        <p><strong>3. 7 大指標燒機壓測與 RMA 返還：</strong>設備進場後約 <strong>7～10 個工作天</strong>完成 FHIR Box OS 裸機部署與 10萬～100萬筆病歷高併發壓測；結案後將清除測試資料並通知貴司辦理設備領回。</p>
      `;
    }
  }

  // 組裝結構化文字供複製與官方信箱 mailto 轉發
  const plainTextSummary = [
    `【國家數位健康互通性與效能認證實驗室 — 線上收件申請單】`,
    `收件單號：${payload.caseId}`,
    `申請時間：${payload.submittedAt}`,
    `收件類別：${payload.tierName}`,
    `申請性質：${payload.applicationNature}`,
    `預估費用：${payload.estimatedFee}`,
    `申請公司：${payload.companyName}（統編：${payload.taxId}）`,
    `聯絡窗口：${payload.contactName} / ${payload.contactRole}`,
    `聯絡電話：${payload.contactPhone}`,
    `回覆信箱：${payload.contactEmail}`,
    `${targetItemLabel}：${targetItemVal}`,
    `${specLabel}：${specVal}`,
    `備註說明：${payload.submissionNotes || '無'}`,
    ``,
    `請實驗室收件小組協助回覆相關檢測排程、應備文件與繳費/進場資訊至申請人信箱：${payload.contactEmail}`
  ].join('\n');

  if (mailtoLink) {
    const mailSubject = encodeURIComponent(`[認證實驗室收件申請] ${payload.caseId} - ${payload.companyName} (${payload.tierCode})`);
    const mailBody = encodeURIComponent(plainTextSummary);
    mailtoLink.href = `mailto:${LAB_OFFICIAL_EMAIL}?cc=${encodeURIComponent(payload.contactEmail)}&subject=${mailSubject}&body=${mailBody}`;
  }

  if (copyBtn) {
    copyBtn.textContent = '複製收件憑證摘要';
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(plainTextSummary);
        copyBtn.textContent = '✓ 已複製收件單號與明細';
      } catch (_) {
        copyBtn.textContent = `單號：${payload.caseId}`;
      }
    };
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSubmissionModalDirect() {
  const modal = document.getElementById('submissionSuccessModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function closeSubmissionModal(event) {
  if (event.target && event.target.classList.contains('course-modal-overlay')) {
    closeSubmissionModalDirect();
  }
}



