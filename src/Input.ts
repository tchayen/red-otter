import { View } from "./View";
import type { ViewStyleProps } from "./types";

export class Input extends View {
  constructor(props: {
    onChange?(value: string): void;
    onClick?(): void;
    placeholder?: string;
    style: ViewStyleProps;
    testID?: string;
    value?: string;
  }) {
    super(props);
  }
}
