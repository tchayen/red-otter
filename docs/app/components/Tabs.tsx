import type { PropsWithChildren } from "react";

function Root() {
  return (
    // <TabsPrimitive.Root>
    //   <TabsPrimitive.List>
    //     <TabsPrimitive.Trigger />
    //   </TabsPrimitive.List>
    //   <TabsPrimitive.Content />
    // </TabsPrimitive.Root>
    null
  );
}

function Tab({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export const Tabs = { Root, Tab };
