import Link from "next/link";

export function Empty({ title, body, action, icon }: { title: string; body?: string; action?: [string, string]; icon?: React.ReactNode }) {
  return (
    <div className="stage px-6 py-20 text-center">
      {icon && <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-card text-mist shadow-[var(--shadow-card)]">{icon}</div>}
      <h2 className="text-[22px]">{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-sm text-[15px] text-graphite">{body}</p>}
      {action && <Link href={action[0]} className="btn btn-quiet mt-6">{action[1]}</Link>}
    </div>
  );
}
