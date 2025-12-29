
import React, { useState, useMemo, useEffect } from 'react';
import { AppScreen, PrintSettings } from './types';
import { generatePrintImage, sendToRawBT } from './services/printService';
import { AUTHORIZED_VINS } from './constants';
import ScannerOverlay from './components/ScannerOverlay';

const DEFAULT_SETTINGS: PrintSettings = {
  fontSize: 52,
  letterSpacing: 3,
  orientation: 'horizontal',
  marginHorizontal: 15,
  verticalOffset: 0,
  canvasHeight: 80
};

const App: React.FC = () => {
  const [showList, setShowList] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [vinInput, setVinInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  const [settings, setSettings] = useState<PrintSettings>(() => {
    const saved = localStorage.getItem('furlong_print_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const saveSettings = (newSettings: PrintSettings) => {
    setSettings(newSettings);
    localStorage.setItem('furlong_print_settings', JSON.stringify(newSettings));
  };

  const isCorrectLength = vinInput.length === 17;
  const isAuthorized = useMemo(() => AUTHORIZED_VINS.includes(vinInput), [vinInput]);
  const canPrint = isCorrectLength && isAuthorized;

  const processedVin = useMemo(() => {
    if (vinInput.length >= 8) {
      return `*${vinInput.slice(-8)}*`;
    }
    return '********';
  }, [vinInput]);

  const handlePrint = async (copies: number) => {
    if (!canPrint) return;
    setIsPrinting(true);
    try {
      const imageUrl = await generatePrintImage(processedVin, settings);
      await sendToRawBT(imageUrl, copies);
    } catch (error) {
      alert('Error de impresión. Verifique RAWBT.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (val.length <= 17) setVinInput(val);
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-slate-50 overflow-hidden relative shadow-2xl safe-top">
      
      {/* Header Fijo */}
      <header className="bg-[#003c71] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-md shadow-sm">
             <img src="https://www.furlong.com.ar/wp-content/uploads/2021/05/logo-furlong.png" alt="Furlong" className="h-6 object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[12px] font-black tracking-widest uppercase text-yellow-400">Terminal POS</h1>
            <span className="text-[9px] font-bold opacity-70 uppercase">Logística & Distribución</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowSettings(false); setShowList(!showList); }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${showList ? 'bg-yellow-400 text-[#003c71]' : 'bg-[#002b52] text-blue-200'}`}
          >
            <span className="material-symbols-outlined text-xl font-bold">list_alt</span>
          </button>
          <button 
            onClick={() => { setShowList(false); setShowSettings(!showSettings); }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${showSettings ? 'bg-yellow-400 text-[#003c71]' : 'bg-[#002b52] text-blue-200'}`}
          >
            <span className="material-symbols-outlined text-xl font-bold">settings</span>
          </button>
        </div>
      </header>

      {/* Área Central Scrolleable */}
      <div className="flex-1 overflow-y-auto relative bg-slate-100/50">
        
        {/* Vista Settings */}
        {showSettings && (
          <div className="absolute inset-0 z-40 bg-white animate-in slide-in-from-top duration-300 flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">tune</span>
                Ajustes de Impresión
              </span>
              <button onClick={() => setShowSettings(false)} className="bg-slate-200 p-1 rounded-full"><span className="material-symbols-outlined text-slate-600">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orientación</label>
                <div className="flex gap-2">
                  {['horizontal', 'vertical'].map((o) => (
                    <button 
                      key={o}
                      onClick={() => saveSettings({...settings, orientation: o as any})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black border-2 transition-all ${settings.orientation === o ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                    >
                      {o.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'Tamaño Letra', key: 'fontSize', min: 20, max: 100, unit: 'px' },
                  { label: 'Separación Letras', key: 'letterSpacing', min: 0, max: 30, unit: 'px' },
                  { label: 'Margen (*)', key: 'marginHorizontal', min: 0, max: 150, unit: 'px' },
                  { label: 'Altura (Offset)', key: 'verticalOffset', min: -50, max: 50, unit: 'px' }
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{(settings as any)[item.key]}{item.unit}</span>
                    </div>
                    <input 
                      type="range" 
                      min={item.min} 
                      max={item.max} 
                      value={(settings as any)[item.key]} 
                      onChange={(e) => saveSettings({...settings, [item.key]: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => saveSettings(DEFAULT_SETTINGS)}
                className="w-full py-4 text-[10px] font-black text-red-500 uppercase border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-colors"
              >
                Restaurar valores de fábrica
              </button>
            </div>
          </div>
        )}

        {/* Vista Listado */}
        {showList && (
          <div className="absolute inset-0 z-40 bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">VINs Permitidos</span>
              <button onClick={() => setShowList(false)} className="bg-slate-200 p-1 rounded-full"><span className="material-symbols-outlined text-slate-600">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {AUTHORIZED_VINS.map((v, i) => (
                <button 
                  key={i} 
                  onClick={() => { setVinInput(v); setShowList(false); }}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-sm hover:border-blue-500 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-700 tracking-tight">{v}</span>
                  <span className="material-symbols-outlined text-blue-500">add_circle</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Home View */}
        <div className="p-5 space-y-6">
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Entrada de Datos</h2>
              <span className={`text-[11px] font-black px-2 py-1 rounded-md ${isCorrectLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                {vinInput.length} / 17
              </span>
            </div>
            <div className="relative group">
              <input 
                type="text"
                value={vinInput}
                onChange={handleInputChange}
                autoFocus
                className={`w-full h-20 pl-6 pr-16 rounded-[2rem] border-4 font-mono text-2xl tracking-tighter transition-all outline-none shadow-xl ${
                  isCorrectLength 
                    ? isAuthorized ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-red-500 bg-red-50 text-red-900'
                    : 'border-white focus:border-blue-600 bg-white'
                }`}
                placeholder="ESCANEÉ O ESCRIBA..."
              />
              <button 
                onClick={() => setIsScanning(true)}
                className="absolute right-3 top-3 w-14 h-14 bg-[#003c71] text-yellow-400 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-2xl font-black">qr_code_scanner</span>
              </button>
            </div>

            {isCorrectLength && (
              <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${
                isAuthorized ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-600 border-red-500 text-white'
              }`}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{isAuthorized ? 'verified' : 'report_problem'}</span>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest">{isAuthorized ? 'Chasis Autorizado' : 'Error de Autorización'}</p>
                  <p className="text-[9px] font-bold opacity-90">{isAuthorized ? 'El VIN se encuentra en el plan de carga.' : 'Este VIN no está en la base de datos de hoy.'}</p>
                </div>
              </div>
            )}
          </section>

          {/* Vista Previa de Etiqueta */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Vista Previa Etiqueta</h3>
             <div className={`rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[160px] transition-all duration-700 border-4 border-dashed relative overflow-hidden ${
               canPrint ? 'bg-white border-blue-600 shadow-2xl scale-[1.02]' : 'bg-slate-200 border-slate-300 opacity-60'
             }`}>
                {/* Visualización dinámica de ajustes */}
                <div 
                  className={`font-mono font-black transition-all duration-300 text-center uppercase tracking-tighter ${canPrint ? 'text-slate-900' : 'text-slate-400'}`}
                  style={{
                    fontSize: `${settings.fontSize * 0.7}px`,
                    letterSpacing: `${settings.letterSpacing * 0.5}px`,
                    transform: `translateY(${settings.verticalOffset * 0.5}px) rotate(${settings.orientation === 'vertical' ? '90deg' : '0deg'})`,
                    padding: `0 ${settings.marginHorizontal * 0.2}px`,
                    textShadow: canPrint ? '0 1px 1px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {processedVin}
                </div>
                
                {canPrint && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-[#003c71] rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm">
                    Rollo Térmico 1CM
                  </div>
                )}
             </div>
          </section>
        </div>
      </div>

      {/* Footer Fijo con Botones Grandes */}
      <footer className="bg-white border-t border-slate-200 p-6 shrink-0 z-50 flex flex-col gap-4 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] safe-bottom">
        <div className="flex gap-4">
          <button 
            onClick={() => handlePrint(1)}
            disabled={!canPrint || isPrinting}
            className={`flex-1 h-20 rounded-[1.5rem] border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${
              canPrint ? 'border-blue-600 text-blue-700 bg-blue-50 font-black' : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed font-bold'
            }`}
          >
            <span className="material-symbols-outlined text-3xl mb-1">filter_1</span>
            <span className="text-[10px] uppercase tracking-tighter">IMPRIMIR 1</span>
          </button>
          
          <button 
            onClick={() => handlePrint(6)}
            disabled={!canPrint || isPrinting}
            className={`flex-[1.5] h-20 rounded-[1.5rem] flex flex-col items-center justify-center transition-all active:scale-95 shadow-2xl relative overflow-hidden ${
              canPrint ? 'bg-[#003c71] text-white shadow-blue-900/30' : 'bg-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canPrint && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 animate-pulse"></div>}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">print</span>
              <span className="text-lg font-black italic tracking-tighter uppercase">IMPRIMIR 6</span>
            </div>
            <span className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em]">Modo Lote RAWBT</span>
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-50">
          Operaciones Furlong S.A.
        </p>
      </footer>

      {isScanning && <ScannerOverlay onClose={() => setIsScanning(false)} onScan={(vin) => { setVinInput(vin); setIsScanning(false); }} />}

      {/* Pantalla de Carga de Impresión */}
      {isPrinting && (
        <div className="fixed inset-0 bg-[#003c71]/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center text-white p-10 text-center">
           <div className="relative mb-8">
              <div className="w-24 h-24 border-8 border-white/10 rounded-full"></div>
              <div className="w-24 h-24 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              <span className="material-symbols-outlined text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse">print</span>
           </div>
           <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Transmitiendo...</h3>
           <div className="bg-white/10 px-6 py-3 rounded-2xl">
             <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Generando Gráficos RAWBT</p>
             <p className="text-[10px] opacity-60 mt-1 uppercase">No cierre la aplicación</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
