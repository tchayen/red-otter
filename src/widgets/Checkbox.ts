import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

export class Checkbox extends View {
  constructor(props: {
    onChange?(value: boolean): void;
    style: ViewStyleProps;
    testID?: string;
    value?: boolean;
  }) {
    super(props);
  }
}
