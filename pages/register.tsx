import Head from "next/head"
import MainLayout from "./layouts/main"
import Link from "next/link"
import { Group, Title, Center, Flex, Container, Button, Paper, TextInput, Text, List, ThemeIcon, Checkbox } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import axios from "axios"
import { z } from "zod"
import { useRouter } from "next/router"

// Define the form schema using Zod
const registerFormSchema = z
  .object({
    username: z.string().min(1, "Uživatelké jméno je povinné"),
    email: z.string().email("Neplatný email").min(1, "Email je povinný"),
    password: z
      .string()
      .min(8, "Heslo musí mít minimálně 8 znaků")
      .regex(/[A-Z]/, "Heslo musí obsahovat alespoň jedno velké písmeno")
      .regex(/[a-z]/, "Heslo musí obsahovat alespoň jedno malé písmeno")
      .regex(/\d/, "Heslo musí obsahovat alespoň jedno číslo")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Heslo musí obsahovat alespoň jeden speciální znak"),
    confirmPassword: z.string().min(1, "Potvrzení hesla je povinné"),
    agree: z.literal(true, {
      errorMap: () => ({ message: "Musíte souhlasit s podmínkami užití" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: zodResolver(registerFormSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Send the register data to the server
      await axios.post("/api/v1/user/register", { password: values.password, username: values.username, email: values.email })
      notifications.show({
        title: "Registrace úspěšná",
        message: "Úspěšně jste se zaregistrovali",
      })
      router.push("/play", undefined, { shallow: true })
    } catch (error) {
      notifications.show({
        title: "Chyba při registraci",
        message: "Došlo k chybě během registrace, uživatelské jméno nebo email je již registrován",
        color: "red",
      })

      form.setErrors({ common: "Chyba během registrace, živatelské jméno nebo email je již registrován" })
    }
  }

  // Check password requirements
  const password = form.values.password
  const passwordRequirements = [
    { regex: /.{8,}/, label: "Heslo musí mít minimálně 8 znaků" },
    { regex: /[A-Z]/, label: "Heslo musí obsahovat alespoň jedno velké písmeno" },
    { regex: /[a-z]/, label: "Heslo musí obsahovat alespoň jedno malé písmeno" },
    { regex: /\d/, label: "Heslo musí obsahovat alespoň jedno číslo" },
    { regex: /[^a-zA-Z0-9]/, label: "Heslo musí obsahovat alespoň jeden speciální znak" },
  ]

  const unmetRequirements = passwordRequirements.filter((req) => !req.regex.test(password))

  return (
    <>
      <Head>
        <title>Think different Academy - Registrace</title>
        <meta name="description" content="Registrace na platformu Think different Academy." />
      </Head>
      <MainLayout
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Paper
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "400px",
            width: "100%",
          }}
          shadow="xs"
          p="md"
          radius="md"
        >
          <Title ta="center">Registrace</Title>
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <TextInput label="Uživatelské jméno" placeholder="Username" mt="md" required {...form.getInputProps("username")} />
            <TextInput label="Email" placeholder="Email" mt="md" required {...form.getInputProps("email")} />
            <TextInput label="Heslo" placeholder="Password" mt="md" type="password" required {...form.getInputProps("password")} />
            <TextInput
              label="Potvrzení hesla"
              placeholder="Confirm Password"
              mt="md"
              type="password"
              required
              {...form.getInputProps("confirmPassword")}
            />
            <Checkbox
              label={
                <>
                  Souhlasím s <Link href="/terms">podmínkami užití</Link>
                </>
              }
              mt="md"
              required
              {...form.getInputProps("agree", { type: "checkbox" })}
            />
            {unmetRequirements.map((req) => (
              <Text c="red" mt="sm" size="sm" key={req.label}>
                {req.label}
              </Text>
            ))}
            {form.errors.common && (
              <Text c="red" mt="sm" size="sm">
                {form.errors.common}
              </Text>
            )}
            <Button mt="md" fullWidth type="submit" disabled={unmetRequirements.length > 0}>
              Registrace
            </Button>
          </form>
          <Link href="/login" style={{ textDecoration: "none", color: "black" }} prefetch>
            <Button variant="transparent" fullWidth mt="md">
              Máte již účet? Přihlaste se
            </Button>
          </Link>
        </Paper>
      </MainLayout>
    </>
  )
}
