import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, Ban, CheckCircle } from 'lucide-react';

export default function FinancesPanel({ students, api, loadStudents, modal }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthYearString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const displayMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  useEffect(() => {
    loadPayments();
  }, [currentDate]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/coaches/payments?anio_mes=${monthYearString}`);
      setPayments(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToggleSuspend = async (studentId, currentStatus) => {
    const action = currentStatus ? "suspender" : "restaurar";
    if (!(await modal.confirm(`¿Estás seguro de que deseas ${action} el acceso de este alumno?`))) return;
    
    try {
      await api.patch(`/api/v1/coaches/students/${studentId}/suspend`, {
        estado_activo: !currentStatus
      });
      await loadStudents(); // Recargar datos de alumnos
      await loadPayments(); // Recargar pagos
      await modal.alert(`Acceso del alumno ${!currentStatus ? 'restaurado' : 'suspendido'} exitosamente.`);
    } catch (e) {
      await modal.alert("Error al actualizar el estado del alumno.");
    }
  };

  const handleMarkPaid = async (studentId) => {
    const isPaid = await modal.confirm("¿El alumno ya realizó el pago?");
    if (!isPaid) return;

    const amountStr = window.prompt("Opcional: Ingresa el monto pagado (ej: 50.00)", "");
    let amount = null;
    if (amountStr !== null && amountStr.trim() !== "") {
        amount = parseFloat(amountStr);
        if (isNaN(amount)) amount = null;
    }

    try {
      await api.post(`/api/v1/coaches/payments`, {
        id_alumno: studentId,
        anio_mes: monthYearString,
        monto: amount,
        metodo_pago: null,
        notas: null
      });
      await loadPayments();
    } catch (e) {
      await modal.alert("Error al registrar el pago.");
    }
  };

  const handleRevertPayment = async (pagoId) => {
    if (!(await modal.confirm("¿Estás seguro de anular este pago?"))) return;
    try {
      await api.delete(`/api/v1/coaches/payments/${pagoId}`);
      await loadPayments();
    } catch (e) {
      await modal.alert("Error al anular el pago.");
    }
  };

  const safePayments = Array.isArray(payments) ? payments : [];
  const totalPaid = safePayments.filter(p => p.pagado).length;
  const totalPending = safePayments.filter(p => !p.pagado && p.estado_activo).length;
  const totalMoney = safePayments.filter(p => p.pagado && p.pago?.monto).reduce((acc, curr) => acc + curr.pago.monto, 0);

  return (
    <section className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Finanzas y Pagos
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Control mensual de mensualidades.</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold w-32 text-center text-zinc-100 capitalize">
            {displayMonthYear}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Pagados</span>
          <span className="text-2xl font-black text-emerald-400">{totalPaid}</span>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Pendientes</span>
          <span className="text-2xl font-black text-amber-400">{totalPending}</span>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Ingresos</span>
          <span className="text-2xl font-black text-blue-400">${totalMoney.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {loading ? (
          <p className="text-center text-sm text-zinc-500 py-4">Cargando...</p>
        ) : safePayments.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 py-4">No tienes alumnos registrados.</p>
        ) : (
          safePayments.map(student => (
            <div key={student.id_alumno} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border ${!student.estado_activo ? 'bg-zinc-900/40 border-red-900/30 opacity-70' : student.pagado ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-zinc-900/60 border-zinc-800/60'} gap-4`}>
              <div>
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  {student.nombre_alumno}
                  {!student.estado_activo && <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full border border-red-700/50">SUSPENDIDO</span>}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{student.email_alumno}</p>
                {student.pagado && student.pago?.monto && (
                  <p className="text-xs text-emerald-400 mt-1">Monto: ${student.pago.monto}</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {student.pagado ? (
                  <button 
                    onClick={() => handleRevertPayment(student.pago.id_pago)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-900/40 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-700/50 hover:bg-emerald-800/50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Pagado
                  </button>
                ) : (
                  <button 
                    onClick={() => handleMarkPaid(student.id_alumno)}
                    disabled={!student.estado_activo}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg disabled:opacity-50 transition-all"
                  >
                    Marcar Pagado
                  </button>
                )}
                
                <button
                  onClick={() => handleToggleSuspend(student.id_alumno, student.estado_activo)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${student.estado_activo ? 'bg-red-900/20 text-red-400 border-red-900/40 hover:bg-red-900/40' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'}`}
                >
                  <Ban className="w-4 h-4" />
                  {student.estado_activo ? 'Suspender' : 'Restaurar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
