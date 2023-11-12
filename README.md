# red-otter

> [!WARNING]
> This project is in early development stage. It's not ready for production use.

A WebGPU/WebGL TypeScript library for building game UIs that can do things that almost only browsers do.

The library features:

- Flexbox layout engine (Facebook Yoga, Unity UI Toolkit).
- TTF font parser.
- Text renderer.
- Styled UI renderer.
- Declarative UI API (think React).

> [!IMPORTANT]
> This is not meant to be used for creating websites. By rendering your own UI and text you prevent users from using screen readers, automa-translations, high-contrast mode etc. Use this only for applications where this is implied that those capabilities are not needed or otherwise would not be available.

The library works in a bit different set of constraints than typical web application. When browser renders a web page, if all animations run under the screen’s frame rate time (usually 16.6ms) and all larger paints run under 100ms or however long it takes before user notices a part of UI and decides to interact with it – it’s perfect. There’s nothing really to improve there. It doesn’t matter if the actual rendering process took 1ms or 10ms as long as it happens in a given timeframe. If browser leans closer to the upper end but uses less CPU and consumes less battery – that’s great. Games are different. Very different. It’s ok, even better if the game can use all computer resources effectively. CPU has 16 cores? Run on all 16. There’s never too fast for rendering a game. If all rendering work is done under 1ms – it leaves more time for more complex game simulation and makes it more likely the game will run on older PCs.

## API

> [!NOTE]
> Properties starting with double underscore (`__`) are considered internal and should not be used. Relying on them will be a time bomb that will break your app in the future.

## Styling

### Edge cases

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

### Layout props

| Prop              | Default        | Type                                                                                                         |
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
| flexBasis         | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
| flexDirection     | `"column"`     | `"row" \| "column" \| "row-reverse" \| "column-reverse"`                                                     |
| flexGrow          | `0`            | `number`                                                                                                     |
| flexShrink        | `0`            | `number`                                                                                                     |
| flexWrap          | `"nowrap"`     | `"wrap" \| "nowrap" \| "wrap-reverse"`                                                                       |
| gap               | `0`            | `number`                                                                                                     |
| height            | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
| justifyContent    | `"flex-start"` | `"flex-start" \| "flex-end" \| "center" \| "space-between" \| "space-around" \| "space-evenly"`              |
| left              | `0`            | `number`                                                                                                     |
| margin            | `0`            | `number`                                                                                                     |
| marginBottom      | `0`            | `number`                                                                                                     |
| marginHorizontal  | `0`            | `number`                                                                                                     |
| marginLeft        | `0`            | `number`                                                                                                     |
| marginRight       | `0`            | `number`                                                                                                     |
| marginTop         | `0`            | `number`                                                                                                     |
| marginVertical    | `0`            | `number`                                                                                                     |
| maxHeight         | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
| maxWidth          | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
| minHeight         | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
| minWidth          | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
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
| width             | `undefined`    | `number \| "${number}%" \| undefined`                                                                        |
| zIndex            | `0`            | `number`                                                                                                     |

### View style props

Decorative props used in combination with layout props.

| Prop                    | Default         | Type   |
| ----------------------- | --------------- | ------ |
| backgroundColor         | `"transparent"` | string |
| borderBottomLeftRadius  | `0`             | number |
| borderBottomRightRadius | `0`             | number |
| borderColor             | `0`             | string |
| borderRadius            | `0`             | number |
| borderTopLeftRadius     | `0`             | number |
| borderTopRightRadius    | `0`             | number |
| boxShadowColor          | `transparent`   | string |
| boxShadowOffsetX        | `0`             | number |
| boxShadowOffsetY        | `0`             | number |
| boxShadowRadius         | `0`             | number |
| opacity                 | `1`             | number |

### Text style props

| Prop          | Default | Type                                                   |
| ------------- | ------- | ------------------------------------------------------ |
| color         |         | `string`                                               |
| fontName      |         | `string`                                               |
| fontSize      |         | `number`                                               |
| lineHeight    |         | `number`                                               |
| textAlign     | `left`  | `"left" \| "center" \| "right"`                        |
| textTransform | `none`  | `"none" \| "uppercase" \| "lowercase" \| "capitalize"` |
