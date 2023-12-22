import type { Lookups } from "../font/types";
import { Text } from "../layout/Text";
import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

export class Button extends View {
  constructor(props: {
    label: string;
    lookups: Lookups;
    onClick?(): void;
    style: ViewStyleProps;
    testID?: string;
  }) {
    // Put default styles here.
    const mergedStyle: ViewStyleProps = { backgroundColor: "#ffd000", ...props.style };
    super({ ...props, style: mergedStyle });

    this.add(
      new Text(props.label, {
        lookups: props.lookups,
        style: {
          color: "#FFFFFF",
          fontName: "InterBold",
          fontSize: 14,
        },
      }),
    );
  }
}
