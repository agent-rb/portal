export function BrandName({ name }: { name: string }) {
  const suffix = "RB";
  const stem = name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
  const mark = name.endsWith(suffix) ? suffix : "";

  return (
    <>
      {stem}
      {mark ? <span className="text-mark">{mark}</span> : null}
    </>
  );
}
