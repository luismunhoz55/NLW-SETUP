import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import cors from '@fastify/cors'

const port = 3000

const app = fastify()
const prisma = new PrismaClient()

app.register(cors)

app.get('/habits', async () => {
  const habits = await prisma.habit.findMany()

  return habits
})

app.listen({
  port,
}).then(() => {
  console.log(`Server rodando em localhost:${port}`)
})