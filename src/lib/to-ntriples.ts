import { Triple } from 'ntriples-collection';
import { inflateCurie } from './curie';
import { Rules } from './rules';

type TripleTransform = (triple: Triple) => Triple;
type TriplesTransform = (
  triples: ReadonlyArray<Triple>
) => ReadonlyArray<Triple>;

const addLanguage = (language: string) => (triple: Triple) => ({
  object: `"${triple.object}"@${language}`,
  predicate: triple.predicate,
  subject: triple.subject
});

const inflateCurieTriple = (prefixes: ReadonlyArray<[string, string]>) => (
  triple: Triple
) => ({
  object: triple.object,
  predicate: inflateCurie(prefixes, triple.predicate),
  subject: inflateCurie(prefixes, triple.subject)
});

export function enhanceTriple(rules: Rules): TripleTransform {
  return (t: Triple) =>
    inflateCurieTriple(rules.prefixes)(addLanguage(rules.language)(t));
}
export function enhanceTriples(rules: Rules): TriplesTransform {
  return (triples: ReadonlyArray<Triple>) => triples.map(enhanceTriple(rules));
}
