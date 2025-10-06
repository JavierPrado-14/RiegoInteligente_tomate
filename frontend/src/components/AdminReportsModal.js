// frontend/src/components/AdminReportsModal.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './AdminModals.css';

const AdminReportsModal = ({ isOpen, closeModal }) => {
  const [reportType, setReportType] = useState('riegos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const chartRef = useRef(null);
  const API_BASE_URL = "http://localhost:4000/api";

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('fechaInicio', startDate);
      if (endDate) params.append('fechaFin', endDate);
      const res = await fetch(`${API_BASE_URL}/riego/historial?${params.toString()}`);
      if (!res.ok) throw new Error('Error al obtener historial');
      const rows = await res.json();
      setData(rows);
    } catch (e) {
      console.error(e);
      setData([]);
    }
  };

  useEffect(() => {
    if (isOpen && reportType === 'riegos') {
      fetchData();
    }
  }, [isOpen, reportType]);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    await fetchData();
  };

  const chartSeries = useMemo(() => {
    // Agrupar por fecha y contar riegos
    const map = new Map();
    const parcelaCount = new Map();
    data.forEach(r => {
      let key = '';
      if (r.fecha) {
        try {
          key = new Date(r.fecha).toISOString().slice(0,10);
        } catch (_) {
          key = (r.fecha + '').slice(0,10);
        }
      }
      map.set(key, (map.get(key) || 0) + 1);
      if (r.parcela) parcelaCount.set(r.parcela, (parcelaCount.get(r.parcela) || 0) + 1);
    });
    const labels = Array.from(map.keys()).sort();
    const values = labels.map(l => map.get(l));
    // Cálculos resumen
    const total = data.length;
    const promedio = labels.length ? (total / labels.length) : 0;
    let pico = 0;
    values.forEach(v => { if (v > pico) pico = v; });
    let topParcela = '';
    let maxCnt = 0;
    parcelaCount.forEach((cnt, p) => { if (cnt > maxCnt) { maxCnt = cnt; topParcela = p; } });
    return { labels, values, total, promedio, pico, topParcela };
  }, [data]);

  const downloadPDF = () => {
    // Estrategia simple sin dependencias: abrir ventana con contenido imprimible
    const printable = document.createElement('div');
    printable.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2 style="margin-top:0;">Reporte de Riegos</h2>
        <p><strong>Rango:</strong> ${startDate || '—'} a ${endDate || '—'}</p>
        <p><strong>Total de riegos:</strong> ${data.length}</p>
        <div>${chartRef.current ? chartRef.current.outerHTML : ''}</div>
        <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:12px;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:6px; text-align:left;">Fecha</th>
              <th style="border:1px solid #ddd; padding:6px; text-align:left;">Hora Inicio</th>
              <th style="border:1px solid #ddd; padding:6px; text-align:left;">Hora Fin</th>
              <th style="border:1px solid #ddd; padding:6px; text-align:left;">Parcela</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td style="border:1px solid #ddd; padding:6px;">${(r.fecha || '').slice(0,10)}</td>
                <td style="border:1px solid #ddd; padding:6px;">${r.hora_inicio || ''}</td>
                <td style="border:1px solid #ddd; padding:6px;">${r.hora_fin || ''}</td>
                <td style="border:1px solid #ddd; padding:6px;">${r.parcela || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    const w = window.open('', 'PRINT', 'height=800,width=1000');
    if (!w) return;
    w.document.write('<html><head><title>Reporte de Riegos</title></head><body>');
    w.document.body.appendChild(printable);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    // El usuario puede elegir "Guardar como PDF" en el diálogo de impresión
  };

  const Chart = () => {
    const { labels, values } = chartSeries;
    if (!labels.length) return <p>No hay datos para el rango seleccionado.</p>;

    // Construir SVG responsive
    const width = 800;
    const height = 300;
    const padding = 40;
    const maxY = Math.max(1, ...values);
    const stepX = (width - padding * 2) / (labels.length - 1 || 1);
    const scaleY = (v) => height - padding - ((v / maxY) * (height - padding * 2));

    const points = values.map((v, i) => `${padding + i * stepX},${scaleY(v)}`).join(' ');

    return (
      <div style={{overflowX: 'auto'}}>
        <svg ref={chartRef} width={width} height={height} style={{ background: '#fff' }}>
          <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
          {/* Ejes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />
          {/* Línea de datos */}
          <polyline fill="none" stroke="#3498db" strokeWidth="3" points={points} />
          {/* Puntos */}
          {values.map((v, i) => (
            <g key={i}>
              <circle cx={padding + i * stepX} cy={scaleY(v)} r="5" fill="#2980b9">
                <title>{`${labels[i]}: ${v} riego${v!==1?'s':''}`}</title>
              </circle>
            </g>
          ))}
          {/* Etiquetas X */}
          {labels.map((l, i) => (
            <text key={i} x={padding + i * stepX} y={height - padding + 16} fontSize="10" textAnchor="middle" fill="#555">{l}</text>
          ))}
          {/* Etiquetas Y simples: 0 y max */}
          <text x={padding - 10} y={height - padding} fontSize="10" textAnchor="end" fill="#555">0</text>
          <text x={padding - 10} y={padding} fontSize="10" textAnchor="end" fill="#555">{maxY}</text>
          <text x={width/2} y={20} fontSize="14" textAnchor="middle" fill="#2c3e50">Riegos programados por día</text>
        </svg>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-modal">
        <div className="modal-header">
          <h2>Generar Reportes de Riego</h2>
          <button className="close-button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleGenerateReport}>
            <div className="form-group">
              <label htmlFor="reportType">Tipo de Reporte:</label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="riegos">Riegos Programados</option>
                <option value="ejecutados">Riegos Ejecutados</option>
                <option value="consumo">Consumo de Agua</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Fecha Inicio:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Fecha Fin:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button type="submit">
                Generar Reporte
              </button>
              <button type="button" onClick={downloadPDF}>
                Descargar PDF
              </button>
            </div>
          </form>
          {/* Tarjetas resumen */}
          <div className="report-summary">
            <div className="report-card">
              <p className="title">Total riegos</p>
              <p className="value">{chartSeries.total}</p>
            </div>
            <div className="report-card">
              <p className="title">Promedio por día</p>
              <p className="value">{chartSeries.promedio.toFixed(2)}</p>
            </div>
            <div className="report-card">
              <p className="title">Día con más riegos</p>
              <p className="value">{chartSeries.pico}</p>
            </div>
            <div className="report-card">
              <p className="title">Parcela más regada</p>
              <p className="value">{chartSeries.topParcela || '—'}</p>
            </div>
          </div>
          {/* Leyenda */}
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot"></span> Riegos programados</span>
          </div>
          <div style={{marginTop: 20}}>
            <Chart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsModal;