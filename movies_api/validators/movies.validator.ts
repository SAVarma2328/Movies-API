export function validatePageQuery(page: any) {
  if (page === undefined) return true;
  const n = Number(page);
  return Number.isInteger(n) && n > 0;
}

export function validateYearQuery(year: any) {
  if (!year) return false;
  const n = Number(year);
  return Number.isInteger(n) && n > 1800 && n < 2100;
}

export function validateSortOrder(order: any) {
  return !order || order === 'asc' || order === 'desc';
}