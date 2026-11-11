export function Titulo({ fino, fuerte, nivel = 2, className = '', id }) {
  const Etiqueta = `h${nivel}`
  return (
    <Etiqueta className={`titulo ${className}`} id={id}>
      <span className="titulo-fino">{fino}</span>
      <span className="titulo-fuerte">{fuerte}</span>
    </Etiqueta>
  )
}
