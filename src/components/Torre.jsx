const CIMA = 60
const BASE = 400
const NIVELES = [60, 110, 150, 195, 245, 300, 355, 400]

const izquierda = (y) => 92 - ((y - CIMA) * 52) / (BASE - CIMA)
const derecha = (y) => 200 - izquierda(y)

export function Torre({ className = '', cables = false }) {
  const celosia = NIVELES.slice(0, -1).flatMap((y, i) => {
    const siguiente = NIVELES[i + 1]
    return [
      [izquierda(y), y, derecha(siguiente), siguiente],
      [derecha(y), y, izquierda(siguiente), siguiente],
      [izquierda(siguiente), siguiente, derecha(siguiente), siguiente],
    ]
  })

  const brazos = [
    [28, 110, 172, 110],
    [28, 110, izquierda(140), 140],
    [172, 110, derecha(140), 140],
    [16, 175, 184, 175],
    [16, 175, izquierda(205), 205],
    [184, 175, derecha(205), 205],
    [92, 60, 100, 18],
    [108, 60, 100, 18],
    [92, 60, 108, 60],
  ]

  const aisladores = [
    [32, 110, 32, 132],
    [168, 110, 168, 132],
    [20, 175, 20, 197],
    [180, 175, 180, 197],
  ]

  return (
    <svg className={`torre ${className}`} viewBox="0 0 200 400" aria-hidden="true" overflow="visible">
      {cables && (
        <g className="torre-cables">
          <path d="M-420 150 Q-190 205 32 132" />
          <path d="M168 132 Q390 190 620 150" />
          <path d="M-420 214 Q-200 262 20 197" />
          <path d="M180 197 Q400 255 620 214" />
          <path d="M-420 40 Q-160 70 100 18" />
          <path d="M100 18 Q360 66 620 40" />
        </g>
      )}
      <g className="torre-estructura">
        <line x1={izquierda(CIMA)} y1={CIMA} x2={izquierda(BASE)} y2={BASE} />
        <line x1={derecha(CIMA)} y1={CIMA} x2={derecha(BASE)} y2={BASE} />
        {[...celosia, ...brazos].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g className="torre-aisladores">
        {aisladores.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  )
}
