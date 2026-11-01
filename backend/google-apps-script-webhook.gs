/**
 * 國家數位健康互通性與效能認證實驗室 — 雲端收件後台與自動轉信/回覆腳本 (Google Apps Script)
 *
 * 【部署步驟（約 2 分鐘）】
 * 1. 建立一份新的 Google 試算表 (Google Sheets)，作為「認證實驗室收件管理後台」。
 * 2. 點選上方選單「擴充功能 (Extensions)」>「Apps Script」，將本檔案內容完整貼上。
 * 3. 點選右上角「部署 (Deploy)」>「新增部署作業 (New deployment)」：
 *    - 類型選擇：「網頁應用程式 (Web app)」
 *    - 執行身分：「我 (Me)」
 *    - 誰可以存取：「所有人 (Anyone)」
 * 4. 複製部署後產生的「網頁應用程式網址 (Web App URL)」，填入前端 `js/main.js` 的 `LAB_SUBMISSION_WEBHOOK_URL` 變數即可！
 */

const OFFICIAL_LAB_EMAIL = 'medstandard@itri.org.tw';
const LAB_SHEET_NAME = '軟硬體收件紀錄';

function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(rawBody);

    // 1. 寫入 Google Sheets 輕量收件後台
    recordToSpreadsheet(data);

    // 2. 自動轉發新收件通知信至官方信箱 (medstandard@itri.org.tw)
    sendOfficialNotificationEmail(data);

    // 3. 自動回覆申請廠商「收件確認憑證與後續檢測準備須知信」
    if (data.contactEmail) {
      sendApplicantAutoReplyEmail(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, caseId: data.caseId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function recordToSpreadsheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(LAB_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(LAB_SHEET_NAME);
    sheet.appendRow([
      '收件單號 (Case ID)',
      '審核狀態',
      '收件時間',
      '收件賽道',
      '檢測等級與項目',
      '申請性質',
      '預估檢測費用',
      '申請公司全銜',
      '統一編號',
      '聯絡人姓名',
      '部門與職稱',
      '聯絡人 Email',
      '聯絡電話',
      '送檢軟體名稱 / 硬體型號',
      '技術規格 / 遵循標準 / 進場方式',
      '規格書或測試連結',
      '廠商備註說明'
    ]);
    sheet.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#022964').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  const isSoftware = data.track === 'software';
  const targetName = isSoftware ? data.swProductName : data.hwModelName;
  const targetSpecs = isSoftware
    ? data.swStandards
    : (data.hwSpecs + ' | ' + data.hwDeliveryMethod);

  sheet.appendRow([
    data.caseId || '',
    '待審核排程',
    data.submittedAt || new Date().toISOString(),
    data.trackLabel || data.track || '',
    data.tierName || '',
    data.applicationNature || '',
    data.estimatedFee || '',
    data.companyName || '',
    data.taxId || '',
    data.contactName || '',
    data.contactRole || '',
    data.contactEmail || '',
    data.contactPhone || '',
    targetName || '',
    targetSpecs || '',
    data.swDocUrl || '',
    data.submissionNotes || ''
  ]);
}

function sendOfficialNotificationEmail(data) {
  const isSoftware = data.track === 'software';
  const subject = `[認證實驗室新收件] ${data.caseId} - ${data.companyName} (${data.tierCode})`;
  const body = [
    `國家數位健康互通性與效能認證實驗室 收件小組您好：`,
    ``,
    `系統已收到一筆新的「${data.trackLabel}」線上申請，並已自動寫入雲端收件後台：`,
    `--------------------------------------------------`,
    `• 收件單號：${data.caseId}`,
    `• 申請時間：${data.submittedAt}`,
    `• 收件類別：${data.tierName}`,
    `• 申請性質：${data.applicationNature}`,
    `• 預估費用：${data.estimatedFee}`,
    `• 申請公司：${data.companyName}（統編：${data.taxId}）`,
    `• 聯絡窗口：${data.contactName}（${data.contactRole}）`,
    `• 聯絡電話：${data.contactPhone}`,
    `• 聯絡信箱：${data.contactEmail}`,
    isSoftware
      ? `• 送檢軟體：${data.swProductName}\n• 遵循標準：${data.swStandards}\n• 附件/網址：${data.swDocUrl || '未提供'}`
      : `• 送檢硬體：${data.hwModelName}\n• 硬體配置：${data.hwSpecs}\n• 進場方式：${data.hwDeliveryMethod}`,
    `• 備註說明：${data.submissionNotes || '無'}`,
    `--------------------------------------------------`,
    `系統已同步自動寄發「收件確認憑證與後續檢測準備須知信」予申請廠商（${data.contactEmail}）。`,
    `請專責人員於 3 個工作天內審核並回覆排程與繳費/進場通知單。`
  ].join('\n');

  MailApp.sendEmail({
    to: OFFICIAL_LAB_EMAIL,
    replyTo: data.contactEmail || OFFICIAL_LAB_EMAIL,
    subject: subject,
    body: body
  });
}

function sendApplicantAutoReplyEmail(data) {
  const isSoftware = data.track === 'software';
  const subject = `【收件確認與檢測須知】衛生福利部國家數位健康認證實驗室 — 收件單號 ${data.caseId}`;

  const prepInstructionsHtml = isSoftware
    ? `
      <ol style="line-height:1.7;color:#1e293b;">
        <li><strong>第一階段（工研院沙盒技術驗證）應備文件：</strong>請備妥「廠商自我評估檢核表（Self-Assessment）」、「TW Core IG / TWCDI 欄位對映規格書」及「第三方資安弱點掃描初步報告」。</li>
        <li><strong>測試環境連線準備：</strong>實驗室專責工程師將於 3 個工作天內與您聯繫，確認雲端沙盒 HTTPS Endpoint（含 OAuth 2.0 測試帳號）或 Docker 容器映像檔交付方式。</li>
        <li><strong>第二階段（臨床驗證）：</strong>通過技術驗證後，將移交委託之醫學中心團隊（長庚醫院 / 三軍總醫院等）進行真實 HIS 與虛擬病歷情境實測。</li>
      </ol>
    `
    : `
      <ol style="line-height:1.7;color:#1e293b;">
        <li><strong>核發設備進場通知單（Lab Entry Ticket）：</strong>實驗室將於 3 個工作天內完成規格初審，並寄發正式「機房進場通知單」與指定收件機房地址。<strong>請務必於收到進場單後再行寄出實體設備。</strong></li>
        <li><strong>實體伺服器寄送與配件要求：</strong>寄送時請隨箱附上標準 19 吋機櫃滑軌套件、雙電源線（C13/C14）、對應之 10GbE/25GbE 光纖模組或線材，並提供預設 BMC/IPMI 與 BIOS 管理帳號密碼。</li>
        <li><strong>7 大指標燒機壓測與設備返還：</strong>設備進場後約 7～10 個工作天完成標準版 FHIR Box OS 裸機部署與 10萬～100萬筆病歷壓力測試；結案後實驗室將清除測試資料並通知貴司辦理 RMA 領回。</li>
      </ol>
    `;

  const htmlBody = `
    <div style="font-family:'Noto Sans TC','Microsoft JhengHei',sans-serif;max-width:680px;margin:0 auto;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;">
      <div style="background:#022964;color:#ffffff;padding:24px 28px;">
        <div style="font-size:12px;color:#7dd3fc;font-weight:bold;letter-spacing:1px;">衛生福利部資訊處 · 國家數位健康互通性與效能認證實驗室</div>
        <h2 style="margin:8px 0 4px;font-size:20px;">認證收件申請確認憑證與後續檢測須知</h2>
        <div style="font-size:14px;color:#e2e8f0;">專屬收件單號：<strong>${data.caseId}</strong></div>
      </div>
      <div style="padding:24px 28px;background:#ffffff;color:#1e293b;">
        <p>${data.companyName}（${data.contactName} ${data.contactRole}）您好：</p>
        <p>感謝貴單位申請「國家數位健康互通性與效能認證實驗室」檢測服務。系統已收到您的線上收件申請，以下為您的案件摘要與後續檢測準備事項：</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;width:32%;font-weight:bold;">專屬收件單號</td><td style="padding:8px 12px;border:1px solid #e2e8f0;"><strong>${data.caseId}</strong></td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;">收件賽道與等級</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.tierName}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;">申請性質與預估費用</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.applicationNature}（<strong>${data.estimatedFee}</strong>）</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;">送檢標的</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${isSoftware ? data.swProductName : data.hwModelName}</td></tr>
        </table>
        <h3 style="font-size:16px;color:#022964;border-bottom:2px solid #e0f2fe;padding-bottom:6px;margin-top:24px;">後續檢測準備與收件辦法須知</h3>
        ${prepInstructionsHtml}
        <div style="margin-top:20px;padding:14px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;font-size:13px;color:#0369a1;">
          <strong>實驗室官方聯繫窗口：</strong><br>
          若有任何技術規格補件或排程疑問，請直接回覆本信件（來信請保留收件單號 <code>${data.caseId}</code>）或電洽實驗室專線：(03) 591-9291 / 信箱：${OFFICIAL_LAB_EMAIL}
        </div>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: data.contactEmail,
    replyTo: OFFICIAL_LAB_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

