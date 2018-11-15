import { Triple } from 'ntriples-collection';
import { inflateCurie } from './curie';
import { Literal, toDatatypeValue } from './literal';
import {
  getLiteral,
  isIRI,
  isLocalized,
  isString,
  matchLiteral,
  Rules
} from './rules';

type TripleTransform = (triple: Triple) => Triple;
type TriplesTransform = (
  triples: ReadonlyArray<Triple>
) => ReadonlyArray<Triple>;

const addLanguage = (rules: Rules) => (triple: Triple) =>
  isLocalized(rules, triple.predicate)
    ? {
        object: `"${triple.object}"@${rules.language}`,
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const addString = (rules: Rules) => (triple: Triple) =>
  isString(rules, triple.predicate)
    ? {
        object: `"${triple.object}"`,
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const addIRI = (rules: Rules) => (triple: Triple) =>
  isIRI(rules, triple.predicate)
    ? {
        object: inflateCurie(rules.prefixes, triple.object),
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const addBoolean = (rules: Rules) => (triple: Triple) =>
  matchLiteral(rules, Literal.Bool, triple.predicate)
    ? {
        object:
          triple.object === 'true'
            ? toDatatypeValue(Literal.Bool, 'true')
            : toDatatypeValue(Literal.Bool, 'false'),
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const forceInt = (value: string): string => {
  const num = parseInt(value, 10);
  return isNaN(num) ? '0' : num.toString();
};
const forceFloat = (value: string): string => {
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toString();
};

const forceDateTime = (value: string): string => {
  const isoDate = new Date(value);
  return isoDate.toISOString();
};
const addInteger = (rules: Rules) => (triple: Triple) =>
  matchLiteral(rules, Literal.Int, triple.predicate)
    ? {
        object: toDatatypeValue(Literal.Int, forceInt(triple.object)),
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const addFloat = (rules: Rules) => (triple: Triple) =>
  matchLiteral(rules, Literal.Float, triple.predicate)
    ? {
        object: toDatatypeValue(Literal.Float, forceFloat(triple.object)),
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

const addDateTime = (rules: Rules) => (triple: Triple) =>
  matchLiteral(rules, Literal.DateTime, triple.predicate)
    ? {
        object: toDatatypeValue(Literal.DateTime, forceDateTime(triple.object)),
        predicate: triple.predicate,
        subject: triple.subject
      }
    : triple;

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
      return addString(rules);
    case Literal.Localized:
      return addLanguage(rules);
    case Literal.Int:
      return addInteger(rules);
    case Literal.Float:
      return addFloat(rules);
    case Literal.Bool:
      return addBoolean(rules);
    case Literal.DateTime:
      return addDateTime(rules);
    case Literal.Date:
      return addDateTime(rules);
    case Literal.AnyURI:
      return addString(rules);
    case Literal.IRI:
      return addIRI(rules);
    default:
      return addString(rules);
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
