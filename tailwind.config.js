/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...defaultTheme.colors,
        c_ED3237: "#ED3237",
        c_0F4B32: "#0F4B32",
        c_006CA3: "#006CA3",
        c_F9F9F9: "#F9F9F9",
        c_0E1014: "#0E1014",
        c_000: "#000",
        c_fff: "#fff",
        c_909193: "#909193",
        c_121516: "#121516",
        c_454545: "#454545",
        c_F3F3F3: "#F3F3F3",
        c_F1F1F1: "#F1F1F1",
        c_595B5C: "#595B5C",
        c_E2E2E2: "#E2E2E2",
        c_9EA2A5: "#9EA2A5",
        c_C6C6C6: "#C6C6C6",
        c_FCFCFC: "#FCFCFC",
        c_F5F7F8: "#F5F7F8",
        c_FDFDFD: "#FDFDFD",
      },
      fontSize: {
        ...defaultTheme.fontSize,
        f_100: 100,
        f_22: 22,
        f_40: 40,
        f_64: 64,
        f_32: 32,
        f_12: 12,
      },
      fontFamily: {
        generalSansRegular: [
          "GeneralSans-Regular",
          ...defaultTheme.fontFamily.serif,
        ],
        generalSansMedium: [
          "GeneralSans-Medium",
          ...defaultTheme.fontFamily.serif,
        ],
        generalSansSemiBold: [
          "GeneralSans-SemiBold",
          ...defaultTheme.fontFamily.serif,
        ],
        generalSansBold: ["GeneralSans-Bold", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
