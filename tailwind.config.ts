import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-plus-jakarta)", "sans-serif"],
                serif: ["var(--font-cormorant)", "serif"], // The new luxury serif
                display: ["var(--font-outfit)", "sans-serif"], // The modern geometric sans
            },
            colors: {
                brand: {
                    forest: "#2D4A3E",
                    sage: "#B2D8C6",
                    blush: "#FFC1CC",
                    cream: "#F4E3B2",
                    sand: "#F5F2EF",
                },
            },
            keyframes: {
                "gentle-float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            animation: {
                "gentle-float": "gentle-float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
export default config;
