import { Tool } from '../types';

/**
 * Parses a standard CSV row handling quotes, escaped quotes, and commas inside quotes.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Extracts a readable domain or hostname from a given URL string.
 */
export function extractDomain(urlStr: string): string {
  try {
    const cleanUrl = urlStr.startsWith('http://') || urlStr.startsWith('https://')
      ? urlStr
      : `https://${urlStr}`;
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr.replace(/^https?:\/\//, '').split('/')[0] || 'external link';
  }
}

/**
 * Parses CSV text into an array of Tool objects, sorted alphabetically by Tool Name.
 */
export function parseToolsCSV(csvText: string): Tool[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header line to dynamically discover column indices
  const headerCols = parseCSVLine(lines[0]).map(col => col.toLowerCase().replace(/[\s_-]+/g, ''));

  let nameIndex = headerCols.findIndex(c => c.includes('name') || c.includes('tool'));
  let categoryIndex = headerCols.findIndex(c => c.includes('category') || c.includes('type') || c.includes('tag'));
  let urlIndex = headerCols.findIndex(c => c.includes('url') || c.includes('link') || c.includes('href') || c.includes('web'));
  let descIndex = headerCols.findIndex(c => c.includes('desc') || c.includes('detail') || c.includes('about'));
  let imageIndex = headerCols.findIndex(c => c.includes('image') || c.includes('thumb') || c.includes('og') || c.includes('banner'));

  // Fallback default index mapping if headers don't match expected names
  if (nameIndex === -1) nameIndex = 0;
  if (categoryIndex === -1) categoryIndex = 1;
  if (urlIndex === -1) urlIndex = 2;
  if (descIndex === -1) descIndex = 3;

  const tools: Tool[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    const name = row[nameIndex]?.trim();
    if (!name) continue;

    const category = row[categoryIndex]?.trim() || 'General';
    let rawUrl = row[urlIndex]?.trim() || '';
    if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = `https://${rawUrl}`;
    }
    const description = row[descIndex]?.trim() || '';
    const customImage = imageIndex !== -1 ? row[imageIndex]?.trim() : '';

    // If explicit image provided in CSV use that, otherwise use OpenGraph embed service
    const ogImage = customImage && customImage.startsWith('http')
      ? customImage
      : rawUrl
        ? `https://api.microlink.io?url=${encodeURIComponent(rawUrl)}&embed=image.url`
        : undefined;

    tools.push({
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
      name,
      category,
      url: rawUrl,
      description,
      domain: extractDomain(rawUrl),
      ogImage,
    });
  }

  // Sort tools in strict alphabetical order by Tool Name, irrelevant to CSV order
  return sortToolsAlphabetically(tools);
}

/**
 * Strictly sorts tools in case-insensitive alphabetical order (A-Z) by name.
 */
export function sortToolsAlphabetically(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
  );
}

/**
 * Formats a single row for CSV escaping quotes as needed.
 */
export function formatCSVRow(name: string, category: string, url: string, description: string): string {
  const escapeCol = (val: string) => {
    const clean = val.replace(/"/g, '""');
    return clean.includes(',') || clean.includes('"') || clean.includes('\n') ? `"${clean}"` : clean;
  };
  return `${escapeCol(name)},${escapeCol(category)},${escapeCol(url)},${escapeCol(description)}`;
}

/**
 * Converts an array of Tool objects to a complete CSV string.
 */
export function toolsToCSV(tools: Tool[]): string {
  const header = 'Tool Name,Category,URL,Description';
  const rows = tools.map(t => formatCSVRow(t.name, t.category, t.url, t.description));
  return [header, ...rows].join('\n');
}
