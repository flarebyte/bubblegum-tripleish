import test from 'ava';
import { Literal } from './literal';
import {
  isIRI,
  isLocalized,
  isString,
  matchLiteral,
  parseRules,
  Rules
} from './rules';

const content = [
  '@language en-GB',
  '@prefix rdf http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  '@prefix foaf http://xmlns.com/foaf/0.1/',
  '@prefix ui http://mysite.com/ui/',
  '@default localized ui:i18n/eng/gb/**',
  '@default localized *:people/**/*-en',
  '@default iri ui:**/*-id',
  'ui:someString string',
  'ui:someLangString localized',
  'ui:some-Int integer',
  'ui:some#Float float',
  'ui:some_Bool boolean',
  'ui:someDateTime datetime',
  'ui:someDate date',
  'ui_plus:someUri uri',
  'ui-plus:someIri iri',
  'foaf:homepage uri'
].join('\n');

const defaultRules = parseRules(content);

test('parseRules should parse valid rules', t => {
  const expected: Rules = {
    language: 'en-GB',
    predicates: new Map([
      ['ui:someString', Literal.Str],
      ['ui:someLangString', Literal.Localized],
      ['ui:some-Int', Literal.Int],
      ['ui:some#Float', Literal.Float],
      ['ui:some_Bool', Literal.Bool],
      ['ui:someDateTime', Literal.DateTime],
      ['ui:someDate', Literal.Date],
      ['ui_plus:someUri', Literal.AnyURI],
      ['ui-plus:someIri', Literal.IRI],
      ['foaf:homepage', Literal.AnyURI]
    ]),
    prefixes: [
      ['rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'],
      ['foaf', 'http://xmlns.com/foaf/0.1/'],
      ['ui', 'http://mysite.com/ui/']
    ]
  };

  t.deepEqual(defaultRules.language, expected.language);
  t.deepEqual(defaultRules.prefixes, expected.prefixes);
  t.deepEqual(defaultRules.predicates, expected.predicates);
});

test('isLocalized should be true for a localized predicate', t => {
  const actual = isLocalized(defaultRules, 'ui:someLangString');
  t.deepEqual(actual, true);
});

test('isLocalized should be false for a string predicate', t => {
  const actual = isLocalized(defaultRules, 'ui:someString');
  t.deepEqual(actual, false);
});

test('isLocalized should be false for an unknown string', t => {
  const actual = isLocalized(defaultRules, 'ui:whatever');
  t.deepEqual(actual, false);
});

test('isString should be true for a string predicate', t => {
  const actual = isString(defaultRules, 'ui:someString');
  t.deepEqual(actual, true);
});

test('isString should be false for a boolean predicate', t => {
  const actual = isString(defaultRules, 'ui:some_Bool');
  t.deepEqual(actual, false);
});

test('isString should be true as a default', t => {
  const actual = isString(defaultRules, 'ui:whatever');
  t.deepEqual(actual, true);
});

test('isIRI should be true for an IRI predicate', t => {
  const actual = isIRI(defaultRules, 'ui-plus:someIri');
  t.deepEqual(actual, true);
});

test('isIRI should be false for a boolean predicate', t => {
  const actual = isIRI(defaultRules, 'ui:some_Bool');
  t.deepEqual(actual, false);
});

test('matchLiteral should be true for the given literal', t => {
  const actual = matchLiteral(defaultRules, Literal.Bool, 'ui:some_Bool');
  t.deepEqual(actual, true);
});

test('matchLiteral should be false for an unexpected predicate', t => {
  const actual = matchLiteral(defaultRules, Literal.Bool, 'ui:someString');
  t.deepEqual(actual, false);
});
