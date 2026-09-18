import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onLogoChange: (newLogoUrl: string) => void;
  orgName?: string;
  trainingCentreName?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogoUrl = '/gue_logo.jpg',
  onLogoChange,
  orgName = 'GUE EDUCATIONAL LIMITED',
  trainingCentreName = 'Skills Training Centre, Wannune',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogoUrl || '/gue_logo.jpg');
  const [customUri, setCustomUri] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'uri'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<{ name: string; size: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side image optimizer that converts file to a clean, optimized Base64 string
  const processAndOptimizeImage = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not a supported image format. Please upload PNG, JPG, WebP, or SVG.');
      return;
    }

    // Limit raw upload to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large (max 10MB). Please select a smaller file.');
      return;
    }

    setProcessing(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setError('Failed to read image file.');
      setProcessing(false);
    };

    reader.onload = (e) => {
      const result = e.target?.result as string;

      // If it's an SVG, base64 data URI is already optimal
      if (file.type === 'image/svg+xml') {
        setPreviewUrl(result);
        onLogoChange(result);
        setFileStats({
          name: file.name,
          size: `${(result.length / 1024).toFixed(1)} KB (SVG Data URI)`,
          type: 'SVG Vector',
        });
        setProcessing(false);
        return;
      }

      // For raster images, resize on canvas to an optimal dimension (max 512x512) for crisp ID card and navbar rendering
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 512;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback to original base64
            setPreviewUrl(result);
            onLogoChange(result);
            setProcessing(false);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Output as PNG to preserve transparent backgrounds, or high-quality JPEG
          const isPng = file.type === 'image/png';
          const optimizedDataUrl = isPng
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', 0.92);

          const sizeKb = (optimizedDataUrl.length * (3 / 4) / 1024).toFixed(1);
          setPreviewUrl(optimizedDataUrl);
          onLogoChange(optimizedDataUrl);
          setFileStats({
            name: file.name,
            size: `${sizeKb} KB (Optimized Base64)`,
            type: `${width}×${height}px ${isPng ? 'PNG' : 'JPEG'}`,
          });
        } catch {
          // Fallback to original base64 if canvas processing fails
          setPreviewUrl(result);
          onLogoChange(result);
        } finally {
          setProcessing(false);
        }
      };

      img.onerror = () => {
        setError('Failed to process image. The file may be corrupt.');
        setProcessing(false);
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndOptimizeImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndOptimizeImage(e.target.files[0]);
    }
  };

  const handleApplyUri = () => {
    if (!customUri.trim()) {
      setError('Please enter a valid image URL or URI.');
      return;
    }
    setError(null);
    setPreviewUrl(customUri.trim());
    onLogoChange(customUri.trim());
    setFileStats({
      name: 'External URI',
      size: 'Remote Resource',
      type: 'Direct Link',
    });
  };

  const handleResetToDefault = () => {
    const defaultUrl = '/gue_logo.jpg';
    setPreviewUrl(defaultUrl);
    setCustomUri('');
    setError(null);
    setFileStats(null);
    onLogoChange(defaultUrl);
  };

  return (
    <div className="space-y-4">
      {/* Upload controls header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Centralized Logo Upload &amp; Brand Asset Manager</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Uploaded logo instantly updates across the Navbar, ID Card Studio, print templates, and public verification.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            File Upload (Base64)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('uri')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${
              activeTab === 'uri'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            URL / URI
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload Zone */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#0f3a5d] bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-[#0f3a5d] bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#0f3a5d] mb-3">
            {processing ? (
              <div className="w-5 h-5 border-2 border-[#0f3a5d] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <div className="text-xs font-bold text-slate-800">
            {processing ? 'Optimizing brand asset...' : 'Click to upload or drag and drop institutional emblem'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Recommended: PNG or SVG with transparent background, or high-res JPG (auto-converted to optimized Base64).
          </p>

          {fileStats && (
            <div className="mt-3 inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md text-[11px] font-semibold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{fileStats.name}</span>
              <span className="text-emerald-600">• {fileStats.size}</span>
              <span className="text-emerald-600">• {fileStats.type}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Image Web URL / CDN Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUri}
              onChange={(e) => setCustomUri(e.target.value)}
              placeholder="e.g. /gue_logo.jpg or https://example.com/logo.png"
              className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0f3a5d]"
            />
            <button
              type="button"
              onClick={handleApplyUri}
              className="px-4 py-2 bg-[#0f3a5d] text-white text-xs font-bold rounded-lg hover:bg-[#164e7d] transition"
            >
              Apply URI
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            You can provide a local path like <code className="text-[#0f3a5d]">/gue_logo.jpg</code> or an external hosted image URI.
          </p>
        </div>
      )}

      {/* Live Preview Strip showing the logo in exact real-world contexts */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Dynamic Live Previews (Real-Time Synchronized)</span>
          </span>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-200/60 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Official Crest</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Context 1: Primary Brand Emblem */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
              Primary Crest
            </div>
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
              <img
                src={previewUrl}
                alt="Brand Crest"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-[10px] font-semibold text-slate-700 mt-2 truncate max-w-[120px]">
              {orgName}
            </div>
          </div>

          {/* Context 2: Navbar Header Pill */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
              Navbar Context
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Navbar Crest"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-[#0f3a5d] leading-tight">
                  {orgName.slice(0, 16)}...
                </div>
                <div className="text-[8px] text-slate-500 truncate max-w-[90px]">
                  {trainingCentreName.slice(0, 16)}...
                </div>
              </div>
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold mt-2">✓ Dynamic in Top Bar</span>
          </div>

          {/* Context 3: Physical ID Card Badge */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
              ID Card Header Badge
            </div>
            <div className="bg-[#0f3a5d] p-1.5 rounded flex items-center space-x-1.5 text-white shadow-xs">
              <div className="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-amber-400/60">
                <img
                  src={previewUrl}
                  alt="ID Badge"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <div className="text-[8px] font-bold uppercase tracking-tight text-white leading-tight">
                  {orgName.slice(0, 14)}...
                </div>
                <div className="text-[6.5px] text-amber-300 font-semibold">Staff ID CR80</div>
              </div>
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold mt-2">✓ Printed on Cards</span>
          </div>
        </div>
      </div>
    </div>
  );
};
