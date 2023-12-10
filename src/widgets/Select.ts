import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

export class Select extends View {
  constructor(props: {
    onChange?(value: string): void;
    options: Array<{ label: string; value: string }>;
    style: ViewStyleProps;
    testID?: string;
    value?: string;
  }) {
    super(props);
  }
}
