  import { Group, Title, Center, Flex, Container, Button } from "@mantine/core";
  import Head from "next/head";
  import MainLayout from "./layouts/main";
  import TdAIcon from "./../components/TdAIcon";
  import Link from "next/link";
  
  export default function NoConnectionPage() {
    return (
      <>
        <Head>
          <title>Think different Academy - Žádné připojení k internetu</title>
        </Head>
        <MainLayout>
          <Center>
            <Flex gap={15} justify={"center"} direction={"column"} align={"center"} style={{ maxWidth: 800 }}>
              <TdAIcon type="duck" size={250} color="black" />
              <Title order={1}>
                Žádné připojení k internetu
              </Title>
              <Title order={2} ta="center">
                Zdá se, že se nemůžete připojit k internetu. Zkontrolujte své síťové připojení a zkuste to znovu.
              </Title>
              <Group>
                <Button size="xl" onClick={() => window.location.reload()}>Zkusit znovu</Button>
                
              </Group>
            </Flex>
          </Center>
        </MainLayout>
      </>
    );
  }
