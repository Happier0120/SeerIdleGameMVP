interface EventLogProps {
  title: string;
  items: string[];
  emptyText?: string;
}

export function EventLog({ title, items, emptyText = "暂无记录" }: EventLogProps) {
  return (
    <section className="panel event-log">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div className="log-list">
          {items.map((item, index) => (
            <p key={`${item}-${index}`}>{item}</p>
          ))}
        </div>
      )}
    </section>
  );
}
