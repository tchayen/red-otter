import { format } from "date-fns";
import Image from "next/image";

export function Blogpost({ title, date, author }: { author: string; date: string; title: string }) {
  const avatar =
    author === "Tomasz Czajecki" ? (
      <Image
        className="rounded-full"
        width={24}
        height={24}
        src="/avatar.jpeg"
        alt="Tomasz Czajecki"
      />
    ) : null;

  return (
    <>
      <h2 className="mb-0.5 text-3xl font-semibold text-mauvedark12">{title}</h2>
      <div className="mb-4 flex items-center gap-1.5 text-sm text-mauvedark10">
        {format(new Date(date), "do LLL y")} by {avatar}
        {author}
      </div>
    </>
  );
}
