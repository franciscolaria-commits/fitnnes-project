import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm' | 'prompt'
    message: '',
    inputPlaceholder: '',
    inputValue: '',
  });

  const resolverRef = useRef(null);

  const showAlert = (message) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalState({ isOpen: true, type: 'alert', message, inputValue: '', inputPlaceholder: '' });
    });
  };

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalState({ isOpen: true, type: 'confirm', message, inputValue: '', inputPlaceholder: '' });
    });
  };

  const showPrompt = (message, inputPlaceholder = '') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalState({ isOpen: true, type: 'prompt', message, inputPlaceholder, inputValue: '' });
    });
  };

  const handleConfirm = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      if (modalState.type === 'prompt') {
        resolverRef.current(modalState.inputValue);
      } else if (modalState.type === 'confirm') {
        resolverRef.current(true);
      } else {
        resolverRef.current(true); // alert resolves to true
      }
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      if (modalState.type === 'prompt') {
        resolverRef.current(null);
      } else {
        resolverRef.current(false);
      }
      resolverRef.current = null;
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalState.isOpen) {
        handleCancel();
      }
      if (e.key === 'Enter' && modalState.isOpen && modalState.type !== 'prompt') {
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen, modalState.type]);

  return (
    <ModalContext.Provider value={{ alert: showAlert, confirm: showConfirm, prompt: showPrompt }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 font-sans text-zinc-200">
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <p className="text-base sm:text-lg font-bold text-zinc-100">{modalState.message}</p>
            
            {modalState.type === 'prompt' && (
              <input
                autoFocus
                type="text"
                placeholder={modalState.inputPlaceholder}
                value={modalState.inputValue}
                onChange={(e) => setModalState(prev => ({ ...prev, inputValue: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600"
              />
            )}

            <div className="flex items-center justify-end gap-3 mt-2">
              {modalState.type !== 'alert' && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-bold tracking-widest uppercase text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 text-sm font-black tracking-widest uppercase text-zinc-950 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                  modalState.type === 'alert' ? 'bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-500' : 'bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-500'
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
