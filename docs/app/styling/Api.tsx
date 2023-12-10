import { Type } from "../components/ApiBlocks";
import { Enums } from "../components/Enums";
import types from "../types.json";
import { A, Box, Hr, P } from "../components/tags";

export function Api() {
  const layoutProps = types.types.LayoutProps;
  const decorativeProps = types.types.DecorativeProps;
  const textStyleProps = types.types.TextStyleProps;
  const layoutNodeState = types.types.LayoutNodeState;
  return (
    <>
      <Type t={layoutProps} />
      <Hr />
      <Type t={decorativeProps} />
      <Hr />
      <Type t={textStyleProps}>
        <P>
          In-depth explanation of text rendering is available on the [Text
          Rendering](/text-rendering) page.
        </P>
        <Box overrideType="IMPORTANT">
          <P>
            The library uses cap size as opposed to line height for calculating bounding box of text
            elements (see <A href="https://seek-oss.github.io/capsize">CapSize</A> for more
            explanation). This results in most noticeable differences in buttons which require more
            vertical space than in browsers.
          </P>
        </Box>
      </Type>
      <Hr />
      <Type t={layoutNodeState} />
      <Hr />
      <Enums />
    </>
  );
}
