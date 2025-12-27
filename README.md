# Code to Text Converter

**Convert your entire codebase into a single text file for LLMs.**

Code to Text is a powerful, secure, and lightning-fast tool designed to help developers easily share their code context with Large Language Models (LLMs) like GPT-4, Claude, and Gemini.

![Application Screenshot](/images/step-result.png)

## 🚀 Features

- **100% Client-Side Processing**: Your code never leaves your browser. All file reading and conversion happen locally for maximum security.
- **Drag & Drop Interface**: Simply drag your project folder to get started.
- **Smart Filtering**: Automatically ignores `node_modules`, `.git`, lockfiles, and other binary files. Customize which files or directories to exclude.
- **Instant Preview**: View the generated text before downloading or copying.
- **Optimized for LLMs**: Formats the output with clear delimiters, making it easy for AI to understand your project structure.

## 🛠️ How It Works

### 1. Upload Your Project
Select your project folder or drag and drop it into the upload area.

![Upload Step](/images/step-upload-box.png)

### 2. Configure & Filter
Select specific files or folders you want to include. The tool automatically handles ignores for you.

![Selection Step](/images/step-1.png)

### 3. Processing
Watch as your files are securely processed right in your browser.

![Processing Step](/images/step-2.png)

### 4. Generate & Export
Get a single consolidated text file ready for your favorite AI assistant.

![Result Step](/images/step-result.png)

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
