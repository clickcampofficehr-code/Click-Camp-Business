import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Lock, Unlock, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

export const ScreenLockModal: React.FC = () => {
  const { isScreenLocked, unlockScreen, currentUser } = useWorkspace();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isScreenLocked) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = unlockScreen(pin);
    if (!success) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // auto-check 4-digit PIN
        const success = unlockScreen(nextPin);
        if (!success) {
          setError(true);
          setPin('');
          setTimeout(() => setError(false), 1500);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-white text-center animate-in fade-in zoom-in-95">
        {/* Security icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold tracking-tight">Workstation Locked</h2>
        <p className="text-xs text-neutral-400 mt-1">
          ClickCamp Technologies Enterprise Security Protocol
        </p>

        {/* User Card */}
        <div className="mt-4 p-2.5 bg-neutral-800/60 rounded-xl border border-neutral-700/60 flex items-center justify-center gap-2.5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-neutral-600"
          />
          <div className="text-left">
            <p className="text-xs font-semibold text-neutral-200">{currentUser.name}</p>
            <p className="text-[10px] text-neutral-400">{currentUser.roleLabel}</p>
          </div>
        </div>

        {/* PIN display */}
        <div className="mt-6">
          <p className="text-xs font-medium text-neutral-300 mb-2">Enter 4-digit security PIN:</p>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  pin.length > idx
                    ? 'bg-emerald-400 border-emerald-400 scale-110'
                    : 'border-neutral-600 bg-neutral-800'
                } ${error ? 'border-rose-500 bg-rose-500 animate-bounce' : ''}`}
              />
            ))}
          </div>
          {error && <p className="text-xs text-rose-400 mt-2 font-medium">Incorrect security PIN. Please try again.</p>}
        </div>

        {/* Keypad */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === 'C') setPin('');
                else if (k === '⌫') setPin((p) => p.slice(0, -1));
                else handleKeypadPress(k);
              }}
              className="py-2.5 text-sm font-semibold rounded-xl bg-neutral-800/90 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 text-neutral-200 transition cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 text-center">
          <span>Enterprise Workstation Guard • Protected Session</span>
        </div>
      </div>
    </div>
  );
};
