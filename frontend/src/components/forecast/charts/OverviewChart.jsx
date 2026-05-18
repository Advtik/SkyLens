import { Area, Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { CHART_COLORS } from '../../../utils/constants'
import { formatDate } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function OverviewChart() {
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const data = daily.map((day) => ({
    date: formatDate(day.date),
    Temperature: day.temp_max_c,
    Precipitation: day.precipitation_mm,
    Humidity: day.humidity_avg,
  }))

  return (
    <ChartWrapper>
      <ComposedChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="Temperature" fill={CHART_COLORS.blue} fillOpacity={0.2} stroke={CHART_COLORS.blue} strokeWidth={3} />
        <Bar dataKey="Precipitation" fill={CHART_COLORS.cyan} radius={[6, 6, 0, 0]} />
        <Line type="monotone" dataKey="Humidity" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 4 }} />
      </ComposedChart>
    </ChartWrapper>
  )
}

