// Initials on a soft gradient picked from the name, so every maker keeps the same colours everywhere.
const TONES = [
  ["#5E9BFF", "#2F6BF2"], ["#7C8CFF", "#5546E8"], ["#B987FF", "#8A4DE8"], ["#FF8FB1", "#E8457A"],
  ["#FFAE70", "#F2741F"], ["#FFD25E", "#E8A400"], ["#6EDB9A", "#22A35A"], ["#5ED6D2", "#14A3A0"],
];

export function tone(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function Avatar({ src, name, size = 32, className = "" }: { src: string | null | undefined; name: string; size?: number; className?: string }) {
  if (src) return <img src={src} alt="" width={size} height={size} className={`avatar bg-fill ${className}`} style={{ width: size, height: size }} referrerPolicy="no-referrer" />;
  const [a, b] = tone(name);
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: `linear-gradient(160deg, ${a}, ${b})` }} aria-hidden>
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
