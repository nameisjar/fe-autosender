const STUDENT_VARIABLE_PATTERN = /\{\{\s*siswa\s*\}\}/gi;

export function hasStudentVariable(message = '') {
  return /\{\{\s*siswa\s*\}\}/i.test(String(message));
}

export function resolveChatTemplate(message = '', firstName = '') {
  const source = String(message);
  const normalizedName = String(firstName || '').trim();
  const usesStudentVariable = hasStudentVariable(source);

  if (!usesStudentVariable || !normalizedName) {
    return {
      message: source,
      usesStudentVariable,
      resolved: !usesStudentVariable,
    };
  }

  return {
    message: source.replace(STUDENT_VARIABLE_PATTERN, normalizedName),
    usesStudentVariable: true,
    resolved: true,
  };
}

export function insertTemplateAtSelection(current = '', template = '', start, end) {
  const source = String(current);
  const insertion = String(template);
  const selectionStart = Number.isInteger(start) ? Math.max(0, Math.min(start, source.length)) : source.length;
  const selectionEnd = Number.isInteger(end)
    ? Math.max(selectionStart, Math.min(end, source.length))
    : selectionStart;
  const before = source.slice(0, selectionStart);
  const after = source.slice(selectionEnd);
  const prefix = before && !before.endsWith('\n') ? '\n\n' : '';
  const suffix = after && !after.startsWith('\n') ? '\n\n' : '';
  const value = `${before}${prefix}${insertion}${suffix}${after}`;

  return {
    value,
    caret: before.length + prefix.length + insertion.length,
  };
}
