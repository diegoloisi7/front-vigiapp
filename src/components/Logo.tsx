// Logo simple en SVG inline: una casa dentro de un cuadrado redondeado.
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#1F4E79" />
      <path d="M8 15.5 16 9l8 6.5V23a1 1 0 0 1-1 1h-4v-5h-6v5H9a1 1 0 0 1-1-1z" fill="#fff" />
    </svg>
  )
}
