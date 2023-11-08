# red-otter

TODO

## Docs

### Layout props

| Prop              | Default Value  | Type                                                                                                         |
| ----------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| alignContent      | `"flex-start"` | `"flex-start" \| "flex-end" \| "center" \| "stretch" \| "space-between" \| "space-around" \| "space-evenly"` |
| alignItems        | `"flex-start"` | `"flex-start" \| "flex-end" \| "center" \| "stretch"`                                                        |
| alignSelf         | `"auto"`       | `"auto" \| "flex-start" \| "center" \| "flex-end" \| "stretch"`                                              |
| borderBottomWidth | `0`            | `number`                                                                                                     |
| borderLeftWidth   | `0`            | `number`                                                                                                     |
| borderRightWidth  | `0`            | `number`                                                                                                     |
| borderTopWidth    | `0`            | `number`                                                                                                     |
| borderWidth       | `0`            | `number`                                                                                                     |
| bottom            | `0`            | `number`                                                                                                     |
| columnGap         | `0`            | `number`                                                                                                     |
| display           | `"flex"`       | `"flex" \| "none"`                                                                                           |
| flex              | `0`            | `number`                                                                                                     |
| flexBasis         | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| flexDirection     | `"column"`     | `"row" \| "column" \| "row-reverse" \| "column-reverse"`                                                     |
| flexGrow          | `0`            | `number`                                                                                                     |
| flexShrink        | `0`            | `number`                                                                                                     |
| flexWrap          | `"nowrap"`     | `"wrap" \| "nowrap" \| "wrap-reverse"`                                                                       |
| gap               | `0`            | `number`                                                                                                     |
| height            | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| justifyContent    | `"flex-start"` | `"flex-start" \| "flex-end" \| "center" \| "space-between" \| "space-around" \| "space-evenly"`              |
| left              | `0`            | `number`                                                                                                     |
| margin            | `0`            | `number`                                                                                                     |
| marginBottom      | `0`            | `number`                                                                                                     |
| marginHorizontal  | `0`            | `number`                                                                                                     |
| marginLeft        | `0`            | `number`                                                                                                     |
| marginRight       | `0`            | `number`                                                                                                     |
| marginTop         | `0`            | `number`                                                                                                     |
| marginVertical    | `0`            | `number`                                                                                                     |
| maxHeight         | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| maxWidth          | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| minHeight         | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| minWidth          | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| overflow          | `visible`      | `"scroll" \| "visible" \| "hidden"`                                                                          |
| padding           | `0`            | `number`                                                                                                     |
| paddingBottom     | `0`            | `number`                                                                                                     |
| paddingHorizontal | `0`            | `number`                                                                                                     |
| paddingLeft       | `0`            | `number`                                                                                                     |
| paddingRight      | `0`            | `number`                                                                                                     |
| paddingTop        | `0`            | `number`                                                                                                     |
| paddingVertical   | `0`            | `number`                                                                                                     |
| position          | `relative`     | `"relative" \| "absolute"`                                                                                   |
| right             | `0`            | `number`                                                                                                     |
| rowGap            | `0`            | `number`                                                                                                     |
| top               | `0`            | `number`                                                                                                     |
| width             | `undefined`    | `number \| ${number}% \| undefined`                                                                          |
| zIndex            | `0`            | `number`                                                                                                     |

```ts
type LayoutProps = {
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch";
  alignSelf?: "auto" | "flex-start" | "center" | "flex-end" | "stretch";
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderTopWidth?: number;
  borderWidth?: number;
  bottom?: number;
  columnGap?: number;
  display?: "flex" | "none";
  flex?: number;
  flexBasis?: number | `${number}%`;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  gap?: number;
  height?: number | `${number}%`;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  left?: number;
  margin?: number;
  marginBottom?: number;
  marginHorizontal?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginVertical?: number;
  maxHeight?: number | `${number}%`;
  maxWidth?: number | `${number}%`;
  minHeight?: number | `${number}%`;
  minWidth?: number | `${number}%`;
  overflow?: "scroll" | "visible" | "hidden";
  padding?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingVertical?: number;
  position?: "relative" | "absolute";
  right?: number;
  rowGap?: number;
  top?: number;
  width?: number | `${number}%`;
  zIndex?: number;
};
```

### Text style props

```ts
type TextStyleProps = {
  color: string;
  fontName: string;
  fontSize: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
};
```

### View style props

```ts
type ViewStyleProps = {
  backgroundColor?: string;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderColor?: string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  boxShadowColor?: string;
  boxShadowOffsetX?: number;
  boxShadowOffsetY?: number;
  boxShadowRadius?: number;
  opacity?: number;
};
```

## Edge cases

Some default or situations differ from CSS. Generally the styling model closely resembles the one from React Native, but it's not a strict rule.

- Default `flexDirection` is `column` (CSS default is `row`).
- Default `alignContent` is `flex-start` (CSS default is `stretch`).
- Default `flexShrink` is `0` (CSS default is `1`).
- `flexBasis` takes precedence over `width` and `height` if defined.
- There's no `margin: auto`.
- Similarly to CSS and RN, if both top and bottom (or left and right) are defined and `height` (or `width`) is _not_ defined, the element will span the distance between those two edges.
- Properties with higher specificity override properties with lower specificity (in CSS order matters).
  In CSS:

  ```css
  .selector {
    flex-grow: 1;
    flex: 2;
  }
  ```

  would use value `2` for `flex-grow` because it is defined later. Here corresponding code would use value `1` for `flex-grow` because it is more specific. Same goes for `margin`, `padding`, `borderWidth`, `gap`.
