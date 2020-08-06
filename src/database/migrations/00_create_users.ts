import Knex from 'knex';
// knexjs.org para documentação

export async function up(knex: Knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('avatar').notNullable();
        table.string('whastapp').notNullable();
        table.string('bio').notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('users');
}