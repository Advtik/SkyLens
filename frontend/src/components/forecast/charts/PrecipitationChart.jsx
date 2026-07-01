import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { CHART_COLORS } from '../../../utils/constants'
import { formatDate } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function PrecipitationChart() {
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const data = daily.map((day) => ({
    date: formatDate(day.date),
    'Rain mm': day.precipitation_mm,
    'Rain chance %': day.precipitation_probability ?? Math.min(100, Math.round(day.cloud_cover_avg * 0.35 + day.precipitation_mm * 12)),
  }))

  return (
    <ChartWrapper>
      <ComposedChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Rain mm" fill={CHART_COLORS.sky} radius={[8, 8, 0, 0]} />
        <Line dataKey="Rain chance %" stroke="#F8FAFC" strokeDasharray="6 3" strokeWidth={2} />
      </ComposedChart>
    </ChartWrapper>
  )
}
