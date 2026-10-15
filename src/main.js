// Entry: local fonts (offline), styles, then the game (src/game/*, concatenated in manifest order by vite.config.js)
import '@fontsource/pacifico/400.css';
import '@fontsource/quicksand/500.css';
import '@fontsource/quicksand/600.css';
import '@fontsource/quicksand/700.css';
import './ui/style.css';
import 'virtual:game';
