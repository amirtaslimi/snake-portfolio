# 🐍 Snake Portfolio

A fun interactive **Snake Game** built with **React + Tailwind CSS**, where your snake “eats” your projects to showcase them.
When the snake touches a project tile (green square), a popup opens showing the project details and link.
Red squares are penalties — they reduce your score, and if it hits zero, the game resets!

---

## 🚀 Features

* 🟩 **Green tiles** represent your projects (loaded from `public/projects.json` or fallback sample).
* 🟥 **Red tiles** randomly placed; hitting them reduces your score.
* ⏸️ Game **pauses automatically** when a project popup appears.
* 🎮 **Keyboard controls:**

  * `↑ ↓ ← →` or `W A S D` to move
  * `Space` to pause/resume
  * `R` to reset
* 🧩 Sidebar lists all projects currently on the board.
* ⚙️ Configurable board size, tick speed, and visuals.

---

## 🧠 How to Use

1. **Create a React app** (using Vite or Create React App).

   ```bash
   npm create vite@latest my-snake-portfolio --template react
   cd my-snake-portfolio
   npm install
   ```

2. **Configure Tailwind CSS** (or remove Tailwind classes and use plain CSS).
   [Tailwind setup guide](https://tailwindcss.com/docs/guides/vite)

3. Copy the file:

   ```
   src/components/SnakePortfolio.jsx
   ```

   and import it in your `App.jsx`:

   ```jsx
   import SnakePortfolio from "./components/SnakePortfolio";
   function App() {
     return <SnakePortfolio />;
   }
   export default App;
   ```

4. Optionally, create a `public/projects.json` file:

   ```json
   [
     {
       "id": 1,
       "title": "My Cool Project",
       "short": "A brief description of what it does",
       "url": "https://github.com/yourusername/yourproject"
     }
   ]
   ```

---

## 🌐 Deploy to GitHub Pages

For **Create React App**:

1. Add to `package.json`:

   ```json
   "homepage": "https://<your-username>.github.io/<repo-name>"
   ```
2. Install and add scripts:

   ```bash
   npm install gh-pages --save-dev
   ```

   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
3. Deploy:

   ```bash
   npm run deploy
   ```

For **Vite**, simply build and upload the `dist/` folder to GitHub Pages or configure in **Settings → Pages**.

---

## 🧩 Customization Ideas

* 🎵 Add sounds or animations on eating tiles
* 💾 Store high scores in `localStorage`
* 🎨 Change colors, board size, or speed constants in the code
* 🧠 Replace project tiles with your real portfolio items dynamically from an API

---

**Made with ❤️ using React and Tailwind CSS.**

---


