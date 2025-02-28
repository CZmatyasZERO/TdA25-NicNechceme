import { CSSProperties, ReactNode, use, useEffect, useState } from "react"
import { Burger, Button, Group, Flex, Text } from "@mantine/core"
import Image from "next/image"
import classes from "./main.module.css"
import Link from "next/link"
import Logo from "../../public/logo/Think-different-Academy_LOGO_oficialni_1.svg"
import axios from "axios"

const links = [
  { link: "/play", label: "Začít hrát" },
  { link: "/puzzles", label: "Úlohy" },
  { link: "/tutorial", label: "Tutoriál" },
  { link: "/about", label: "O nás" },
  { link: "/leaderboard", label: "Žebříček" },
]

interface MainLayoutProps {
  children: ReactNode
  style?: CSSProperties
}

interface Profile {
  loggedIn: boolean
  uuid?: string
  username?: string
  email?: string
  elo?: number
  wins?: number
  losses?: number
  draws?: number
  admin?: Boolean
}

export default function MainLayout({ children, style }: MainLayoutProps) {
  const [opened, setOpened] = useState(false)
  const [profile, setProfile] = useState<Profile>({ loggedIn: false })

  const items = links.map((link) => (
    <Link href={link.link} key={link.link} prefetch={true}>
      <Button>{link.label}</Button>
    </Link>
  ))

  useEffect(() => {
    axios.get("/api/v1/user/status").then((response) => {
      setProfile(response.data)
    })
  }, [])

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <Flex justify="space-around" align="center" className={classes.inner}>
          <Link href="/" prefetch>
            <Image priority src={Logo} alt="Think different Academy logo" width={200} height={50} style={{ margin: 10 }} />
          </Link>

          <Group gap={5} visibleFrom="xs">
            {items}
            <Link href={profile.loggedIn ? "/profile/" + profile.uuid : "/register"} prefetch={true}>
              <Button variant="outline">{profile.loggedIn ? profile.username : "Přidat se"}</Button>
            </Link>
            {profile.loggedIn && profile.admin && (
              <Link href="/admin" prefetch={true}>
                <Button variant="outline">Admin panel</Button>
              </Link>
            )}
          </Group>

          <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="xs" size="sm" />
        </Flex>

        {opened && (
          <Flex direction="column" align="center" gap="10px" className={classes.mobileMenu} hiddenFrom="xs">
            {items}
            <Link href={profile.loggedIn ? "/profile/" + profile.uuid : "/register"} prefetch={true}>
              <Button variant="outline">{profile.loggedIn ? profile.username : "Přidat se"}</Button>
            </Link>
            {profile.loggedIn && profile.admin && (
              <Link href="/admin" prefetch={true}>
                <Button variant="outline">Admin panel</Button>
              </Link>
            )}
          </Flex>
        )}
      </header>

      <main className={classes.mainContent} style={style}>
        {children}
      </main>

      <footer className={classes.footer}>
        <Flex justify="center" align="center" direction="row" className={classes.footerContent}>
          <Text size="sm">© {new Date().getFullYear()} Think Different Academy</Text>
          <Text size="sm" mx={5}>
            •
          </Text>
          <Link href="/terms" prefetch>
            Terms of Use
          </Link>
        </Flex>
      </footer>
    </div>
  )
}
