import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import QRCode from 'qrcode';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : '';

export default function GymConfigPanel() {
  const qc = useQueryClient();
  const canvasRef = useRef(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['gymConfig'],
    queryFn: () => api.get('/api/v1/coaches/gym/config'),
  });

  const [form, setForm] = useState({
    tipo_cuenta: 'estandar',
    gym_tipo_cobro: '',
    gym_frecuencia_tipo: 'por_semana',
    gym_frecuencia_valor: 3,
    gym_monto_pase_libre: '',
    gym_monto_clases: '',
    gym_paquetes_clases: [],
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        tipo_cuenta: config.tipo_cuenta || 'estandar',
        gym_tipo_cobro: config.gym_tipo_cobro || '',
        gym_frecuencia_tipo: config.gym_frecuencia_tipo || 'por_semana',
        gym_frecuencia_valor: config.gym_frecuencia_valor || 3,
        gym_monto_pase_libre: config.gym_monto_pase_libre || '',
        gym_monto_clases: config.gym_monto_clases || '',
        gym_paquetes_clases: config.gym_paquetes_clases || [],
      });
    }
  }, [config]);

  // Generate QR canvas when in gym mode
  useEffect(() => {
    if (config?.qr_url && form.tipo_cuenta === 'gimnasio' && canvasRef.current) {
      const fullUrl = `${APP_URL}${config.qr_url}`;
      QRCode.toCanvas(canvasRef.current, fullUrl, {
        width: 200,
        color: { dark: '#10b981', light: '#09090b' },
        errorCorrectionLevel: 'H',
      }).catch(() => {});
    }
  }, [config, form.tipo_cuenta]);

  const mutation = useMutation({
    mutationFn: (body) => api.patch('/api/v1/coaches/gym/config', body),
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ['gymConfig'] }); setTimeout(() => setSaved(false), 2500); },
  });

  const handleSave = () => {
    mutation.mutate({
      tipo_cuenta: form.tipo_cuenta,
      gym_tipo_cobro: form.tipo_cuenta === 'gimnasio' ? form.gym_tipo_cobro : null,
      gym_frecuencia_tipo: form.tipo_cuenta === 'gimnasio' && form.gym_tipo_cobro !== 'pase_libre' ? form.gym_frecuencia_tipo : null,
      gym_frecuencia_valor: form.tipo_cuenta === 'gimnasio' && form.gym_tipo_cobro !== 'pase_libre' ? Number(form.gym_frecuencia_valor) : null,
      gym_monto_pase_libre: (form.gym_tipo_cobro === 'pase_libre' || form.gym_tipo_cobro === 'ambos') ? Number(form.gym_monto_pase_libre) || null : null,
      gym_monto_clases: (form.gym_tipo_cobro === 'por_clases' || form.gym_tipo_cobro === 'ambos') ? Number(form.gym_monto_clases) || null : null,
      gym_paquetes_clases: form.tipo_cuenta === 'gimnasio' && (form.gym_tipo_cobro === 'por_clases' || form.gym_tipo_cobro === 'ambos') ? form.gym_paquetes_clases : [],
    });
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr-gimnasio.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  if (isLoading) return <div className="animate-pulse h-20 bg-zinc-800 rounded-xl" />;

  const isGym = form.tipo_cuenta === 'gimnasio';
  const needsClases = isGym && (form.gym_tipo_cobro === 'por_clases' || form.gym_tipo_cobro === 'ambos');
  const needsPaseLibre = isGym && (form.gym_tipo_cobro === 'pase_libre' || form.gym_tipo_cobro === 'ambos');

  return (
    <div className="space-y-5">
      {/* Tipo de cuenta */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Tipo de cuenta</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: 'estandar', label: 'Estándar', desc: 'Entrenador personal' },
            { val: 'gimnasio', label: 'Gimnasio', desc: 'Gestión de membresías y acceso QR' },
          ].map(opt => (
            <button key={opt.val} onClick={() => set('tipo_cuenta', opt.val)}
              className={`p-4 rounded-xl border text-left transition-all ${form.tipo_cuenta === opt.val ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
              <p className={`font-bold text-sm ${form.tipo_cuenta === opt.val ? 'text-emerald-400' : 'text-zinc-300'}`}>{opt.label}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Gym config */}
      {isGym && (
        <>
          {/* Tipo de cobro */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Tipo de cobro</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'pase_libre', label: 'Pase Libre' },
                { val: 'por_clases', label: 'Por Clases' },
                { val: 'ambos', label: 'Ambos' },
              ].map(opt => (
                <button key={opt.val} onClick={() => set('gym_tipo_cobro', opt.val)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${form.gym_tipo_cobro === opt.val ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paquetes de Clases (Múltiples) */}
          {needsClases && (
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Paquetes de Clases</p>
              
              <div className="space-y-3">
                {form.gym_paquetes_clases.map((pkg, i) => (
                  <div key={pkg.id || i} className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500">Cantidad de clases</label>
                      <input type="number" min={1} value={pkg.clases || ''}
                        onChange={e => {
                          const newPkgs = [...form.gym_paquetes_clases];
                          newPkgs[i].clases = Number(e.target.value);
                          set('gym_paquetes_clases', newPkgs);
                        }}
                        className="bg-transparent text-white text-sm outline-none w-full" placeholder="Ej: 8" />
                    </div>
                    <div className="w-px h-8 bg-zinc-800"></div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500">Precio ($)</label>
                      <input type="number" min={0} value={pkg.precio || ''}
                        onChange={e => {
                          const newPkgs = [...form.gym_paquetes_clases];
                          newPkgs[i].precio = Number(e.target.value);
                          set('gym_paquetes_clases', newPkgs);
                        }}
                        className="bg-transparent text-white text-sm outline-none w-full" placeholder="Ej: 15000" />
                    </div>
                    <button onClick={() => {
                      const newPkgs = form.gym_paquetes_clases.filter((_, idx) => idx !== i);
                      set('gym_paquetes_clases', newPkgs);
                    }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <button onClick={() => {
                const newPkgs = [...form.gym_paquetes_clases, { id: Date.now().toString(), clases: 8, precio: 10000 }];
                set('gym_paquetes_clases', newPkgs);
              }} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors">
                + Agregar Paquete
              </button>
            </div>
          )}

          {/* Monto Pase Libre */}
          {needsPaseLibre && (
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Monto Pase Libre ($/mes)</p>
              <input type="number" value={form.gym_monto_pase_libre} onChange={e => set('gym_monto_pase_libre', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ej: 15000" />
            </div>
          )}

          {/* QR Code */}
          {config?.qr_url && (
            <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">QR de acceso al gimnasio</p>
              <canvas ref={canvasRef} className="rounded-xl border border-emerald-500/20 p-2 bg-zinc-950" />
              <p className="text-zinc-500 text-[10px] text-center">Imprimí este QR y colocalo en la entrada del gimnasio</p>
              <div className="flex gap-3">
                <button onClick={downloadQR}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs uppercase tracking-widest transition-colors">
                  Descargar PNG
                </button>
                <button onClick={() => navigator.clipboard?.writeText(`${APP_URL}${config.qr_url}`)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors">
                  Copiar URL
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Save button */}
      <button onClick={handleSave} disabled={mutation.isPending}
        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all
          ${saved ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-emerald-500 hover:bg-emerald-400 text-black'}`}>
        {mutation.isPending ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Configuración'}
      </button>
    </div>
  );
}
   
 