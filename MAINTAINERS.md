# For maintainers

(Currently just me)

### Updating logo

1. Export from Figma:

- Website logo: SVG (`docs/public/logo.svg`)
- GitHub logo: 0.25x PNG (`.github/assets/logo.png`)
- Favicon:
  - Copy the original frame.
  - Scale to 16x16px size.
  - Remove moustache 🥸.
  - Export as 1x PNG.
  - Convert to `*.ico`.
  - Replace in `docs/public/favicon.ico`.

### Replacing map

If for any reason the map in the [map example](https://red-otter.dev/#map) needs to be replaced:

1. use the following script:

   ```ts
   const RADIUS = 6378137.0;

   function degreesToMeters(lat: number, lng: number) {
     return {
       x: (RADIUS * lng * Math.PI) / 180.0,
       y: RADIUS * Math.atanh(Math.sin((lat * Math.PI) / 180.0)),
     };
   }

   function metersToDegrees(x: number, y: number) {
     return {
       lng: ((x / RADIUS) * 180.0) / Math.PI,
       lat: (Math.asin(Math.tanh(y / RADIUS)) * 180.0) / Math.PI,
     };
   }

   const position = { lat: 60.26627, lng: 24.98868 };
   const squareSide = 400;

   const center = degreesToMeters(position.lat, position.lng);
   const ne = metersToDegrees(
     center.x + squareSide / 2,
     center.y + squareSide / 2
   );
   const sw = metersToDegrees(
     center.x - squareSide / 2,
     center.y - squareSide / 2
   );

   const boundingBox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

   const query = `
     [out:json][bbox:${boundingBox}];
     (
       way[building];
       relation[building];
       way[highway~residential];
     );
     (._;>;);
     out;`;

   console.log(query);
   ```

1. Copy the output and paste it on [Overpass Turbo](https://overpass-turbo.eu).
1. Select **Data** in top right corner.
1. Copy the content and save it to file `osm-map.json`.
1. Install [`osmtogeojson`](https://github.com/tyrasd/osmtogeojson).
1. Run: `osmtogeojson osm-map.json > docs/src/map.json`.

## Q&A

- Why `--no-threads` in `yarn test`? [Answer](https://twitter.com/youyuxi/status/1621299180261244928?s=20&t=fyQYZyV2omJHrGjlVrfq6A)

- Why relative imports in CI example? Vite dev server running inside `run.ts` had problems with resolving paths. Similarly because of the same reason files within `/src` use relative imports with each other.
