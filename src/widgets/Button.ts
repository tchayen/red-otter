import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

export class Button extends View {
  constructor(props: { onClick?(): void; style: ViewStyleProps; testID?: string }) {
    // Put default styles here.
    const mergedStyle: ViewStyleProps = { backgroundColor: "#ffd000", ...props.style };
    super({ ...props, style: mergedStyle });
  }
}
