import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#1976d2",
    },

    success: {
      main: "#2e7d32",
    },

    error: {
      main: "#d32f2f",
    },

    warning: {
      main: "#ed6c02",
    },

    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
  },
});

export default theme;
