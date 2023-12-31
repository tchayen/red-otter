import Link from "next/link";

// @ts-expect-error MDX posts are not recognized by TS.
import BigReset from "./(posts)/0-1-0-the-big-reset/page.mdx";
import { getMetadata } from "../getMetadata";

export const metadata = getMetadata("Blog");

export default function Page() {
  return (
    <>
      <BigReset />
      <Link className="text-sm text-mauvedark10" href="/blog/0-1-0-the-big-reset">
        Direct link -&gt;
      </Link>
    </>
  );
}
