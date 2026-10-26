export function Logo({ size = 24, white = false, markOnly = false }: { size?: number; white?: boolean; markOnly?: boolean }) {
  const mark = <img src="/brand/epixo-mark.png" alt={markOnly ? "Epixo" : ""} width={Math.round(size * 1.105)} height={size} style={{ height: size, width: "auto" }} className="block select-none" draggable={false} />;
  if (markOnly) return mark;
  const h = Math.round(size * 0.9), w = Math.round(h * 2.37);
  const word = (src: string, cls: string) => <img src={src} alt="Epixo" width={w} height={h} style={{ height: h, width: "auto" }} className={cls} draggable={false} />;
  return (
    <span className="flex select-none items-center" style={{ gap: Math.round(size * 0.38) }}>
      {mark}
      {white ? word("/brand/epixo-wordmark-white.png", "block") : (
        <>
          {word("/brand/epixo-wordmark.png", "only-light")}
          {word("/brand/epixo-wordmark-white.png", "only-dark")}
        </>
      )}
    </span>
  );
}
