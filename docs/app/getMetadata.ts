import { packageJson } from "./components/PackageJson";

export function getMetadata(title: string, description?: string, publishedTime?: string) {
  let url = `/og?title=${encodeURI(title)}`;
  if (publishedTime) {
    url += `&publishedTime=${publishedTime}`;
  }

  return {
    description: description ?? packageJson.description,
    openGraph: {
      description: description ?? packageJson.description,
      images: [
        {
          height: 630,
          url,
          width: 1200,
        },
      ],
      locale: "en_US",
      title,
      type: "website",
    },
    title,
  };
}
