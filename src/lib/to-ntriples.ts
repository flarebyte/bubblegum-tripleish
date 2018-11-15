import { Triple } from 'ntriples-collection';
import { inflateCurie } from './curie';
import { Literal, toDatatypeValue } from './literal';
import { getLiteral, matchLiteral, Rules } from './rules';

type TripleTransform = (triple: Triple) => Triple;
type TriplesTransform = (
  triples: ReadonlyArray<Triple>
) => ReadonlyArray<Triple>;

const enforceInt = (value: string): string => {
  const num = parseInt(value, 10);
  return isNaN(num) ? '0' : num.toString();
};
const enforceFloat = (value: string): string => {
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toString();
};

const enforceDateTime = (value: string): string => {
  const isoDate = new Date(value);
  return isoDate.toISOString();
};

const enforceDate = (value: string): string => {
  const isoDate = enforceDateTime(`${value}T00:00:00.000Z`);
  return isoDate.substring(0, 10);
};

type stringTransformer = (value: string) => string;
type updateMatcher = (value: string) => boolean;

const updateObject = (transf: stringTransformer, matcher: updateMatcher) => (
  triple: Triple
) =>
  matcher(triple.predicate)
    ? {
        object: transf(triple.object),
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const addLanguage = (rules: Rules) => (value: string) =>
  `"${value}"@${rules.language}`;
const addString = () => (value: string) => `"${value}"`;
const addIRI = (rules: Rules) => (value: string) =>
  inflateCurie(rules.prefixes, value);
const addBoolean = () => (value: string) =>
  value === 'true'
    ? toDatatypeValue(Literal.Bool, 'true')
    : toDatatypeValue(Literal.Bool, 'false');

const addInteger = () => (value: string) =>
  toDatatypeValue(Literal.Int, enforceInt(value));
const addFloat = () => (value: string) =>
  toDatatypeValue(Literal.Float, enforceFloat(value));
const addDateTime = () => (value: string) =>
  toDatatypeValue(Literal.DateTime, enforceDateTime(value));
const addDate = () => (value: string) =>
  toDatatypeValue(Literal.Date, enforceDate(value));
const addAnyURI = () => (value: string) =>
  toDatatypeValue(Literal.AnyURI, value);

const inflateCurieTriple = (prefixes: ReadonlyArray<[string, string]>) => (
  triple: Triple
) => ({
  object: triple.object,
  predicate: inflateCurie(prefixes, triple.predicate),
  subject: inflateCurie(prefixes, triple.subject)
});

const normalizeObjectByLiteral = (rules: Rules, literal: Literal) => {
  switch (literal) {
    case Literal.Str:
      return updateObject(addString(), matchLiteral(rules, Literal.Str));
    case Literal.Localized:
      return updateObject(
        addLanguage(rules),
        matchLiteral(rules, Literal.Localized)
      );
    case Literal.Int:
      return updateObject(addInteger(), matchLiteral(rules, Literal.Int));
    case Literal.Float:
      return updateObject(addFloat(), matchLiteral(rules, Literal.Float));
    case Literal.Bool:
      return updateObject(addBoolean(), matchLiteral(rules, Literal.Bool));
    case Literal.DateTime:
      return updateObject(addDateTime(), matchLiteral(rules, Literal.DateTime));
    case Literal.Date:
      return updateObject(addDate(), matchLiteral(rules, Literal.Date));
    case Literal.AnyURI:
      return updateObject(addAnyURI(), matchLiteral(rules, Literal.AnyURI));
    case Literal.IRI:
      return updateObject(addIRI(rules), matchLiteral(rules, Literal.IRI));
    default:
      return updateObject(addString(), matchLiteral(rules, Literal.Str));
  }
};

export function enhanceTriple(rules: Rules): TripleTransform {
  return (t: Triple) => {
    const processCurie = inflateCurieTriple(rules.prefixes);
    const literal = getLiteral(rules, t.predicate);
    const pipeline: ReadonlyArray<any> = [
      normalizeObjectByLiteral(rules, literal),
      processCurie
    ];
    return pipeline.reduce((xs, f) => f(xs), t);
  };
}
export function enhanceTriples(rules: Rules): TriplesTransform {
  return (triples: ReadonlyArray<Triple>) => triples.map(enhanceTriple(rules));
}
