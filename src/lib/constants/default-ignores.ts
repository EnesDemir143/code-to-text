export const DEFAULT_IGNORES = [
    // --- Node.js / Javascript ---
    "node_modules",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    ".npm",
    ".yarn",
    ".pnpm-store",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lockb",

    // --- Next.js / React ---
    ".next",
    "out",
    "build",
    "dist",
    ".turbo",
    ".vercel",

    // --- Python ---
    "__pycache__",
    "*.py[cod]",
    "*$py.class",
    "venv",
    ".venv",
    "env",
    ".env",
    ".pytest_cache",
    ".coverage",
    "htmlcov",

    // --- Java / Kotlin ---
    "*.class",
    "*.log",
    "*.ctxt",
    ".mtj.tmp/",
    "*.jar",
    "*.war",
    "*.nar",
    "*.ear",
    "*.zip",
    "*.tar.gz",
    "*.rar",

    // --- GO ---
    "/bin/",
    "/pkg/",
    "/src/",
    "vendor/",

    // --- Rust ---
    "/target/",
    "**/*.rs.bk",

    // --- General IDEs ---
    ".idea",
    ".vscode",
    "*.swp",
    "*.swo",
    ".DS_Store",
    ".Thumbs.db",

    // --- Git ---
    ".git",
    ".gitignore", // Usually we handle this specifically, but good to have

    // --- Misc Binary / Media ---
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.ico",
    "*.svg", // Sometimes useful as code, but usually noise for LLMs
    "*.mp4",
    "*.mp3",
    "*.pdf",
    "*.exe",
    "*.dll",
    "*.so",
    "*.dylib",
    "*.bin",
    "*.iso",
    "*.dmg",
    "*.eot",
    "*.ttf",
    "*.woff",
    "*.woff2",
];
