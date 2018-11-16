import test from 'ava';
import { Literal } from './literal';
import { Rules } from './rules';
import { enhanceTriple } from './to-ntriples';

const language = 'en-GB';
const prefixes: ReadonlyArray<any> = [
  ['ui', 'http://mysite.com/ui/'],
  ['app', 'http://mysite.com/app/']
];

const defaults: ReadonlyArray<any> = [
  [Literal.Localized, /ui:i18n\/eng\/gb\/.+/],
  [Literal.Localized, /[^\/]+:people\/.+\/[^\/]+-en/],
  [Literal.IRI, /ui:.+\/[^\/]+-id/]
];

const typedRule = (literal: Literal): [string, Literal] => {
  return [`ui:type/${literal}`, literal];
};

test('enhanceTriple should expand subject and predicate', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Str)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'any',
    predicate: 'ui:type/string',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.subject, '<http://mysite.com/app/a/b/c>');
  t.deepEqual(actual.predicate, '<http://mysite.com/ui/type/string>');
});

test('enhanceTriple should add language when localized', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Localized)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'some text',
    predicate: 'ui:type/localized',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.object, '"some text"@en-GB');
});

test('enhanceTriple should add language when localized for a default path with **', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'some text',
    predicate: 'ui:i18n/eng/gb/a/b/c',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.object, '"some text"@en-GB');
});

test('enhanceTriple should add language when localized for a default path with single *', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'some text',
    predicate: 'ui:people/a/b/description-en',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.object, '"some text"@en-GB');
});

test('enhanceTriple should support string', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Str)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'some text',
    predicate: 'ui:type/string',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.object, '"some text"');
});

test('enhanceTriple should support IRI', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.IRI)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'app:x/z',
    predicate: 'ui:type/iri',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.object, '<http://mysite.com/app/x/z>');
});

test('enhanceTriple should support IRI for default path', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: 'app:x/z',
    predicate: 'ui:a/b/c/company-id',
    subject: 'app:a/b/c'
  });
  t.deepEqual(actual.object, '<http://mysite.com/app/x/z>');
});

test('enhanceTriple should support Boolean', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Bool)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const truth = enhancer({
    object: 'true',
    predicate: 'ui:type/boolean',
    subject: 'app:a/b/c'
  });

  t.deepEqual(
    truth.object,
    '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>'
  );
  const falsy = enhancer({
    object: 'false',
    predicate: 'ui:type/boolean',
    subject: 'app:a/b/c'
  });
  t.deepEqual(
    falsy.object,
    '"false"^^<http://www.w3.org/2001/XMLSchema#boolean>'
  );
});

test('enhanceTriple should support integer', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Int)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: '12',
    predicate: 'ui:type/integer',
    subject: 'app:a/b/c'
  });
  t.deepEqual(
    actual.object,
    '"12"^^<http://www.w3.org/2001/XMLSchema#integer>'
  );
});

test('enhanceTriple should support float', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Float)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: '-121.15',
    predicate: 'ui:type/float',
    subject: 'app:a/b/c'
  });
  t.deepEqual(
    actual.object,
    '"-121.15"^^<http://www.w3.org/2001/XMLSchema#float>'
  );
});

test('enhanceTriple should support date time', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.DateTime)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: '2018-11-18T14:13:07+00:00',
    predicate: 'ui:type/datetime',
    subject: 'app:a/b/c'
  });
  t.deepEqual(
    actual.object,
    '"2018-11-18T14:13:07.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>'
  );
});

test('enhanceTriple should support date', t => {
  const rules: Rules = {
    defaults,
    language,
    predicates: new Map([typedRule(Literal.Date)]),
    prefixes
  };
  const enhancer = enhanceTriple(rules);
  const actual = enhancer({
    object: '2018-11-18',
    predicate: 'ui:type/date',
    subject: 'app:a/b/c'
  });
  t.deepEqual(
    actual.object,
    '"2018-11-18"^^<http://www.w3.org/2001/XMLSchema#date>'
  );
});
