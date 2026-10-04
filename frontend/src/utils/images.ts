// Mismo patrón que el mapper del backend: /ids/905042/ → /ids/905042-600-600/
export function resizeVtexImage(url: string, size: number): string {
  return url.replace(/\/ids\/(\d+)(-\d+-\d+)?\//, `/ids/$1-${size}-${size}/`);
}
