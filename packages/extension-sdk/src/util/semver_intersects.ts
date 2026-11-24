/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

export interface SemverOptions {
  loose?: boolean;
  includePrerelease?: boolean;
}

type NormalizedOptions = Required<SemverOptions>;

interface ParsedSemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: Array<string | number>;
  version: string;
}

const MAX_LENGTH = 256;
const MAX_SAFE_BUILD_LENGTH = 250;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
const LETTERDASHNUMBER = '[a-zA-Z0-9-]';
const NUMERIC_RE = /^[0-9]+$/;

const parseOptions = (options?: boolean | SemverOptions): NormalizedOptions =>
  typeof options === 'boolean'
    ? { loose: options, includePrerelease: false }
    : {
        loose: Boolean(options?.loose),
        includePrerelease: Boolean(options?.includePrerelease),
      };

const SAFE_TOKENS: Array<[string, number]> = [
  ['\\s', 1],
  ['\\d', MAX_LENGTH],
  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
];

const makeSafeRegex = (pattern: string, flags?: string): RegExp =>
  new RegExp(
    SAFE_TOKENS.reduce(
      (acc, [tok, max]) =>
        acc
          .split(`${tok}*`)
          .join(`${tok}{0,${max}}`)
          .split(`${tok}+`)
          .join(`${tok}{1,${max}}`),
      pattern
    ),
    flags
  );

const NUM_ID = '0|[1-9]\\d*';
const NUM_ID_LOOSE = '\\d+';
const NON_NUM_ID = `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`;
const MAIN_VER = `(${NUM_ID})\\.(${NUM_ID})\\.(${NUM_ID})`;
const MAIN_VER_LOOSE = `(${NUM_ID_LOOSE})\\.(${NUM_ID_LOOSE})\\.(${NUM_ID_LOOSE})`;
const PRE_ID = `(?:${NON_NUM_ID}|${NUM_ID})`;
const PRE_ID_LOOSE = `(?:${NON_NUM_ID}|${NUM_ID_LOOSE})`;
const PRE = `(?:-(${PRE_ID}(?:\\.${PRE_ID})*))`;
const PRE_LOOSE = `(?:-?(${PRE_ID_LOOSE}(?:\\.${PRE_ID_LOOSE})*))`;
const BUILD = `(?:\\+(${LETTERDASHNUMBER}+(?:\\.${LETTERDASHNUMBER}+)*))`;
const FULL_PLAIN = `v?${MAIN_VER}${PRE}?${BUILD}?`;
const LOOSE_PLAIN = `[v=\\s]*${MAIN_VER_LOOSE}${PRE_LOOSE}?${BUILD}?`;
const GTLT = '((?:<|>)?=?)';
const XRANGE_ID = `${NUM_ID}|x|X|\\*`;
const XRANGE_ID_LOOSE = `${NUM_ID_LOOSE}|x|X|\\*`;
const XRANGE_PLAIN = `[v=\\s]*(${XRANGE_ID})(?:\\.(${XRANGE_ID})(?:\\.(${XRANGE_ID})(?:${PRE})?${BUILD}?)?)?`;
const XRANGE_PLAIN_LOOSE = `[v=\\s]*(${XRANGE_ID_LOOSE})(?:\\.(${XRANGE_ID_LOOSE})(?:\\.(${XRANGE_ID_LOOSE})(?:${PRE_LOOSE})?${BUILD}?)?)?`;
const LONE_TILDE = '(?:~>?)';

const RE = {
  FULL: makeSafeRegex(`^${FULL_PLAIN}$`),
  LOOSE: makeSafeRegex(`^${LOOSE_PLAIN}$`),
  BUILD: makeSafeRegex(BUILD),
  BUILD_GLOBAL: new RegExp(BUILD, 'g'),
  XRANGE: makeSafeRegex(`^${GTLT}\\s*${XRANGE_PLAIN}$`),
  XRANGE_LOOSE: makeSafeRegex(`^${GTLT}\\s*${XRANGE_PLAIN_LOOSE}$`),
  TILDE_TRIM: makeSafeRegex(`(\\s*)${LONE_TILDE}\\s+`, 'g'),
  TILDE: makeSafeRegex(`^${LONE_TILDE}${XRANGE_PLAIN}$`),
  TILDE_LOOSE: makeSafeRegex(`^${LONE_TILDE}${XRANGE_PLAIN_LOOSE}$`),
  CARET_TRIM: makeSafeRegex('(\\s*)\\^\\s+', 'g'),
  CARET: makeSafeRegex(`^\\^${XRANGE_PLAIN}$`),
  CARET_LOOSE: makeSafeRegex(`^\\^${XRANGE_PLAIN_LOOSE}$`),
  COMPARATOR: makeSafeRegex(`^${GTLT}\\s*(${FULL_PLAIN})$|^$`),
  COMPARATOR_LOOSE: makeSafeRegex(`^${GTLT}\\s*(${LOOSE_PLAIN})$|^$`),
  COMPARATOR_TRIM: makeSafeRegex(
    `(\\s*)${GTLT}\\s*(${LOOSE_PLAIN}|${XRANGE_PLAIN})`,
    'g'
  ),
  HYPHEN: makeSafeRegex(
    `^\\s*(${XRANGE_PLAIN})\\s+-\\s+(${XRANGE_PLAIN})\\s*$`
  ),
  HYPHEN_LOOSE: makeSafeRegex(
    `^\\s*(${XRANGE_PLAIN_LOOSE})\\s+-\\s+(${XRANGE_PLAIN_LOOSE})\\s*$`
  ),
  STAR: makeSafeRegex('(<|>)?=?\\s*\\*'),
  GTE0: makeSafeRegex('^\\s*>=\\s*0\\.0\\.0\\s*$'),
  GTE0_PRE: makeSafeRegex('^\\s*>=\\s*0\\.0\\.0-0\\s*$'),
};

const compareIdentifiers = (
  a: string | number,
  b: string | number
): -1 | 0 | 1 => {
  const aNum = typeof a === 'number' || NUMERIC_RE.test(a);
  const bNum = typeof b === 'number' || NUMERIC_RE.test(b);
  const av = aNum && bNum ? +a : a;
  const bv = aNum && bNum ? +b : b;
  return av === bv
    ? 0
    : aNum && !bNum
    ? -1
    : bNum && !aNum
    ? 1
    : av < bv
    ? -1
    : 1;
};

const parseSemVer = (raw: string, loose: boolean): ParsedSemVer => {
  if (raw.length > MAX_LENGTH) {
    throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
  }
  const m = raw.trim().match(loose ? RE.LOOSE : RE.FULL);
  if (!m) throw new TypeError(`Invalid Version: ${raw}`);

  const [major, minor, patch] = [+m[1], +m[2], +m[3]];
  if ([major, minor, patch].some(n => n > MAX_SAFE_INTEGER || n < 0)) {
    throw new TypeError('Invalid numeric version component');
  }

  const prerelease = m[4]
    ? m[4].split('.').map(id => {
        const num = +id;
        return NUMERIC_RE.test(id) && num >= 0 && num < MAX_SAFE_INTEGER
          ? num
          : id;
      })
    : [];

  return {
    major,
    minor,
    patch,
    prerelease,
    version: `${major}.${minor}.${patch}${
      prerelease.length ? `-${prerelease.join('.')}` : ''
    }`,
  };
};

const compareSemVer = (a: ParsedSemVer, b: ParsedSemVer): number => {
  if (a.version === b.version) return 0;
  const main = a.major - b.major || a.minor - b.minor || a.patch - b.patch;
  if (main) return main < 0 ? -1 : 1;
  if (Boolean(a.prerelease.length) !== Boolean(b.prerelease.length)) {
    return a.prerelease.length ? -1 : 1;
  }
  for (let i = 0; i < a.prerelease.length || i < b.prerelease.length; i++) {
    const pa = a.prerelease[i];
    const pb = b.prerelease[i];
    if (pa === undefined) return -1;
    if (pb === undefined) return 1;
    if (pa !== pb) return compareIdentifiers(pa, pb);
  }
  return 0;
};

const cmpSemVer = (a: ParsedSemVer, op: string, b: ParsedSemVer): boolean => {
  const c = compareSemVer(a, b);
  return op === '>'
    ? c > 0
    : op === '>='
    ? c >= 0
    : op === '<'
    ? c < 0
    : op === '<='
    ? c <= 0
    : c === 0;
};

class Comparator {
  operator: string;
  semver: ParsedSemVer | null;
  value: string;

  constructor(comp: string, options: NormalizedOptions) {
    const normalized = comp.trim().split(/\s+/).join(' ');
    const m = normalized.match(
      options.loose ? RE.COMPARATOR_LOOSE : RE.COMPARATOR
    );
    if (!m) throw new TypeError(`Invalid comparator: ${normalized}`);
    this.operator = m[1] === '=' || m[1] === undefined ? '' : m[1];
    this.semver = m[2] ? parseSemVer(m[2], options.loose) : null;
    this.value = this.semver ? this.operator + this.semver.version : '';
  }

  test(version: ParsedSemVer): boolean {
    return !this.semver || cmpSemVer(version, this.operator, this.semver);
  }

  intersects(comp: Comparator, options: NormalizedOptions): boolean {
    if (this.operator === '') {
      return (
        !this.semver ||
        testRange(parseRangeSet(comp.value, options), this.semver, options)
      );
    }
    if (comp.operator === '') {
      return (
        !comp.semver ||
        testRange(parseRangeSet(this.value, options), comp.semver, options)
      );
    }

    if (
      options.includePrerelease
        ? this.value === '<0.0.0-0' || comp.value === '<0.0.0-0'
        : this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0')
    ) {
      return false;
    }

    if (
      (this.operator.startsWith('>') && comp.operator.startsWith('>')) ||
      (this.operator.startsWith('<') && comp.operator.startsWith('<'))
    ) {
      return true;
    }

    if (!this.semver || !comp.semver) return false;
    const a = this.semver;
    const b = comp.semver;
    return (
      (a.version === b.version &&
        this.operator.includes('=') &&
        comp.operator.includes('=')) ||
      (cmpSemVer(a, '<', b) &&
        this.operator.startsWith('>') &&
        comp.operator.startsWith('<')) ||
      (cmpSemVer(a, '>', b) &&
        this.operator.startsWith('<') &&
        comp.operator.startsWith('>'))
    );
  }
}

const isX = (id?: string): boolean =>
  !id || id.toLowerCase() === 'x' || id === '*';

const replaceTilde = (
  comp: string,
  { loose, includePrerelease }: NormalizedOptions
): string =>
  comp.replace(loose ? RE.TILDE_LOOSE : RE.TILDE, (_, M, m, p, pr) => {
    const z = includePrerelease ? '-0' : '';
    if (isX(M)) return '';
    if (isX(m)) return `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    if (isX(p)) return `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
    return `>=${M}.${m}.${p}${pr ? `-${pr}` : ''} <${M}.${+m + 1}.0-0`;
  });

const replaceCaret = (
  comp: string,
  { loose, includePrerelease }: NormalizedOptions
): string =>
  comp.replace(loose ? RE.CARET_LOOSE : RE.CARET, (_, M, m, p, pr) => {
    const z = includePrerelease ? '-0' : '';
    if (isX(M)) return '';
    if (isX(m)) return `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    if (isX(p)) {
      return M === '0'
        ? `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
        : `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
    }
    const upper =
      M === '0'
        ? m === '0'
          ? `${M}.${m}.${+p + 1}`
          : `${M}.${+m + 1}.0`
        : `${+M + 1}.0.0`;
    return `>=${M}.${m}.${p}${pr ? `-${pr}` : ''} <${upper}-0`;
  });

const replaceXRange = (
  comp: string,
  { loose, includePrerelease }: NormalizedOptions
): string => {
  const trimmed = comp.trim();
  return trimmed.replace(
    loose ? RE.XRANGE_LOOSE : RE.XRANGE,
    (ret, gtlt, M, m, p) => {
      if ((isX(M) && !isX(m)) || (isX(m) && Boolean(p) && !isX(p))) {
        return trimmed;
      }
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      let op = gtlt === '=' && xp ? '' : gtlt;
      const pr = includePrerelease ? '-0' : '';

      if (xM) return op === '>' || op === '<' ? '<0.0.0-0' : '*';
      if (op && xp) {
        const bump = op === '>' || op === '<=';
        if (op === '>') op = '>=';
        if (op === '<=') op = '<';
        const maj = bump && xm ? +M + 1 : M;
        const min = bump ? (xm ? 0 : +m + 1) : xm ? 0 : m;
        return `${op}${maj}.${min}.0${op === '<' ? '-0' : pr}`;
      }
      if (xm) return `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      if (xp) return `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      return ret;
    }
  );
};

const hyphenReplace =
  (incPr: boolean) =>
  (
    _m: string,
    from: string,
    fM: string,
    fm: string,
    fp: string,
    fpr: string,
    _fb: string,
    to: string,
    tM: string,
    tm: string,
    tp: string,
    tpr: string
  ): string => {
    const z = incPr ? '-0' : '';
    const left = isX(fM)
      ? ''
      : isX(fm)
      ? `>=${fM}.0.0${z}`
      : isX(fp)
      ? `>=${fM}.${fm}.0${z}`
      : `>=${from}${fpr ? '' : z}`;
    const right = isX(tM)
      ? ''
      : isX(tm)
      ? `<${+tM + 1}.0.0-0`
      : isX(tp)
      ? `<${tM}.${+tm + 1}.0-0`
      : tpr
      ? `<=${tM}.${tm}.${tp}-${tpr}`
      : incPr
      ? `<${tM}.${tm}.${+tp + 1}-0`
      : `<=${to}`;
    return `${left} ${right}`.trim();
  };

const desugarToken = (comp: string, options: NormalizedOptions): string =>
  [replaceCaret, replaceTilde, replaceXRange]
    .reduce(
      (s, fn) =>
        s
          .trim()
          .split(/\s+/)
          .map(c => fn(c, options))
          .join(' '),
      comp.replace(RE.BUILD, '')
    )
    .trim()
    .replace(RE.STAR, '');

const parseBranch = (
  rangeInput: string,
  options: NormalizedOptions
): Comparator[] => {
  const normalized = rangeInput
    .replace(RE.BUILD_GLOBAL, '')
    .replace(
      options.loose ? RE.HYPHEN_LOOSE : RE.HYPHEN,
      hyphenReplace(options.includePrerelease)
    )
    .replace(RE.COMPARATOR_TRIM, '$1$2$3')
    .replace(RE.TILDE_TRIM, '$1~')
    .replace(RE.CARET_TRIM, '$1^');

  let tokens = normalized
    .split(' ')
    .map(c => desugarToken(c, options))
    .join(' ')
    .split(/\s+/)
    .map(c =>
      c.trim().replace(options.includePrerelease ? RE.GTE0_PRE : RE.GTE0, '')
    );

  if (options.loose) {
    tokens = tokens.filter(c => Boolean(c.match(RE.COMPARATOR_LOOSE)));
  }

  const map = new Map<string, Comparator>();
  for (const token of tokens) {
    const comp = new Comparator(token, options);
    if (comp.value === '<0.0.0-0') return [comp];
    map.set(comp.value, comp);
  }
  if (map.size > 1 && map.has('')) map.delete('');
  return Array.from(map.values());
};

const parseRangeSet = (
  range: string,
  options: NormalizedOptions
): Comparator[][] => {
  if (typeof range !== 'string') throw new TypeError('Invalid SemVer Range');
  const raw = range.trim().replace(/\s+/g, ' ');
  let set = raw
    .split('||')
    .map(r => parseBranch(r.trim(), options))
    .filter(c => c.length > 0);

  if (!set.length) throw new TypeError(`Invalid SemVer Range: ${raw}`);

  if (set.length > 1) {
    const first = set[0];
    set = set.filter(c => c[0].value !== '<0.0.0-0');
    if (!set.length) {
      set = [first];
    } else if (set.length > 1) {
      const star = set.find(c => c.length === 1 && c[0].value === '');
      if (star) set = [star];
    }
  }
  return set;
};

const testRange = (
  set: Comparator[][],
  version: ParsedSemVer,
  options: NormalizedOptions
): boolean =>
  set.some(
    branch =>
      branch.every(c => c.test(version)) &&
      (!version.prerelease.length ||
        options.includePrerelease ||
        branch.some(
          c =>
            c.semver !== null &&
            c.semver.prerelease.length > 0 &&
            c.semver.major === version.major &&
            c.semver.minor === version.minor &&
            c.semver.patch === version.patch
        ))
  );

const isSatisfiable = (
  comps: Comparator[],
  options: NormalizedOptions
): boolean =>
  comps.every((a, i) =>
    comps.slice(i + 1).every(b => a.intersects(b, options))
  );

export const semverIntersects = (
  r1: string,
  r2: string,
  options?: boolean | SemverOptions
): boolean => {
  const opts = parseOptions(options);
  const set1 = parseRangeSet(r1, opts);
  const set2 = parseRangeSet(r2, opts);
  return set1.some(
    b1 =>
      isSatisfiable(b1, opts) &&
      set2.some(
        b2 =>
          isSatisfiable(b2, opts) &&
          b1.every(c1 => b2.every(c2 => c1.intersects(c2, opts)))
      )
  );
};
