const { Client } = require('pg');
const c = new Client({connectionString:'postgresql://postgres:pak12345@localhost:5432/online_bazar'});
(async () => {
  try {
    await c.connect();
    const tables = ['Order', 'VendorOrder', 'OrderItem', 'Payment'];
    for (const table of tables) {
      const res = await c.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position;",
        [table]
      );
      console.log('TABLE:', table);
      console.log(JSON.stringify(res.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
