import { visit } from "unist-util-visit";

/**
 * @typedef {import('unist').Node} Node
 * @typedef {Object} TextNode
 * @property {string} type
 * @property {string} value
 */

/**
 * Type guard for checking if a node is a TextNode.
 *
 * @param {Node} node
 * @returns {node is TextNode}
 */
function isTextNode(node) {
  return node.type === "text";
}

/**
 * Replaces straight quotes with curly ones in a TextNode.
 *
 * @param {TextNode} node
 */
function replaceQuotes(node) {
  node.value = node.value.replaceAll('"', "“").replaceAll("'", "’");
}

/**
 * Transformer function for the remark plugin.
 *
 * @returns {import('unified').Transformer}
 */
function remarkTypography() {
  return (tree) => {
    visit(tree, "text", (node) => {
      if (isTextNode(node)) {
        replaceQuotes(node);
      }
    });
  };
}

export default remarkTypography;
