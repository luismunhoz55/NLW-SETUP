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

  app.patch('/habits/:id/toggle', async (request, reply) => { // patch para atualizar apenas um status no banco de dados

    const toggleHabitParams = z.object({
      id: z.string().uuid()
    })

    const { id } = toggleHabitParams.parse(request.params)

    const today = await dayjs().startOf('day').toDate()

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      }
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        }
      })
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        }
      }
    })

    // Se o hábito já está completo, então desmarque
    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        }
      })
    } else {
      // Completar o hábito nesse dia
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id
        }
      })
    }


    return day

  })

  app.get('/summary', async (request, reply) => {
    const summary = prisma.$queryRaw`
      SELECT 
        D.id,
        D.date,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT 
            cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= D.date
        ) as amount
      FROM days D
    `

    return summary
  })

}