import type { ExactLayoutProps, LayoutNodeState } from "./styling";

export interface Node {
  _state: LayoutNodeState;
  _style: ExactLayoutProps;
  firstChild: Node | null;
  lastChild: Node | null;
  next: Node | null;
  parent: Node | null;
  prev: Node | null;
  testID: string | null;
}
