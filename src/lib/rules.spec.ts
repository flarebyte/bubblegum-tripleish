import test from 'ava';
import { Literal } from './literal';
import { parseRules, PredicateRule, Rules } from './rules';

const asKeyPredicateTuple = (rule: PredicateRule): [string, PredicateRule] => [
  rule.curie,
  rule
];
const content = [
  '@language en-GB',
  '@prefix rdf http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  '@prefix foaf http://xmlns.com/foaf/0.1/',
  '@prefix ui http://mysite.com/ui/',
  'ui:manyLangString string lang many',
  'ui:someLangString string lang',
  'ui:some-Int integer',
  'ui:many-Int integer many',
  'ui:some/Number number',
  'ui:some#Float float',
  'ui:some_Bool boolean',
  'ui:someDateTime datetime',
  'ui:someDate date',
  'ui_plus:someUri uri',
  'ui-plus:someIri iri'
].join('\n');

test('parseRules should parse valid rules', t => {
  const actual = parseRules(content);
  const expected: Rules = {
    language: 'en-GB',
    prefixes: [
      ['rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'],
      ['foaf', 'http://xmlns.com/foaf/0.1/'],
      ['ui', 'http://mysite.com/ui/']
    ],
    rules: new Map([
      asKeyPredicateTuple({
        curie: 'ui:manyLangString',
        isLocalized: true,
        isMany: true,
        literal: Literal.Str
      }),
      asKeyPredicateTuple({
        curie: 'ui:someLangString',
        isLocalized: true,
        isMany: false,
        literal: Literal.Str
      }),
      asKeyPredicateTuple({
        curie: 'ui:some-Int',
        isLocalized: false,
        isMany: false,
        literal: Literal.Int
      }),
      asKeyPredicateTuple({
        curie: 'ui:many-Int',
        isLocalized: false,
        isMany: true,
        literal: Literal.Int
      }),
      asKeyPredicateTuple({
        curie: 'ui:some/Number',
        isLocalized: false,
        isMany: false,
        literal: Literal.Number
      }),
      asKeyPredicateTuple({
        curie: 'ui:some#Float',
        isLocalized: false,
        isMany: false,
        literal: Literal.Float
      }),
      asKeyPredicateTuple({
        curie: 'ui:some_Bool',
        isLocalized: false,
        isMany: false,
        literal: Literal.Bool
      }),
      asKeyPredicateTuple({
        curie: 'ui:someDateTime',
        isLocalized: false,
        isMany: false,
        literal: Literal.DateTime
      }),
      asKeyPredicateTuple({
        curie: 'ui:someDate',
        isLocalized: false,
        isMany: false,
        literal: Literal.Date
      }),
      asKeyPredicateTuple({
        curie: 'ui_plus:someUri',
        isLocalized: false,
        isMany: false,
        literal: Literal.AnyURI
      }),
      asKeyPredicateTuple({
        curie: 'ui-plus:someIri',
        isLocalized: false,
        isMany: false,
        literal: Literal.IRI
      })
    ])
  };

  t.deepEqual(actual.language, expected.language);
  t.deepEqual(actual.prefixes, expected.prefixes);
  t.deepEqual(actual.rules, expected.rules);
});
