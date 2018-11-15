const enum Literal {
  Str = 'string',
  Localized = 'localized',
  Int = 'integer',
  Float = 'float',
  Bool = 'boolean',
  DateTime = 'datetime',
  Date = 'date',
  AnyURI = 'uri',
  IRI = 'iri',
  Unknown = 'unknown'
}

const toLiteral = (value: string): Literal => {
  switch (value) {
    case 'string':
      return Literal.Str;
    case 'localized':
      return Literal.Localized;
    case 'integer':
      return Literal.Int;
    case 'float':
      return Literal.Float;
    case 'boolean':
      return Literal.Bool;
    case 'datetime':
      return Literal.DateTime;
    case 'date':
      return Literal.Date;
    case 'uri':
      return Literal.AnyURI;
    case 'iri':
      return Literal.IRI;
    default:
      return Literal.Unknown;
  }
};

const toDatatype = (value: Literal): string => {
  switch (value) {
    case Literal.Str:
      return 'http://www.w3.org/2001/XMLSchema#string';
    case Literal.Localized:
      return 'unknown';
    case Literal.Int:
      return 'http://www.w3.org/2001/XMLSchema#integer';
    case Literal.Float:
      return 'http://www.w3.org/2001/XMLSchema#float';
    case Literal.Bool:
      return 'http://www.w3.org/2001/XMLSchema#boolean';
    case Literal.DateTime:
      return 'http://www.w3.org/2001/XMLSchema#dateTime';
    case Literal.Date:
      return 'http://www.w3.org/2001/XMLSchema#date';
    case Literal.AnyURI:
      return 'http://www.w3.org/2001/XMLSchema#anyURI';
    case Literal.IRI:
      return 'unknown';
    default:
      return 'unknown';
  }
};

const toDatatypeValue = (literal: Literal, value: string) =>
  `"${value}"^^<${toDatatype(literal)}>`;

export { Literal, toDatatypeValue, toDatatype, toLiteral };
