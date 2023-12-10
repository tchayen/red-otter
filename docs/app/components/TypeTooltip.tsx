"use client";
import { Code, slugify } from "./tags";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { EnumType, FieldType } from "./ApiBlocks";
import { Markdown } from "./Markdown";

type TypeTooltipProps = {
  enumType: EnumType;
  field: FieldType;
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
        {enumType.values.map((value) => (
          <div key={value.name} className="flex items-baseline gap-1">
            <Code className="[&>*]:text-sm">{value.name}</Code>
            {value.description && (
              <div className="[&>*]:text-sm [&>*]:text-mauvedark10">
                <Markdown>{value.description}</Markdown>
              </div>
            )}
          </div>
        ))}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
