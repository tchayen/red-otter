"use client";
import { Code, slugify } from "./tags";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Enum, Field } from "./TypeTable";

type TypeTooltipProps = {
  enumType: Enum;
  field: Field;
};

export function TypeTooltip({ field, enumType }: TypeTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <a
          href={`#${slugify(field.type)}`}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-orangedark9"
        >
          <Code className="text-[13px] underline">{field.type}</Code>
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={4} className="rounded-md bg-black px-3 py-2">
        <Tooltip.Arrow />
        <h3 className="text-lg font-semibold text-mauvedark12">{enumType.name}</h3>
        <span className="text-mauvedark10">{enumType.description}</span>
        <ul className="text-mauvedark10">
          {enumType.values.map((value) => (
            <li key={value.name} className="my-1">
              <Code>{value.name}</Code>
              {value.description && <span> – {value.description}</span>}
            </li>
          ))}
        </ul>
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
