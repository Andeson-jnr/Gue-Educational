import QRCode from 'qrcode';

export async function generateQrDataUrl(verificationUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H', // High error correction for printed ID cards
      margin: 1,
      width: 400,
      color: {
        dark: '#0f3a5d', // Institutional navy for crisp, professional scanning
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

export async function generateQrSvg(verificationUrl: string): Promise<string> {
  try {
    return await QRCode.toString(verificationUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#0f3a5d',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    throw err;
  }
}
