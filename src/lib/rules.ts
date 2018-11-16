import { Literal, toLiteral } from './literal';

interface Rules {
  readonly language: string;
  readonly prefixes: ReadonlyArray<[string, string]>;
  readonly predicates: Map<string, Literal>;
  readonly defaults: ReadonlyArray<[Literal, RegExp]>;
}

const regexLine = /[\r\n]+/;
const regexPredicateRule = /^[a-z_-]+[:][^:\u0000-\u0020<>"{}|^`\\]+ (string|localized|integer|float|boolean|datetime|date|uri|iri)/i;
const regexLanguageLine = /^@language [a-z]+('-'[a-z0-9]+)*/i;
const regexdefaultLine = /^@default (localized|iri) [a-z_*-]+[:][^:\u0000-\u0020<>"{}|^`\\]+/i;

const parsePredicateRule = (line: string): [string, Literal] => {
  const words = line.split(' ', 2);
  const [curie, literalKey] = words;
  const literal = toLiteral(literalKey);
  return [curie, literal];
};

const parseLanguage = (line: string): string => {
  const words = line.split(' ', 2);
  const [, language] = words;
  return language || 'en';
};

const parseTuple = (line: string): [string, string] => {
  const words = line.split(' ', 3);
  const [, left, right] = words;
  return [left, right];
};

const parseDefault = (line: string): [Literal, RegExp] => {
  const [literal, wildchar] = parseTuple(line);
  const regex = wildchar
    .replace(/\//g, '\\/')
    .replace(/[*]{2}/g, '.+')
    .replace(/[*]/g, '[^/]+');
  return [toLiteral(literal), new RegExp(regex)];
};

const toMapOfPredicates = (
  lines: ReadonlyArray<string>
): Map<string, Literal> => {
  const ruleArray: ReadonlyArray<[string, Literal]> = lines.map(
    parsePredicateRule
  );
  return new Map<string, Literal>(ruleArray);
};

function parseRules(content: string): Rules {
  const lines = content.split(regexLine);
  const languageLine = lines.filter(s => regexLanguageLine.test(s))[0] || '';
  const prefixLines = lines.filter(s => s.startsWith('@prefix '));
  const defaultLines = lines.filter(s => regexdefaultLine.test(s));
  const predicateLines = lines.filter(s => regexPredicateRule.test(s));
  const language = parseLanguage(languageLine);
  const prefixes = prefixLines.map(parseTuple);
  const defaults = defaultLines.map(parseDefault);
  const predicates = toMapOfPredicates(predicateLines);

  const allRules = {
    defaults,
    language,
    predicates,
    prefixes
  };
  return allRules;
}
const matchDefault = (rules: Rules, literal: Literal, predicate: string) =>
  rules.defaults.findIndex(d => d[0] === literal && d[1].test(predicate)) !==
  -1;

const isLocalized = (rules: Rules, predicate: string): boolean => {
  return rules.predicates.get(predicate) === Literal.Localized
    ? true
    : matchDefault(rules, Literal.Localized, predicate);
};

const isIRI = (rules: Rules, predicate: string): boolean => {
  return rules.predicates.get(predicate) === Literal.IRI
    ? true
    : matchDefault(rules, Literal.IRI, predicate);
};

const getLiteral = (rules: Rules, predicate: string): Literal => {
  const specialLiteral = isLocalized(rules, predicate)
    ? Literal.Localized
    : isIRI(rules, predicate)
      ? Literal.IRI
      : Literal.Unknown;

  const maybeLiteral = rules.predicates.get(predicate);

  return specialLiteral !== Literal.Unknown
    ? specialLiteral
    : maybeLiteral || Literal.Str;
};

const matchLiteral = (rules: Rules, literal: Literal) => (
  predicate: string
) => {
  return getLiteral(rules, predicate) === literal;
};

export { getLiteral, matchLiteral, parseRules, Rules };
