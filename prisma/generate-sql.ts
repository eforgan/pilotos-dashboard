import * as fs from 'fs';
import * as path from 'path';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'pilots.json');
const pilots = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let sql = '';

for (const p of pilots) {
  const id = p.id || `pilot-${Math.random().toString(36).substr(2, 9)}`;
  const values = [
    `'${id}'`,
    `'${p.PILOTO}'`,
    `'${p.TELEFONO}'`,
    `'${p.DNI}'`,
    `'${p.FECHA_NAC}'`,
    `'${p.LICENCIA}'`,
    `'${p.CMA}'`,
    `'${p.AW109}'`,
    `'${p.BO105}'`,
    `'${p.CONTROL_BIENAL}'`,
    `'${p.INSP_RECONOC}'`,
    `'${p.SIMULADOR}'`,
    `'${p.CTRL_IDONEIDAD}'`,
    `'${p.CTRL_RUTA}'`,
    `'${p.CTRL_VLO_INST}'`,
    `'${p.EXP_RECIENTE}'`,
    `'${p.ULT_FOLIADO}'`,
    `'${p.CRM_FFHH}'`,
    `'${p.MERC_PELIGROSAS}'`,
    `'${p.INTERF_ILICITA}'`,
    `'${p.MOE}'`,
    `'${p.SMS}'`,
    `'${p.CURSO_AERONAVE}'`,
    `'${p.VACACIONES}'`,
    `'${p.INSP_IR}'`,
    `'${p.BASE}'`,
    `'${p.HUET}'`,
    `'${p.RO}'`,
    'CURRENT_TIMESTAMP',
    'CURRENT_TIMESTAMP'
  ].join(', ');

  sql += `INSERT INTO "Pilot" ("id", "PILOTO", "TELEFONO", "DNI", "FECHA_NAC", "LICENCIA", "CMA", "AW109", "BO105", "CONTROL_BIENAL", "INSP_RECONOC", "SIMULADOR", "CTRL_IDONEIDAD", "CTRL_RUTA", "CTRL_VLO_INST", "EXP_RECIENTE", "ULT_FOLIADO", "CRM_FFHH", "MERC_PELIGROSAS", "INTERF_ILICITA", "MOE", "SMS", "CURSO_AERONAVE", "VACACIONES", "INSP_IR", "BASE", "HUET", "RO", "createdAt", "updatedAt") VALUES (${values}) ON CONFLICT ("DNI") DO NOTHING;\n`;
}

// Add Admin User (Password is 'adminpassword123' bcrypt hash)
const adminEmail = 'admin@empresa.com';
const adminHash = '$2a$10$7Z25R/2G2.6.2.6.2.6.2.6.2.6.2.6.2.6.2.6.2.6.2.6'; // Simplified mock hash
sql += `INSERT INTO "User" ("id", "email", "password", "role", "createdAt", "updatedAt") VALUES ('admin-1', '${adminEmail}', '${adminHash}', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ("email") DO NOTHING;\n`;

fs.writeFileSync(path.join(process.cwd(), 'prisma', 'seed.sql'), sql);
console.log('SQL Seed generated successfully in prisma/seed.sql');
