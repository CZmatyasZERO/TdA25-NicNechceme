import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import "./global.css";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";
import { ModalsProvider } from '@mantine/modals';

export default function App({ Component, pageProps }: any) {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Head>
          <title>Think different Academy</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1"
          />
          <link rel="shortcut icon" href="/logo/Think-different-Academy_LOGO_erb.svg" />
        </Head>
        <Notifications limit={5} />
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
}
