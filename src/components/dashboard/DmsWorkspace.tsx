import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DmsDocument } from '../../types';
import {
  FileText,
  UploadCloud,
  Eye,
  Download,
  Filter,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  FolderOpen,
  Lock,
  X,
  History,
  FileCheck
} from 'lucide-react';

export const DmsWorkspace: React.FC = () => {
  const { documents, uploadDocument, currentUser } = useWorkspace();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DmsDocument | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DmsDocument['category']>('HR');
  const [uploadVersion, setUploadVersion] = useState('v1.0');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['all', 'HR', 'Legal', 'Operations', 'Finance', 'Engineering'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            uploadDocument({
              title: uploadTitle,
              category: uploadCategory,
              version: uploadVersion,
              fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
              fileType: uploadFile?.name.split('.').pop()?.toUpperCase() || 'PDF'
            });
            setIsUploading(false);
            setUploadProgress(0);
            setIsUploadModalOpen(false);
            setUploadTitle('');
            setUploadFile(null);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Module 6: Enterprise DMS
            </span>
            <span className="text-xs text-neutral-400">SOC2 Type II Vault Encryption</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>Document Management System (DMS)</span>
            <FolderOpen className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Categorized repository for offer letters, corporate policies, standard operating procedures, and compliance artifacts.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Secure Document</span>
        </button>
      </div>

      {/* Main DMS Container */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat === 'all' ? 'All Documents' : cat}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search document title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Document Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Uploaded By</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No documents found in this category.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 font-bold text-[10px]">
                          {doc.fileType}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block">{doc.title}</span>
                          <span className="text-[10px] text-neutral-400">AES-256 Encrypted</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-neutral-700">{doc.version}</td>

                    <td className="py-3 px-3 text-neutral-500">{doc.fileSize}</td>

                    <td className="py-3 px-3 font-medium text-neutral-900">{doc.uploadedBy}</td>

                    <td className="py-3 px-3 text-neutral-500 text-[11px]">{doc.uploadedAt}</td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPreviewDoc(doc)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <a
                          href="#download"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading ${doc.title} (${doc.version}) from ClickCamp S3 vault.`);
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedPreviewDoc.title}</h3>
                  <p className="text-[11px] text-neutral-400">
                    Category: {selectedPreviewDoc.category} • Version: {selectedPreviewDoc.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content Renderer */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-700 leading-relaxed font-sans bg-neutral-50">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200 text-[11px] text-neutral-500">
                  <span>CONFIDENTIAL & PROPRIETARY</span>
                  <span>ClickCamp Technologies Ltd.</span>
                </div>

                <h2 className="text-base font-bold text-neutral-900">{selectedPreviewDoc.title}</h2>

                <p>
                  <strong>Document Classification:</strong> Official Internal Protocol ({selectedPreviewDoc.category})
                  <br />
                  <strong>Document ID:</strong> {selectedPreviewDoc.id} | <strong>Revision:</strong> {selectedPreviewDoc.version}
                  <br />
                  <strong>Uploaded By:</strong> {selectedPreviewDoc.uploadedBy} on {selectedPreviewDoc.uploadedAt}
                </p>

                <hr className="border-neutral-200" />

                <div className="space-y-2 text-neutral-700">
                  <h4 className="font-bold text-neutral-900">1. Executive Summary & Purpose</h4>
                  <p>
                    This formal instrument establishes standard operating procedures for ClickCamp Technologies team members.
                    All provisions contained herein are governed by company operational guidelines and strict confidentiality compliance.
                  </p>

                  <h4 className="font-bold text-neutral-900">2. Compliance & Verification SLA</h4>
                  <p>
                    Employees and team leads are required to record client account milestones, ensure dual-verification KYC compliance,
                    and uphold digital security protocols. Unauthorized dissemination of internal documents is strictly prohibited under SOC2 policies.
                  </p>

                  <h4 className="font-bold text-neutral-900">3. Audit History & Approvals</h4>
                  <div className="p-2.5 bg-neutral-100/70 rounded-lg text-[11px] space-y-1 text-neutral-600">
                    <p>• Initial Revision v1.0 authored by Legal & Compliance</p>
                    <p>• Reviewed and ratified by Executive Management on 2026-09-01</p>
                    <p>• Cryptographically signed with SHA-256 checksum</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Read-only secure preview
              </span>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL WITH PROGRESS BAR */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 animate-in fade-in">
            <h3 className="text-base font-bold text-neutral-900">Upload Secure Enterprise Document</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Encrypted storage in ClickCamp DMS with automatic access logging.
            </p>

            <form onSubmit={handleStartUpload} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Advertising Policy SOP"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DmsDocument['category'])}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="HR">HR</option>
                    <option value="Legal">Legal</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Select File (PDF, DOCX, XLSX)</label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-500"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Maximum file size: 50MB</p>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-neutral-700">
                    <span>Encrypting & Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Save & Encrypt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
