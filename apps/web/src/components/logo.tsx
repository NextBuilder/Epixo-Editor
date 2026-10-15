export function Logo({ size = 26, white = false, markOnly = false }: { size?: number; white?: boolean; markOnly?: boolean }) {
  if (markOnly) return <img src="/brand/epixo-mark.png" alt="Epixo" width={Math.round(size * 1.105)} height={size} style={{ height: size, width: "auto" }} className="block select-none" draggable={false} />;
  return (
    <span className="flex select-none items-center" style={{ gap: Math.round(size * 0.4) }}>
      <img src="/brand/epixo-mark.png" alt="" width={Math.round(size * 1.105)} height={size} style={{ height: size, width: "auto" }} draggable={false} />
      <img src={white ? "/brand/epixo-wordmark-white.png" : "/brand/epixo-wordmark.png"} alt="Epixo" width={Math.round(size * 0.92 * 2.37)} height={Math.round(size * 0.92)} style={{ height: Math.round(size * 0.92), width: "auto" }} draggable={false} />
    </span>
  );
}
