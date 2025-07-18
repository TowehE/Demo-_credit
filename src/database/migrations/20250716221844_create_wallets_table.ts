import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.string('id', 36).primary();
    table.string('email', 255).unique().notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).nullable();
    table.string('account_number', 20).notNullable().unique();
    table.boolean('karma_is_blacklisted').defaultTo(false);
    table.timestamps(true, true); 

    // Indexes
    table.index(['email']);
    table.index(['karma_is_blacklisted']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
