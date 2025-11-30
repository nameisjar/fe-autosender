// Lazy load XLSX library only when needed
let xlsxPromise = null;

export const loadXLSX = () => {
  // Return existing promise if already loading
  if (xlsxPromise) {
    return xlsxPromise;
  }

  xlsxPromise = new Promise((resolve, reject) => {
    // Check if XLSX is already loaded
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
    script.async = true;

    script.onload = () => {
      if (window.XLSX) {
        resolve(window.XLSX);
      } else {
        reject(new Error('XLSX library failed to load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load XLSX library'));
    };

    document.head.appendChild(script);
  });

  return xlsxPromise;
};
