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
  return (t: Triple) => {
    const processLanguage = addLanguage(rules.language);
    const processCurie = inflateCurieTriple(rules.prefixes);
    const pipeline: ReadonlyArray<any> = [processLanguage, processCurie];
    return pipeline.reduce((xs, f) => f(xs), t);
  };
}
export function enhanceTriples(rules: Rules): TriplesTransform {
  return (triples: ReadonlyArray<Triple>) => triples.map(enhanceTriple(rules));
}
