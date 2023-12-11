import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function layout({ children }: PropsWithChildren) {
  return (
    <>
      <Link href="/blog" className="text-sm text-mauvedark10">
        &lt;- Back to blog
      </Link>
      {children}
    </>
  );
}
