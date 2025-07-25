import { Html, Head, Main, NextScript } from "next/document"
import { ColorSchemeScript } from "@mantine/core"

export default function Document() {
  return (
    <Html lang="cs" suppressHydrationWarning>
      <Head>
        <ColorSchemeScript />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
