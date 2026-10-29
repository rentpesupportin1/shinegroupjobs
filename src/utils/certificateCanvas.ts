import { CandidateCertificate } from '../types.js';

/**
 * Generates an ultra-premium, high-resolution certificate image (1400x990) purely using native HTML5 Canvas.
 * 100% immune to CSS parsing bugs, cross-origin stylesheet security errors,
 * oklch() color issues, and iframe sandboxing restrictions.
 * Govt Reg No has been removed as requested, and styling elevated to luxury executive standards.
 */
export function generateCertificateDataUrl(certificate: CandidateCertificate): string {
  const width = 1400;
  const height = 990;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // 1. Background Parchment & Luxury Radial Glow
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, width, height);

  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 80,
    width / 2, height / 2, width * 0.72
  );
  radialGradient.addColorStop(0, 'rgba(255, 252, 240, 0.95)');
  radialGradient.addColorStop(0.45, 'rgba(254, 248, 230, 0.55)');
  radialGradient.addColorStop(0.85, 'rgba(250, 243, 224, 0.8)');
  radialGradient.addColorStop(1, 'rgba(244, 234, 210, 0.95)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle Guilloche / Security Lattice line work in corners
  ctx.save();
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 100 + i * 25, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width, 0, 100 + i * 25, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, height, 100 + i * 25, Math.PI * 1.5, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width, height, 100 + i * 25, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Heavy Royal Obsidian Outer Border
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#0b1329';
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 3. Inner Double Gold Ornamental Borders
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#b45309'; // Rich amber/gold
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#d97706';
  ctx.strokeRect(43, 43, width - 86, height - 86);

  // Fine inner accent border
  ctx.lineWidth = 0.75;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.strokeRect(52, 52, width - 104, height - 104);

  // Luxury Ornate Corner Accents
  const cornerSize = 34;
  const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(x, y + dirY * cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dirX * cornerSize, y);
    ctx.stroke();

    // Secondary inner corner bracket
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(x + dirX * 6, y + dirY * (cornerSize - 6));
    ctx.lineTo(x + dirX * 6, y + dirY * 6);
    ctx.lineTo(x + dirX * (cornerSize - 6), y + dirY * 6);
    ctx.stroke();

    // Gold diamond floret at corner
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    const cx = x + dirX * 12;
    const cy = y + dirY * 12;
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 6, cy);
    ctx.lineTo(cx, cy + 6);
    ctx.lineTo(cx - 6, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  drawCorner(43, 43, 1, 1);
  drawCorner(width - 43, 43, -1, 1);
  drawCorner(43, height - 43, 1, -1);
  drawCorner(width - 43, height - 43, -1, -1);

  // 4. Subtle Background Security Watermark (NO Govt Reg No)
  ctx.save();
  ctx.font = 'bold 88px Georgia, serif';
  ctx.fillStyle = 'rgba(11, 19, 41, 0.03)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SHINE GROUP JOBS', width / 2, height / 2 - 25);
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('ISO 9001:2015 CERTIFIED', width / 2, height / 2 + 55);
  ctx.restore();

  // 5. Header Top Meta Information (Govt Reg No completely removed)
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#991b1b'; // Red / Crimson accreditation
  ctx.fillText('Accreditation: ISO 9001:2015 Certified', 75, 80);
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Corporate Reg: Skill Development & Placement Council', 75, 99);

  // Right Meta: Unique Certificate ID
  ctx.textAlign = 'right';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Unique Certificate ID:', width - 75, 80);
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(certificate.certificateNumber, width - 75, 100);

  // Top Divider line
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.moveTo(75, 118);
  ctx.lineTo(width - 75, 118);
  ctx.stroke();

  // 6. Organization Title & Branding
  ctx.textAlign = 'center';
  ctx.font = '900 38px Georgia, serif';
  ctx.fillStyle = '#090e1a';
  ctx.fillText('SHINE GROUP JOBS & PLACEMENT', width / 2, 166);

  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#78350f';
  ctx.fillText('RECRUITMENT, SKILL DEVELOPMENT & PLACEMENT AGENCY • JABALPUR (EST. 2002)', width / 2, 192);

  // Gold accent under header with floret
  const accentGrad = ctx.createLinearGradient(width / 2 - 160, 202, width / 2 + 160, 202);
  accentGrad.addColorStop(0, 'rgba(180, 83, 9, 0)');
  accentGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.85)');
  accentGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(width / 2 - 160, 202, 320, 2.5);

  // Small stars next to accent line
  ctx.font = '10px serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText('★   ★   ★', width / 2, 216);

  // 7. Certificate Type Badge / Banner
  const badgeText = certificate.certificateType.toUpperCase();
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  const badgeMetrics = ctx.measureText(badgeText);
  const badgeWidth = Math.max(360, badgeMetrics.width + 70);
  const badgeHeight = 36;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 228;

  // Navy pill with gold rim
  ctx.fillStyle = '#0b1329';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 18);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d97706';
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, width / 2, badgeY + 23);

  // 8. Body Text: Recipient & Qualification Details
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('This is to certify that', width / 2, 298);

  // Candidate Name (Grand Executive Serif)
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillStyle = '#050914';
  ctx.fillText(certificate.candidateName, width / 2, 346);

  // Name underline flourish
  const nameMetrics = ctx.measureText(certificate.candidateName);
  const lineW = Math.min(nameMetrics.width + 60, width - 240);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
  ctx.beginPath();
  ctx.moveTo(width / 2 - lineW / 2, 358);
  ctx.lineTo(width / 2 + lineW / 2, 358);
  ctx.stroke();

  // Father / Guardian's Name
  let currentY = 384;
  if (certificate.fatherName) {
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Son / Daughter / Ward of ${certificate.fatherName}`, width / 2, currentY);
    currentY += 32;
  } else {
    currentY += 16;
  }

  // Certification Statement
  ctx.font = '17px Georgia, serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('has successfully fulfilled all prescribed requirements, evaluation benchmarks, and training curriculum for', width / 2, currentY);
  currentY += 34;

  // Course / Role Title (Bold & Colored)
  ctx.font = 'bold 23px Georgia, serif';
  ctx.fillStyle = '#0b1329';
  ctx.fillText(certificate.courseOrRole, width / 2, currentY);

  // Underline for Course/Role
  const courseMetrics = ctx.measureText(certificate.courseOrRole);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(width / 2 - courseMetrics.width / 2, currentY + 5);
  ctx.lineTo(width / 2 + courseMetrics.width / 2, currentY + 5);
  ctx.stroke();
  currentY += 35;

  ctx.font = '17px Georgia, serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`conducted through Shine Group Placement Center over the period of ${certificate.duration}.`, width / 2, currentY);
  currentY += 38;

  // Grade Box if available
  if (certificate.grade) {
    const gradeText = `★  Performance Evaluation: ${certificate.grade}  ★`;
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    const gradeMetrics = ctx.measureText(gradeText);
    const gBoxW = gradeMetrics.width + 44;
    const gBoxH = 32;
    const gBoxX = (width - gBoxW) / 2;

    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(gBoxX, currentY, gBoxW, gBoxH, 8);
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.textAlign = 'center';
    ctx.fillText(gradeText, width / 2, currentY + 21);
  }

  // 9. Watermark if NOT Approved
  if (certificate.status !== 'Approved') {
    ctx.save();
    ctx.translate(width / 2, height / 2 + 30);
    ctx.rotate(-0.35);
    ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
    ctx.textAlign = 'center';
    ctx.fillText('PENDING ADMIN APPROVAL', 0, 0);

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.28)';
    ctx.setLineDash([16, 10]);
    ctx.strokeRect(-360, -45, 720, 70);
    ctx.restore();
  }

  // 10. Footer Section Divider
  const footerY = height - 192;
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.moveTo(75, footerY);
  ctx.lineTo(width - 75, footerY);
  ctx.stroke();

  // 11. Footer Left: Issue Date & Verification ID
  ctx.textAlign = 'left';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Issue Date:', 75, footerY + 36);
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(certificate.issueDate || certificate.requestedDate, 160, footerY + 36);

  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Mahanadda, Jabalpur (M.P.) - 482001', 75, footerY + 60);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Verification ID: ${certificate.id}`, 75, footerY + 82);

  // 12. Footer Center: Gold Seal Medallion
  const sealX = width / 2;
  const sealY = footerY + 54;
  const sealRadius = 48;

  // Starburst teeth behind seal
  ctx.save();
  ctx.translate(sealX, sealY);
  ctx.fillStyle = '#b45309';
  for (let s = 0; s < 24; s++) {
    ctx.rotate((Math.PI * 2) / 24);
    ctx.fillRect(-3, -sealRadius - 4, 6, 8);
  }
  ctx.restore();

  // Medallion Gold Gradient
  const sealGrad = ctx.createRadialGradient(sealX - 14, sealY - 14, 5, sealX, sealY, sealRadius);
  sealGrad.addColorStop(0, '#fef08a');
  sealGrad.addColorStop(0.45, '#f59e0b');
  sealGrad.addColorStop(1, '#92400e');

  ctx.beginPath();
  ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
  ctx.fillStyle = sealGrad;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#78350f';
  ctx.stroke();

  // Inner Ring
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealRadius - 6, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.stroke();

  // Seal Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3a1a00';
  ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SHINE GROUP', sealX, sealY - 18);
  ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('★ ISO 9001:2015 ★', sealX, sealY - 6);
  ctx.font = '900 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VERIFIED', sealX, sealY + 12);
  ctx.font = 'bold 7px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VERIFIED SEAL', sealX, sealY + 25);

  ctx.font = '11px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('admin@shinegroupjob.com', sealX, footerY + 120);

  // 13. Footer Right: Signature Designation
  ctx.textAlign = 'right';
  ctx.font = 'italic bold 23px Georgia, serif';
  ctx.fillStyle = '#1e3a8a';
  const signatoryName = certificate.approvedBy ? certificate.approvedBy.split(',')[0] : 'Director of Placement';
  ctx.fillText(signatoryName, width - 75, footerY + 36);

  // Signature Underline
  ctx.beginPath();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#0f172a';
  ctx.moveTo(width - 275, footerY + 44);
  ctx.lineTo(width - 75, footerY + 44);
  ctx.stroke();

  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Placement Director', width - 75, footerY + 64);

  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(certificate.signatoryTitle || 'Shine Group Jobs Jabalpur', width - 75, footerY + 82);

  // 14. Bottom Security Disclaimer
  ctx.textAlign = 'center';
  ctx.font = '10px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `This document is an authentic certified digital issuance by Shine Group Jobs & Placement, Jabalpur. Online verification: Unique Cert No. ${certificate.certificateNumber}`,
    width / 2,
    height - 52
  );

  return canvas.toDataURL('image/png', 1.0);
}
