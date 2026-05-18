import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { CHART_COLORS } from '../../../utils/constants'
import { formatDate, msToKmh } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function WindChart() {
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const currentWind = useWeatherStore((state) => state.weather?.wind_speed_ms ?? 0)
  const data = daily.map((day) => ({ date: formatDate(day.date), 'Wind Speed': Math.round(day.wind_speed_avg * 3.6) }))

  return (
    <div>
      <ChartWrapper>
        <AreaChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="windFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.42} />
              <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area dataKey="Wind Speed" type="monotone" fill="url(#windFill)" stroke={CHART_COLORS.green} strokeWidth={3} />
        </AreaChart>
      </ChartWrapper>
      <p className="mt-3 text-sm text-slate-400">Current wind: {msToKmh(currentWind)}</p>
    </div>
  )
}
