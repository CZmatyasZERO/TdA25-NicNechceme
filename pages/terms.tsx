import { Container, Title, Text, Flex, Center, ScrollArea } from "@mantine/core";
import Head from "next/head";
import MainLayout from "./layouts/main";

export default function TermsOfUsePage() {
  return (
    <>
      <Head>
        <title>Think different Academy - Terms of Use</title>
        <meta name="description" content="Podmínky užívání služby Think different Academy." />
      </Head>
      <MainLayout>
        <Center>
          <Flex gap={15} justify="center" direction="column" align="center" style={{ maxWidth: 800 }}>
            <ScrollArea>
              <Container component="section">
                <Title order={1} ta="center">
                  Podmínky užívání
                </Title>
                <Text size="md">
                  Vítejte na platformě Think different Academy. Přečtěte si prosím tyto podmínky užívání pozorně, než začnete používat naše služby. Vaše další užívání webu znamená souhlas s těmito podmínkami.
                </Text>

                <Title order={2} style={{ marginTop: 30 }}>
                  Využívání služby
                </Title>
                <Text size="md">
                  Platforma je poskytována pro vzdělávací a zábavní účely. Uživatelé se zavazují využívat službu v souladu se všemi příslušnými zákony.
                </Text>

                <Title order={2} style={{ marginTop: 30 }}>
                  Ochrana osobních údajů
                </Title>
                <Text size="md">
                  Vaše soukromí je pro nás důležité. Sbíráme osobní údaje jako jméno, e-mailová adresa a další informace potřebné pro poskytování našich služeb. Tyto údaje shromažďujeme s vaším souhlasem a zpracováváme je dle platných právních předpisů. Můžete kdykoliv požádat o přístup k osobním údajům, jejich opravu nebo výmaz.
                </Text>

                <Title order={2} style={{ marginTop: 30 }}>
                  Odpovědnost za obsah
                </Title>
                <Text size="md">
                  I když děláme vše pro to, aby byl obsah aktuální a přesný, nemůžeme garantovat jeho úplnost nebo věcnou správnost. Využívání obsahu je na vlastní riziko uživatele.
                </Text>

                <Title order={2} style={{ marginTop: 30 }}>
                  Změny podmínek
                </Title>
                <Text size="md">
                  Vyhrazujeme si právo kdykoliv změnit tyto podmínky. Jakékoliv změny vstupují v platnost okamžitě po zveřejnění na naší webové stránce.
                </Text>

                <Title order={2} style={{ marginTop: 30 }}>
                  Jurisdikce
                </Title>
                <Text size="md">
                  Tyto podmínky se řídí právními předpisy České republiky. Jakékoliv spory vyplývající z těchto podmínek budou řešeny českými soudy.
                </Text>
              </Container>
            </ScrollArea>
          </Flex>
        </Center>
      </MainLayout>
    </>
  );
}