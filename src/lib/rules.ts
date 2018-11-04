import { Literal, toLiteral } from './literal';

interface PredicateRule {
  readonly curie: string;
  readonly isLocalized: boolean;
  readonly isMany: boolean;
  readonly literal: Literal;
}

interface Rules {
  readonly language: string;
  readonly prefixes: ReadonlyArray<[string, string]>;
  readonly rules: Map<string, PredicateRule>;
}

const regexLine = /[\r\n]+/;
const regexPredicateRule = /^[a-z_-]+[:][a-z/#_-]+ (string|integer|number|float|boolean|datetime|date|uri|iri)( (lang|many))*/i;

const parsePredicateRule = (line: string): PredicateRule => {
  const words = line.split(' ', 4);
  const [curie, literalKey, ...options] = words;
  const literal = toLiteral(literalKey);
  const predicateRule: PredicateRule = {
    curie,
    isLocalized: options.includes('lang'),
    isMany: options.includes('many'),
    literal
  };
  return predicateRule;
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

const asKeyPredicateTuple = (rule: PredicateRule): [string, PredicateRule] => [
  rule.curie,
  rule
];

const toMapOfPredicateRule = (
  rules: ReadonlyArray<PredicateRule>
): Map<string, PredicateRule> => {
  const ruleArray: ReadonlyArray<[string, PredicateRule]> = rules.map(
    asKeyPredicateTuple
  );
  return new Map<string, PredicateRule>(ruleArray);
};

function parseRules(content: string): Rules {
  const lines = content.split(regexLine);
  const languageLine = lines.filter(s => s.startsWith('@language'))[0] || '';
  const prefixLines = lines.filter(s => s.startsWith('@prefix'));
  const ruleLines = lines.filter(s => regexPredicateRule.test(s));
  const language = parseLanguage(languageLine);
  const prefixes = prefixLines.map(parsePrefix);
  const rules = toMapOfPredicateRule(ruleLines.map(parsePredicateRule));

  const allRules = {
    language,
    prefixes,
    rules
  };
  return allRules;
}

export { parseRules, PredicateRule, Rules };
