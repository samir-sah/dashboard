// Healthy Bit logo mark — a plus/cross built from dots, recreated as geometric SVG.
export function HealthyBitMark({ className }) {
  // Grid positions for the dot-cross pattern.
  const dots = [
    // vertical arm
    [12, 3],
    [12, 7.5],
    [12, 16.5],
    [12, 21],
    // horizontal arm
    [3, 12],
    [7.5, 12],
    [16.5, 12],
    [21, 12],
    // center
    [12, 12],
    // diagonals (inner)
    [8.4, 8.4],
    [15.6, 8.4],
    [8.4, 15.6],
    [15.6, 15.6],
  ]
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="Healthy Bit logo"
    >
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i === 8 ? 1.7 : 1.45} />
      ))}
    </svg>
  )
}

export function HealthyBitLogo({ className, markClassName, light = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <HealthyBitMark className={markClassName ?? 'h-8 w-8'} />
      <div className="leading-none">
        <span className="block text-xl font-bold tracking-tight">
          Healthy Bit
        </span>
        <span
          className={`block text-[11px] font-medium tracking-wide ${
            light ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          Precision in Every Beat
        </span>
      </div>
    </div>
  )
}
