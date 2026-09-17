// Print, PDF and WhatsApp Helper for Medical Prescriptions and Lab Slips
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

/**
 * Capture an HTML DOM element as a high-resolution PNG image.
 * Uses html-to-image (SVG foreignObject) first to guarantee that Arabic text
 * ligatures and RTL scripts are preserved 100% natively without character splitting.
 * Falls back to html2canvas if needed.
 */
export async function captureElementAsImage(element) {
  if (!element) return null;

  // 1. Primary: html-to-image with high pixelRatio (preserves cursive Arabic letters & RTL)
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: false
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { dataUrl, blob };
  } catch (err) {
    console.warn('html-to-image standard attempt failed, retrying with skipFonts=true:', err);
    try {
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return { dataUrl, blob };
    } catch (err2) {
      console.warn('html-to-image fallback to html2canvas:', err2);
      // Fallback: html2canvas
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
        return { canvas, dataUrl, blob };
      } catch (err3) {
        console.error('All image capture methods failed:', err3);
        return null;
      }
    }
  }
}

/**
 * Copy image blob to system clipboard
 */
export async function copyBlobToClipboard(blob) {
  if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
    return false;
  }
  try {
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Clipboard image write failed:', err);
    return false;
  }
}

/**
 * Download a blob as a PNG file
 */
export function downloadBlobAsFile(blob, filename = 'prescription.png') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Native file sharing (mobile / supported desktops)
 */
export async function shareBlobFile(blob, filename, title = 'الروشتة الطبية', text = '') {
  if (navigator.canShare && typeof File !== 'undefined') {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text
        });
        return true;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share error:', err);
      }
    }
  }
  return false;
}

/**
 * Print HTML content cleanly inside an isolated iframe
 * This completely avoids any parent modal overflow, backdrop-filter,
 * or positioning issues that cause blank print pages.
 */
export function printHtmlContent(htmlContent, title = 'Medical Document', lang = 'ar') {
  // Remove existing print iframes if any
  const existingFrame = document.getElementById('medical-print-frame');
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'medical-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  const isRtl = lang === 'ar';
  const doc = iframe.contentWindow.document;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: ${isRtl 
            ? "'Cairo', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif" 
            : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"};
          color: #0f172a;
          background: #ffffff;
          font-size: 13px;
          line-height: 1.45;
        }
        .print-wrapper {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background: #ffffff;
          padding: 16px;
        }
        .header-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2.5px solid #0284c7;
          padding-bottom: 14px;
          margin-bottom: 14px;
        }
        .header-box.lab-header {
          border-bottom-color: #7c3aed;
        }
        .meta-grid {
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .meta-grid.lab-meta {
          background-color: #faf5ff;
          border-color: #e9d5ff;
        }
        .diagnosis-box {
          margin-bottom: 16px;
          background: #f8fafc;
          border-right: ${isRtl ? '4px solid #0284c7' : 'none'};
          border-left: ${!isRtl ? '4px solid #0284c7' : 'none'};
          padding: 8px 12px;
          border-radius: 4px;
        }
        .rx-symbol {
          font-size: 32px;
          font-weight: 900;
          font-family: serif;
          color: #0284c7;
          margin-bottom: 8px;
        }
        .med-item {
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .instructions-box {
          margin-top: 18px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          border-radius: 6px;
        }
        .footer-box {
          border-top: 2px solid #0284c7;
          padding-top: 14px;
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 11.5px;
        }
        .footer-box.lab-footer {
          border-top-color: #7c3aed;
        }
        .stamp-box {
          text-align: center;
          min-width: 140px;
        }
        .stamp-line {
          font-weight: bold;
          border-top: 1px solid #94a3b8;
          padding-top: 4px;
          margin-top: 28px;
        }
      </style>
    </head>
    <body>
      <div class="print-wrapper">
        ${htmlContent}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Trigger print after styles have painted
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Print iframe error:', e);
      window.print();
    }
  }, 250);
}

/**
 * Format Egyptian or international phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone = '') {
  let cleaned = String(phone).replace(/[^\d+]/g, '');
  if (!cleaned) return '';

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Egyptian format: 010... -> 2010...
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }

  return cleaned;
}

/**
 * Build WhatsApp text for a Prescription
 */
export function buildPrescriptionWhatsAppText(rx, lang = 'ar', clinicPhone = '01012345671') {
  const isAr = lang === 'ar';

  const medList = (rx.medicines || []).map((m, idx) => {
    if (isAr) {
      return `${idx + 1}. *${m.name}* (${m.form || 'علاج'})\n   ▫️ الجرعة: ${m.dosage || 'حسب التوجيه'} ${m.duration ? `• المدة: ${m.duration}` : ''}`;
    } else {
      return `${idx + 1}. *${m.name}* (${m.form || 'Medication'})\n   ▫️ Dosage: ${m.dosage || 'As directed'} ${m.duration ? `• Duration: ${m.duration}` : ''}`;
    }
  }).join('\n\n');

  if (isAr) {
    return `🏥 *Clini-Tech | كليني تك*
✨ *إدارة أسهل.. رعاية أفضل*
📋 *روشتة طبية معتمدة رقم:* ${rx.code || 'RX'}
━━━━━━━━━━━━━━━━━━━━
👤 *المريض:* ${rx.patientName} ${rx.patientCode ? `(كود: ${rx.patientCode})` : ''}
👨‍⚕️ *الطبيب:* ${rx.doctorName}
🩺 *التخصص:* ${rx.clinicName || 'العيادات التخصصية'}
📍 *الفرع:* ${rx.branchName || 'الفرع الرئيسي'}
📅 *التاريخ:* ${rx.date || new Date().toISOString().split('T')[0]}
${rx.diagnosis ? `🔬 *التشخيص:* ${rx.diagnosis}\n` : ''}━━━━━━━━━━━━━━━━━━━━
💊 *الأدوية والعلاج الموصوف (℞):*

${medList}
━━━━━━━━━━━━━━━━━━━━
${rx.instructions ? `💡 *تعليمات الطبيب:*\n${rx.instructions}\n\n` : ''}🗓️ *المتابعة:* ${rx.followUpDate || 'حسب الموعد'}
📞 *للحجز والاستفسار:* ${clinicPhone}

نتمنى لكم دوام الصحة والعافية ✨`;
  } else {
    return `🏥 *Clini-Tech Specialized Clinics*
✨ *Easier Management.. Better Care*
📋 *Official Medical Prescription No:* ${rx.code || 'RX'}
━━━━━━━━━━━━━━━━━━━━
👤 *Patient:* ${rx.patientName} ${rx.patientCode ? `(ID: ${rx.patientCode})` : ''}
👨‍⚕️ *Doctor:* ${rx.doctorName}
🩺 *Clinic:* ${rx.clinicName || 'Specialized Clinic'}
📍 *Branch:* ${rx.branchName || 'Main Center'}
📅 *Date:* ${rx.date || new Date().toISOString().split('T')[0]}
${rx.diagnosis ? `🔬 *Diagnosis:* ${rx.diagnosis}\n` : ''}━━━━━━━━━━━━━━━━━━━━
💊 *Prescribed Medications (℞):*

${medList}
━━━━━━━━━━━━━━━━━━━━
${rx.instructions ? `💡 *Doctor's Instructions:*\n${rx.instructions}\n\n` : ''}🗓️ *Next Follow-up:* ${rx.followUpDate || 'As advised'}
📞 *For Inquiries & Booking:* ${clinicPhone}

Wishing you a speedy recovery ✨`;
  }
}

/**
 * Build WhatsApp text for a Lab Request
 */
export function buildLabWhatsAppText(lab, lang = 'ar', clinicPhone = '01012345671') {
  const isAr = lang === 'ar';
  const testList = (lab.tests || []).map((t, i) => `${i + 1}. *${t}*`).join('\n');

  if (isAr) {
    return `🏥 *Clini-Tech | كليني تك - قسم المختبرات والأشعة*
✨ *إدارة أسهل.. رعاية أفضل*
🧪 *إحالة فحص طبي رقم:* ${lab.code || 'LAB'}
━━━━━━━━━━━━━━━━━━━━
👤 *المريض:* ${lab.patientName}
👨‍⚕️ *الطبيب المحيل:* ${lab.doctorName} (${lab.clinicName})
📅 *التاريخ:* ${lab.date}
⚡ *الأولوية:* ${lab.priority}
━━━━━━━━━━━━━━━━━━━━
🔬 *الفحوصات المطلوبة:*
${testList}
━━━━━━━━━━━━━━━━━━━━
${lab.notes ? `📝 *تعليمات:* ${lab.notes}\n` : ''}📞 *للاستعلام ومواعيد النتائج:* ${clinicPhone}`;
  } else {
    return `🏥 *Clini-Tech - Lab & Radiology Department*
✨ *Easier Management.. Better Care*
🧪 *Referral Order No:* ${lab.code || 'LAB'}
━━━━━━━━━━━━━━━━━━━━
👤 *Patient:* ${lab.patientName}
👨‍⚕️ *Referring Doctor:* ${lab.doctorName} (${lab.clinicName})
📅 *Date:* ${lab.date}
⚡ *Priority:* ${lab.priority}
━━━━━━━━━━━━━━━━━━━━
🔬 *Ordered Tests / Scans:*
${testList}
━━━━━━━━━━━━━━━━━━━━
${lab.notes ? `📝 *Notes:* ${lab.notes}\n` : ''}📞 *Inquiries & Results:* ${clinicPhone}`;
  }
}
