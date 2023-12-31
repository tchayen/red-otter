import { visit } from "unist-util-visit";

/**
 * Transformer function for the remark plugin.
 *
 * @returns {import('unified').Transformer}
 */
function remarkUniqueIds() {
  return (tree) => {
    // Initialize counters for each heading level
    const counters = {};

    visit(tree, "heading", (node) => {
      // Initialize the counter for this level if not already done
      if (!counters[node.depth]) {
        counters[node.depth] = 0;
      }

      // Increment counter for this level
      counters[node.depth]++;

      // Reset counters of all deeper levels
      Object.keys(counters)
        .map(Number)
        .filter((depth) => depth > node.depth)
        .forEach((depth) => (counters[depth] = 0));

      // Generate the ID
      let id = "";
      for (let i = 1; i <= node.depth; i++) {
        id += `${counters[i]}.`;
      }
      id = id.slice(0, -1); // Remove the last dot

      // Assign the ID to the node data
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.id = id;
    });
  };
}

export default remarkUniqueIds;
