import { HabitDay } from '../components/HabitDay'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'
import { api } from '../lib/axios'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const weekDays = [
    'D',
    'S',
    'T',
    'Q',
    'Q',
    'S',
    'S',
]

const summaryDays = generateDatesFromYearBeginning()

// Indicar qual o tipo de variável que summary é
type Summary = Array<{
    id: string,
    date: string,
    amount: number,
    completed: number,
}>[]

export function SummaryTable() {
    const [summary, setSummary] = useState<Summary>([])

    useEffect(() => {
        api.get('/summary').then(response => {
            setSummary(response.data)
        })
    }, [])

    return (
        <div className="w-full flex">
            <div className="grid grid-rows-7 grid-flow-row gap-3">
                {weekDays.map((weekDay, i) => { // retornando para cada dia da semana
                    return (
                        <div
                            key={`${weekDay}-${i}`}
                            className="text-zinc-400 text-xl font-bold h-10 w-10 flex items-center justify-center"
                        >
                            {weekDay}
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-rows-7 grid-flow-col gap-3">
                {
                    summary.length > 0 && summaryDays.map(summaryDay => {
                        const dayInSummary = summary.find(day => {
                            return dayjs(summaryDay).isSame(day.date, 'day')
                        })

                        return (
                            <HabitDay
                                key={summaryDay.toString()}
                                date={summaryDay}
                                amount={dayInSummary?.amount}
                                defaultCompleted={dayInSummary?.completed}
                            />
                        )
                    })
                }
            </div>

        </div>
    )
}