declare module "react-quill" {
    import * as React from "react";
  
    interface ReactQuillProps {
      value?: string;
      onChange?: (content: string, delta: any, source: string, editor: any) => void;
      placeholder?: string;
      readOnly?: boolean;
      theme?: string;
      modules?: Record<string, any>;
      formats?: string[];
      bounds?: string | HTMLElement;
      scrollingContainer?: string | HTMLElement;
      preserveWhitespace?: boolean;
      style?: React.CSSProperties;
      className?: string;
    }
  
    class ReactQuill extends React.Component<ReactQuillProps> {}
    export default ReactQuill;
  }