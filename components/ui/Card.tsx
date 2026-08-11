import type { ElementType, HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

export function Card({ as: Tag = "div", className = "", ...props }: CardProps) {
  return <Tag className={`rounded-lg border border-border bg-surface p-4 ${className}`} {...props} />;
}
