import { neon } from "@neondatabase/serverless";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const applyChanges = process.argv.includes("--apply");
const neonUrl = process.env.NEON_DATABASE_URL;
const projectId =
  process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;

if (!neonUrl) {
  throw new Error("NEON_DATABASE_URL must be set to a Neon PostgreSQL connection string.");
}

if (!projectId) {
  throw new Error("FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID must be set.");
}

const sql = neon(neonUrl);
initializeApp({
  credential: applicationDefault(),
  projectId,
});
const firestore = getFirestore();

const sources = [
  {
    table: "bookings",
    collection: "bookings",
    fetch: () => sql`SELECT * FROM public.bookings`,
  },
  {
    table: "booking_data",
    collection: "bookings_clients",
    fetch: () => sql`SELECT * FROM public.booking_data`,
  },
  {
    table: "services",
    collection: "services",
    fetch: () => sql`SELECT * FROM public.services`,
  },
  {
    table: "calendar",
    collection: "calendar",
    fetch: () => sql`SELECT * FROM public.calendar`,
  },
  {
    table: "config",
    collection: "config",
    fetch: () => sql`SELECT * FROM public.config`,
  },
];

function toFirestoreValue(value) {
  if (typeof value === "bigint") return value.toString();
  if (value === null || value === undefined || value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) {
    return value.map((item) => item === undefined ? null : toFirestoreValue(item));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, toFirestoreValue(item)])
    );
  }
  return value;
}

function documentId(table, row) {
  if (table === "config") return "1";
  if (row.id === null || row.id === undefined) {
    throw new Error(`A row in ${table} has no id; refusing to generate an unstable document ID.`);
  }

  const id = String(row.id);
  if (!id || id.includes("/")) {
    throw new Error(`A row in ${table} has an invalid Firestore document ID.`);
  }
  return id;
}

function convertRow(table, row) {
  const data = { ...row };

  if (table === "config") {
    const config = {
      slotDuration: row.slotduration ?? row.slot_duration ?? row.slotDuration,
      bufferMinutes: row.bufferminutes ?? row.buffer_minutes ?? row.bufferMinutes,
      minAdvanceDays: row.minadvancedays ?? row.min_advance_days ?? row.minAdvanceDays,
      maxAdvanceMonths:
        row.maxadvancemonths ?? row.max_advance_months ?? row.maxAdvanceMonths,
      businessStartHour:
        row.businessstarthour ?? row.business_start_hour ?? row.businessStartHour,
      businessEndHour:
        row.businessendhour ?? row.business_end_hour ?? row.businessEndHour,
    };
    return Object.fromEntries(
      Object.entries(config).filter(([, value]) => value !== undefined)
    );
  }

  if (data.id !== undefined) data.id = String(data.id);
  if (table === "booking_data" && data.booking_id !== undefined) {
    data.booking_id = String(data.booking_id);
  }

  return toFirestoreValue(data);
}

async function migrateSource(source) {
  let rows;
  try {
    rows = await source.fetch();
  } catch (error) {
    if (error?.code === "42P01") {
      console.log(`Skipping public.${source.table}: table does not exist.`);
      return;
    }
    throw new Error(`Failed to read public.${source.table}.`, { cause: error });
  }

  if (source.table === "config" && rows.length > 1) {
    throw new Error(
      `public.config has ${rows.length} rows, but Firebase uses one config/1 document.`
    );
  }

  const documents = rows.map((row) => ({
    id: documentId(source.table, row),
    data: convertRow(source.table, row),
  }));

  console.log(
    `${applyChanges ? "Migrating" : "Would migrate"} ${documents.length} ` +
      `rows from public.${source.table} to ${source.collection}.`
  );

  if (!applyChanges) return;

  const target = firestore.collection(source.collection);
  for (let offset = 0; offset < documents.length; offset += 400) {
    const batch = firestore.batch();
    for (const item of documents.slice(offset, offset + 400)) {
      batch.set(target.doc(item.id), item.data, { merge: true });
    }
    await batch.commit();
  }
}

async function main() {
  console.log(
    applyChanges
      ? `Writing data to Firebase project ${projectId}. Existing matching documents will be merged.`
      : `Dry run for Firebase project ${projectId}; pass --apply to write data.`
  );

  for (const source of sources) {
    await migrateSource(source);
  }

  console.log(applyChanges ? "Migration complete." : "Dry run complete; no Firebase data was changed.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
