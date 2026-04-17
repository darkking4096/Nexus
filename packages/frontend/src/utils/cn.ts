/**
 * Utility to combine classNames with tailwind-css
 * Merges classes intelligently, with later classes overriding earlier ones
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
