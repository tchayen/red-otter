// TODO: replace HTML symbols.

type HighlightMatchesProps = {
  match: string;
  value: string;
};

export function HighlightMatches({ match, value }: HighlightMatchesProps) {
  // Create a RegExp with word boundaries to match whole words only, case-insensitive.
  const regExp = new RegExp(regExpEscape(match), "ig");
  let startIndex = 0;
  let endIndex = value.length;
  let needsLeadingEllipsis = false;
  let needsTrailingEllipsis = false;

  // Check if the string needs to be shortened.
  if (value.length > 100) {
    const matchIndex = value.search(regExp);

    // If a match is found, and the string is longer than 100 characters, we'll slice around the
    // match.
    if (matchIndex !== -1) {
      startIndex = Math.max(0, matchIndex - 50);
      endIndex = Math.min(value.length, matchIndex + 50 + match.length);
      needsLeadingEllipsis = startIndex > 0;
      needsTrailingEllipsis = endIndex < value.length;
    } else {
      // If no match is found, we'll slice the first 100 characters.
      endIndex = 100;
      needsTrailingEllipsis = true;
    }
  }

  // Slice the value string around the match for highlighting.
  let slicedValue = value.slice(startIndex, endIndex);

  // Apply the ellipsis if needed.
  if (needsLeadingEllipsis) {
    slicedValue = "…" + slicedValue;
  }
  if (needsTrailingEllipsis) {
    slicedValue = slicedValue.replace(/\.$/, ""); // Remove any trailing dot before adding ellipsis.
    slicedValue += "…";
  }

  // Split the sliced value by the regular expression to get the parts to be joined later.
  const parts = slicedValue.split(regExp);

  // Use a map to hold the matched strings in their original case.
  const matches = slicedValue.match(regExp) || [];

  // Reconstruct the string with highlighted matches.
  const highlightedParts = parts.map((part, index) => {
    if (index < matches.length) {
      // Get the original matched string to preserve case.
      const originalMatch = matches[index];
      return (
        <>
          {part}
          <span className="rounded text-tomatodark10">{originalMatch}</span>
        </>
      );
    }
    return part;
  });

  return <>{highlightedParts}</>;
}

function regExpEscape(value: string) {
  return value.replaceAll(/[\s#$()*+,.?[\\\]^{|}-]/g, "\\$&");
}
