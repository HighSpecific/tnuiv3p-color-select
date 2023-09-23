
/**
 * 类型定义
 */
export namespace ConversionColorType {
  export namespace ColorFormats {
    export interface Alpha {
      a: number
    }

    export interface PRGB {
      r: string
      g: string
      b: string
    }

    export interface PRGBA extends PRGB, Alpha {}

    export interface RGB {
      r: number
      g: number
      b: number
    }

    export interface RGBA extends RGB, Alpha {}

    export interface HSL {
      h: number
      s: number
      l: number
    }

    export interface HSLA extends HSL, Alpha {}

    export interface HSV {
      h: number
      s: number
      v: number
    }

    export interface HSVA extends HSV {
      a: number
    }

    export type FORMATS = "rgb" | "prgb" | "hex" | "hex6" | "hex3" | "hex4" | "hex8" | "name" | "hsl" | "hsv" | ""
  }

  export type ColorInput =
    | string
    | ColorFormats.PRGB
    | ColorFormats.PRGBA
    | ColorFormats.RGB
    | ColorFormats.RGBA
    | ColorFormats.HSL
    | ColorFormats.HSLA
    | ColorFormats.HSV
    | ColorFormats.HSVA

  export interface ConstructorOptions {
    format?: string | undefined
    gradientType?: boolean | undefined
  }

  export type InputToRGB = ColorInput & {
    format?: ColorFormats.FORMATS
  }

  export type InputToRGBReturn = {
    r: number,
    g: number,
    b: number,
    a: number,
    ok: boolean,
    format: ColorFormats.FORMATS
  }

  export type ColorStringToObject = (
    ColorFormats.RGB
    | ColorFormats.RGBA
    | ColorFormats.HSL
    | ColorFormats.HSLA
    | ColorFormats.HSV
    | ColorFormats.HSVA
    | false
  ) & { format?: ColorFormats.FORMATS}
}