import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'
import { z } from 'zod'
import dayjs from 'dayjs'

export async function appRoutes(app: FastifyInstance) {

  app.get('/test', async (request, reply) => {
    return await prisma.habit.findMany()
  })

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

  app.get('/day', async (request, reply) => {
    const getDayParams = z.object({
      date: z.coerce.date() // transforma uma string numa data
    })

    const { date } = getDayParams.parse(request.query)

    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day') // retorna o dia da semana

    // todos os hábitos possiveis do dia
    // hábitos que já foram completados

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          }
        }
      }
    })

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate()
      },
      include: {
        dayHabits: true
      }
    })

    const completedHabits = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id
    })

    return {
      possibleHabits,
      completedHabits
    }

  })

}