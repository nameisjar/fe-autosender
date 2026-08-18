import { describe, expect, it } from 'vitest';
import {
  hasStudentVariable,
  insertTemplateAtSelection,
  resolveChatTemplate,
} from '../../utils/chatTemplate.js';

describe('chat template utilities', () => {
  it('replaces every siswa variable with the contact first name', () => {
    expect(resolveChatTemplate('Halo {{siswa}}, apakah {{ SISWA }} hadir?', ' Shania ')).toEqual({
      message: 'Halo Shania, apakah Shania hadir?',
      usesStudentVariable: true,
      resolved: true,
    });
  });

  it('does not modify a template without the siswa variable', () => {
    expect(resolveChatTemplate('Selamat pagi Parents', 'Shania')).toEqual({
      message: 'Selamat pagi Parents',
      usesStudentVariable: false,
      resolved: true,
    });
  });

  it('preserves an unresolved variable when the contact has no first name', () => {
    expect(resolveChatTemplate('Halo {{siswa}}', '')).toEqual({
      message: 'Halo {{siswa}}',
      usesStudentVariable: true,
      resolved: false,
    });
    expect(hasStudentVariable('Halo {{ siswa }}')).toBe(true);
  });

  it('inserts a template at the current selection without merging paragraphs', () => {
    expect(insertTemplateAtSelection('AwalAkhir', 'Template', 4, 4)).toEqual({
      value: 'Awal\n\nTemplate\n\nAkhir',
      caret: 14,
    });
  });
});
