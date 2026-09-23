import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  X,
  Save,
  KeyRound,
  FileCheck,
  HeartPulse,
  Home,
  CreditCard,
  Sparkles
} from 'lucide-react';

export const ProfileSettingsModal: React.FC = () => {
  const {
    currentUser,
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
    updateEmployeeInformation,
    setIs2FAModalOpen
  } = useWorkspace();

  const [activeSection, setActiveSection] = useState<'profile_photo' | 'contact_address' | 'emergency_medical' | 'statutory'>('profile_photo');

  // Form states initialized with currentUser
  const [formData, setFormData] = useState({
    phone: currentUser.phone || '',
    personalEmail: currentUser.personalEmail || '',
    address: currentUser.address || '',
    city: currentUser.city || '',
    state: currentUser.state || '',
    pincode: currentUser.pincode || '',
    emergencyContactName: currentUser.emergencyContactName || '',
    emergencyContactPhone: currentUser.emergencyContactPhone || '',
    emergencyContactRelation: currentUser.emergencyContactRelation || '',
    bloodGroup: currentUser.bloodGroup || 'O+',
    dob: currentUser.dob || '1996-01-01',
    gender: currentUser.gender || 'Male',
    bio: currentUser.bio || '',
    panNumber: currentUser.panNumber || '',
    bankName: currentUser.bankName || '',
    bankAccountNumber: currentUser.bankAccountNumber || '',
    bankIfsc: currentUser.bankIfsc || ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever modal opens or currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFormData({
        phone: currentUser.phone || '',
        personalEmail: currentUser.personalEmail || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        emergencyContactName: currentUser.emergencyContactName || '',
        emergencyContactPhone: currentUser.emergencyContactPhone || '',
        emergencyContactRelation: currentUser.emergencyContactRelation || '',
        bloodGroup: currentUser.bloodGroup || 'O+',
        dob: currentUser.dob || '1996-01-01',
        gender: currentUser.gender || 'Male',
        bio: currentUser.bio || '',
        panNumber: currentUser.panNumber || '',
        bankName: currentUser.bankName || '',
        bankAccountNumber: currentUser.bankAccountNumber || '',
        bankIfsc: currentUser.bankIfsc || ''
      });
    }
  }, [currentUser, isProfileSettingsOpen]);

  if (!isProfileSettingsOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateEmployeeInformation(currentUser.id, formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Employee Profile & Information
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {currentUser.id}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Upload custom DP profile and save official employee records (persistent in database)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileSettingsOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Close Profile Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 border-b border-neutral-200 shrink-0 overflow-x-auto text-xs">
          {[
            { id: 'profile_photo', label: 'DP Profile Photo', icon: Sparkles },
            { id: 'contact_address', label: 'Contact & Address', icon: Home },
            { id: 'emergency_medical', label: 'Emergency & Bio', icon: HeartPulse },
            { id: 'statutory', label: 'Statutory & KYC', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body - Scrollable Form */}
        <form onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: DP PROFILE PHOTO */}
          {activeSection === 'profile_photo' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 text-center">
                <div className="mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                    Display Picture (DP) Management
                  </span>
                  <h3 className="text-xs font-bold text-neutral-800 mt-1">
                    Upload & Crop Your Corporate Avatar
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 max-w-sm mx-auto">
                    Your uploaded DP is stored permanently in the database and displayed across ClickCamp workspaces, chat messages, and the admin directory.
                  </p>
                </div>

                {/* ProfilePictureUpload Component */}
                <ProfilePictureUpload
                  currentAvatarUrl={currentUser.avatarUrl}
                  userName={currentUser.name}
                  userId={currentUser.id}
                  size="lg"
                  showRemoveButton={true}
                />
              </div>

              {/* Corporate Identity Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Corporate Name</span>
                  <p className="font-bold text-neutral-900">{currentUser.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Official Email</span>
                  <p className="font-mono text-neutral-800 text-[11px]">{currentUser.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Department</span>
                  <p className="font-semibold text-neutral-800">{currentUser.department}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Clearance Role</span>
                  <p className="font-bold text-emerald-700">{currentUser.roleLabel || currentUser.role.toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeSection === 'contact_address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Primary Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Personal Email */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Personal / Alternate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                      placeholder="personal.email@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Residential Street Address
                  </label>
                  <div className="relative">
                    <Home className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Apartment / Flat number, Wing, Street, Landmark"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600 resize-none"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="560103"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY & MEDICAL & BIO */}
          {activeSection === 'emergency_medical' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Next of Kin / Emergency Contact Person</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="e.g. Ramesh Verma"
                      className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      placeholder="Parent, Spouse, Sibling"
                      className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="+91 98450 11223"
                      className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Professional Bio */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                  Professional Bio / Experience Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a brief overview of your skills, domain focus, and operational responsibilities..."
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY & KYC */}
          {activeSection === 'statutory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono uppercase text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Salary Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="HDFC Bank / ICICI Bank"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="50100482910123"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Bank IFSC Code</label>
                  <input
                    type="text"
                    value={formData.bankIfsc}
                    onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono uppercase text-neutral-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* 2FA Security Pill */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 text-xs">Two-Factor Authentication (2FA)</p>
                    <p className="text-[11px] text-neutral-500">TOTP Authenticator security enabled</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileSettingsOpen(false);
                    setIs2FAModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 cursor-pointer transition"
                >
                  View 2FA Details
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer with Save Button */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between shrink-0">
            {isSaved ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Information saved & database updated!</span>
              </div>
            ) : (
              <span className="text-[11px] text-neutral-400">
                * All changes are synced and persisted to database.
              </span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSaving ? 'Saving to Database...' : 'Save Employee Information'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
