
import React from 'react';

interface ScannerOverlayProps {
  onClose: () => void;
  onScan: (vin: string) => void;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onClose, onScan }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} className="p-2">
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="font-bold">Escanear VIN</span>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center">
        {/* Simulated Camera View */}
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
             <span className="text-slate-500 text-sm italic">Cargando cámara...</span>
        </div>
        
        {/* Frame Overlay */}
        <div className="relative w-72 h-40 border-2 border-white/50 rounded-lg flex items-center justify-center">
           <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1"></div>
           
           <div className="w-full h-0.5 bg-red-500/50 shadow-[0_0_10px_red] animate-pulse"></div>
        </div>
        
        <p className="absolute bottom-20 left-0 right-0 text-center text-white/70 text-xs px-10">
          Enfoque el código VIN de 17 dígitos del vehículo
        </p>
      </div>
      
      <div className="bg-slate-900 p-8 flex justify-center">
        <button 
          onClick={() => onScan('1HGCM82633A004352')}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-bold transition-all"
        >
          Simular Captura
        </button>
      </div>
    </div>
  );
};

export default ScannerOverlay;
