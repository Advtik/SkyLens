import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { CHART_COLORS } from '../../../utils/constants'
import { formatDate } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function TemperatureChart({ mlConfidence }) {
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const data = daily.map((day) => ({
    date: formatDate(day.date),
    'Official Max': day.temp_max_c,
    'Official Min': day.temp_min_c,
    'ML Predicted': day.temp_ml_predicted,
  }))

  return (
    <div>
      <ChartWrapper>
        <LineChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(value) => `${value}°C`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#CBD5E1' }} />
          <Line type="monotone" dataKey="Official Max" stroke={CHART_COLORS.blue} strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Official Min" stroke={CHART_COLORS.sky} strokeWidth={2} strokeDasharray="4 2" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="ML Predicted" stroke={CHART_COLORS.amber} strokeWidth={3} strokeDasharray="6 3" dot={{ r: 4, fill: CHART_COLORS.amber }} />
        </LineChart>
      </ChartWrapper>
      <p className="mt-3 text-sm text-slate-400">RandomForest trend confidence: {Math.round((mlConfidence || 0) * 100)}%</p>
    </div>
  )
}
