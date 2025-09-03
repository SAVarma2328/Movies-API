export function extractGenresFromRows(rows: any[]): string[] {
  const genreSet = new Set<string>();
  for (const row of rows) {
    const genres = JSON.parse(row.genres);
    for (const genre of genres) {
      genreSet.add(genre.name);
    }
  }
  return Array.from(genreSet);
}