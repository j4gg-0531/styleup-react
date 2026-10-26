// src/utils/semana.js
// Utilidad compartida para calcular los días de una semana.
// Usada en Horarios.jsx y PerfilBarbero.jsx

export const getDiasSemana = (offset = 0) => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1) + offset * 7);

  return Array.from({ length: 6 }, (_, i) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);
    return {
      name: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i],
      num: String(dia.getDate()),
      fecha: dia,
    };
  });
};

export const fmtFecha = (d) =>
  d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });