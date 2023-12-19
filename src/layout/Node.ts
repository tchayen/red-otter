import type { ExactLayoutProps, LayoutNodeState } from "./styling";

/**
 * Basic node in the layout tree. Containing its state and style information as well as pointers to
 * its children, siblings, and parent.
 */
export interface Node {
  /**
   * State!
   */
  _state: LayoutNodeState;
  _style: ExactLayoutProps;

  firstChild: Node | null;
  lastChild: Node | null;
  next: Node | null;
  parent: Node | null;
  prev: Node | null;

  testID: string | null;
}
