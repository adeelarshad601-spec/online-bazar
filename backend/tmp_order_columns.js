const { Client } = require('pg');
const c = new Client({connectionString:'postgresql://postgres:pak12345@localhost:5432/online_bazar'});
(async () => {
  try {
    await c.connect();
    const res = await c.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'Order' ORDER BY ordinal_position;");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
