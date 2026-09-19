const db = require('../config/db');

const columns = [
  { name: 'phone', type: 'VARCHAR(30) NULL' },
  { name: 'dob', type: 'VARCHAR(50) NULL' },
  { name: 'gender', type: "VARCHAR(20) NULL DEFAULT 'Male'" },
  { name: 'address', type: 'TEXT NULL' },
  { name: 'avatar', type: 'VARCHAR(255) NULL' },
];

async function updateSchema() {
  for (const col of columns) {
    await new Promise((resolve) => {
      db.query(`SHOW COLUMNS FROM users LIKE '${col.name}'`, (err, rows) => {
        if (rows && rows.length > 0) {
          console.log(`Column ${col.name} already exists`);
          resolve();
        } else {
          db.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err2) => {
            if (err2) console.error(`Error adding ${col.name}:`, err2.message);
            else console.log(`Added column ${col.name}`);
            resolve();
          });
        }
      });
    });
  }

  db.query('DESCRIBE users', (err, results) => {
    console.log('Updated users schema:');
    console.table(results);
    process.exit(0);
  });
}

updateSchema();
