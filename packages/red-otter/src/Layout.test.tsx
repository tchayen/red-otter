import { describe, expect, it } from "vitest";
import { IContext } from "./Context";
import { Layout } from "./Layout";

class MockContext implements IContext {
  getCanvas() {
    return {
      clientWidth: 800,
      clientHeight: 600,
    } as HTMLCanvasElement;
  }
  line() {
    // noop
  }
  polygon() {
    // noop
  }
  triangles() {
    // noop
  }
  rectangle() {
    // noop
  }
  clear() {
    // noop
  }
  setProjection() {
    // noop
  }
  text() {
    // noop
  }
  flush() {
    // noop
  }
  loadTexture() {
    return {} as WebGLTexture;
  }
}

describe("Layout", () => {
  it("calculates fixed layout", () => {
    const context = new MockContext();
    const layout = new Layout(context);

    layout.add(<view></view>);

    // const tree = fixedLayout().flush();
    // const f1Node = tree.firstChild?.value;
    // const f2Node = tree.firstChild?.next?.value;
    // const f3Node = tree.firstChild?.next?.firstChild?.value;
    // expect(f1Node?.x).toBe(100);
    // expect(f2Node?.x).toBe(400);
    // expect(f3Node?.x).toBe(450);
  });

  it("doesn't crash when style attribute is not provided", () => {
    const context = new MockContext();
    const layout = new Layout(context);

    layout.add(<view />);
    const tree = layout.flush();
    expect(tree).toBeTruthy();
  });

  it("throws if fontFamily is not specified", () => {
    const context = new MockContext();
    const layout = new Layout(context);

    expect(() => layout.add(<text>hello</text>)).toThrow(
      "Font family must be specified."
    );
  });

  it("throws if text styles are provided to <view>", () => {
    const context = new MockContext();
    const layout = new Layout(context);

    // @ts-expect-error ts(2322)
    expect(() => layout.add(<view style={{ fontSize: 12 }} />)).toThrow(
      "View does not accept text styles. Provide them directly to the <text> element."
    );
  });
});
