/**
 * Styling available for views.
 */
export type Style = {
  /**
   * Undefined means that view should hug its content.
   *
   * String can only be a percentage value (e.g. `'50%'`).
   * It is defined relative to the parent view.
   *
   * Numerical value is defined in pixels.
   */
  width?: number | string | undefined;
  /**
   * Undefined means that view should hug its content.
   *
   * String can only be a percentage value (e.g. `'50%'`).
   * It is defined relative to the parent view.
   *
   * Percentage value does not take into account paddings or gaps.
   *
   * Numerical value is defined in pixels.
   */
  height?: number | string | undefined;

  /**
   * Direction of children layout.
   */
  flexDirection?: "row" | "column";

  /**
   * How children are aligned along the main axis.
   */
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";

  /**
   * How children are aligned along the cross axis.
   */
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";

  /**
   * Override parent's `alignItems` property for this child.
   */
  alignSelf?: "flex-start" | "center" | "flex-end" | "stretch";

  /**
   * How space is distributed among children along the main axis.
   */
  flex?: number;

  /**
   * Position `absolute` makes the view skip taking part in the layout.
   */
  position?: "absolute" | "relative";

  /**
   * Space between children along the main axis.
   */
  gap?: number;

  /**
   * Z-index of the view. Higher value means that the view will be drawn on
   * top of values with lower z-index.
   *
   * Default value is 0.
   */
  zIndex?: number;

  /**
   * Supported formats are: hex, RGB, HSL, HSV.
   *
   * Hex can be in short form (e.g. `#fff`) or long form (e.g. `#ffffff`).
   *
   * RGB (`rgb(255, 0, 0)`) can also have alpha channel: `rgba(255, 0, 0, 0.5)`.
   *
   * HSL (`hsl(60, 100%, 50%)`) can also have alpha channel: `hsla(30, 60%, 90%, 0.8)`.
   * Commas are optional (e.g. `hsl(60 100% 50%)`). Alpha channel can also be separated by `/` (e.g. `hsla(30 60% 90% / 0.8)`).
   *
   * Exactly the same rules apply to HSV as to HSL.
   *
   * You can pass `readCSSVariables` to `options` argument in `Layout()`
   * constructor and then you can use CSS variables in color values by their
   * names, ie. `var(--my-color)` is accessed by `my-color`.
   */
  backgroundColor?: string;

  /**
   * Whether the view should be visible or not.
   */
  display?: "flex" | "none";

  /**
   *
   */
  aspectRatio?: number;

  /**
   * If view is positioned `absolute`, this property is used to define its
   * position relative to the parent view.
   *
   * If view is positioned `relative`, this property is an offset from the
   * calculated layout position (but it doesn't affect layout of siblings).
   *
   * If `width` is not defined and both `left` and `right` are set, then the
   * element will stretch to fill the space between the two offsets. Similarly
   * for `height`.
   */
  top?: number;
  /**
   * See: `top` property.
   */
  left?: number;
  /**
   * See: `top` property.
   */
  right?: number;
  /**
   * See: `top` property.
   */
  bottom?: number;

  /**
   * Color of the border. See `backgroundColor` for supported formats.
   */
  borderColor?: string;

  /**
   * Width of the border. Default value is <code>0</code>.
   */
  borderWidth?: number;

  /**
   * Border width at the top edge of the view.
   */
  borderTopWidth?: number;

  /**
   * Border width at the right edge of the view.
   */
  borderRightWidth?: number;

  /**
   * Border width at the bottom edge of the view.
   */
  borderBottomWidth?: number;

  /**
   * Border width at the left edge of the view.
   */
  borderLeftWidth?: number;

  /**
   * Corner radius. Default value is <code>0</code>.
   */
  borderRadius?: number;

  /**
   * Overrides `borderRadius` property.
   */
  borderRadiusTop?: number;

  /**
   * Overrides `borderRadius` property.
   */
  borderRadiusBottom?: number;

  /**
   * Overrides `borderRadius` property and `borderRadiusTop` property.
   */
  borderRadiusTopLeft?: number;

  /**
   * Overrides `borderRadius` property and `borderRadiusTop` property.
   */
  borderRadiusTopRight?: number;

  /**
   * Overrides `borderRadius` property and `borderRadiusBottom` property.
   */
  borderRadiusBottomLeft?: number;

  /**
   * Overrides `borderRadius` property and `borderRadiusBottom` property.
   */
  borderRadiusBottomRight?: number;

  /**
   * Space around children. More specific properties override it.
   */
  padding?: number;

  /**
   * Overrides `padding` property.
   */
  paddingHorizontal?: number;

  /**
   * Overrides `padding` property.
   */
  paddingVertical?: number;

  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  paddingLeft?: number;

  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  paddingRight?: number;

  /**
   * Overrides `margin` and `marginVertical` properties.
   */
  paddingTop?: number;

  /**
   *  Overrides `margin` and `marginVertical` properties.
   */
  paddingBottom?: number;

  /**
   * Space around children. More specific properties take precedence.
   */
  margin?: number;

  /**
   * Overrides `margin` property, less important than `marginLeft` or `marginRight`.
   */
  marginHorizontal?: number;

  /**
   * Overrides `margin` property, less important than `marginTop` or `marginBottom`.
   */
  marginVertical?: number;

  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  marginLeft?: number;

  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  marginRight?: number;

  /**
   * Overrides `margin` and `marginVertical` properties.
   */
  marginTop?: number;

  /**
   *  Overrides `margin` and `marginVertical` properties.
   */
  marginBottom?: number;
};
