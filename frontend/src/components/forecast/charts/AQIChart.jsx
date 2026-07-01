import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { getAqiColor } from '../../../utils/colorScales'
import { formatDate } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function AQIChart() {
  const weather = useWeatherStore((state) => state.weather)
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const data = daily.map((day) => ({
    date: formatDate(day.date),
    AQI: day.aqi_avg ?? weather?.aqi ?? null,
    Source: day.aqi_source || (day.aqi_avg ? 'Forecast' : 'Current baseline'),
  }))

  return (
    <div>
      <ChartWrapper>
        <BarChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          {[1, 2, 3, 4, 5].map((line) => (
            <ReferenceLine key={line} y={line} stroke="#475569" strokeDasharray="2 2" />
          ))}
          <Bar dataKey="AQI" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.date} fill={getAqiColor(entry.AQI || 1)} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 text-sm text-slate-400">AQI uses the 1-5 OpenWeather scale: 1 good, 3 moderate, 5 very poor.</p>
    </div>
  )
}
