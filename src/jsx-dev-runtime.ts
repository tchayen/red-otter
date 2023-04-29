import { FixedView, TreeNode } from "src/Layout";
import { BuiltInTag, Component, ViewProps, createElement } from "./jsx-runtime";

export * from "./jsx-runtime";

export function jsxDEV(
  type: BuiltInTag | Component,
  props: Record<string, unknown> | null
  // _key: string | null | undefined,
  // _isStaticChildren: boolean,
  // _source: Record<string, any> | null,
  // _self: any
): ReturnType<typeof createElement> {
  return createElement(
    type,
    props as ViewProps,
    props?.children as TreeNode<FixedView>[]
  );
}
