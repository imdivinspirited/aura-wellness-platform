/**
 * Resume PDF — dynamic page size, margins, fonts, alignment (PDFKit).
 */
import PDFDocument from 'pdfkit';

function parseHex(hex, fallback = '#0f172a') {
  if (typeof hex !== 'string') return fallback;
  const s = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^#[0-9A-Fa-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return fallback;
}

function mmToPt(mm) {
  const n = Number(mm);
  if (Number.isNaN(n)) return 48;
  return (Math.min(45, Math.max(4, n)) * 72) / 25.4;
}

function typoScale(key) {
  const t = String(key || 'standard');
  if (t === 'large') return { name: 22, headline: 11.5, section: 11, body: 10.5, meta: 9, small: 8.5, bullet: 10 };
  if (t === 'compact') return { name: 17, headline: 9.5, section: 9.5, body: 9, meta: 8, small: 7.5, bullet: 8.5 };
  return { name: 20, headline: 10.5, section: 10.5, body: 10, meta: 8.5, small: 8, bullet: 9.5 };
}

function scaleTy(ty, fontScale) {
  const s = Number(fontScale) > 0 ? Number(fontScale) : 1;
  const o = {};
  for (const k of Object.keys(ty)) o[k] = Math.round(ty[k] * s * 20) / 20;
  return o;
}

function getPdfFonts(family) {
  const f = String(family || 'Helvetica');
  if (f === 'Times-Roman') return { regular: 'Times-Roman', bold: 'Times-Bold' };
  if (f === 'Courier') return { regular: 'Courier', bold: 'Courier-Bold' };
  return { regular: 'Helvetica', bold: 'Helvetica-Bold' };
}

function gap(doc, layoutDensity, base, sectionGapScale) {
  const sg = Number(sectionGapScale) > 0 ? Number(sectionGapScale) : 1;
  const d = layoutDensity === 'compact' ? base * 0.72 : base;
  doc.moveDown(d * sg);
}

function sectionTitle(doc, title, accent, ruleStyle, ty, ld, sg, fonts, sectionAlign, lhs) {
  const align = sectionAlign === 'center' ? 'center' : 'left';
  const left = doc.page.margins?.left ?? 48;
  const right = doc.page.width - (doc.page.margins?.right ?? 48);
  doc
    .font(fonts.bold)
    .fontSize(ty.section)
    .fillColor(accent)
    .text(String(title).toUpperCase(), { lineGap: 2 * lhs, align });
  gap(doc, ld, 0.12, sg);
  if (ruleStyle !== 'none') {
    const y = doc.y;
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .lineWidth(0.85)
      .strokeColor(ruleStyle === 'accent' ? accent : '#d4d4d8')
      .stroke();
  }
  gap(doc, ld, 0.28, sg);
  doc.fillColor('#1a1a1a').font(fonts.regular);
}

function ensureSpace(doc, minBottom = 72) {
  if (doc.y > doc.page.height - minBottom) doc.addPage();
}

function drawTopAccentBar(doc, accent) {
  const w = doc.page.width || 595.28;
  doc.save();
  doc.rect(0, 0, w, 6).fill(accent);
  doc.restore();
}

function drawTemplateFlourish(doc, template, accent, _pageIndex, topPad) {
  if (template !== 'accent') return;
  doc.save();
  const left = doc.page.margins?.left ?? 48;
  const y0 = Math.max(48, topPad || 52);
  doc.rect(left - 2, y0, 3, 120).fill(accent);
  doc.restore();
}

function drawFooters(doc, resume, range, pageSizeLabel) {
  if (resume.layout?.showPageNumbersInPdf === false) return;
  const total = range.count;
  for (let i = 0; i < total; i++) {
    doc.switchToPage(range.start + i);
    const ph = doc.page.height;
    const pw = doc.page.width;
    const ml = doc.page.margins?.left ?? 48;
    const mr = doc.page.margins?.right ?? 48;
    const bottom = ph - 28;
    doc.save();
    doc.font('Helvetica').fontSize(7.5).fillColor('#a1a1aa');
    doc.text(`Page ${i + 1} of ${total}  ·  ${pageSizeLabel}`, ml, bottom, {
      width: pw - ml - mr,
      align: 'center',
    });
    doc.restore();
  }
}

function headerAlignPdf(layout) {
  const h = layout?.headerTextAlign;
  if (h === 'left' || h === 'center' || h === 'right') return h;
  return 'center';
}

export function pipeResumeA4Pdf(res, { user, details, resume, achievements }) {
  const layout = resume.layout || {};
  const accent = parseHex(layout.accentColor);
  const ruleStyle = ['none', 'accent', 'full'].includes(layout.ruleStyle) ? layout.ruleStyle : 'accent';
  const template = ['classic', 'compact', 'accent'].includes(layout.template) ? layout.template : 'classic';
  const ty0 = typoScale(layout.pdfTypography);
  const ty = scaleTy(ty0, layout.fontScale ?? 1);
  const layoutDensity = layout.density === 'compact' ? 'compact' : 'comfortable';
  const sg = layout.sectionGapScale ?? 1;
  const lhs = layout.lineHeightScale ?? 1.35;
  const fonts = getPdfFonts(layout.pdfFontFamily);
  const bodyAlign = ['left', 'center', 'justify'].includes(layout.bodyTextAlign) ? layout.bodyTextAlign : 'left';
  const hAlign = headerAlignPdf(layout);
  const sectionAlign = layout.sectionTitleAlign === 'center' ? 'center' : 'left';
  const pageKey = ['A4', 'LETTER', 'LEGAL', 'A3'].includes(layout.pageSize) ? layout.pageSize : 'A4';
  const mm = layout.marginMm || { top: 16, right: 16, bottom: 16, left: 16 };
  const mt = mmToPt(mm.top);
  const mr = mmToPt(mm.right);
  const mb = mmToPt(mm.bottom);
  const ml = mmToPt(mm.left);
  const padPt = mmToPt(layout.contentPaddingMm ?? 10) * 0.35;
  const pageLabel =
    pageKey === 'LETTER'
      ? 'US Letter'
      : pageKey === 'LEGAL'
        ? 'US Legal'
        : pageKey === 'A3'
          ? 'ISO A3'
          : 'ISO A4';

  const doc = new PDFDocument({
    size: pageKey,
    margins: { top: mt + padPt * 0.5, bottom: mb + 8, left: ml + padPt * 0.25, right: mr + padPt * 0.25 },
    bufferPages: true,
    info: {
      Title: `Resume — ${String((resume.fullName && String(resume.fullName).trim()) || user.name || 'Candidate').trim()}`,
      Author: String((resume.fullName && String(resume.fullName).trim()) || user.name || '').trim(),
      Subject: 'Professional Resume',
      Keywords: `resume, CV, ${pageKey}, Aura`,
      Creator: 'Aura Resume Studio',
    },
    autoFirstPage: true,
  });

  doc.pipe(res);

  drawTopAccentBar(doc, accent);
  drawTemplateFlourish(doc, template, accent, 0, mt + 4);

  const name =
    String((resume.fullName && String(resume.fullName).trim()) || user.name || 'Resume').trim() || 'Resume';
  doc.font(fonts.bold).fontSize(ty.name + (layout.headerStyle === 'minimal' ? 0 : 0)).fillColor('#0f172a').text(name, {
    align: hAlign,
  });
  gap(doc, layoutDensity, layout.headerStyle === 'minimal' ? 0.35 : 0.28, sg);

  if (resume.headline && resume.visibility.headline) {
    doc
      .font(fonts.regular)
      .fontSize(ty.headline)
      .fillColor('#475569')
      .text(resume.headline, { align: hAlign, lineGap: 2 * lhs });
    gap(doc, layoutDensity, 0.35, sg);
  }

  const contactBits = [user.email, user.phone, details?.whatsapp].filter(Boolean);
  const socialLine = resume.visibility.social
    ? [
        resume.social.linkedin,
        resume.social.github,
        resume.social.portfolio,
        resume.social.twitter,
        resume.social.other,
      ]
        .map((u) => String(u || '').trim())
        .filter(Boolean)
    : [];
  const line1 = [...contactBits, ...socialLine.slice(0, 6)].filter(Boolean);
  if (line1.length) {
    doc
      .font(fonts.regular)
      .fontSize(ty.small)
      .fillColor('#64748b')
      .text(line1.join('  ·  '), { align: hAlign, lineGap: 1 * lhs });
    gap(doc, layoutDensity, 0.45, sg);
  }

  const lx = doc.page.margins?.left ?? 48;
  const rx = doc.page.width - (doc.page.margins?.right ?? 48);
  doc.moveTo(lx, doc.y).lineTo(rx, doc.y).lineWidth(0.6).strokeColor('#e4e4e7').stroke();
  gap(doc, layoutDensity, 0.55, sg);

  if (resume.summary && resume.visibility.summary) {
    ensureSpace(doc, 100);
    sectionTitle(doc, 'Professional summary', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    doc
      .font(fonts.regular)
      .fontSize(ty.body)
      .fillColor('#334155')
      .text(resume.summary, { align: bodyAlign, lineGap: 3 * lhs });
    gap(doc, layoutDensity, 0.65, sg);
  }

  if (resume.experience?.length && resume.visibility.experience) {
    ensureSpace(doc, 80);
    sectionTitle(doc, 'Experience', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    for (const ex of resume.experience) {
      ensureSpace(doc, 110);
      const hdr = [ex.title, ex.company].filter(Boolean).join(' — ');
      doc.font(fonts.bold).fontSize(ty.body + 0.5).fillColor('#0f172a').text(hdr || 'Role', { align: bodyAlign });
      const dates = [ex.start, ex.end || (ex.current ? 'Present' : '')].filter(Boolean).join(' – ');
      const sub = [dates, ex.location].filter(Boolean).join('  ·  ');
      if (sub) doc.font(fonts.regular).fontSize(ty.meta).fillColor('#64748b').text(sub, { align: bodyAlign });
      doc.fillColor('#334155');
      if (ex.summary) {
        gap(doc, layoutDensity, 0.12, sg);
        doc.font(fonts.regular).fontSize(ty.small).text(ex.summary, { align: bodyAlign, lineGap: 2 * lhs });
      }
      if (ex.bullets?.length) {
        for (const b of ex.bullets) {
          doc
            .font(fonts.regular)
            .fontSize(ty.bullet)
            .fillColor('#334155')
            .text(`•  ${b}`, { indent: 12, lineGap: 2 * lhs, align: bodyAlign });
        }
      }
      gap(doc, layoutDensity, 0.42, sg);
    }
    gap(doc, layoutDensity, 0.15, sg);
  }

  if (resume.education?.length && resume.visibility.education) {
    ensureSpace(doc, 80);
    sectionTitle(doc, 'Education', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    for (const ed of resume.education) {
      ensureSpace(doc, 72);
      doc
        .font(fonts.bold)
        .fontSize(ty.body)
        .fillColor('#0f172a')
        .text([ed.degree, ed.field].filter(Boolean).join(' — ') || ed.school, { align: bodyAlign });
      doc
        .font(fonts.regular)
        .fontSize(ty.meta)
        .fillColor('#64748b')
        .text([ed.school, [ed.start, ed.end].filter(Boolean).join(' – ')].filter(Boolean).join('  ·  '), {
          align: bodyAlign,
        });
      if (ed.details) doc.font(fonts.regular).fontSize(ty.small).fillColor('#475569').text(ed.details, { lineGap: 2 * lhs, align: bodyAlign });
      if (ed.extras) doc.font(fonts.regular).fontSize(ty.small).fillColor('#64748b').text(ed.extras, { align: bodyAlign });
      gap(doc, layoutDensity, 0.35, sg);
    }
    gap(doc, layoutDensity, 0.15, sg);
  }

  if (resume.projects?.length && resume.visibility.projects) {
    ensureSpace(doc, 80);
    sectionTitle(doc, 'Projects', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    for (const p of resume.projects) {
      ensureSpace(doc, 70);
      doc.font(fonts.bold).fontSize(ty.body).fillColor('#0f172a').text(p.name || 'Project', { align: bodyAlign });
      if (p.url) doc.font(fonts.regular).fontSize(ty.meta).fillColor('#2563eb').text(p.url, { align: bodyAlign });
      doc.fillColor('#334155');
      if (p.summary) doc.font(fonts.regular).fontSize(ty.small).text(p.summary, { lineGap: 2 * lhs, align: bodyAlign });
      if (p.highlights?.length) {
        for (const h of p.highlights) {
          doc.font(fonts.regular).fontSize(ty.small).text(`•  ${h}`, { indent: 12, align: bodyAlign });
        }
      }
      gap(doc, layoutDensity, 0.32, sg);
    }
    gap(doc, layoutDensity, 0.15, sg);
  }

  if (resume.certifications?.length && resume.visibility.certifications) {
    ensureSpace(doc, 70);
    sectionTitle(doc, 'Certifications', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    for (const c of resume.certifications) {
      ensureSpace(doc, 48);
      doc.font(fonts.bold).fontSize(ty.body).fillColor('#0f172a').text(c.name || 'Certification', { align: bodyAlign });
      const bits = [c.issuer, c.date, c.credentialId].filter(Boolean).join('  ·  ');
      if (bits) doc.font(fonts.regular).fontSize(ty.meta).fillColor('#64748b').text(bits, { align: bodyAlign });
      gap(doc, layoutDensity, 0.28, sg);
    }
    gap(doc, layoutDensity, 0.15, sg);
  }

  if (resume.languages?.length && resume.visibility.languages) {
    ensureSpace(doc, 56);
    sectionTitle(doc, 'Languages', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    doc
      .font(fonts.regular)
      .fontSize(ty.body)
      .fillColor('#334155')
      .text(
        resume.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join('  ·  '),
        { lineGap: 2 * lhs, align: bodyAlign }
      );
    gap(doc, layoutDensity, 0.5, sg);
  }

  if (resume.skillGroups?.length && resume.visibility.skills) {
    ensureSpace(doc, 56);
    sectionTitle(doc, 'Skills', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    for (const g of resume.skillGroups) {
      if (g.items?.length) {
        doc.font(fonts.bold).fontSize(ty.small).fillColor('#0f172a').text(`${g.label}: `, { continued: true });
        doc.font(fonts.regular).fontSize(ty.body).fillColor('#334155').text(g.items.join(', '), { lineGap: 2 * lhs, align: bodyAlign });
        gap(doc, layoutDensity, 0.2, sg);
      }
    }
    gap(doc, layoutDensity, 0.25, sg);
  } else if (details?.skills && resume.visibility.skills) {
    ensureSpace(doc, 56);
    sectionTitle(doc, 'Skills', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    doc.font(fonts.regular).fontSize(ty.body).fillColor('#334155').text(String(details.skills), { lineGap: 2 * lhs, align: bodyAlign });
    gap(doc, layoutDensity, 0.5, sg);
  }

  if (details && resume.visibility.profileDetails) {
    ensureSpace(doc, 72);
    sectionTitle(doc, 'Profile', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    doc.font(fonts.regular).fontSize(ty.body).fillColor('#334155');
    const loc = [details.city, details.state, details.country].filter(Boolean).join(', ');
    if (loc) doc.text(`Location: ${loc}`, { lineGap: 2 * lhs, align: bodyAlign });
    if (details.age != null) doc.text(`Age: ${details.age}`, { lineGap: 2 * lhs, align: bodyAlign });
    if (details.gender) doc.text(`Gender: ${details.gender}`, { lineGap: 2 * lhs, align: bodyAlign });
    if (details.education && !resume.education?.length) doc.text(`Education: ${details.education}`, { lineGap: 2 * lhs, align: bodyAlign });
    if (details.available_from) {
      const d = details.available_from instanceof Date ? details.available_from : new Date(details.available_from);
      if (!Number.isNaN(d.getTime())) doc.text(`Available from: ${d.toISOString().slice(0, 10)}`, { lineGap: 2 * lhs, align: bodyAlign });
    }
    if (details.duration) doc.text(`Duration: ${details.duration}`, { lineGap: 2 * lhs, align: bodyAlign });
    gap(doc, layoutDensity, 0.45, sg);
  }

  if (resume.customSections?.length && resume.visibility.custom) {
    for (const cs of resume.customSections) {
      if (!cs.title && !cs.body) continue;
      ensureSpace(doc, 72);
      sectionTitle(doc, cs.title || 'Section', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
      if (cs.body) doc.font(fonts.regular).fontSize(ty.body).fillColor('#334155').text(cs.body, { lineGap: 3 * lhs, align: bodyAlign });
      gap(doc, layoutDensity, 0.45, sg);
    }
  }

  if (achievements.length && resume.visibility.achievements) {
    ensureSpace(doc, 72);
    sectionTitle(doc, 'Achievements', accent, ruleStyle, ty, layoutDensity, sg, fonts, sectionAlign, lhs);
    for (const a of achievements) {
      const t = a.title || 'Achievement';
      doc.font(fonts.bold).fontSize(ty.body).fillColor('#334155').text(`•  ${t}`, { lineGap: 2 * lhs, align: bodyAlign });
      if (a.description) {
        doc.font(fonts.regular).fontSize(ty.small).fillColor('#64748b').text(String(a.description), { indent: 14, lineGap: 2 * lhs, align: bodyAlign });
      }
      gap(doc, layoutDensity, 0.22, sg);
    }
  }

  const range = doc.bufferedPageRange();
  drawFooters(doc, resume, range, pageLabel);
  doc.end();
}
