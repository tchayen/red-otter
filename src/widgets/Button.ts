import { View } from "../layout/View";
import type { ViewStyleProps } from "../layout/styling";

export class Button extends View {
  constructor(props: { onClick?(): void; style: ViewStyleProps; testID?: string }) {
    const mergedStyle: ViewStyleProps = { backgroundColor: "#ffd000", ...props.style };
    super({ ...props, style: mergedStyle });
  }
}
