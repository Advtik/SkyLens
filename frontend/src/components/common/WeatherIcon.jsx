import { motion } from 'framer-motion'

export default function WeatherIcon({ icon, condition = 'Clear', size = 'large' }) {
  const isSun = icon?.includes('01') || condition.toLowerCase().includes('clear')
  const dimension = size === 'large' ? 'h-28 w-28 md:h-36 md:w-36' : 'h-11 w-11'

  return (
    <motion.div
      animate={isSun ? { rotate: 360 } : { y: [0, 5, 0] }}
      transition={isSun ? { duration: 24, repeat: Infinity, ease: 'linear' } : { duration: 2.4, repeat: Infinity }}
      className={`shrink-0 ${dimension}`}
    >
      <img
        className="h-full w-full drop-shadow-2xl"
        src={`https://openweathermap.org/img/wn/${icon || '02d'}@4x.png`}
        alt={`${condition} weather icon`}
      />
    </motion.div>
  )
}

