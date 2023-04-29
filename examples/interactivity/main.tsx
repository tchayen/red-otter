// NOTE: this is NOT needed if you are using red-otter outside of this
// repository. You can safely remove the next line.
/** @jsxImportSource ../../src */

import {
  Context,
  Font,
  FontAtlas,
  Layout,
  Style,
  TextStyle,
  Interactions,
  TTF,
} from "../../src";

const colors = {
  slate1: "hsl(200 7.0% 8.8%)",
  slate2: "hsl(195 7.1% 11.0%)",
  slate3: "hsl(197 6.8% 13.6%)",
  slate4: "hsl(198 6.6% 15.8%)",
  slate5: "hsl(199 6.4% 17.9%)",
  slate6: "hsl(201 6.2% 20.5%)",
  slate7: "hsl(203 6.0% 24.3%)",
  slate8: "hsl(207 5.6% 31.6%)",
  slate9: "hsl(206 6.0% 43.9%)",
  slate10: "hsl(206 5.2% 49.5%)",
  slate11: "hsl(206 6.0% 63.0%)",
  slate12: "hsl(210 6.0% 93.0%)",
  indigo1: "hsl(229 24.0% 10.0%)",
  indigo2: "hsl(230 36.4% 12.9%)",
  indigo3: "hsl(228 43.3% 17.5%)",
  indigo4: "hsl(227 47.2% 21.0%)",
  indigo5: "hsl(227 50.0% 24.1%)",
  indigo6: "hsl(226 52.9% 28.2%)",
  indigo7: "hsl(226 56.0% 34.5%)",
  indigo8: "hsl(226 58.2% 44.1%)",
  indigo9: "hsl(226 70.0% 55.5%)",
  indigo10: "hsl(227 75.2% 61.6%)",
  indigo11: "hsl(228 100% 75.9%)",
  indigo12: "hsl(226 83.0% 96.3%)",
};

const UI_FONT_SIZE = 16;

async function loadFont(): Promise<Font> {
  const start = performance.now();

  // Add font to the document so we will use browser to rasterize the font.
  const fontFace = new FontFace("Inter", 'url("/inter.ttf")');
  await fontFace.load();
  document.fonts.add(fontFace);

  // Download font file for parsing.
  const file = await fetch("/inter.ttf");
  const buffer = await file.arrayBuffer();

  const ttf = new TTF(buffer);
  if (!ttf.ok) {
    throw new Error("Failed to parse font file.");
  }

  // Render font atlas.
  const atlas = new FontAtlas(ttf);
  const { canvas, spacing } = atlas.render();

  const image = new Image();
  image.src = canvas.toDataURL();

  const font = new Font(spacing, image);
  console.debug(`Loaded font client-side in ${performance.now() - start}ms.`);
  return font;
}

loadFont().then((font) => {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const div = document.getElementById("app");
  if (!div) {
    throw new Error("Missing #app div.");
  }

  div.appendChild(canvas);

  const context = new Context(canvas, font);
  const interactions = new Interactions(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    backgroundColor: colors.slate4,
    padding: 60,
    gap: 20,
  };

  const text: TextStyle = {
    fontSize: UI_FONT_SIZE,
    color: colors.slate10,
    fontFamily: font,
  };

  let counter = 0;
  let checked = false;
  let selectedValue: string | null = null;
  let sliderValue = 30;
  let inputValue = "Some input text";

  function display(): void {
    context.clear();
    const layout = new Layout(context, { readCSSVariables: true });
    interactions.startFrame(layout);

    const {
      Button,
      Input,
      Checkbox,
      Select,
      Slider,
      Tooltip,
      Toggle,
      RadioGroup,
    } = interactions;

    layout.add(
      <view style={container}>
        <Button
          id="test-button-id"
          label="Click to increase the counter"
          onClick={() => {
            counter += 1;
          }}
        />
        <text style={text}>{String(counter)}</text>
        <Select
          id="test-select-id"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
          value={selectedValue}
          onChange={(value) => {
            selectedValue = value;
          }}
        />
        <Input
          id="test-input-id"
          value={inputValue}
          onChange={(value) => {
            inputValue = value;
          }}
        />
        <Checkbox
          id="test-checkbox-id"
          label="Allow cookies"
          checked={checked}
          onChange={() => {
            checked = !checked;
          }}
        />
        <Slider
          id="test-slider-id"
          min={20}
          max={40}
          value={sliderValue}
          onChange={(value) => {
            sliderValue = value;
          }}
        />
        <Toggle
          id="toggle-id"
          label="Toggle me"
          checked={checked}
          onChange={() => {
            checked = !checked;
          }}
        />
        <Tooltip
          id="tooltip-id"
          content={<text style={text}>When you know</text>}
          trigger={<text style={text}>When you don't know</text>}
        />
        <RadioGroup
          id="radio-group-id"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
          value={selectedValue}
          onChange={(value) => {
            selectedValue = value;
          }}
        />
      </view>
    );

    layout.render();
    interactions.endFrame();

    context.flush();

    requestAnimationFrame(display);
  }

  display();
});
