import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'
import { z } from 'zod'
import dayjs from 'dayjs'

export async function appRoutes(app: FastifyInstance) {

  app.post('/habits', async (request, reply) => {

    // criar o tipo que o body da requisição deve ser
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(
        z.number().min(0).max(6) // array de números
      )
    })

    const { title, weekDays } = createHabitBody.parse(request.body) // o createHabitBody vai analisar a requisição e ver se todos os parâmetros batem

    const today = dayjs().startOf('day').toDate() // zera as horas, minutos e segundos

    const habit = await prisma.habit.create({
      data: {
        title,
        created_at: new Date(),
        weekDays: {
          create: weekDays.map(weekDay => { //mapear todos os dias da semana e criar um objeto para cada um
            return {
              week_day: weekDay
            }
          })
        }
      }
    })
  })

}