import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
          'board': "url('../public/board.png')",
          'wp': "url('../public/pieces/WP.png')",
          'wn': "url('../public/pieces/WN.png')",
          'wb': "url('../public/pieces/WB.png')",
          'wr': "url('../public/pieces/WR.png')",
          'wk': "url('../public/pieces/WK.png')",
          'wq': "url('../public/pieces/WQ.png')",
          'bp': "url('../public/pieces/BP.png')",
          'bn': "url('../public/pieces/BN.png')",
          'bb': "url('../public/pieces/BB.png')",
          'br': "url('../public/pieces/BR.png')",
          'bk': "url('../public/pieces/BK.png')",
          'bq': "url('../public/pieces/BQ.png')",
      },
    },
  },
  plugins: [],
};
export default config;
