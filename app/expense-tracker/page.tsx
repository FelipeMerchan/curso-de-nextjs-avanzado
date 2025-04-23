import Form from "next/form"

import {
  FormControl,
  FormLabel,
  Heading,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
} from "@chakra-ui/react"
import { ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline"

import {
  getExpenses,
  addExpense,
  deleteExpense,
  getMonthlyTotal,
} from "./actions"

/* Los react server components nos ayudan a proteger el código de los navegadores.
Siempre queremos proteger nuestros secretos, proteger todo lo que pasa en el servidor
y enviar tan poco código como sea posible al cliente para que únicamente
ejecuten lo que deben hacer.
En vez de utilizar fetch podríamos conectarnos directamente a nuestra base de datos
sin ninguna base de datos y next se encarga de separar el código entre cliente y servidor
y enviar únicamente el resultado a nuestros usuarios.
*/

export default async function ExpenseTracker() {
  /* Nos conectamos directamente a nuestra base de datos: */
  const expenses = await getExpenses()
  const total = await getMonthlyTotal()

  return (
    <main className="my-16">
      <Heading size="lg" className="mb-1">
        Manejo de Gastos
      </Heading>
      <Heading as="h3" size="md">
        Monthly Total: ${total}
      </Heading>

      <Form
        /* Desde nuestro FE estamos usando addExpense de forma directa, nos conectamos directamente
        a la base de datos, estamos hablando directamente sql dentro de addExpense y lo
        estamos enviando a la página */
        action={addExpense}
        className="p-6 my-12 border-2 space-y-4 max-w-lg mx-auto"
      >
        <FormControl>
          <FormLabel>Nombre</FormLabel>
          <Input required name="name" />
        </FormControl>
        <FormControl>
          <FormLabel>Valor</FormLabel>
          <Input required type="number" name="amount" />
        </FormControl>

        <Button type="submit">Agregar</Button>
      </Form>

      <Heading as="h3" size="md">
        Gastos
      </Heading>

      <TableContainer className="mt-4">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Valor</Th>
              <Th>Fecha</Th>
              <Th>Acción</Th>
            </Tr>
          </Thead>
          <Tbody>
            {expenses.map((expense) => (
              <Tr key={expense.id}>
                <Td>{expense.name}</Td>
                <Td>$ {expense.amount}</Td>
                <Td>{expense.date.toLocaleDateString()}</Td>
                <Td>
                  <form action={deleteExpense} style={{ display: "inline" }}>
                    <input type="hidden" value={expense.id} name="id" />
                    <IconButton
                      type="submit"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Remove"
                      icon={<ArchiveBoxXMarkIcon className="size-5" />}
                    />
                  </form>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </main>
  )
}
