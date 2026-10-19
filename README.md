# Mohamed Yassine Ben Lazreg — CV Website

A dynamic, single-page resume website built from your CV. Dark theme, animated particles, scroll reveals, and fully responsive.

## Quick Preview

Open `index.html` in your browser, or run a local server:

```bash
npx serve .
```

Then visit `http://localhost:3000`

## Deploy for LinkedIn

LinkedIn lets you add a **website link** on your profile. Deploy this site to get a public URL.

### Option 1: GitHub Pages (recommended)

1. Create a new repo on GitHub (e.g. `yassine-cv`)
2. Push this folder:

```bash
git init
git add .
git commit -m "Add dynamic CV website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/yassine-cv.git
git push -u origin main
```

3. Go to **Settings → Pages → Source**: deploy from `main` branch, folder `/ (root)`
4. Your site will be live at: `https://YOUR_USERNAME.github.io/yassine-cv/`

### Option 2: Netlify (drag & drop)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag the `yassine-cv-website` folder onto the deploy area
3. You get a URL like `https://random-name.netlify.app` (customizable)

### Add to LinkedIn

1. Go to your LinkedIn profile → **Edit**
2. Under **Contact info**, add your deployed URL as **Website**
3. Choose type: **Portfolio** or **Personal**

## Customize

### GitHub & LinkedIn links

Edit `script.js` at the bottom:

```javascript
const SOCIAL_LINKS = {
  github: 'https://github.com/YOUR_USERNAME',
  linkedin: 'https://www.linkedin.com/in/yassine-ben-lazreg-747a67359',
};
```

### Skills levels

Adjust `data-level` values on skill bars in `index.html` (0–100).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure & content |
| `styles.css` | Styling & animations |
| `script.js` | Particles, typing effect, scroll animations |
| `assets/meinCV.pdf` | Downloadable CV |

## License

Personal use — feel free to modify for your own portfolio.
