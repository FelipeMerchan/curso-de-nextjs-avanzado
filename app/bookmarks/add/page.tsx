"use client"

import Form from "next/form"

import {
  FormControl,
  FormLabel,
  Heading,
  Input,
  Button,
  Text,
} from "@chakra-ui/react"

import { addBookmark } from "./actions"
import { useActionState } from "react"

export default function Bookmarks() {
  /* Hay dos formas de mostrar el estado loading en la UI:
  1. Usando useFormStatus como se usó en el archivo: app\auth\login\page.tsx.
  useFormStatus nos brindará la información en el que se encuentra en el formulario
  que está activo dentro de la página.
  2. Recientemente ha sido introducida dentro de useActionState una nueva forma
  de conocer el estado de loading. Ahora este hook retorna un booleano en la tercera
  posición del array que nos retorna que nos indica si está cargando. */
  /* The isPending flag tells you whether there is a pending Transition. */
  const [state, action, isPending] = useActionState(addBookmark, { error: "" })

  return (
    <main className="mt-12">
      <header className="">
        <Heading size="lg" className="mb-1">
          Agregar un marcador
        </Heading>
        <Text>Exploración de manejo de Errores con React y Next.js 15</Text>
      </header>

      {/* El componente Form de Next.js nos ayuda porque nos brinda algunas
      funcionalidades de seguridad: https://nextjs.org/docs/app/api-reference/components/form */}
      <Form
        action={action}
        className="p-6 my-12 border-2 space-y-4 max-w-lg mx-auto"
      >
        <FormControl>
          <FormLabel>Titulo</FormLabel>
          <Input required name="title" />
        </FormControl>
        <FormControl>
          <FormLabel>URL</FormLabel>
          <Input required type="url" name="url" />
        </FormControl>

        <Button disabled={isPending} type="submit">
          Agregar
        </Button>
        {state?.error && (
          <div className="my-4 bg-red-300 px-6 py-4">{state.error}</div>
        )}
      </Form>
    </main>
  )
}
