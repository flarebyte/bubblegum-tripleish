import test from 'ava';
import { Literal } from './literal';
import { PredicateRule, Rules } from './rules';
import { enhanceTriple } from './to-ntriples';

const language = 'en-GB';
const prefixes: ReadonlyArray<any> = [
  ['ui', 'http://mysite.com/ui/'],
  ['app', 'http://mysite.com/app/']
];

const asKeyPredicateTuple = (rule: PredicateRule): [string, PredicateRule] => [
  rule.curie,
  rule
];

const typedRules = (literal: Literal) => {
  return [
    asKeyPredicateTuple({
      curie: `ui:type/${literal}`,
      isLocalized: false,
      isMany: false,
      literal
    }),
    asKeyPredicateTuple({
      curie: `ui:type/many/${literal}`,
      isLocalized: false,
      isMany: true,
      literal
    }),
    asKeyPredicateTuple({
      curie: `ui:type/local/${literal}`,
      isLocalized: true,
      isMany: false,
      literal
    }),
    asKeyPredicateTuple({
      curie: `ui:type/all/${literal}`,
      isLocalized: true,
      isMany: true,
      literal
    })
  ];
};

test('enhanceTriple should expand subject and predicate', t => {
  const rules: Rules = {
    language,
    prefixes,
    rules: new Map(typedRules(Literal.Str))
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'any',
    predicate: 'ui:type/string',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.subject, 'http://mysite.com/app/a/b/c');
  t.deepEqual(actual.predicate, 'http://mysite.com/ui/type/string');
});
