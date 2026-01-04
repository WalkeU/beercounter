export default function Logo({ size = 32, onClick, className = "" }) {
  // Tailwind text-[${size}px] dinamikusan nem támogatott, ezért inline style-t használunk
  return (
    <div
      className={`block font-sans font-bold bg-bg flex items-center gap-2 w-fit ${className}`}
      style={{ fontSize: `${size}px` }}
      onClick={onClick}
    >
      <span className="text-text-primary pb-1">Beer</span>
      <span className="bg-accent text-bg rounded-[8px] px-2 pb-1 inline-block">count</span>
    </div>
  )
}
