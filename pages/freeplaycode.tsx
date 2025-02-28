import { Group, Title, Center, Flex, Button, PinInput, Paper } from "@mantine/core"
import Head from "next/head"
import MainLayout from "./layouts/main"
import { useForm, zodResolver } from "@mantine/form"
import { z } from "zod"
import { useRouter } from "next/router"

// Define the form schema using Zod
const codeFormSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/, "Pin musí být šestimístné číslo"),
})

export default function IndexPage() {
  const router = useRouter()
  const form = useForm({
    initialValues: {
      code: "",
    },
    validate: zodResolver(codeFormSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    router.replace("/freeplay/" + values.code)
  }

  return (
    <>
      <Head>
        <title>Think different Academy - Připojit ke hře</title>
      </Head>
      <MainLayout>
        <Center>
          <Paper shadow="xs" p="md" radius="md" style={{ width: "100%", maxWidth: "500px" }}>
            <form
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 20,
              }}
              onSubmit={form.onSubmit((values) => handleSubmit(values))}
            >
              <Title>Připoj se ke hře</Title>
              <PinInput length={6} {...form.getInputProps("code")} type={"number"} />
              <Button type="submit">Připojit se</Button>
            </form>
          </Paper>
        </Center>
      </MainLayout>
    </>
  )
}
