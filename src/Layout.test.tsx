import { describe, expect, it } from "vitest";
import { IContext } from "./IContext";
import { Layout } from "./Layout";

class MockContext implements IContext {
  getCanvas(): HTMLCanvasElement {
    return {
      clientWidth: 800,
      clientHeight: 600,
    } as HTMLCanvasElement;
  }
  line(): void {
    // noop
  }
  polygon(): void {
    // noop
  }
  triangles(): void {
    // noop
  }
  rectangle(): void {
    // noop
  }
  clear(): void {
    // noop
  }
  setProjection(): void {
    // noop
  }
  text(): void {
    // noop
  }
  flush(): void {
    // noop
  }
  loadTexture(): WebGLTexture {
    return {};
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

  it("ignores flex value when justify-content is space-between or space-around or space-evenly", () => {
    // TODO: create a row with 3 elements, set it to justify-content: space-between. Give first element flex: 1. Check that it has no effect by comparing to another row without flex: 1. Repeat the same for space-around and space-evenly.
  });

  it("respects new size after applying align-self: stretch when placing children with justify-content", () => {
    // TODO: create a row with 3 elements. Give align-self: stretch to the middle one. The other two should have height: 100. Add a text inside, put justify-content: center on it. The text should be centered (if there's a bug it will stay in the top).
  });

  it("respects position: absolute when rendering siblings", () => {
    // Recreate situation from position: absolute example and make sure that box 3 renders over text 2.
  });
});
