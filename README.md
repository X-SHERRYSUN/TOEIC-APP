# 📚 TOEIC Study App

A comprehensive and mobile-friendly TOEIC study application built with React and Vite. This app helps you track your mistakes, build vocabulary, and study more effectively for the TOEIC exam.

## ✨ Features

- **📝 Mistake Book**: Track and review your incorrect answers
- **📖 Vocabulary Builder**: Build and manage your vocabulary list
- **🔍 OCR Support**: Extract text from images using Tesseract.js
- **📱 Mobile-Friendly**: Works perfectly on mobile devices
- **💾 Offline Storage**: Uses IndexedDB for robust local storage
- **🔄 Data Sync**: Export/import your data across devices
- **🎨 Beautiful UI**: Modern design with Tailwind CSS

## 🚀 Live Demo

Visit the live app: [https://yourusername.github.io/TOEIC-APP/](https://yourusername.github.io/TOEIC-APP/)

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: IndexedDB (via custom service)
- **OCR**: Tesseract.js
- **Deployment**: GitHub Pages

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TOEIC-APP.git
   cd TOEIC-APP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in your terminal)

## 🌐 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. **Fork or clone this repository**

2. **Update the Vite config**
   - Open `vite.config.js`
   - Change `/TOEIC-APP/` to `/YOUR-REPOSITORY-NAME/`

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

4. **Push to main branch**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

5. **Access your app**
   Your app will be available at: `https://yourusername.github.io/YOUR-REPOSITORY-NAME/`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (using gh-pages package)
npm install -g gh-pages
gh-pages -d dist
```

## 📱 Mobile Usage

### Adding to Home Screen

**iOS Safari:**
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name your app and tap "Add"

**Android Chrome:**
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. Name your app and tap "Add"

### Offline Functionality

The app works completely offline once loaded:
- All data is stored locally using IndexedDB
- No internet connection required for core functionality
- OCR processing happens locally in your browser

## 💾 Data Management

### Automatic Migration

The app automatically migrates data from localStorage to IndexedDB on first load, ensuring a smooth upgrade experience.

### Export/Import Data

1. **Export Data**
   - Go to Settings
   - Click "Export Data"
   - Save the JSON file to your device

2. **Import Data**
   - Go to Settings
   - Click "Import Data"
   - Select your JSON file

### Data Synchronization Across Devices

1. Export data from your first device
2. Transfer the JSON file to your second device
3. Import the data on your second device
4. Repeat as needed to keep devices in sync

## 🗂️ Project Structure

```
TOEIC-APP/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/         # React context for state management
│   │   └── StudyContext.jsx
│   ├── pages/           # Main application pages
│   │   ├── Home.jsx
│   │   ├── Upload.jsx
│   │   ├── MistakeBook.jsx
│   │   ├── VocabularyBook.jsx
│   │   └── Settings.jsx
│   ├── services/        # Database and API services
│   │   └── database.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions deployment
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Customize app behavior
VITE_APP_NAME=TOEIC Study App
VITE_APP_VERSION=2.0.0
```

### Customizing the Base Path

If deploying to a subdirectory, update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/your-subdirectory/',
  // ... other config
})
```

## 🐛 Troubleshooting

### Common Issues

1. **App not loading on mobile**
   - Ensure HTTPS is enabled
   - Check if JavaScript is enabled
   - Try clearing browser cache

2. **Data not saving**
   - Check if IndexedDB is supported in your browser
   - Ensure sufficient storage space
   - Try refreshing the page

3. **OCR not working**
   - Ensure good image quality
   - Check internet connection for Tesseract.js download
   - Try a different image format

### Browser Compatibility

- **Minimum Requirements**:
  - Chrome 51+
  - Firefox 44+
  - Safari 10+
  - Edge 79+

- **Recommended**:
  - Latest version of any modern browser
  - JavaScript enabled
  - IndexedDB support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Icons
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine

## 📈 Roadmap

- [ ] Add spaced repetition algorithm
- [ ] Implement study streaks and achievements
- [ ] Add audio pronunciation support
- [ ] Create practice test mode
- [ ] Add progress analytics
- [ ] Implement cloud sync options

---

Made with ❤️ for TOEIC learners worldwide