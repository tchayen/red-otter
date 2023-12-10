import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

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
