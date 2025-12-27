
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

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'venv',
  '__pycache__',
  'dist',
  'build',
  'out',
  '.idea',
  '.vscode',
  'coverage',
]);

const IGNORED_FILES = new Set([
  '.env',
  '.DS_Store',
  'bun.lockb',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

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

export const shouldIgnore = (path: string): boolean => {
  const parts = path.split('/');
  
  // Check directories
  for (const part of parts) {
    if (IGNORED_DIRS.has(part)) return true;
  }
  
  // Check filename (last part)
  const filename = parts[parts.length - 1];
  if (IGNORED_FILES.has(filename)) return true;
  
  // Ignore dotfiles generally (except specific allowed ones if any, but default ignore)
  // if (filename.startsWith('.') && filename !== '.gitignore') return true; 
  // User specifically mentioned .env, keeping it simple with the set for now.

  return false;
};

export const processFiles = async (
  fileList: FileList
): Promise<FileGroup[]> => {
  const groups: Record<string, FileEntry[]> = {};
  
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const path = file.webkitRelativePath || file.name;
    
    if (shouldIgnore(path)) continue;
    
    // Skip binary files (simple heuristic: check extension or try to read)
    // For now, we will try to read all non-ignored, but maybe skip known binary extensions
    if (isBinary(path)) continue;

    try {
      const content = await readFileContent(file);
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
      console.warn(`Failed to read file ${path}`, e);
    }
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

const isBinary = (path: string): boolean => {
  const ext = path.split('.').pop()?.toLowerCase();
  const binaryExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'pdf', 'zip', 'exe', 'dll', 'so', 'dylib', 'bin', 'lock']);
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
  return selectedFiles
    .map(
      (file) =>
        `<file_start path="${file.path}">\n${file.content}\n<file_end>`
    )
    .join('\n\n');
};
