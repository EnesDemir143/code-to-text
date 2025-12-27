import JSZip from 'jszip';
import ignore from 'ignore';
import { DEFAULT_IGNORES } from '@/lib/constants/default-ignores';

export interface FileEntry {
  path: string;
  name: string;
  language: string;
  content: string;
  size: number;
}

export type FileGroup = {
  language: string;
  files: FileEntry[];
  count: number;
};

const EXTENSION_MAP: Record<string, string> = {
  // JavaScript / TypeScript
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',

  // Web
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'SASS',
  less: 'LESS',
  json: 'JSON',
  svg: 'SVG',
  xml: 'XML',

  // Backend / Systems
  py: 'Python',
  rb: 'Ruby',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  h: 'C/C++',
  hpp: 'C++',
  rs: 'Rust',
  go: 'Go',
  php: 'PHP',
  cs: 'C#',
  swift: 'Swift',
  kt: 'Kotlin',

  // Config / Infra
  yml: 'YAML',
  yaml: 'YAML',
  toml: 'TOML',
  md: 'Markdown',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Shell',
  dockerfile: 'Dockerfile',

  // Misc
  txt: 'Text',
};

export const getLanguageFromFilename = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length === 1) {
    if (filename.toLowerCase() === 'dockerfile') return 'Dockerfile';
    if (filename.toLowerCase() === 'makefile') return 'Makefile';
    return 'Unknown';
  }
  const ext = parts.pop()?.toLowerCase() || '';
  return EXTENSION_MAP[ext] || 'Other';
};

/**
 * 2-Pass Processing:
 * Pass 1: Unzip recursive zips and collect all raw files. Find all .gitignore files.
 * Pass 2: Build ignore rules and filter files.
 * Pass 3: Read content of accepted files.
 */
export const processFiles = async (
  input: FileList | File[]
): Promise<FileGroup[]> => {
  // Phase 1: Flatten everything (handle Zips)
  const rawFiles: File[] = [];
  const queue = Array.isArray(input) ? [...input] : Array.from(input);

  // We need to handle async unzipping carefully to not block UI too much, 
  // but for now we do it sequentially or in chunks.

  const processedPaths = new Set<string>();

  while (queue.length > 0) {
    const file = queue.shift();
    if (!file) continue;

    // Normalize path
    // webkitRelativePath is available for directory drops. 
    // For individual files, it's empty, so we use name. 
    // For unzipped files, we manually set it in our unzip helper but here we access it carefully.
    const path = (file as any).path || file.webkitRelativePath || file.name;

    // Safety check for duplicates if multiple zips contain same structure or something
    if (processedPaths.has(path)) continue;
    processedPaths.add(path);

    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const unzipped = await unzipFile(file);
        // Prefix unzipped files if needed? 
        // Actually unzipFile preserves internal structure. 
        // If zip is at root, internal paths are relative to root.
        queue.push(...unzipped);
      } catch (e) {
        console.warn(`Failed to unzip ${path}`, e);
      }
      continue;
    }

    // Determine if we need to keep this file object for the next phase
    // We attach the 'path' to the file object for easier access later if it's missing
    if (!file.webkitRelativePath && !(file as any).path) {
      Object.defineProperty(file, 'path', { value: path });
    }

    rawFiles.push(file);
  }

  // Phase 2: Build Ignore Manager
  const ig = ignore().add(DEFAULT_IGNORES);

  // Find project-specific .ignore files
  // We look for .gitignore files in the rawFiles list
  const gitIgnoreFiles = rawFiles.filter(f => f.name === '.gitignore');

  // Applying nested gitignores is complex without a full tree traversal logic.
  // For this MVP, we will treat all .gitignore rules as GLOBAL or 
  // try to scope them if possible. 
  // 'ignore' package by default works partially strictly.
  // Ideally: parse .gitignore, prepending the folder path to the rules.
  // e.g. src/.gitignore having "foo" -> add "src/foo" to global ignore.

  for (const ignoreFile of gitIgnoreFiles) {
    try {
      const content = await readFileContent(ignoreFile);
      const ignorePath = (ignoreFile as any).path || ignoreFile.webkitRelativePath || '';
      const folderPrefix = ignorePath.substring(0, ignorePath.lastIndexOf('.gitignore')); // e.g. "src/" or ""

      const lines = content.split('\n');
      const scopedRules = lines.map(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return null;
        // If rule starts with /, it's relative to that .gitignore root.
        // We need to prepend folderPrefix.
        // 'ignore' package doesn't natively support "multiple roots" easily in one instance.
        // We construct a global rule set by prepending paths.

        // Logic:
        // pattern "node_modules" in "client/.gitignore" -> "client/node_modules"
        // and "client/**/node_modules" (depending on git behavior, usually relative to that dir)

        // Simplification for MVP: Add the rule as is? No, that would ignore sibling folders.
        // We PREPEND the prefix.

        if (line.startsWith('/')) {
          return folderPrefix + line.substring(1);
        }
        return folderPrefix + '**/' + line;
        // This is a rough heuristic. Gitignore logic is complex. 
        // A safe bet for "folder/.gitignore" having "dist" is that it ignores "folder/dist".
        // Use strict prefixing.
      }).filter(Boolean) as string[];

      ig.add(scopedRules);

    } catch (e) {
      console.warn('Failed to parse .gitignore', e);
    }
  }

  // Phase 3: Filter and Read
  const validFiles = rawFiles.filter(file => {
    const path = (file as any).path || file.webkitRelativePath || file.name;
    // 'ignore' expects relative paths without leading slash usually
    // Ensure path doesn't start with /
    const checkPath = path.startsWith('/') ? path.substring(1) : path;

    // Debug log for ignoring
    if (ig.ignores(checkPath)) {
      // console.log(`Ignored: ${checkPath}`);
      return false;
    }
    return true;
  });

  const groups: Record<string, FileEntry[]> = {};

  // Read content (Limit concurrency to avoid browser freeze)
  // For very large projects, we might want to chunk this.
  const CHUNK_SIZE = 50;
  for (let i = 0; i < validFiles.length; i += CHUNK_SIZE) {
    const chunk = validFiles.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async (file) => {
      let path = (file as any).path || file.webkitRelativePath || file.name;
      // Ensure path has no leading slash for consistency
      if (path.startsWith('/')) path = path.substring(1);

      if (isBinary(path)) return; // Double check binary logic

      try {
        const content = await readFileContent(file);
        // Skip empty content? No, empty files might be relevant. 
        // But if read failed, it's empty string.

        const language = getLanguageFromFilename(path);

        const entry: FileEntry = {
          path,
          name: file.name,
          language,
          content,
          size: file.size,
        };

        if (!groups[language]) {
          groups[language] = [];
        }
        groups[language].push(entry);

      } catch (e) {
        console.warn(`Failed to read ${path}`, e);
      }
    }));
  }

  // Sort groups by file count desc
  return Object.entries(groups)
    .map(([language, files]) => ({
      language,
      files: files.sort((a, b) => a.path.localeCompare(b.path)),
      count: files.length,
    }))
    .sort((a, b) => b.count - a.count);
};


// Helper to unzip
const unzipFile = async (file: File): Promise<File[]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const files: File[] = [];

  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    if (zipEntry.dir) continue;

    // Preliminary check against default ignores to save time? 
    // No, we do it in Phase 2 globally.

    const blob = await zipEntry.async('blob');

    // Create a File object. 
    // We attach the 'path' property manually since 'webkitRelativePath' is read-only often.
    // Ensure relativePath doesn't start with /
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    const extractedFile = new File([blob], cleanPath.split('/').pop() || cleanPath, { type: blob.type });
    Object.defineProperty(extractedFile, 'path', { value: cleanPath });

    files.push(extractedFile);
  }

  return files;
};

const isBinary = (path: string): boolean => {
  const ext = path.split('.').pop()?.toLowerCase();
  const binaryExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'pdf', 'zip', 'exe', 'dll', 'so', 'dylib', 'bin', 'lock', 'eot', 'ttf', 'woff', 'woff2', 'mp3', 'mp4', 'pyc', 'class']);
  return ext ? binaryExts.has(ext) : false;
};

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const generateOutput = (selectedFiles: FileEntry[]): string => {
  if (selectedFiles.length === 0) return "No files were processed.";
  return selectedFiles
    .map(
      (file) =>
        `================================================================\nFile: ${file.path}\n================================================================\n${file.content}\n`
    )
    .join('\n\n');
};
