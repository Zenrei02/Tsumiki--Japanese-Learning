import { createRoot } from "react-dom/client";
import { installStorage } from "./src/lib/storage.js";
import App from "./src/App.jsx";
installStorage();
createRoot(document.getElementById("root")).render(<App />);
