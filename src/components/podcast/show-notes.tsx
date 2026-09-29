import type { ReactNode } from "react";

export function ShowNotes({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  if (blocks.length === 0 || (blocks.length === 1 && blocks[0] === "")) return null;

  return (
    <div className="space-y-4 text-base leading-relaxed text-text-secondary">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function renderBlock(block: string, index: number): ReactNode {
  const lines = block.split("\n");
  if (lines.every((line) => line.startsWith("- "))) {
    return (
      <ul key={index} className="list-disc space-y-1 pl-5">
        {lines.map((line, lineIndex) => (
          <li key={lineIndex}>{inline(line.slice(2), `${index}-${lineIndex}`)}</li>
        ))}
      </ul>
    );
  }

  if (lines.length === 1 && lines[0].startsWith("### ")) {
    return (
      <h3 key={index} className="pt-2 text-base font-semibold text-text-primary">
        {inline(lines[0].slice(4), String(index))}
      </h3>
    );
  }

  if (lines.length === 1 && lines[0].startsWith("## ")) {
    return (
      <h2 key={index} className="pt-2 text-xl font-semibold tracking-tight text-text-primary">
        {inline(lines[0].slice(3), String(index))}
      </h2>
    );
  }

  return <p key={index}>{inline(lines.join(" "), String(index))}</p>;
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const token = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let count = 0;

  for (const match of text.matchAll(token)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));

    const key = `${keyPrefix}-${count}`;
    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={key}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          {match[2]}
        </a>,
      );
    } else if (match[5]) {
      nodes.push(
        <strong key={key} className="font-semibold text-text-primary">
          {match[5]}
        </strong>,
      );
    } else if (match[7]) {
      nodes.push(
        <code key={key} className="font-mono text-[0.9em] text-text-primary">
          {match[7]}
        </code>,
      );
    }

    last = index + match[0].length;
    count += 1;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
