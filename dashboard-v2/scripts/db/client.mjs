import pg from 'pg';

const normalizeDbUrl = (value) => {
  if (!value) return value;
  // Keep compatibility with providers that still append these params.
  let next = value
    .replace('&channel_binding=require', '')
    .replace('?channel_binding=require&', '?')
    .replace('?channel_binding=require', '');

  if (next.includes('sslmode=require') && !next.includes('uselibpqcompat=')) {
    next += next.includes('?') ? '&uselibpqcompat=true' : '?uselibpqcompat=true';
  }
  return next;
};

const pool = new pg.Pool({
  connectionString: normalizeDbUrl(process.env.DATABASE_URL),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

function sql(strings, ...values) {
  const text = strings.reduce((acc, part, i) => {
    const next = i < values.length ? `$${i + 1}` : '';
    return `${acc}${part}${next}`;
  }, '');
  return pool.query(text, values).then((res) => res.rows);
}

export default sql;
