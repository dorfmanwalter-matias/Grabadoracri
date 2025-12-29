
export interface VINData {
  fullVin: string;
  processedVin: string;
  isValid: boolean;
  timestamp: number;
}

export enum AppScreen {
  PROCESSOR = 'processor',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export interface PrintSettings {
  fontSize: number;
  letterSpacing: number;
  orientation: 'horizontal' | 'vertical';
  marginHorizontal: number; // Espacio antes/después de los asteriscos
  verticalOffset: number; // Altura dentro del área
  canvasHeight: number; // Altura total de la franja (por defecto ~1cm)
}
