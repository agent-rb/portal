export function PodcastSubscribe({
  links,
}: {
  links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
}) {
  const visible = links.filter((link) => link.href.length > 0);
  if (visible.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-3">
      {visible.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-border/60 bg-bg-elevated/30 px-4 py-2 text-sm font-medium text-text-secondary backdrop-blur-md transition-colors hover:border-border hover:text-text-primary"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
