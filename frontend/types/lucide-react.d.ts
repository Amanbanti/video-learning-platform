declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  type IconComponent = React.FC<LucideProps>;

  export const Play: IconComponent;
  export const Pause: IconComponent;
  export const VolumeX: IconComponent;
  export const Volume1: IconComponent;
  export const Volume2: IconComponent;
  export const Maximize: IconComponent;
  export const Minimize: IconComponent;
  export const PictureInPicture: IconComponent;
  export const PictureInPicture2: IconComponent;

  // Icons used in pages/components
  export const BookOpen: IconComponent;
  export const Clock: IconComponent;
  export const LoaderCircle: IconComponent;

  const _default: any;
  export default _default;
}
