import Head from "next/head"
import MainLayout from "./layouts/main"
import Link from "next/link"
import { Group, Title, Center, Flex, Container, Button, Paper, TextInput, Text } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import axios from "axios"
import { z } from "zod"
import { useRouter } from "next/router"

// Define the form schema using Zod
const loginFormSchema = z.object({
  login: z.string().min(1, "Přihlašovací jméno nebo email je povinné"),
  password: z.string().min(1, "Heslo je povinné"),
})

export default function IndexPage() {
  const router = useRouter()
  const form = useForm({
    initialValues: {
      login: "",
      password: "",
    },
    validate: zodResolver(loginFormSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Send the login data to the server
      await axios.post("/api/v1/user/login", values)
      notifications.show({
        title: "Přihlášení úspěšné",
        message: "Byli jste úspěšně přihlášeni",
      })
      router.push("/play", undefined, { shallow: true })
    } catch (error) {
      notifications.show({
        title: "Chyba při přihlášení",
        message: "Došlo k chybě během přihlašování, zkontrolujte prosím své údaje",
        color: "red",
      })

      form.setErrors({ common: "Neplatné přihlašovací údaje" })
    }
  }

  return (
    <>
      <Head>
        <title>Think different Academy</title>
        <meta
          name="description"
          content="Think different Academy je platforma, díky které si budou moci mladí lidé potrénovat své logické a taktické myšlení na piškvorkových úlohách."
        />
      </Head>
      <MainLayout style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
        <Paper style={{ display: "flex", flexDirection: "column", maxWidth: "400px", width: "100%" }} shadow="xs" p="md" radius="md">
          <Title ta="center">Přihlásit se</Title>
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <TextInput label="Přihlašovací jméno nebo email" placeholder="Username/Email" mt="md" required {...form.getInputProps("login")} />
            <TextInput label="Heslo" placeholder="Password" mt="md" type="password" required {...form.getInputProps("password")} />
            {form.errors.common && (
              <Text c="red" mt="sm" size="sm">
                {form.errors.common}
              </Text>
            )}
            <Button mt="md" fullWidth type="submit">
              Login
            </Button>
          </form>
          <Link href="/register" style={{ textDecoration: "none", color: "black" }} prefetch>
            <Button variant="transparent" fullWidth mt="md">
              Nemáte účet? Zaregistrujte se
            </Button>
          </Link>
        </Paper>
      </MainLayout>
    </>
  )
}
