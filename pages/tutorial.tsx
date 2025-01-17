import { Container, Title, Text, Flex, Center, ScrollArea, Group } from "@mantine/core";
import Head from "next/head";
import MainLayout from "./layouts/main";
import Image from "next/image";

export default function TermsOfUsePage() {
  return (
    <>
      <Head>
        <title>Think different Academy - Tutorial</title>
        <meta name="description" content="Tutorial na používani Think different Academy." />
      </Head>
      <MainLayout>
        <Center>
          <Flex gap={15} justify="center" direction="column" align="center" style={{ maxWidth: 800, width: "100%" }}>
            <ScrollArea style={{ height: "100%" }}>
              <Flex component="section" gap={15} direction="column" style={{ padding: 20, width: "100%" }}>
                <Title ta="center" order={1}>Tutoriál</Title>
                <Flex wrap="wrap" gap={15}>
                  <Text flex={1} style={{ minWidth: 300 }}>
                    Na této stránce tě provedeme naší platformou Think different Academy. V horní části stránky najdeš navigaci s několíka tlačítky, pomocí kterých se můžeš pohybovat po platformě.
                  </Text>
                  <img style={{ minWidth: 300, maxWidth: "90%"}} src="/screenshots/image.png" alt="Screenshot" />
                </Flex>

                <Flex wrap="wrap" gap={15}>
                  <img src="/screenshots/tutorial.png" alt="Screenshot" style={{ minWidth: 300, maxWidth: "90%"}} />
                  <Text flex={1} style={{ minWidth: 300 }}>
                    Kliknutím na tlačítko Začít hrát spustíte novou prázdnou hru. Na obrazovce uvidíte prázdné herní pole 15x15 a vedle něj nabídku s informacemi o aktuální hře a s nastavením.
                    V informacích o hře se zobrazuje. který hráč je zrovna na řadě a kolikáté je teď kolo hry. Jedno kolo je když zahraje kolečko a křížek.
                  </Text>


                </Flex>

                <Flex wrap="wrap" gap={15}>
                  
                  <Text flex={1} style={{ minWidth: 300 }}>
                    Pokud se nahoře přepnete kartu na &quot;Nastavení&quot;, zobrazí se vám formulář pro nastavení hry.
                    <br />
                    Režim pro dotykové obrazovky - pro zahrání hry bude potřeba kliknout dvakrát na pole. Hlavní účel je omezení překliků. Vhodné pro mobilní zařízení.
                    <br />
                    Režim pro projektor - zvýrazní čáry mezi poli pro lepší viditelnost na projektoru.
                  </Text>
                  <img src="/screenshots/1nastaveni.png" alt="Screenshot" style={{ minWidth: 300, maxWidth: "90%"}}  />
                </Flex>          

                <Flex wrap="wrap" gap={15}>
                  <img src="/screenshots/2nastaveni.png" alt="Screenshot" style={{ minWidth: 300, maxWidth: "90%"}}  />
                  <Text flex={1} style={{ minWidth: 300 }}>
                    V nastavení je také možnost hrát proti botovi. Je na výběr za jakého hráče má bot hrát a jakou má maximální dobu na udělání tahu. Čím je doba delší, tím kvalitnější bude dělat tahy.
                  </Text>

                  
                </Flex>
                <Flex wrap="wrap" gap={15}>
                  
                  <Text flex={1} style={{ minWidth: 300 }}>
                    Pod informacemi o hře se nachází formulář pro uložení hry jako úlohu. Úloha bude uložena do databáze a bude dostupná pro všechny uživatele. Pro uložení úlohy musí být zahrán alespoň jeden tah a hra nesmí být dohraná.
                  </Text>
                  <img src="/screenshots/3tutorial.png" alt="Screenshot" style={{ minWidth: 300, maxWidth: "90%"}}  />
                </Flex>
                <Flex wrap="wrap" gap={15}>
                  <img src="/screenshots/3uprava.png" alt="Screenshot" style={{ minWidth: 300, maxWidth: "90%"}}  />
                  <Text flex={1} style={{ minWidth: 300 }}> 
                    Po uložení úlohy ji můžete upravit. Pozor pokud jste už v úloze provedli nějaké tahy, a chcete upravit úlohu, tahy se uloží společně se změnami. Pokud chcete smazat úlohu, stačí kliknout na červené tlačítko Smazat úlohu.
                  </Text>
                </Flex>
              </Flex>
            </ScrollArea>
          </Flex>
        </Center>
      </MainLayout>
    </>
  )
}