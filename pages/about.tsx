import { Container, Title, Text, TextInput, Textarea, Button, Group, Flex } from "@mantine/core";
import Head from "next/head";
import { useState } from "react";
import MainLayout from "./layouts/main";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from '@mantine/notifications';
import { z } from "zod";

// Define the form schema using Zod
const contactFormSchema = z.object({
  name: z.string().min(1, "Jméno je povinné"),
  email: z.string().email("Neplatný email"),
  message: z.string().min(1, "Zpráva je povinná"),
});

export default function AboutUsPage() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validate: zodResolver(contactFormSchema),
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log("Form submitted with: ", values);
    notifications.show({
      title: 'Zpráva odeslána',
      message: 'Zpráva byla úspěšně odeslána',
    });
  };

  return (
    <>
      <Head>
        <title>Think different Academy - O nás</title>
        <meta name="description" content="Informace o Think different Academy." />
      </Head>
      <MainLayout>
        <Container style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
          <Title order={1} ta="center">O nás</Title>
          <Text size="md" style={{ marginTop: '20px' }}>
            Think different Academy je tým nadšených profesionálů zaměřených na rozvoj logického a taktické myšlení. Naši platformu využívají studenti a hráči z celého světa pro zlepšování svých dovedností v oblasti strategie a plánování.
          </Text>
          
          <Title order={2} style={{ marginTop: '40px' }}>Kontaktujte nás</Title>
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))} style={{ marginTop: '20px' }}>
            <Flex direction="column" gap="md">
              <TextInput
                label="Jméno"
                placeholder="Vaše jméno"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Email"
                placeholder="Vaše emailová adresa"
                required
                {...form.getInputProps('email')}
              />
              <Textarea
                label="Zpráva"
                placeholder="Vaše zpráva"
                required
                {...form.getInputProps('message')}
              />
              <Group>
                <Button type="submit">Odeslat</Button>
              </Group>
            </Flex>
          </form>
        </Container>
      </MainLayout>
    </>
  );
}