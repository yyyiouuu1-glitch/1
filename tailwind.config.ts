import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#FFFFFF",
          surface: "#F5F5F7",
          text: "#1D1D1F",
          muted: "#86868B",
          blue: "#0071E3",
          border: "#E5E5EA"
        },
        yipin: {
          red: "#D90A14",
          redHover: "#B80811",
          soft: "#FFF2F3"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "PingFang SC",
          "Helvetica Neue",
          "sans-serif"
        ]
      },
      boxShadow: {
        apple: "0 12px 32px rgba(0, 0, 0, 0.06)",
        "apple-hover": "0 20px 44px rgba(0, 0, 0, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
