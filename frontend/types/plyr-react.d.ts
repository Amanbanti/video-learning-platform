declare module "plyr-react" {
  import { FC } from "react";

  export interface PlyrProps {
    source: {
      type: string; // "youtube" | "vimeo" | "video"
      sources: { src: string; provider?: string }[];
    };
    options?: any;
    [key: string]: any;
  }

  const Plyr: FC<PlyrProps>;
  export default Plyr;
}
