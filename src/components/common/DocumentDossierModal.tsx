import React, { useState } from 'react';
import {
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Eye,
  ShieldCheck,
  Building,
  User,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { PendingOnboarding, UploadedDocFile } from '../../types';

interface DocumentDossierModalProps {
  candidate: PendingOnboarding;
  onClose: () => void;
  onVerifyStatus?: (status: 'Verified' | 'Pending Review') => void;
}

export const DocumentDossierModal: React.FC<DocumentDossierModalProps> = ({
  candidate,
  onClose,
  onVerifyStatus
}) => {
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<{
    doc: UploadedDocFile;
    title: string;
  } | null>(null);

  const docs = candidate.uploadedDocuments;

  const renderDocCard = (
    title: string,
    doc: UploadedDocFile | undefined,
    category: string,
    optional = false,
    helperNote?: string
  ) => {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-3.5 flex flex-col justify-between transition-all hover:border-neutral-300">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-xs font-bold text-neutral-900 truncate" title={title}>
              {title}
            </span>
            {doc ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                Uploaded
              </span>
            ) : optional ? (
              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                Not Uploaded (Optional)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                Missing
              </span>
            )}
          </div>

          <p className="text-[10px] text-neutral-500 mb-2.5">{category}</p>

          {doc ? (
            <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-200 flex items-center gap-3">
              {/* Thumbnail */}
              <div
                onClick={() => setSelectedPreviewDoc({ doc, title })}
                className="w-12 h-12 rounded-md bg-neutral-200 border border-neutral-300 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 relative group"
              >
                {doc.type === 'image' && doc.previewUrl ? (
                  <img
                    src={doc.previewUrl}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-600">
                    <FileText className="w-5 h-5" />
                    <span className="text-[8px] font-bold uppercase">PDF</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800 truncate" title={doc.name}>
                  {doc.name}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {doc.size || '350 KB'} • {doc.uploadedAt}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-3 text-center text-xs text-neutral-400">
              No document file uploaded yet
            </div>
          )}
        </div>

        {helperNote && (
          <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
            {helperNote}
          </p>
        )}

        {doc && (
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedPreviewDoc({ doc, title })}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Full</span>
            </button>
            <a
              href={doc.previewUrl || '#'}
              download={doc.name}
              className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              {candidate.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{candidate.fullName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-purple-300 border border-neutral-700">
                  Ref: {candidate.id}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {candidate.department} • {candidate.personalEmail} • Joining: {candidate.dateOfJoining}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-neutral-50">
          {/* Status summary pill */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  Compliance Dossier & Statutory Pre-requisites
                </p>
                <p className="text-[11px] text-neutral-500">
                  Click Camp Business and Technology Services Limited Verification Protocol
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  candidate.documentStatus === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Verification: {candidate.documentStatus}
              </span>
              {onVerifyStatus && (
                <button
                  type="button"
                  onClick={() =>
                    onVerifyStatus(candidate.documentStatus === 'Verified' ? 'Pending Review' : 'Verified')
                  }
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  {candidate.documentStatus === 'Verified' ? 'Mark Pending' : 'Mark Verified'}
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Standard Mandatory Documents */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
              <span>Standard Mandatory Documents</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderDocCard('PAN Card Copy', docs?.panCard, 'Tax & Regulatory ID')}
              {renderDocCard(
                'Credit Score Copy (CIBIL/Experian)',
                docs?.creditScore,
                'Financial Integrity Verification'
              )}
              {renderDocCard(
                'Proof of Address (Front Side)',
                docs?.addressProofFront,
                'Voter ID / Driving License Front'
              )}
              {renderDocCard(
                'Proof of Address (Back Side)',
                docs?.addressProofBack,
                'Voter ID / Driving License Back'
              )}
              {renderDocCard(
                'Passport Size Photograph',
                docs?.passportPhoto,
                'Candidate Formal Headshot'
              )}
            </div>
          </div>

          {/* Section 2: Experience Documents */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-neutral-600" />
                <span>Prior Work Experience Documents</span>
              </h4>
              <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-200/80 px-2 py-0.5 rounded">
                Experience Status: {docs?.hasPriorExperience ? 'Experienced' : 'Fresher / First Job'}
              </span>
            </div>

            {docs?.hasPriorExperience ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {renderDocCard('Latest Resume', docs?.resume, 'Candidate CV')}
                {renderDocCard(
                  "Last / Current Org Offer Letter",
                  docs?.previousOfferLetter,
                  'Employment Verification'
                )}
                {renderDocCard(
                  'Last 3-Months Salary Slips',
                  docs?.salarySlips,
                  'Compensation History'
                )}
                {renderDocCard(
                  'Resignation / Relieving Letter',
                  docs?.relievingLetter,
                  'Clearance Certificate',
                  true,
                  !docs?.relievingLetter
                    ? 'Candidate probation clearance contingent on receiving relieving letter.'
                    : undefined
                )}
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-neutral-200 text-xs text-neutral-600">
                ✓ Candidate is onboarded under <strong>Fresher Program</strong>. No previous organization offer letter, salary slips, or relieving letters are required.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Click Camp Internal HR Compliance Document Audit
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Full screen document image/pdf previewer modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">{selectedPreviewDoc.title}</h4>
                <p className="text-[11px] text-neutral-400">
                  {selectedPreviewDoc.doc.name} • {selectedPreviewDoc.doc.size}
                </p>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-neutral-100 flex-1 flex items-center justify-center overflow-auto min-h-[300px]">
              {selectedPreviewDoc.doc.type === 'image' && selectedPreviewDoc.doc.previewUrl ? (
                <img
                  src={selectedPreviewDoc.doc.previewUrl}
                  alt={selectedPreviewDoc.doc.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] object-contain rounded-lg border border-neutral-300 shadow-lg"
                />
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-center max-w-md w-full">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">{selectedPreviewDoc.doc.name}</h4>
                  <p className="text-xs text-neutral-500 mb-4">
                    Portable Document Format ({selectedPreviewDoc.doc.size})
                  </p>
                  <a
                    href={selectedPreviewDoc.doc.previewUrl || '#'}
                    download={selectedPreviewDoc.doc.name}
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
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
