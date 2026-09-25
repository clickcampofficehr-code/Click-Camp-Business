import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CompanyLogoMark } from './CompanyLogo';
import {
  X,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  Palette,
  ExternalLink,
  ShieldCheck,
  Copy,
  Info
} from 'lucide-react';

export const CompanyLogoModal: React.FC = () => {
  const {
    isBrandModalOpen,
    setIsBrandModalOpen,
    companyLogoUrl,
    updateCompanyLogo,
    showToast,
    currentUser
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePreviewTheme, setActivePreviewTheme] = useState<'light' | 'dark' | 'navy'>('light');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isBrandModalOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        updateCompanyLogo(result);
        showToast('Company logo updated and synced across all workspace headers!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleResetToDefault = () => {
    updateCompanyLogo(null);
    showToast('Reset to official ClickCamp vector logo emblem.');
  };

  const downloadSvg = () => {
    const svgContent = `<svg width="256" height="256" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cc-pill-gradient" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0066FF"/>
      <stop offset="50%" stop-color="#1E6BFF"/>
      <stop offset="100%" stop-color="#00D2FF"/>
    </linearGradient>
    <linearGradient id="cc-dot-gradient" x1="60" y1="12" x2="88" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="60%" stop-color="#0066FF"/>
      <stop offset="100%" stop-color="#0047CC"/>
    </linearGradient>
    <filter id="cc-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0052FF" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect x="38" y="20" width="24" height="62" rx="12" transform="rotate(38 50 51)" fill="url(#cc-pill-gradient)" filter="url(#cc-shadow)"/>
  <rect x="42" y="23" width="8" height="34" rx="4" transform="rotate(38 50 51)" fill="#FFFFFF" fill-opacity="0.32"/>
  <circle cx="76" cy="26" r="12.5" fill="url(#cc-dot-gradient)"/>
  <circle cx="72.5" cy="22.5" r="4" fill="#FFFFFF" fill-opacity="0.45"/>
  <circle cx="25" cy="75" r="3.5" fill="#00D2FF" fill-opacity="0.55"/>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ClickCamp_Official_Logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded official ClickCamp SVG logo asset.');
  };

  const copyBrandHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedCode(true);
    showToast(`Copied ${hex} to clipboard.`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <CompanyLogoMark size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                ClickCamp Brand Identity & Logo
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  Official v3.0
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Manage, preview, and customize the official company insignia and logo assets.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBrandModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Showcase Panel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Logo Preview</span>
              </span>

              {/* Theme Preview Switcher */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActivePreviewTheme('light')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    activePreviewTheme === 'light'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    activePreviewTheme === 'dark'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTheme('navy')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    activePreviewTheme === 'navy'
                      ? 'bg-blue-950 text-sky-200 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Brand Navy
                </button>
              </div>
            </div>

            {/* Showcase Stage */}
            <div
              className={`rounded-2xl p-8 border flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors ${
                activePreviewTheme === 'light'
                  ? 'bg-neutral-50/80 border-neutral-200 text-neutral-900'
                  : activePreviewTheme === 'dark'
                  ? 'bg-neutral-900 border-neutral-800 text-white'
                  : 'bg-gradient-to-br from-blue-950 to-neutral-950 border-blue-900 text-white'
              }`}
            >
              {/* Emblem & Lockup */}
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl shadow-sm border transition-all ${
                    activePreviewTheme === 'light'
                      ? 'bg-white border-neutral-200 shadow-blue-500/5'
                      : 'bg-neutral-800/80 border-neutral-700/80'
                  }`}
                >
                  {companyLogoUrl ? (
                    <img
                      src={companyLogoUrl}
                      alt="Uploaded ClickCamp Logo"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <CompanyLogoMark size={64} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-2xl font-black tracking-tight ${
                        activePreviewTheme === 'light' ? 'text-neutral-900' : 'text-white'
                      }`}
                    >
                      Click
                    </span>
                    <span className="text-2xl font-black tracking-tight text-blue-500">
                      Camp
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${
                      activePreviewTheme === 'light' ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    Technologies Limited
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Sparkles className="w-2.5 h-2.5" />
                      {companyLogoUrl ? 'Custom Asset Active' : 'Official Vector Emblem'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={downloadSvg}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>

                {companyLogoUrl && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Vector</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upload Custom Logo Asset Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Custom Logo Graphic</span>
              </span>
              <span className="text-[11px] text-neutral-400">PNG, JPG, SVG, WebP (Max 5MB)</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-neutral-300 hover:border-blue-400 bg-neutral-50/50 hover:bg-blue-50/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">
                  Click to browse or drag & drop your company logo image here
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Seamlessly updates sidebar, navigation bars, email headers, and portal screens.
                </p>
              </div>
            </div>
          </div>

          {/* Official Design Specifications & Color Codes */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Brand Geometry & Color Palette</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">Design System Guidelines</span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              The ClickCamp identity consists of a <strong>slanted rounded pill capsule</strong> angled at 38° symbolizing speed and forward momentum, alongside a <strong>vibrant royal blue circular dot</strong> representing precision, connectivity, and enterprise action.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { name: 'Royal Blue', hex: '#0066FF', desc: 'Primary Pill & Wordmark' },
                { name: 'Cyan Glow', hex: '#00D2FF', desc: 'Dot Accent & Highlight' },
                { name: 'Slate Dark', hex: '#0F172A', desc: 'Enterprise Text' },
                { name: 'Ice White', hex: '#FFFFFF', desc: 'Reflection Core' }
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => copyBrandHex(c.hex)}
                  className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:border-blue-300 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-bold text-neutral-800 truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                    <span>{c.hex}</span>
                    <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP & Corporate Branding Verified</span>
          </div>

          <button
            type="button"
            onClick={() => setIsBrandModalOpen(false)}
            className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
