import fastify from "fastify";
import cors from '@fastify/cors'
import { appRoutes } from "./routes";

const port = 3000

const app = fastify()

app.register(cors)
app.register(appRoutes)

app.listen({
  port,
}).then(() => {
  console.log(`Server rodando em localhost:${port}`)
})