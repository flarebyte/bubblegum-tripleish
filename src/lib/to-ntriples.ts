import { Triple } from 'ntriples-collection';
import { Rules } from './rules';

type TripleTransform = (triple: Triple) => Triple;

export function enhanceTriple(rules: Rules): TripleTransform {
  return (t: Triple) => t;
}
export function enhanceTriples(rules: Rules, triples: ReadonlyArray<Triple>): ReadonlyArray<Triple> {
  return triples.map(enhanceTriple(rules));
}
