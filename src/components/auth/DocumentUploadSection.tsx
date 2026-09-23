import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  Trash2,
  FileCheck,
  CreditCard,
  Briefcase,
  ExternalLink,
  HelpCircle,
  X
} from 'lucide-react';
import { OnboardingDocuments, UploadedDocFile } from '../../types';

interface DocumentUploadSectionProps {
  documents: OnboardingDocuments;
  onChange: (docs: OnboardingDocuments) => void;
  onPreviewModal?: (doc: UploadedDocFile, title: string) => void;
}

interface FileUploaderProps {
  id: string;
  label: string;
  required?: boolean;
  accept?: string;
  fileTypeLabel?: string;
  helperText?: string;
  warningText?: string;
  currentFile?: UploadedDocFile;
  onFileSelect: (file: UploadedDocFile | undefined) => void;
  onPreview?: (file: UploadedDocFile) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  id,
  label,
  required = true,
  accept = '.pdf,.jpg,.jpeg,.png',
  fileTypeLabel = 'PDF, JPG, or PNG up to 10MB',
  helperText,
  warningText,
  currentFile,
  onFileSelect,
  onPreview
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const type: 'pdf' | 'image' = isImage ? 'image' : 'pdf';

    const formatSize = (bytes: number) => {
      if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      const uploadedFile: UploadedDocFile = {
        name: file.name,
        size: formatSize(file.size),
        type,
        previewUrl: previewUrl || undefined,
        uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', ' +
          new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      };
      onFileSelect(uploadedFile);
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      // For PDFs, we still generate a data URL or fallback placeholder preview
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 transition-all hover:border-neutral-300">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
            <span>{label}</span>
            {required ? (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Required
              </span>
            ) : (
              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                Optional
              </span>
            )}
          </label>
        </div>
        {currentFile && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Uploaded
          </span>
        )}
      </div>

      {helperText && (
        <div className="flex items-start gap-1.5 text-[11px] text-neutral-500 mb-2.5 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
          <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
          <span>{helperText}</span>
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload area or Preview Card */}
      {currentFile ? (
        <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail Preview */}
            <div className="w-14 h-14 rounded-lg bg-neutral-200 border border-neutral-300 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative group">
              {currentFile.type === 'image' && currentFile.previewUrl ? (
                <img
                  src={currentFile.previewUrl}
                  alt={currentFile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-600 p-1">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">PDF</span>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
                {currentFile.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                <span>{currentFile.size || '520 KB'}</span>
                <span>•</span>
                <span>{currentFile.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onPreview && onPreview(currentFile)}
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={() => onFileSelect(undefined)}
              className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-1 border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
              <UploadCloud className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-800">
                <span className="text-emerald-700 font-bold hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{fileTypeLabel}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-1 px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg border border-neutral-300 text-xs font-semibold shadow-2xs transition"
            >
              Upload Image/PDF
            </button>
          </div>
        </div>
      )}

      {warningText && (
        <div className="mt-2.5 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{warningText}</p>
        </div>
      )}
    </div>
  );
};

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  documents,
  onChange
}) => {
  const [previewDoc, setPreviewDoc] = useState<{ doc: UploadedDocFile; title: string } | null>(null);

  const updateDoc = (field: keyof OnboardingDocuments, value: UploadedDocFile | undefined) => {
    onChange({
      ...documents,
      [field]: value
    });
  };

  const handleTogglePriorExperience = (hasPrior: boolean) => {
    onChange({
      ...documents,
      hasPriorExperience: hasPrior
    });
  };

  return (
    <div className="space-y-6">
      {/* Introductory Text Callout Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <FileCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-950">
            Document Uploads & Prerequisites
          </h4>
          <p className="text-xs text-emerald-900 mt-1 font-medium leading-relaxed">
            "We would request you to keep the soft copy of the below documents handy while filling the form."
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">
            Supported formats: PDF, JPG, PNG (Max 10MB per document). These will be verified by HR & Compliance.
          </p>
        </div>
      </div>

      {/* Group 1: Standard Mandatory Documents */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Standard Document Uploads <span className="text-xs font-normal text-neutral-500">(Mandatory for all)</span>
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            4 Requirements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. PAN Card Copy */}
          <FileUploader
            id="pan-upload"
            label="PAN Card Copy"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            fileTypeLabel="PAN card soft copy (PDF, JPG, or PNG)"
            currentFile={documents.panCard}
            onFileSelect={(f) => updateDoc('panCard', f)}
            onPreview={(f) => setPreviewDoc({ doc: f, title: 'PAN Card Copy' })}
          />

          {/* 2. Latest Credit Score copy */}
          <FileUploader
            id="credit-score-upload"
            label="Latest Credit Score Copy (CIBIL/ Experian score)"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            fileTypeLabel="Credit report PDF or screenshot (PDF, JPG, PNG)"
            helperText="You will be able to access a free copy of your credit score on the FreechargeBiz mobile app under the Loans and Invest Section."
            currentFile={documents.creditScore}
            onFileSelect={(f) => updateDoc('creditScore', f)}
            onPreview={(f) => setPreviewDoc({ doc: f, title: 'Credit Score Report (CIBIL/Experian)' })}
          />

          {/* 3a. Proof of Address (Front Side) */}
          <FileUploader
            id="address-front-upload"
            label="Proof of Address (Front Side)"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            fileTypeLabel="Voter ID / Driving License - Front Side"
            helperText="Voter/ Driving License Copy. Please note that Aadhar copy will not be accepted as a proof of address."
            currentFile={documents.addressProofFront}
            onFileSelect={(f) => updateDoc('addressProofFront', f)}
            onPreview={(f) => setPreviewDoc({ doc: f, title: 'Proof of Address - Front Side' })}
          />

          {/* 3b. Proof of Address (Back Side) */}
          <FileUploader
            id="address-back-upload"
            label="Proof of Address (Back Side)"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            fileTypeLabel="Voter ID / Driving License - Back Side"
            helperText="Voter/ Driving License Copy. Please note that Aadhar copy will not be accepted as a proof of address."
            currentFile={documents.addressProofBack}
            onFileSelect={(f) => updateDoc('addressProofBack', f)}
            onPreview={(f) => setPreviewDoc({ doc: f, title: 'Proof of Address - Back Side' })}
          />

          {/* 4. Passport Photo (Image only) */}
          <div className="md:col-span-2">
            <FileUploader
              id="passport-photo-upload"
              label="Passport Photo (Candidate Headshot)"
              required={true}
              accept=".jpg,.jpeg,.png"
              fileTypeLabel="Formal photograph with clear white/neutral background (JPG, PNG only)"
              helperText="Please upload a recent color passport-size photograph with high visibility."
              currentFile={documents.passportPhoto}
              onFileSelect={(f) => updateDoc('passportPhoto', f)}
              onPreview={(f) => setPreviewDoc({ doc: f, title: 'Passport Size Photograph' })}
            />
          </div>
        </div>
      </div>

      {/* Group 2: Additional Documents (Prior Work Experience) */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Work Experience & Employment History
            </h3>
          </div>
        </div>

        {/* Experience Toggle Radio Component */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <label className="text-xs font-bold text-neutral-900 block mb-2">
            Do you have prior work experience? <span className="text-rose-600">*</span>
          </label>
          <p className="text-[11px] text-neutral-500 mb-3">
            Select "Yes" if you have previously worked as a full-time, contract, or probationary employee in any recognized organization.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-md">
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                documents.hasPriorExperience
                  ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold ring-1 ring-purple-600'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="hasPriorExperience"
                checked={documents.hasPriorExperience === true}
                onChange={() => handleTogglePriorExperience(true)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-neutral-300"
              />
              <span className="text-xs">Yes, Experienced Candidate</span>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                documents.hasPriorExperience === false
                  ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold ring-1 ring-purple-600'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="hasPriorExperience"
                checked={documents.hasPriorExperience === false}
                onChange={() => handleTogglePriorExperience(false)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-neutral-300"
              />
              <span className="text-xs">No, Fresher / First Job</span>
            </label>
          </div>
        </div>

        {/* Revealed Experience Uploads */}
        {documents.hasPriorExperience ? (
          <div className="space-y-4 pt-2 animate-in fade-in duration-200">
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-900">
                Prior Experience Verification Documents Required
              </span>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                4 Files
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 5. Latest Resume */}
              <FileUploader
                id="resume-upload"
                label="5. Latest Resume"
                required={true}
                accept=".pdf,.doc,.docx"
                fileTypeLabel="Comprehensive CV / Resume (PDF or Word)"
                currentFile={documents.resume}
                onFileSelect={(f) => updateDoc('resume', f)}
                onPreview={(f) => setPreviewDoc({ doc: f, title: 'Latest Resume' })}
              />

              {/* 6. Last/ Current organization's offer letter */}
              <FileUploader
                id="offer-letter-upload"
                label="6. Last / Current Organization's Offer Letter"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                fileTypeLabel="Appointment / Offer letter copy (PDF, JPG, PNG)"
                currentFile={documents.previousOfferLetter}
                onFileSelect={(f) => updateDoc('previousOfferLetter', f)}
                onPreview={(f) => setPreviewDoc({ doc: f, title: "Last Organization's Offer Letter" })}
              />

              {/* 7. Last 3-months salary slips */}
              <FileUploader
                id="salary-slips-upload"
                label="7. Last 3-Months Salary Slips"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                fileTypeLabel="Consolidated PDF or pay slip copies"
                helperText="Upload salary slips for the latest three consecutive months prior to joining Click Camp."
                currentFile={documents.salarySlips}
                onFileSelect={(f) => updateDoc('salarySlips', f)}
                onPreview={(f) => setPreviewDoc({ doc: f, title: 'Last 3-Months Salary Slips' })}
              />

              {/* 8. Resignation/ Relieving Letter of last organization (Optional) */}
              <FileUploader
                id="relieving-letter-upload"
                label="8. Resignation / Relieving Letter of Last Organization"
                required={false}
                accept=".pdf,.jpg,.jpeg,.png"
                fileTypeLabel="Relieving Letter or accepted resignation email copy"
                warningText="Note: In case you are not submitting this document currently, please note that in case of selection, your employment will not be confirmed if this document is not submitted during the probation period."
                currentFile={documents.relievingLetter}
                onFileSelect={(f) => updateDoc('relievingLetter', f)}
                onPreview={(f) => setPreviewDoc({ doc: f, title: 'Resignation / Relieving Letter' })}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
            <p className="text-xs text-neutral-600">
              ✓ Marked as <strong>Fresher / First Employment</strong>. Prior organization salary slips, offer letters, and relieving certificates are exempted.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Document Thumbnail & Full Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{previewDoc.title}</h3>
                <p className="text-[11px] text-neutral-400">
                  {previewDoc.doc.name} • {previewDoc.doc.size}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-neutral-100 min-h-[300px]">
              {previewDoc.doc.type === 'image' && previewDoc.doc.previewUrl ? (
                <img
                  src={previewDoc.doc.previewUrl}
                  alt={previewDoc.doc.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] object-contain rounded-lg border border-neutral-300 shadow-md"
                />
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-center max-w-md w-full">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">{previewDoc.doc.name}</h4>
                  <p className="text-xs text-neutral-500 mb-4">
                    Official Portable Document Format ({previewDoc.doc.size})
                  </p>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs font-mono text-neutral-600 space-y-1 mb-4">
                    <div>Verification: Click Camp Document Security</div>
                    <div>Status: Ready for HR Dossier Archival</div>
                    <div>Timestamp: {previewDoc.doc.uploadedAt}</div>
                  </div>
                  <a
                    href={previewDoc.doc.previewUrl || '#'}
                    download={previewDoc.doc.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    <span>Download / Open Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
