// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/auth.db3',
    },
    useNullAsDefault: true
  },
  pool: {
    afterCreate: (conn, done) => {
      conn.run('PRAGMA foreign_keys = ON', done);
    },
  },
    migrations: {
      filename: './database/migrations'
    },

    seeds: {
      directory: './database/seeds'
    }

};
