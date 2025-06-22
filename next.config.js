import { fileURLToPath } from "node:url";
import createJiti from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));
 
jiti("./src/config/env");

/** @type {import("next").NextConfig} */
const config = {};

export default config;
