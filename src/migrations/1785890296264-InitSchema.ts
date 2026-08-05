import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1785890296264 implements MigrationInterface {
    name = 'InitSchema1785890296264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "intentos" ("id_intento" SERIAL NOT NULL, "Tiempo" integer NOT NULL, "Dificultad" integer NOT NULL, "Puntos" integer NOT NULL, "Emocion" integer NOT NULL, "Monedas" integer NOT NULL, "Numero_de_intento" integer NOT NULL, "Operacion" character varying, "Fecha" TIMESTAMP NOT NULL DEFAULT now(), "Discenteid_discente" integer, CONSTRAINT "PK_9946505725e906f373332bc64bc" PRIMARY KEY ("id_intento"))`);
        await queryRunner.query(`CREATE TABLE "discente" ("id_discente" SERIAL NOT NULL, "Nombre_Discente" character varying(255) NOT NULL, "Apellido_Paterno_Discente" character varying(255) NOT NULL, "Apellido_Materno_Discente" character varying(255) NOT NULL, "Activo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_6d51ea9b12c547b02853af790c5" PRIMARY KEY ("id_discente"))`);
        await queryRunner.query(`CREATE TABLE "grupos" ("id_grupo" SERIAL NOT NULL, "Nombre_Grupo" character varying(255) NOT NULL, "Año" integer NOT NULL, "Grado" integer NOT NULL, "Docenteid_docente" integer, CONSTRAINT "PK_e76d6dc78127fb54c1922c120f5" PRIMARY KEY ("id_grupo"))`);
        await queryRunner.query(`CREATE TABLE "docentes" ("id_docente" SERIAL NOT NULL, "Nombre_Docente" character varying(255) NOT NULL, "Apellido_Paterno_Docente" character varying(255) NOT NULL, "Apellido_Materno_Docente" character varying(255) NOT NULL, "Password" character varying(255) NOT NULL, "Usuario" character varying(255) NOT NULL, CONSTRAINT "PK_178349aff786cd23c38f6b55369" PRIMARY KEY ("id_docente"))`);
        await queryRunner.query(`CREATE TABLE "Discente_Grupo" ("Discenteid_discente" integer NOT NULL, "Grupoid_grupo" integer NOT NULL, CONSTRAINT "PK_8dd96bb783f31295ddfea0d5531" PRIMARY KEY ("Discenteid_discente", "Grupoid_grupo"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7ae8cdb7d7591705bcf8d4351e" ON "Discente_Grupo" ("Discenteid_discente") `);
        await queryRunner.query(`CREATE INDEX "IDX_7628343bdef18e32e25895f9b2" ON "Discente_Grupo" ("Grupoid_grupo") `);
        await queryRunner.query(`ALTER TABLE "intentos" ADD CONSTRAINT "FK_484e69eef0fd500ab9a64f2ae49" FOREIGN KEY ("Discenteid_discente") REFERENCES "discente"("id_discente") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grupos" ADD CONSTRAINT "FK_2e83f3466b4fef2cd1a3220daf5" FOREIGN KEY ("Docenteid_docente") REFERENCES "docentes"("id_docente") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Discente_Grupo" ADD CONSTRAINT "FK_7ae8cdb7d7591705bcf8d4351e1" FOREIGN KEY ("Discenteid_discente") REFERENCES "discente"("id_discente") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "Discente_Grupo" ADD CONSTRAINT "FK_7628343bdef18e32e25895f9b2e" FOREIGN KEY ("Grupoid_grupo") REFERENCES "grupos"("id_grupo") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Discente_Grupo" DROP CONSTRAINT "FK_7628343bdef18e32e25895f9b2e"`);
        await queryRunner.query(`ALTER TABLE "Discente_Grupo" DROP CONSTRAINT "FK_7ae8cdb7d7591705bcf8d4351e1"`);
        await queryRunner.query(`ALTER TABLE "grupos" DROP CONSTRAINT "FK_2e83f3466b4fef2cd1a3220daf5"`);
        await queryRunner.query(`ALTER TABLE "intentos" DROP CONSTRAINT "FK_484e69eef0fd500ab9a64f2ae49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7628343bdef18e32e25895f9b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ae8cdb7d7591705bcf8d4351e"`);
        await queryRunner.query(`DROP TABLE "Discente_Grupo"`);
        await queryRunner.query(`DROP TABLE "docentes"`);
        await queryRunner.query(`DROP TABLE "grupos"`);
        await queryRunner.query(`DROP TABLE "discente"`);
        await queryRunner.query(`DROP TABLE "intentos"`);
    }

}
