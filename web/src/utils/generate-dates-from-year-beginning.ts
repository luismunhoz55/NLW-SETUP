import dayjs from 'dayjs'

export function generateDatesFromYearBeginning() {
    const firstDayOfTheYear = dayjs().startOf('year')
    const today = new Date()

    let dates = []
    let compareDate = firstDayOfTheYear

    while (dates.length < 112) {
        dates.push(compareDate.toDate())
        compareDate = compareDate.add(1, 'day') // adicionando 1 dia a cada iteração do while
    }

    return dates
}