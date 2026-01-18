export type AsciiBoxAlign =
  | 'l' | 'c' | 'r'
  | `h${'l' | 'c' | 'r'}`
  | `v${'t' | 'c' | 'b'}`
  | `j${'l' | 'c' | 'r'}`
  | string;

export type CssLength = number | string;

export type AsciiBoxPadding = {
  top?: CssLength;
  right?: CssLength;
  bottom?: CssLength;
  left?: CssLength;
};

export type AsciiBoxSize = {
  cols: number;
  rows: number;
};

export type AsciiBoxPaddingCells = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type AsciiBoxMeasured = {
  cols: number;
  rows: number;
};
