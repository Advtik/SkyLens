import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { useWeatherStore } from '../../../store/useWeatherStore'
import { formatDate } from '../../../utils/formatters'
import ChartWrapper from './ChartWrapper'
import CustomTooltip from './CustomTooltip'

export default function CloudCoverChart() {
  const daily = useWeatherStore((state) => state.forecast?.daily ?? [])
  const data = daily.map((day) => ({ date: formatDate(day.date), 'Cloud Cover': day.cloud_cover_avg }))

  return (
    <ChartWrapper>
      <AreaChart data={data} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F8FAFC" stopOpacity={0.48} />
            <stop offset="95%" stopColor="#F8FAFC" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area dataKey="Cloud Cover" type="monotone" fill="url(#cloudFill)" stroke="#E2E8F0" strokeWidth={3} />
      </AreaChart>
    </ChartWrapper>
  )
}

