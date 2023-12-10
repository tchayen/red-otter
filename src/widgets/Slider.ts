import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

export class Slider extends View {
  constructor(props: {
    onChange?(value: number): void;
    style: ViewStyleProps;
    testID?: string;
    value?: number;
  }) {
    super(props);
  }
}
