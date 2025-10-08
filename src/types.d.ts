declare module 'blade-formatter' {
  export class Formatter {
    constructor(options?: any);
    formatContent(input: string): Promise<string>;
  }

  // Legacy fallback (older versions)
  export function format(
    input: string,
    options?: {
      indentSize?: number;
      wrapAttributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
    }
  ): Promise<string>;
}

