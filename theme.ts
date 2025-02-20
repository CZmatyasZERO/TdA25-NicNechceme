import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core"

const blue: MantineColorsTuple = ["#0070bb", "#0070bb", "#0070bb", "#0070bb", "#0070bb", "#0070bb", "#0070bb", "#395a9a", "#395a9a", "#395a9a"]

const red: MantineColorsTuple = ["#e31837", "#e31837", "#e31837", "#e31837", "#e31837", "#e31837", "#e31837", "#ab2e58", "#ab2e58", "#ab2e58"]

export const theme = createTheme({
  primaryColor: "blue",
  white: "#ffffff",
  black: "#080808",
  fontFamily: "Dosis, sans-serif",
  colors: { blue, red },
  headings: {
    fontFamily: "Dosis, sans-serif",
  },
})
