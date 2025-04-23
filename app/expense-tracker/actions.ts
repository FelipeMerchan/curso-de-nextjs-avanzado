"use server"

import { revalidatePath } from "next/cache"
import { sql } from "./db"

type Expense = {
  id: string
  name: string
  amount: string
  date: Date
}

/* Nos funciona mucho para la seguridad, generalmente se suelen analizar
de forma automática cuáles son las apis abiertas de una página para
empezar atacar desde allí, con Next podemos mitigar estas vulnearbildiades
porque nuestras apis no están abiertas, son apis que están cambiando por seguridad
con ids diferentes y con paths diferentes automáticamente por next y estamos haciendo que
next se encargue de esto. Esto hace nuestro sitio más seguro, protegemos la información con postgres,
así tengamos secretos en el backend en nuestro react server component nunca le va a llegar a
nuestro cliente y así hacemos que nuestras páginas y la forma en que manejamos los datos
sea mucho más eficiente. */

/* En Next se acostumbra que las acciones sea un archivo dentro de la misma
carpeta de la página, en este caso la carpeta expense-tracker */
// Fetch all expenses
export async function getExpenses() {
  /* Podemos usar sql directamente sin un ORM: */
  const result = await sql<Expense[]>`SELECT * FROM expenses ORDER BY date DESC`
  return result
}

// Add a new expense
export async function addExpense(data: FormData) {
  /* Como es un action y es desde el servidor todo se hace desde
  FormData, FormData es la forma nativa de enviar datos desde un cliente hasta un
  servidor. */
  const name = data.get("name") as string
  const amount = data.get("amount") as string
  /* con data.get accedemos a los inputs del formulario,
  con data.get("name") accedemos al input:
  <Input required name="name" />, así que name y amount serán
  los valores de los inputs del formulario en el que usamos
  este action addExpense:
  <Form action={addExpense}
  así que en la práctica aquí recibimos en el servidor la información
  que nos envié nuestro cliente.
  */

  /* Esto lo veremos correr en el servidor con los datos del formulario: */
  console.log("Adding expense:", { name, amount })

  /* Aquí podríamos agregar datos a la base de datos sin un ORM,
  ejecutamos directamente sql: */
  await sql`
    INSERT INTO expenses
      (name, amount)
    VALUES
      (${name.toString()}, ${amount})
    `

  /* revalidatePath recibe el nombre del path que queremos revalidar
  esto hara que next revalide la información por dentro, next volverá a cargar
  la información para mostrar la última versión de la página, es decir,
  hace un refresh que es más rápido que hacer un windows.reload para tener
  toda la nueva información */
  revalidatePath("/expense-tracker")
}

// Delete an expense
export async function deleteExpense(data: FormData) {
  const id = data.get("id") as string

  await sql`
    DELETE FROM expenses
    WHERE id = ${id}
  `

  revalidatePath("/expense-tracker")
}

// Get total expenses for the current month
export async function getMonthlyTotal() {
  const result = await sql<{ total: string }[]>`
    SELECT SUM(amount) AS total
    FROM expenses
    WHERE
      date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
  `

  return result[0]?.total || 0
}
