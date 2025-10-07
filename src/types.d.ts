declare module 'blade-formatter' {
  export function format(
    input: string,
    options?: {
      indentSize?: number;
      wrapAttributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
    }
  ): Promise<string>;
}

