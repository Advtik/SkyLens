import { Bar, BarChart, CartesianGrid, Cell, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { getUvColor } from '../../../utils/colorScales'
import { formatDate } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function UVChart() {
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const data = daily.map((day) => ({ date: formatDate(day.date), UV: day.uv_max }))

  return (
    <div>
      <ChartWrapper>
        <BarChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis domain={[0, 12]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceArea y1={0} y2={3} fill="#10B981" fillOpacity={0.08} />
          <ReferenceArea y1={8} y2={12} fill="#EF4444" fillOpacity={0.08} />
          <Bar dataKey="UV" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.date} fill={getUvColor(entry.UV)} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 text-sm text-slate-400">UV shows daily maximum index from the hourly forecast.</p>
    </div>
  )
}
