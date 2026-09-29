type Bucket = { stamps: number[] };

const buckets = new Map<string, Bucket>();

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "local";
}

export function allowRequest(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { stamps: [] };
  bucket.stamps = bucket.stamps.filter((stamp) => now - stamp < windowMs);
  if (bucket.stamps.length >= max) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.stamps.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 2000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return true;
}
