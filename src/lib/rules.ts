import { Literal, toLiteral } from './literal';

interface Rules {
  readonly language: string;
  readonly prefixes: ReadonlyArray<[string, string]>;
  readonly predicates: Map<string, Literal>;
}

const regexLine = /[\r\n]+/;
const regexPredicateRule = /^[a-z_-]+[:][a-z/#_-]+ (string|localized|integer|float|boolean|datetime|date|uri|iri)/i;
const regexLanguageLine = /^@language [a-z]+('-'[a-z0-9]+)*/i;

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

const parsePrefix = (line: string): [string, string] => {
  const words = line.split(' ', 3);
  const [, curie, uri] = words;
  return [curie, uri];
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
  const predicateLines = lines.filter(s => regexPredicateRule.test(s));
  const language = parseLanguage(languageLine);
  const prefixes = prefixLines.map(parsePrefix);
  const predicates = toMapOfPredicates(predicateLines);

  const allRules = {
    language,
    predicates,
    prefixes
  };
  return allRules;
}

const isLocalized = (rules: Rules, predicate: string): boolean => {
  return rules.predicates.get(predicate) === Literal.Localized;
};

const isString = (rules: Rules, predicate: string): boolean => {
  const literal = rules.predicates.get(predicate);
  return literal ? literal === Literal.Str : true;
};

const isIRI = (rules: Rules, predicate: string): boolean => {
  return rules.predicates.get(predicate) === Literal.IRI;
};

const matchLiteral = (
  rules: Rules,
  literal: Literal,
  predicate: string
): boolean => {
  return rules.predicates.get(predicate) === literal;
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

export {
  getLiteral,
  isIRI,
  isLocalized,
  isString,
  matchLiteral,
  parseRules,
  Rules
};
