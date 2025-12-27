# CodeContext

**Convert your entire codebase into a single text file for LLMs.**

[**Live Demo: context.enesdemir.me**](https://context.enesdemir.me)

CodeContext is a powerful, secure, and lightning-fast tool designed to help developers easily share their code context with Large Language Models (LLMs) like GPT-4, Claude, and Gemini.

## 🚀 Features

- **Client-Side Processing:** Files are processed in the browser, zero server uploads.
- **Smart Filtering:** Automatically ignores `node_modules`, `.git`, `.env`, and binary files.
- **Language Detection:** Groups files by extension (e.g., Python, TypeScript).
- **Dark Mode UI:** Designed with a clean, developer-focused interface.
- **Optimized for LLMs:** Formats the output with clear delimiters, making it easy for AI to understand your project structure.

### 🆕 Interactive File Tree (v1.2.0)

- **Visual File Selection:** Both local uploads and GitHub imports now show an interactive file tree
- **Smart Selection:** Select parent folders to include all children, or pick individual files
- **Bulk Actions:** Select All / Deselect All, Expand All / Collapse All
- **Real-time Preview:** See exactly which files will be included before download

### 🔗 GitHub Integration (v1.3.0)

- **Authentication:** Login with GitHub to access your private repositories
- **Repository Browser:** Visual interface to browse and filter your repositories and organizations
- **Private & Public:** Support for both public URLs and private repository access
- **Visual File Tree:** Browse repository structure in an interactive tree view
- **Progress Tracking:** Real-time download progress indicator

## 🛠️ How It Works

### Option 1: Upload Your Project

#### 1. Upload Your Project
Select your project folder or drag and drop it into the upload area.

![Upload Step](public/images/step-upload-box.png)

#### 2. Browse & Select Files
After processing, an interactive file tree appears. Select specific files or folders you want to include.

- ✅ Select a folder to include all its contents
- ✅ Use "Select All" / "Deselect All" for bulk operations  
- ✅ Expand/Collapse folders for easier navigation

#### 3. Download
Click the download button to get your `.txt` file with all selected code.

---

### Option 2: GitHub Integration

![GitHub Tree View](public/images/github-tree-view.png)

#### 1. Connect GitHub
Click the "Sign in with GitHub" button to access your repositories (including private ones) and increased API limits.

#### 2. Select Repository
- **Browse:** View a list of your repositories and organizations.
- **Search:** Quickly find the repo you need.
- **URL:** Alternatively, paste a public repository URL directly.

#### 3. Browse & Select Files
Explore the repository's file structure in a tree view. Click folders to expand, use checkboxes to select files.

- ✅ Select a folder to include all its contents
- ✅ Use "Select All" / "Deselect All" for bulk operations
- ✅ Expand/Collapse folders for easier navigation

#### 4. Download
Click the download button to get your `.txt` file with all selected code.

## 💻 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine.
- npm, yarn, or pnpm.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EnesDemir143/code-to-text.git
   cd code-to-text
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to use the application.

## 📋 API Limits

> **Note:** GitHub integration uses the GitHub API. 
> - **Unauthenticated:** 60 requests per hour (Public repos only).
> - **Authenticated:** 5,000 requests per hour (Public & Private repos).
> 
> Logging in is recommended for larger repositories or frequent use.

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or documentation improvement, I'd love to hear from you.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

### Contact

For any inquiries, feedback, or collaboration opportunities, please reach out:

📧 **Email**: [enesdemirdev@gmail.com](mailto:enesdemirdev@gmail.com)

---

Built with ❤️ using [Next.js](https://nextjs.org), [React](https://react.dev), and [Tailwind CSS](https://tailwindcss.com).

