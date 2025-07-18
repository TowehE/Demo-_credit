import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.string('id', 36).primary();
    table.string('reference', 100).unique().notNullable();
    table.string('user_id', 36).notNullable();
    table.string('wallet_id', 36).notNullable();
    table.enu('type', ['CREDIT', 'DEBIT']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.text('description').nullable();
    table.enu('status', ['PENDING', 'COMPLETED', 'FAILED']).defaultTo('PENDING');
    table.json('metadata').nullable();
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('wallet_id').references('id').inTable('wallets').onDelete('CASCADE');

    // Indexes
    table.index(['user_id']);
    table.index(['wallet_id']);
    table.index(['reference']);
    table.index(['status']);
    table.index(['type']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
