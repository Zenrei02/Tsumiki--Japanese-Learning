// Entry for test-checker-records.mjs. Mounts the REAL generated Checker so the
// recording path is exercised through the wiring that ships, not through a
// re-implementation of it — see the header of that file for why that matters.
import { createRoot } from "react-dom/client";
import { installStorage } from "../src/lib/storage.js";
import Checker from "../src/modules/Checker.jsx";
installStorage();
createRoot(document.getElementById("root")).render(<Checker />);
