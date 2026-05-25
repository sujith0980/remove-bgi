# Remove BGI - Background Remover

A powerful web-based background removal tool powered by AI. Remove backgrounds from images with precision using advanced computer vision.

## Features

- 🎨 **AI-Powered Background Removal** - Uses cutting-edge AI models to intelligently remove backgrounds
- 🖌️ **Brush Editor** - Fine-tune results with precision brush tools
- 🔄 **Before/After Comparison** - Side-by-side slider to compare results
- 🚀 **Fast & Efficient** - Real-time processing with optimized performance
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sujith0980/remove-bgi.git
   cd remove-bgi
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your `GEMINI_API_KEY` from [Google AI Studio](https://ai.google.dev)

## Running the App

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm preview
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI Model**: Google Gemini API
- **Background Removal**: @imgly/background-removal
- **Icons**: Lucide React
- **Animations**: Motion

## Project Structure

```
src/
├── components/
│   ├── BrushEditor.tsx      # Brush tool for fine-tuning
│   ├── CompareSlider.tsx    # Before/after comparison
│   ├── Header.tsx           # App header
│   └── Footer.tsx           # App footer
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Application constants
└── index.css               # Global styles
```

## Usage

1. Upload an image or drag-and-drop to get started
2. The AI will automatically remove the background
3. Use the Brush Editor to refine edges if needed
4. Use the Compare Slider to verify the results
5. Download your processed image

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.
