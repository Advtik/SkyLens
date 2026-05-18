import { ResponsiveContainer } from 'recharts'

export default function ChartWrapper({ children, height = 310 }) {
  return (
    <div className="scrollbar-hide w-full overflow-x-auto">
      <div className="min-w-[720px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

