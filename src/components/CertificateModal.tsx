import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Award, 
  ShieldCheck, 
  QrCode, 
  Download,
  Building2,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { CandidateCertificate } from '../types.js';
import { generateCertificateDataUrl } from '../utils/certificateCanvas.js';

interface CertificateModalProps {
  certificate: CandidateCertificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(certificate.certificateNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    try {
      setDownloading(true);
      const element = certRef.current;
      
      let dataUrl: string;
      try {
        // Use html-to-image with skipFonts: true to prevent SecurityError from remote Google Fonts stylesheets
        dataUrl = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#fffdf9',
          cacheBust: false,
          skipFonts: true,
        });
      } catch (domCaptureErr) {
        // High-res native Canvas 2D fallback: completely immune to stylesheet security & CSS errors
        console.warn('DOM screenshot skipped external stylesheet, using high-res Canvas generator:', domCaptureErr);
        dataUrl = generateCertificateDataUrl(certificate);
      }

      const fileName = `Shine_Group_Certificate_${certificate.certificateNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.warn('Direct image export fallback to print dialog:', err);
      // Fallback directly to high-res browser print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const isApproved = certificate.status === 'Approved';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-wide">Verified Certificate Document</span>
              <span className="ml-2 text-[11px] sm:text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                {certificate.certificateNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              title="Copy Unique Certificate Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy No.'}</span>
            </button>

            {/* Direct Download Button */}
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 ${
                downloadSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
              }`}
              title="Download High-Resolution Certificate Image (PNG)"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Saved PNG</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              )}
            </button>

            {isApproved && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Alert if Pending or Rejected (Hidden in print) */}
        {!isApproved && (
          <div className={`px-4 sm:px-6 py-2.5 text-xs font-medium border-b flex items-center justify-between print:hidden ${
            certificate.status === 'Pending Approval' 
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                {certificate.status === 'Pending Approval' 
                  ? 'This certificate is currently PENDING ADMIN APPROVAL. The preview watermark will remain until Shine Group Admin approves and issues it.'
                  : `Certificate Request Rejected: ${certificate.rejectionReason || 'Details could not be verified'}`}
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-white border border-amber-300 shrink-0 ml-2">
              {certificate.status}
            </span>
          </div>
        )}

        {/* Certificate Printable Canvas Wrapper */}
        <div className="p-2 sm:p-5 md:p-6 bg-slate-200/80 overflow-x-auto print:p-0 print:bg-white flex justify-center">
          
          {/* Main Certificate Card with all details strictly contained within borders */}
          <div 
            ref={certRef}
            className="relative bg-[#fffdf9] text-slate-900 w-full max-w-[850px] p-5 sm:p-8 md:p-10 shadow-2xl border-[8px] sm:border-[10px] border-[#0b1329] rounded-xs flex flex-col justify-between box-border overflow-hidden print:shadow-none print:border-8 print:w-full print:m-0"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(255, 252, 240, 0.95) 0%, rgba(254, 248, 230, 0.6) 50%, rgba(246, 238, 218, 0.95) 100%)'
            }}
          >
            {/* Ornamental Inner Double Gold Borders */}
            <div className="absolute inset-2 sm:inset-3 border-2 border-amber-600/80 pointer-events-none flex flex-col justify-between p-1 z-0">
              <div className="flex justify-between w-full">
                <div className="w-6 h-6 border-t-2 border-l-2 border-amber-800 relative">
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-amber-600/70 rotate-45"></div>
                </div>
                <div className="w-6 h-6 border-t-2 border-r-2 border-amber-800 relative">
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-600/70 rotate-45"></div>
                </div>
              </div>
              <div className="flex justify-between w-full">
                <div className="w-6 h-6 border-b-2 border-l-2 border-amber-800 relative">
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-amber-600/70 rotate-45"></div>
                </div>
                <div className="w-6 h-6 border-b-2 border-r-2 border-amber-800 relative">
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-amber-600/70 rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Fine Inner Gold Inset Line */}
            <div className="absolute inset-3.5 sm:inset-5 border border-amber-500/30 pointer-events-none z-0"></div>

            {/* Faint Background Security Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
              <img
                src="/shine_group_logo.png"
                alt=""
                className="w-80 sm:w-96 h-auto grayscale"
              />
            </div>

            {/* Pending Watermark Overlay if not yet approved */}
            {!isApproved && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                <div className="rotate-[-22deg] border-4 border-dashed border-amber-500/60 bg-amber-100/85 backdrop-blur-[2px] px-8 py-3 rounded-xl text-amber-900 font-black text-xl sm:text-2xl md:text-3xl tracking-widest uppercase shadow-xl">
                  Pending Admin Approval
                </div>
              </div>
            )}

            {/* Inner Content Structure strictly kept inside */}
            <div className="relative z-10 flex flex-col justify-between gap-3 sm:gap-4 h-full">

              {/* 1. Header Area with Accreditation & Unique Cert ID (Govt Reg No removed) */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-between border-b border-amber-600/30 pb-2 px-1 sm:px-3">
                  <div className="text-left text-[9px] sm:text-[11px] font-semibold text-slate-600 space-y-0.5 leading-tight">
                    <div className="flex items-center gap-1 text-red-700 font-bold tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                      ISO 9001:2015 Certified
                    </div>
                    <div className="text-slate-500 text-[8.5px] sm:text-[10px] tracking-wide">
                      Skill Development & Placement Council
                    </div>
                  </div>

                  {/* Centered Crest Logo */}
                  <div className="flex items-center justify-center px-2">
                    <div className="h-10 sm:h-12 w-auto bg-[#c40011] rounded-xl p-1.5 border-2 border-amber-400/80 shadow-md flex items-center justify-center">
                      <img
                        src="/shine_group_logo.png"
                        alt="Shine Group Jobs"
                        className="h-full w-auto object-contain drop-shadow"
                      />
                    </div>
                  </div>

                  {/* Right: Unique Verifiable Credential ID */}
                  <div className="text-right text-[9px] sm:text-[11px] font-semibold text-slate-600 space-y-0.5 leading-tight">
                    <div className="text-slate-500 text-[8.5px] sm:text-[10px] uppercase tracking-wider font-bold">
                      Unique Cert ID
                    </div>
                    <div className="font-mono font-bold text-slate-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-400 shadow-2xs inline-block text-[10px] sm:text-xs">
                      {certificate.certificateNumber}
                    </div>
                  </div>
                </div>

                {/* Organization Title */}
                <div className="pt-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-[#0b1329] font-serif uppercase leading-tight">
                    SHINE GROUP JOBS & PLACEMENT
                  </h1>
                  <p className="text-[10px] sm:text-xs text-amber-900 font-bold tracking-wider sm:tracking-widest uppercase mt-0.5">
                    Recruitment, Skill Development & Placement Agency • Jabalpur (Est. 2002)
                  </p>
                  
                  {/* Ornate Gold Divider */}
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <div className="w-16 sm:w-28 h-0.5 bg-gradient-to-r from-transparent to-amber-600"></div>
                    <span className="text-amber-700 text-xs tracking-widest">★ ★ ★</span>
                    <div className="w-16 sm:w-28 h-0.5 bg-gradient-to-l from-transparent to-amber-600"></div>
                  </div>
                </div>
              </div>

              {/* 2. Certificate Type Badge / Ribbon */}
              <div className="text-center my-0.5 sm:my-1">
                <div className="inline-block bg-[#0b1329] text-amber-300 px-6 sm:px-10 py-1.5 rounded-full border-2 border-amber-500 shadow-md">
                  <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-widest uppercase">
                    {certificate.certificateType.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 3. Body Text & Candidate Details */}
              <div className="text-center space-y-2.5 sm:space-y-3.5 px-2 sm:px-6 md:px-10">
                <p className="text-xs sm:text-sm text-slate-600 italic font-serif">
                  This is to certify that
                </p>

                {/* Candidate Name in Grand Executive Serif */}
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0b1329] font-serif tracking-wide border-b-2 border-amber-600/60 inline-block px-5 pb-1 max-w-full break-words">
                    {certificate.candidateName}
                  </div>
                  {certificate.fatherName && (
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium pt-1">
                      Son / Daughter / Ward of <span className="text-slate-900 font-bold">{certificate.fatherName}</span>
                    </p>
                  )}
                </div>

                {/* Certification Statement */}
                <p className="text-xs sm:text-[13.5px] leading-relaxed text-slate-800 max-w-2xl mx-auto font-serif">
                  has successfully fulfilled all prescribed requirements, evaluation benchmarks, and training curriculum for{' '}
                  <strong className="text-[#0b1329] font-bold underline decoration-amber-600 underline-offset-4">
                    {certificate.courseOrRole}
                  </strong>{' '}
                  conducted through Shine Group Placement Center over the period of{' '}
                  <strong className="text-slate-900 font-semibold">{certificate.duration}</strong>.
                </p>

                {/* Performance Evaluation Grade */}
                {certificate.grade && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs font-bold shadow-xs">
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Performance Evaluation: <strong className="text-amber-900 font-extrabold">{certificate.grade}</strong></span>
                  </div>
                )}
              </div>

              {/* 4. Footer Signatures, QR Code & Gold Stamp */}
              <div className="border-t border-amber-600/30 pt-3 sm:pt-4 px-1 sm:px-4">
                <div className="grid grid-cols-3 items-end gap-2 text-center">
                  
                  {/* Left: Issue Date & Verification Info */}
                  <div className="text-left space-y-0.5 text-[9px] sm:text-[11px] text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">Issue Date: </span>
                      <span className="font-mono text-slate-900 font-bold">{certificate.issueDate || certificate.requestedDate}</span>
                    </div>
                    <div className="text-slate-500 hidden sm:block text-[10px]">
                      <span>Mahanadda, Jabalpur (M.P.) - 482001</span>
                    </div>
                    <div className="text-[8px] sm:text-[9.5px] font-mono text-slate-400">
                      ID: {certificate.id}
                    </div>
                  </div>

                  {/* Center: Golden Medallion Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-600/90 bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-600 shadow-lg flex flex-col items-center justify-center text-center p-1 text-slate-950 select-none relative">
                      <div className="absolute inset-0.5 rounded-full border border-amber-700/50 pointer-events-none"></div>
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                      <span className="text-[7px] sm:text-[8px] font-black tracking-tight uppercase leading-none mt-0.5">
                        SHINE GROUP
                      </span>
                      <span className="text-[5.5px] sm:text-[6.5px] font-bold text-red-950 leading-none">
                        ISO 9001:2015
                      </span>
                      <span className="text-[6px] sm:text-[7px] font-black text-amber-950 tracking-wider leading-none mt-0.5">
                        ★ VERIFIED ★
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-600 font-mono font-medium">
                      <QrCode className="w-3 h-3 text-slate-700 shrink-0" />
                      <span>verify.shinegroupjobs.com</span>
                    </div>
                  </div>

                  {/* Right: Signature */}
                  <div className="text-right space-y-0.5">
                    <div className="h-8 sm:h-9 flex items-end justify-end">
                      <div className="font-serif italic font-bold text-blue-900 text-xs sm:text-sm md:text-base border-b-2 border-slate-900/60 pb-0.5 px-3 inline-block">
                        {certificate.approvedBy ? certificate.approvedBy.split(',')[0] : 'Placement Controller'}
                      </div>
                    </div>
                    <div className="text-[9.5px] sm:text-[11.5px] font-bold text-slate-900 leading-tight">
                      Placement Director
                    </div>
                    <div className="text-[8px] sm:text-[9.5px] text-slate-500 leading-tight">
                      {certificate.signatoryTitle || 'Shine Group Jobs Jabalpur'}
                    </div>
                  </div>

                </div>

                {/* Bottom Micro-Disclaimer */}
                <div className="mt-2.5 pt-1.5 border-t border-slate-200 text-center text-[7.5px] sm:text-[8.5px] text-slate-500 font-serif leading-tight">
                  This document is an authentic certified digital issuance by Shine Group Jobs & Placement, Jabalpur. Its authenticity can be verified online by querying Unique Certificate No. <strong className="text-slate-700 font-mono">{certificate.certificateNumber}</strong>.
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Footer info (hidden in print) */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 print:hidden">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] sm:text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>2nd Floor, Khalsa College, above Central Bank, Mahanadda, Jabalpur (M.P.)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-[11px] sm:text-xs"
            >
              Copy Verification Number ({certificate.certificateNumber})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
