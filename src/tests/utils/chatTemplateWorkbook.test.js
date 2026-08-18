import { describe, expect, it } from 'vitest';
import { parseChatTemplateSheetRows } from '../../utils/chatTemplateWorkbook.js';

describe('chat template workbook', () => {
  it('membaca template baru dan pembaruan dari kolom Excel', () => {
    const rows = parseChatTemplateSheetRows([
      ['template_id', 'judul', 'isi_pesan'],
      ['template-1', 'Konfirmasi EC', 'Halo {{siswa}}\nApakah bisa hadir?'],
      ['', 'Pengingat Baru', 'Selamat pagi Parents 🙏'],
    ]);

    expect(rows).toEqual([
      {
        rowNumber: 2,
        id: 'template-1',
        title: 'Konfirmasi EC',
        message: 'Halo {{siswa}}\nApakah bisa hadir?',
      },
      {
        rowNumber: 3,
        id: '',
        title: 'Pengingat Baru',
        message: 'Selamat pagi Parents 🙏',
      },
    ]);
  });

  it('mendukung nama kolom alternatif dan melewati baris kosong', () => {
    expect(parseChatTemplateSheetRows([
      ['ID Template', 'Title', 'Message'],
      ['', '', ''],
      ['', 'Template A', 'Pesan A'],
    ])).toEqual([
      { rowNumber: 3, id: '', title: 'Template A', message: 'Pesan A' },
    ]);
  });

  it('menolak file tanpa kolom wajib', () => {
    expect(() => parseChatTemplateSheetRows([
      ['template_id', 'judul'],
      ['', 'Template A'],
    ])).toThrow('Kolom judul dan isi_pesan wajib tersedia');
  });
});
