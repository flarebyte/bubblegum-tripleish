import test from 'ava';
import { deflateCurie, inflateCurie } from './curie';

const prefixes: ReadonlyArray<any> = [
  ['ui', 'http://mysite.com/ui/'],
  ['app', 'http://mysite.com/app/'],
  ['ui1', 'http://mysite.com/ui1/'],
  ['ui2', 'http://mysite.com/ui2/'],
  ['ui3', 'http://mysite.com/ui3/']
];

test('inflateCurie should expand curie to url', t => {
  t.deepEqual(
    inflateCurie(prefixes, 'ui2:whatever/ui2:cool'),
    '<http://mysite.com/ui2/whatever/ui2:cool>'
  );
});

test('inflateCurie should expand curie absent from rule', t => {
  t.deepEqual(
    inflateCurie(prefixes, 'ui4:whatever/ui:cool'),
    '<ui4:whatever/ui:cool>'
  );
});

test('deflateCurie should deflate the curie from url', t => {
  t.deepEqual(
    deflateCurie(prefixes, 'http://mysite.com/ui2/whatever/ui2:cool'),
    'ui2:whatever/ui2:cool'
  );
});
