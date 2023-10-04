import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import dayjs from 'dayjs';

interface HabitsListProps {
  date: Date,
  onCompletedChange: (completed: number) => void,
}

type Habit = Array<{
  id: string,
  title: string,
  created_at: Date,
}>

export function HabitsList({ date, onCompletedChange }: HabitsListProps) {

  const [allHabits, setAllHabits] = useState<Habit>([])
  const [madeHabits, setMadeHabits] = useState<string[]>([])

  useEffect(() => {
    api.get('/day', {
      params: { // params -> query
        date: date.toISOString()
      }
    }).then(response => {
      const { completedHabits, possibleHabits } = response.data;
      setAllHabits(possibleHabits)
      setMadeHabits(completedHabits)
    })
  }, [])

  async function handleToggleHabbit(habitId: string) {

    await api.patch(`/habits/${habitId}/toggle`)

    const isHabitAlreadyCompleted = madeHabits!.includes(habitId)

    let newCompletedHabits: string[] = []

    if (isHabitAlreadyCompleted) {
      newCompletedHabits = madeHabits.filter(id => id !== habitId)
    } else {
      newCompletedHabits = [...madeHabits, habitId]
    }

    setMadeHabits(newCompletedHabits)

    console.log(madeHabits)
    onCompletedChange(madeHabits.length)

  }

  const isDayInPast = dayjs(date).endOf('day').isBefore(new Date())

  return (
    <div className='mt-6 flex flex-col gap-3'>

      {
        allHabits.map(habit => {
          return (
            <Checkbox.Root
              key={habit.id}
              defaultChecked={madeHabits?.includes(habit.id)}
              disabled={isDayInPast}
              onCheckedChange={() => handleToggleHabbit(habit.id)}
              className='flex items-center gap-3 group'
            >

              <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 
                                        group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500'>
                <Checkbox.Indicator>
                  <Check size={20} className='text-white' />
                </Checkbox.Indicator>
              </div>
              <span
                className='font-semibold text-xl text-white leading-tight
                            group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'
              >
                {habit.title}
              </span>
            </Checkbox.Root>

          )
        })
      }

    </div>
  )
}