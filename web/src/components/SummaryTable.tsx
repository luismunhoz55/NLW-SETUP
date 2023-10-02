import { HabitDay } from '../components/HabitDay'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'

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

export function SummaryTable() {
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
                    summaryDays.map((summaryDay, i) => {
                        return (
                            <HabitDay
                                key={i}
                                amount={5}
                                completed={Math.round(Math.random() * 6)}
                            />
                        )
                    })
                }
            </div>

        </div>
    )
}