const TEMPLATE_SHEET_NAME = 'Templates';
const MAX_IMPORT_ROWS = 500;

const normalizeHeader = (value) => String(value || '')
  .trim()
  .toLocaleLowerCase('id-ID')
  .replace(/[\s-]+/g, '_');

const headerType = (value) => {
  const header = normalizeHeader(value);
  if (['template_id', 'id_template', 'id'].includes(header)) return 'id';
  if (['judul', 'title'].includes(header)) return 'title';
  if (['isi_pesan', 'pesan', 'message', 'content'].includes(header)) return 'message';
  return '';
};

export function parseChatTemplateSheetRows(matrix) {
  if (!Array.isArray(matrix) || !matrix.length) {
    throw new Error('File Excel tidak berisi data');
  }

  const headerIndex = matrix.findIndex((row) => (
    Array.isArray(row) && row.some((cell) => String(cell || '').trim())
  ));
  if (headerIndex < 0) throw new Error('Header Excel tidak ditemukan');

  const headers = Array.isArray(matrix[headerIndex]) ? matrix[headerIndex] : [];
  const columns = {};
  headers.forEach((header, index) => {
    const type = headerType(header);
    if (type && columns[type] === undefined) columns[type] = index;
  });
  if (columns.title === undefined || columns.message === undefined) {
    throw new Error('Kolom judul dan isi_pesan wajib tersedia');
  }

  const rows = matrix
    .slice(headerIndex + 1)
    .map((row, index) => {
      const values = Array.isArray(row) ? row : [];
      return {
        rowNumber: headerIndex + index + 2,
        id: columns.id === undefined ? '' : String(values[columns.id] || '').trim(),
        title: String(values[columns.title] || '').trim(),
        message: String(values[columns.message] || '').trim(),
      };
    })
    .filter((row) => row.id || row.title || row.message);

  if (!rows.length) throw new Error('File Excel tidak berisi data template');
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new Error(`Maksimal ${MAX_IMPORT_ROWS} template dalam satu kali import`);
  }
  return rows;
}

const loadXlsx = async () => {
  const module = await import('xlsx');
  return module.default || module;
};

export async function readChatTemplateWorkbook(file) {
  const XLSX = await loadXlsx();
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames.includes(TEMPLATE_SHEET_NAME)
    ? TEMPLATE_SHEET_NAME
    : workbook.SheetNames[0];
  if (!sheetName) throw new Error('Sheet template tidak ditemukan');
  const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false,
  });
  return parseChatTemplateSheetRows(matrix);
}

const addInstructionSheet = (XLSX, workbook) => {
  const guide = [
    ['Panduan Import Custom Template Chat'],
    ['Kolom', 'Keterangan'],
    ['template_id', 'Jangan diubah untuk memperbarui template lama. Kosongkan untuk membuat template baru.'],
    ['judul', 'Wajib diisi, maksimal 128 karakter, dan unik dalam akun Anda.'],
    ['isi_pesan', 'Wajib diisi, maksimal 10.000 karakter. Baris baru dan emoji didukung.'],
    ['Variabel', 'Gunakan {{siswa}} agar nama depan kontak diisi saat template dipilih di Inbox.'],
    ['Catatan', 'Menghapus baris dari file tidak menghapus template di aplikasi.'],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(guide);
  sheet['!cols'] = [{ wch: 20 }, { wch: 92 }];
  XLSX.utils.book_append_sheet(workbook, sheet, 'Panduan');
};

export async function downloadChatTemplateWorkbook(templates, { empty = false } = {}) {
  const XLSX = await loadXlsx();
  const workbook = XLSX.utils.book_new();
  const rows = [['template_id', 'judul', 'isi_pesan']];
  if (!empty) {
    (Array.isArray(templates) ? templates : []).forEach((template) => {
      rows.push([template.id || '', template.title || '', template.message || '']);
    });
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{ wch: 40 }, { wch: 34 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(workbook, sheet, TEMPLATE_SHEET_NAME);
  addInstructionSheet(XLSX, workbook);

  const date = new Date().toISOString().slice(0, 10);
  const filename = empty
    ? 'format-custom-template-chat.xlsx'
    : `custom-template-chat-${date}.xlsx`;
  XLSX.writeFile(workbook, filename, { compression: true });
}

