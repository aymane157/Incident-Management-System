/// <reference types="vite/client" />

// Allow side-effect CSS imports from node_modules (e.g. @xyflow/react/dist/style.css)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
