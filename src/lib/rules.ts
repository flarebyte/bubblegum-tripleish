import Literal from './literal'

interface PredicateRule {
  readonly curie: string;
  readonly url: string;
  readonly isMany: boolean;
  readonly isLocalized: boolean;
  readonly literal: Literal
}

interface Rules{
  readonly language: string;
  readonly rules: Map<string, PredicateRule>
}

export { Rules };
