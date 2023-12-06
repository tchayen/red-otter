import * as cheerio from "cheerio";

export type Section = {
  content: string;
  header: string;
  level: number;
  url: string;
};

export type Page = {
  sections: Array<Section>;
  title: string;
  url: string;
};

const searchablePages = ["/api-reference", "/layout", "/renderer", "/roadmap", "/"];

export async function GET() {
  const start = performance.now();
  const baseUrl = "http://localhost:4141";
  const pages = await Promise.all(
    searchablePages.map((url) => fetch(`${baseUrl}${url}`).then((response) => response.text())),
  );

  const results: Array<Page> = pages.map((page, index) => {
    const document = cheerio.load(page);
    document("script, style").remove();
    const sections = [];
    let currentSection;

    function processElement(element) {
      const tagName = element.tagName;
      if (tagName && tagName.match(/^h[1-6]$/i)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          content: "",
          header: document(element).text().trim(),
          level: Number.parseInt(tagName.slice(1)),
          url: `${baseUrl}${searchablePages[index]}#${document(element).attr("id")}`,
        };
      } else {
        if (currentSection && document(element).children().length === 0) {
          // Add text to the current section if it's not another header.
          currentSection.content +=
            " " +
            document(element)
              .html()
              .toString()
              .replaceAll(/<(?:"[^"]*"["']*|'[^']*'["']*|[^"'>])+>/g, " ")
              .replaceAll(/\s\s+/g, " ")
              .trim();
        }
        // Recursively process child elements.
        document(element)
          .children()
          .each(function () {
            processElement(this);
          });
      }
    }

    processElement(document("main"));

    if (currentSection) {
      sections.push(currentSection);
    }

    for (const section of sections) {
      // Replace multiple spaces with a single space.
      section.content = section.content.replaceAll(/\s\s+/g, " ");
    }

    const title = document("title").text();
    const url = `${baseUrl}${searchablePages[index]}`;
    return { sections, title, url };
  });

  console.log(`Search index generated in ${performance.now() - start}ms`);
  return Response.json(results);
}
