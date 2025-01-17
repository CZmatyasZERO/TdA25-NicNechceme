import { CSSProperties, ReactNode, useState } from 'react';
import { Burger, Button, Group, Flex, Text } from '@mantine/core';
import Image from 'next/image';
import classes from './main.module.css';
import Link from 'next/link';
import Logo from "../../public/logo/Think-different-Academy_LOGO_oficialni_1.svg";

const links = [
  { link: '/game', label: 'Začít hrát' },
  { link: '/puzzles', label: 'Úlohy' },
  { link: '/tutorial', label: 'Tutoriál' },
  { link: '/about', label: 'O nás' },
];

interface MainLayoutProps {
  children: ReactNode,
  style?: CSSProperties
}

export default function MainLayout({ children, style }: MainLayoutProps) {
  const [opened, setOpened] = useState(false);

  const items = links.map((link) => (
    <Link href={link.link} key={link.link} prefetch={true}>
      <Button>
        {link.label}
      </Button>
    </Link>
  ));

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <Flex justify="space-around" align="center" className={classes.inner}>
          <Link href="/" prefetch>
            <Image priority src={Logo} alt="Think different Academy logo" width={200} height={50} />
          </Link>

          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>

          <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="xs" size="sm" />
        </Flex>

        {opened && (
          <Flex
            direction="column"
            align="center"
            gap="10px"
            className={classes.mobileMenu}
            hiddenFrom="xs"
          >
            {items}
          </Flex>
        )}
      </header>

      <main className={classes.mainContent} style={style}>{children}</main>

      <footer className={classes.footer}>
        <Flex justify="center" align="center" direction="row" className={classes.footerContent}>
          <Text size="sm">© {new Date().getFullYear()} Think Different Academy</Text>
          <Text size="sm" mx={5}>•</Text>
          <Link href="/terms" prefetch>
              Terms of Use
          </Link>
        </Flex>
      </footer>
    </div>
  );
}