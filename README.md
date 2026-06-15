# Chrome Extension Tool

Developer tool to help prepare assets Chrome Web Store assets. <br>
Resize icons, promotional images, screenshots, and generate mockups with custom backgrounds -- all client-side.

**Live [demo](https://ogc16.github.io/ChromeExtensionTool/)** 
- Forked from:[terrydigital](https://terrydigital.github.io/Chrome-Extension-Image-Resizer/)

## Features

- **Icons** -- Generate 16x16, 32x32, 48x48, and 128x128 icons from a single upload. Supports contain/cover/fill resize modes, padding, and background color.
- **Promotional** -- Create Small Tile (440x280), Marquee (1400x560), and Screenshot (1280x800) from one image. Adjustable crop position (top/center/bottom).
- **Screenshots** -- Batch resize up to 5 screenshots to 1280x800 or 640x400. Supports contain and cover modes.
- **Mockup Generator** -- Compose screenshots onto custom backgrounds with a live canvas preview.
  - Background types: solid color, gradient (6 presets + custom two-color), or uploaded image (with blur and dim overlay)
  - Screenshot positioning: left, center, right
  - Tagline system: enable/disable, position (top/bottom), font size, color, alignment, weight
  - Export presets: CWS Thumbnail (440x280), CWS Screenshot (1280x800), Featured Promo (1400x560), Social Media (1080x1080)
  - Export selected sizes individually or all as a ZIP file
- **Guide** -- Built-in reference for the Chrome Web Store submission process, including a preparation checklist, step-by-step upload guide, specification reference table, and common rejection reasons.

All image processing runs entirely in the browser. No files are uploaded to any server.

## Usage

1. Open the tool in your browser.
2. Navigate between tabs: **Icons**, **Promotional**, **Screenshots**, **Mockup Generator**, **Guide**.
3. Upload your source image(s) in each tab.
4. Adjust resize options, background, and tagline settings as needed.
5. Download individual images or use the ZIP export for batch downloads.

## File Structure

```
index.html       -- Main HTML document
styles.css       -- All styles (extracted from original inline <style>)
script.js        -- All JavaScript logic (extracted from original inline <script>)
README.md        -- This file
```

## Development

This is a single-page application with no build step. To run locally, serve the directory with any static file server:

```bash
npx serve .
```

## License

MIT
