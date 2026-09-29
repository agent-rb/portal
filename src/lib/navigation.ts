import { siteConfig } from "@/config/site";

const featureByHref = {
  "/blog": "blog",
  "/docs": "docs",
  "/newsletter": "newsletter",
  "/podcast": "podcast",
} as const;

export function portalNav() {
  return siteConfig.nav.filter((item) => {
    const feature = featureByHref[item.href as keyof typeof featureByHref];
    if (!feature) return true;
    return siteConfig.features[feature];
  });
}
