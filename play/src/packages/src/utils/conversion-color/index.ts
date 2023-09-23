/**
 * 颜色转换操作
 * 根据tinycolor进行二次修改
 * author: tuniao
 */
import type { ConversionColorType } from './interface'

const trimLeft = /^\s+/,
  trimRight = /\s+$/,
  mathRound = Math.round,
  mathMin = Math.min,
  mathMax = Math.max

export default class ConversionColor {
  // rgba的值
  private _r = 0
  private _g = 0
  private _b = 0
  private _a = 1
  private _roundA = 0

  // 输入值的类型
  private _format: ConversionColorType.ColorFormats.FORMATS = ''

  // 是否解析成功
  private _ok = false

  constructor(color: ConversionColorType.ColorInput) {
    const result = this._inputToRGB(color)

    this._r = result.r
    this._g = result.g
    this._b = result.b
    this._a = result.a
    this._roundA = mathRound(100 * this._a) / 100
    this._format = result.format

    if (this._r < 1) {
      this._r = mathRound(this._r)
    }
    if (this._g < 1) {
      this._g = mathRound(this._g)
    }
    if (this._b < 1) {
      this._b = mathRound(this._b)
    }

    this._ok = result.ok
  }

  /**
   * 获取亮度信息
   */
  getBrightness(): number {
    const rgb = this.toRGB()
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  }

  /**
   * 获取传入颜色的格式
   */
  getFormat(): ConversionColorType.ColorFormats.FORMATS {
    return this._format
  }

  /**
   * 获取透明度
   */
  getAlpha(): number {
    return this._a
  }

  /**
   * 转换为hsv
   */
  toHsv() {
    const hsv = this._rgbToHsv(this._r, this._g, this._b)
    return {
      h: hsv.h * 360,
      s: hsv.s,
      v: hsv.v,
      a: this._a,
    }
  }

  /**
   * 转换为hsv字符串
   */
  toHsvString() {
    const hsv = this._rgbToHsv(this._r, this._g, this._b)
    const h = mathRound(hsv.h * 360),
      s = mathRound(hsv.s * 100),
      v = mathRound(hsv.v * 100)

    return this._a === 1
      ? `hsv(${h}, ${s}, ${v})`
      : `hsva(${h}, ${s}, ${v}, ${this._roundA})`
  }

  /**
   * 转换为hsl
   */
  toHsl() {
    const hsl = this._rgbToHsl(this._r, this._g, this._b)
    return {
      h: hsl.h * 360,
      s: hsl.s,
      l: hsl.l,
      a: this._a,
    }
  }

  /**
   * 转换为hsl字符串
   */
  toHslString() {
    const hsl = this._rgbToHsl(this._r, this._g, this._b)
    const h = mathRound(hsl.h * 360),
      s = mathRound(hsl.s * 100),
      l = mathRound(hsl.l * 100)
    return this._a === 1
      ? `hsl(${h}, ${s}, ${l})`
      : `hsla(${h}, ${s}, ${l}, ${this._roundA})`
  }

  /**
   * 转换为hex格式
   */
  toHex(allowChar3 = true) {
    return this._rgbToHex(this._r, this._g, this._b, allowChar3)
  }
  toHexString(allowChar3 = true) {
    return `#${this.toHex(allowChar3)}`
  }
  toHex8(allowChar4 = true) {
    return this._rgbaToHex(this._r, this._g, this._b, this._a, allowChar4)
  }
  toHex8String(allowChar4 = true) {
    return `#${this.toHex8(allowChar4)}`
  }

  /**
   * 获取颜色名称
   */
  toName(): string {
    if (this._a === 0) {
      return 'transparent'
    }
    if (this._a < 1) {
      return ''
    }
    return this._hexNames[this._rgbToHex(this._r, this._g, this._b, true)] || ''
  }

  /**
   * 获取rgb对象
   */
  toRGB(): ConversionColorType.ColorFormats.RGBA {
    return {
      r: mathRound(this._r),
      g: mathRound(this._g),
      b: mathRound(this._b),
      a: this._a,
    }
  }

  /**
   * 转换为rgb字符串
   */
  toRGBString(): string {
    return this._a === 1
      ? `rgb(${mathRound(this._r)}, ${mathRound(this._g)}, ${mathRound(
          this._b
        )})`
      : `rgba(${mathRound(this._r)}, ${mathRound(this._g)}, ${mathRound(
          this._b
        )}, ${this._roundA})`
  }

  /**
   * 转换为百分比rgb
   */
  toPercentageRgb(): ConversionColorType.ColorFormats.PRGBA {
    return {
      r: `${mathRound(this._bound01(this._r, 255) * 100)}%`,
      g: `${mathRound(this._bound01(this._r, 255) * 100)}%`,
      b: `${mathRound(this._bound01(this._r, 255) * 100)}%`,
      a: this._a,
    }
  }

  /**
   * 转换为百分比rgb字符串
   */
  toPercentageRgbString(): string {
    return this._a === 1
      ? `rgb(${mathRound(this._bound01(this._r, 255) * 100)}%, ${mathRound(
          this._bound01(this._g, 255) * 100
        )}%, ${mathRound(this._bound01(this._b, 255) * 100)}%)`
      : `rgba(${mathRound(this._bound01(this._r, 255) * 100)}%, ${mathRound(
          this._bound01(this._g, 255) * 100
        )}%, ${mathRound(this._bound01(this._b, 255) * 100)}%, ${this._roundA})`
  }

  /**
   * 转换为字符串
   */
  toString(format?: ConversionColorType.ColorFormats.FORMATS): string {
    const formatSet = !!format
    format = format || this._format

    let formattedString = ''
    const hasAlpha: boolean = this._a < 1 && this._a > 0
    const needAlphaFormat: boolean =
      !formatSet &&
      hasAlpha &&
      (format === 'hex' ||
        format === 'hex6' ||
        format === 'hex3' ||
        format === 'hex4' ||
        format === 'hex8' ||
        format === 'name')

    if (needAlphaFormat) {
      if (format === 'name' && this._a === 0) {
        return this.toName()
      }
      return this.toRGBString()
    }
    if (format === 'rgb') {
      formattedString = this.toRGBString()
    }
    if (format === 'prgb') {
      formattedString = this.toPercentageRgbString()
    }
    if (format === 'hex' || format === 'hex6') {
      formattedString = this.toHexString(false)
    }
    if (format === 'hex3') {
      formattedString = this.toHexString(true)
    }
    if (format === 'hex4') {
      formattedString = this.toHex8String(true)
    }
    if (format === 'hex8') {
      formattedString = this.toHex8String(false)
    }
    if (format === 'name') {
      formattedString = this.toName()
    }
    if (format === 'hsl') {
      formattedString = this.toHslString()
    }
    if (format === 'hsv') {
      formattedString = this.toHsvString()
    }

    return formattedString || this.toHexString(false)
  }

  /**
   * 将用户输入的值转换为rgb数据
   * @param color
   * @returns
   */
  private _inputToRGB(
    color: ConversionColorType.InputToRGB
  ): ConversionColorType.InputToRGBReturn {
    let rgb: ConversionColorType.ColorFormats.RGB = {
      r: 0,
      g: 0,
      b: 0,
    }
    let a = 1
    let s: string | number = ''
    let v: string | number = ''
    let l: string | number = ''

    let format: ConversionColorType.ColorFormats.FORMATS = ''
    let ok = false

    if (typeof color === 'string') {
      const results = this._stringInputToObject(color)
      if (results) {
        color = results
      }
    }
    if (typeof color === 'object') {
      if (
        this._isValidCSSUnit(
          (color as ConversionColorType.ColorFormats.RGB).r
        ) &&
        this._isValidCSSUnit(
          (color as ConversionColorType.ColorFormats.RGB).g
        ) &&
        this._isValidCSSUnit((color as ConversionColorType.ColorFormats.RGB).b)
      ) {
        rgb = this._rgbToRGB(
          (color as ConversionColorType.ColorFormats.RGB).r,
          (color as ConversionColorType.ColorFormats.RGB).g,
          (color as ConversionColorType.ColorFormats.RGB).b
        )
        ok = true
        format =
          String((color as ConversionColorType.ColorFormats.RGB).r).slice(0) ===
          '%'
            ? 'prgb'
            : 'rgb'
      } else if (
        this._isValidCSSUnit(
          (color as ConversionColorType.ColorFormats.HSV).h
        ) &&
        this._isValidCSSUnit(
          (color as ConversionColorType.ColorFormats.HSV).s
        ) &&
        this._isValidCSSUnit((color as ConversionColorType.ColorFormats.HSV).v)
      ) {
        s = this._convertToPercentage(
          (color as ConversionColorType.ColorFormats.HSV).s
        )
        v = this._convertToPercentage(
          (color as ConversionColorType.ColorFormats.HSV).v
        )
        rgb = this._hsvToRGB(
          (color as ConversionColorType.ColorFormats.HSV).h,
          s,
          v
        )
        ok = true
        format = 'hsv'
      } else if (
        this._isValidCSSUnit(
          (color as ConversionColorType.ColorFormats.HSL).h
        ) &&
        this._isValidCSSUnit(
          (color as ConversionColorType.ColorFormats.HSL).s
        ) &&
        this._isValidCSSUnit((color as ConversionColorType.ColorFormats.HSL).l)
      ) {
        s = this._convertToPercentage(
          (color as ConversionColorType.ColorFormats.HSL).s
        )
        l = this._convertToPercentage(
          (color as ConversionColorType.ColorFormats.HSL).l
        )
        rgb = this._hslToRGB(
          (color as ConversionColorType.ColorFormats.HSL).h,
          s,
          l
        )
        ok = true
        format = 'hsl'
      }

      if (color.hasOwnProperty('a')) {
        a = (color as ConversionColorType.ColorFormats.Alpha).a
      }
    }

    a = this._boundAlpha(a)

    return {
      r: mathMin(255, mathMax(rgb.r, 0)),
      g: mathMin(255, mathMax(rgb.g, 0)),
      b: mathMin(255, mathMax(rgb.b, 0)),
      a,
      ok,
      format: color.format || format,
    }
  }

  /**
   * 将颜色字符串转换为对象类型
   * @param color 颜色字符串
   * @returns 颜色对象
   */
  private _stringInputToObject(
    color: string
  ): ConversionColorType.ColorStringToObject {
    color = color
      .replace(trimLeft, '')
      .replace(trimRight, '')
      .toLocaleLowerCase()
    // 判断是否为内置名称的颜色
    let named = false
    if (Object.keys(this._InnerColorsList).includes(color)) {
      color = this._InnerColorsList[color as keyof typeof this._InnerColorsList]
      named = true
    } else if (color === 'transparent') {
      return {
        r: 0,
        g: 0,
        b: 0,
        format: 'name',
      }
    }

    // 根据不同的匹配规则获取对应的值
    let match: RegExpExecArray | null = null
    if ((match = this._matches.rgb.exec(color))) {
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
      }
    }
    if ((match = this._matches.rgba.exec(color))) {
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: Number(match[4]),
      }
    }
    if ((match = this._matches.hsl.exec(color))) {
      return {
        h: Number(match[1]),
        s: Number(match[2]),
        l: Number(match[3]),
      }
    }
    if ((match = this._matches.hsla.exec(color))) {
      return {
        h: Number(match[1]),
        s: Number(match[2]),
        l: Number(match[3]),
        a: Number(match[4]),
      }
    }
    if ((match = this._matches.hsv.exec(color))) {
      return {
        h: Number(match[1]),
        s: Number(match[2]),
        v: Number(match[3]),
      }
    }
    if ((match = this._matches.hsva.exec(color))) {
      return {
        h: Number(match[1]),
        s: Number(match[2]),
        v: Number(match[3]),
        a: Number(match[4]),
      }
    }
    if ((match = this._matches.hex8.exec(color))) {
      return {
        r: this._parseIntFromHex(match[1]),
        g: this._parseIntFromHex(match[2]),
        b: this._parseIntFromHex(match[3]),
        a: this._convertHexToDecimal(match[4]),
        format: named ? 'name' : 'hex8',
      }
    }
    if ((match = this._matches.hex6.exec(color))) {
      return {
        r: this._parseIntFromHex(match[1]),
        g: this._parseIntFromHex(match[2]),
        b: this._parseIntFromHex(match[3]),
        format: named ? 'name' : 'hex',
      }
    }
    if ((match = this._matches.hex4.exec(color))) {
      return {
        r: this._parseIntFromHex(`${match[1]}${match[1]}`),
        g: this._parseIntFromHex(`${match[2]}${match[2]}`),
        b: this._parseIntFromHex(`${match[3]}${match[3]}`),
        a: this._convertHexToDecimal(`${match[4]}${match[4]}`),
        format: named ? 'name' : 'hex8',
      }
    }
    if ((match = this._matches.hex6.exec(color))) {
      return {
        r: this._parseIntFromHex(`${match[1]}${match[1]}`),
        g: this._parseIntFromHex(`${match[2]}${match[2]}`),
        b: this._parseIntFromHex(`${match[3]}${match[3]}`),
        format: named ? 'name' : 'hex',
      }
    }

    return false
  }

  /**
   * 格式化rgb的值
   * @param r
   * @param g
   * @param b
   * @returns
   */
  private _rgbToRGB(
    r: string | number,
    g: string | number,
    b: string | number
  ) {
    return {
      r: this._bound01(r, 255) * 255,
      g: this._bound01(g, 255) * 255,
      b: this._bound01(b, 255) * 255,
    }
  }

  /**
   * 将hsv的值转换为rgb的值
   * @param h
   * @param s
   * @param v
   * @returns
   */
  private _hsvToRGB(
    h: string | number,
    s: string | number,
    v: string | number
  ) {
    h = this._bound01(h, 360) * 6
    s = this._bound01(s, 100)
    v = this._bound01(v, 100)

    const i = Math.floor(h),
      f = h - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s),
      mod = i % 6,
      r = [v, q, p, p, t, v][mod],
      g = [t, v, v, q, p, p][mod],
      b = [p, p, t, v, v, q][mod]

    return {
      r: r * 255,
      g: g * 255,
      b: b * 255,
    }
  }

  /**
   * rgb转换为hsv
   * @param r
   * @param g
   * @param b
   * @returns
   */
  private _rgbToHsv(
    r: string | number,
    g: string | number,
    b: string | number
  ) {
    r = this._bound01(r, 255)
    g = this._bound01(g, 255)
    b = this._bound01(b, 255)

    const max = mathMax(r, g, b),
      min = mathMin(r, g, b)
    let h = 0,
      s = 0,
      v = max
    const d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
      h = 0
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return { h, s, v }
  }

  /**
   * 将hsl格式转换为rgb
   * @param h
   * @param s
   * @param l
   * @returns
   */
  private _hslToRGB(
    h: string | number,
    s: string | number,
    l: string | number
  ) {
    let r: number, g: number, b: number

    h = this._bound01(h, 360)
    s = this._bound01(s, 360)
    l = this._bound01(l, 360)

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t < 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + 2) : l + s - l * s,
        p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: r * 255,
      g: g * 255,
      b: b * 255,
    }
  }

  /**
   * rgb转hsl
   * @param r
   * @param g
   * @param b
   * @returns
   */
  private _rgbToHsl(
    r: string | number,
    g: string | number,
    b: string | number
  ) {
    r = this._bound01(r, 255)
    g = this._bound01(g, 255)
    b = this._bound01(b, 255)

    const max = mathMax(r, g, b),
      min = mathMin(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return { h, s, l }
  }

  /**
   * rgb转换为hex
   * @param r
   * @param g
   * @param b
   * @param allowChar3 是否转换为3位hex格式的数据
   * @returns
   */
  private _rgbToHex(r: number, g: number, b: number, allowChar3: boolean) {
    const hex = [
      this._pad2(mathRound(r).toString(16)),
      this._pad2(mathRound(g).toString(16)),
      this._pad2(mathRound(b).toString(16)),
    ]

    if (
      allowChar3 &&
      hex[0].charAt(0) === hex[0].charAt(1) &&
      hex[1].charAt(0) === hex[1].charAt(1) &&
      hex[2].charAt(0) === hex[2].charAt(1)
    ) {
      return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0)
    }
    return hex.join('')
  }

  /**
   * rgba转换为hex
   * @param r
   * @param g
   * @param b
   * @param allowChar4 是否转换为4位hex格式的数据
   * @returns
   */
  private _rgbaToHex(
    r: number,
    g: number,
    b: number,
    a: number,
    allowChar4: boolean
  ) {
    const hex = [
      this._pad2(mathRound(r).toString(16)),
      this._pad2(mathRound(g).toString(16)),
      this._pad2(mathRound(b).toString(16)),
      this._pad2(this._convertDecimalToHex(a)),
    ]

    if (
      allowChar4 &&
      hex[0].charAt(0) === hex[0].charAt(1) &&
      hex[1].charAt(0) === hex[1].charAt(1) &&
      hex[2].charAt(0) === hex[2].charAt(1) &&
      hex[3].charAt(0) === hex[3].charAt(1)
    ) {
      return (
        hex[0].charAt(0) +
        hex[1].charAt(0) +
        hex[2].charAt(0) +
        hex[3].charAt(0)
      )
    }
    return hex.join('')
  }

  /**
   * 将对应的小数值转换为百分比
   * @param value 待转换的值
   * @returns
   */
  private _convertToPercentage(value: string | number) {
    if (typeof value === 'string') value = Number.parseFloat(value)
    if (value <= 1) {
      value = `${(value as number) * 100}%`
    }
    return value
  }

  /**
   * 判断是否为css单位
   * @param color 颜色对应的值
   * @returns 匹配结果
   */
  private _isValidCSSUnit(color: string | number) {
    if (typeof color === 'number') color = String(color)
    return !!this._matches.CSS_UNIT.exec(color)
  }

  /**
   * 将十六进制的值转换为十进制
   * @param val 十六进制的值
   * @returns 十进制的值
   */
  private _parseIntFromHex(val: string): number {
    return Number.parseInt(val, 16)
  }

  /**
   * 将值转换为[0, 1]范围
   * @param value 需要转换的值
   * @param max 转换的最大值
   * @returns [0, 1]
   */
  private _bound01(value: string | number, max: number) {
    if (this._isOnePointZero(value)) {
      value = '100%'
    }

    const processPercent = this._isPercentage(value)
    value = mathMin(max, mathMax(0, Number.parseFloat(value as string)))
    // 自动将百分比转换为数值
    if (processPercent) {
      value = Number.parseInt(String(value * max), 10) / 100
    }

    if (Math.abs(value - max) < 0.000001) {
      return 1
    }

    return (value % max) / Number.parseInt(String(max))
  }

  /**
   * 将值转换为透明度内的有效值
   * @param value
   * @returns
   */
  private _boundAlpha(value: number) {
    value = Number.parseFloat(String(value))
    if (isNaN(value) || value < 0 || value > 1) {
      value = 1
    }
    return value
  }

  /**
   * 判断是否为1.0或者100%
   * @param value 1.0或者100%
   * @returns 判断结果
   */
  private _isOnePointZero(value: string | number) {
    return (
      typeof value === 'string' &&
      value.includes('.') &&
      Number.parseFloat(value) === 1
    )
  }

  /**
   * 判断值是否为百分比的值
   * @param value 待判断的值
   * @returns 判断的值
   */
  private _isPercentage(value: string | number) {
    return typeof value === 'string' && value.includes('%')
  }

  /**
   * 补全hex数值
   * @param value
   * @returns
   */
  private _pad2(value: string): string {
    return value.length === 1 ? `0${value}` : value
  }

  /**
   * 数值转16进制
   * @param value
   * @returns
   */
  private _convertDecimalToHex(value: string | number) {
    return Math.round(Number.parseFloat(String(value)) * 255).toString(16)
  }

  /**
   * 十六进制转数值
   * @param value
   * @returns
   */
  private _convertHexToDecimal(value: string | number) {
    return this._parseIntFromHex(String(value)) / 255
  }

  /**
   * 获取对应格式的匹配规则
   */
  private _matches = (() => {
    const CSS_INTEGER = '[-\\+]?\\d+%?'
    const CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?'
    const CSS_UNIT = `(?:${CSS_NUMBER})|(?:${CSS_INTEGER})`

    const PERMISSIVE_MATCH3 = `[\\s|\\(]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})\\s*\\)?`
    const PERMISSIVE_MATCH4 = `[\\s|\\(]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})\\s*\\)?`

    return {
      CSS_UNIT: new RegExp(CSS_UNIT),
      rgb: new RegExp(`rgb${PERMISSIVE_MATCH3}`),
      rgba: new RegExp(`rgba${PERMISSIVE_MATCH4}`),
      hsl: new RegExp(`hsl${PERMISSIVE_MATCH3}`),
      hsla: new RegExp(`hsla${PERMISSIVE_MATCH4}`),
      hsv: new RegExp(`hsv${PERMISSIVE_MATCH3}`),
      hsva: new RegExp(`hsva${PERMISSIVE_MATCH4}`),
      hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
      hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    }
  })()

  // 内置颜色值
  private _InnerColorsList = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '0ff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000',
    blanchedalmond: 'ffebcd',
    blue: '00f',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    burntsienna: 'ea7e5d',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '0ff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'f0f',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '789',
    lightslategrey: '789',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '0f0',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'f0f',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    rebeccapurple: '663399',
    red: 'f00',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'fff',
    whitesmoke: 'f5f5f5',
    yellow: 'ff0',
    yellowgreen: '9acd32',
  }

  private _hexNames = this._flip(this._InnerColorsList)

  /**
   * 将值和键翻转
   * @param obj
   * @returns
   */
  private _flip(obj: typeof this._InnerColorsList) {
    const flipped: {
      [key: string]: string
    } = {}
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        flipped[obj[i as keyof typeof this._InnerColorsList]] = i
      }
    }
    return flipped
  }
}
