
import { PrintSettings } from '../types';

/**
 * Genera una imagen para impresión térmica basada en ajustes personalizados.
 */
export const generatePrintImage = (text: string, settings: PrintSettings): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    const rollWidth = 384; // Ancho estándar de 58mm en puntos
    
    // Configuramos dimensiones según orientación
    if (settings.orientation === 'horizontal') {
      canvas.width = rollWidth;
      canvas.height = settings.canvasHeight;
    } else {
      // En vertical, el largo es dinámico pero limitado para la etiqueta
      canvas.width = rollWidth;
      canvas.height = 400; // Altura generosa para texto vertical
    }

    // Fondo blanco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Preparar texto con márgenes configurados
    const marginStr = " ".repeat(Math.max(0, Math.floor(settings.marginHorizontal / 5)));
    const finalText = `${marginStr}${text}${marginStr}`;

    // Estilo de fuente
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Aplicar espaciado de caracteres si el navegador lo soporta
    if ('letterSpacing' in ctx) {
      (ctx as any).letterSpacing = `${settings.letterSpacing}px`;
    }

    ctx.font = `bold ${settings.fontSize}px "Roboto Mono", monospace`;

    if (settings.orientation === 'horizontal') {
      // Dibujamos transversal (normal sobre el ancho)
      ctx.fillText(finalText, canvas.width / 2, (canvas.height / 2) + settings.verticalOffset);
    } else {
      // Dibujamos vertical (rotado 90 grados)
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(finalText, 0, settings.verticalOffset);
      ctx.restore();
    }

    resolve(canvas.toDataURL('image/png'));
  });
};

export const sendToRawBT = async (base64Image: string, copies: number = 1) => {
  const pureBase64 = base64Image.split(',')[1];
  
  for (let i = 0; i < copies; i++) {
    const rawbtUrl = `rawbt:${pureBase64}`;
    window.location.href = rawbtUrl;
    
    if (copies > 1) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }
};
