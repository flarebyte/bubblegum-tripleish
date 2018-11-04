const enum Literal {
  Str = 'string',
  Int = 'integer',
  Number = 'number',
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
    case 'integer':
      return Literal.Int;
    case 'number':
      return Literal.Number;
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

export { Literal, toLiteral };
