import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, type MetaData } from "./db.fb";

export interface Service {
  service: string;
  description: string;
  price: number;
}

export type ServiceResponse = Service & MetaData; // MetaData.id is now string

// ─── Helpers ──────────────────────────────────────────────────────────────────

const servicesCol = () => collection(db, "services");

function docToService(id: string, d: Record<string, any>): ServiceResponse {
  return {
    id,
    created_at:  d.created_at ?? "",
    service:     d.service,
    description: d.description,
    price:       d.price,
  };
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function getServices(): Promise<ServiceResponse[] | null> {
  try {
    const snap = await getDocs(servicesCol());
    return snap.docs.map((d) => docToService(d.id, d.data()));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addService(
  service: string,
  description: string,
  price: number
): Promise<boolean> {
  try {
    await addDoc(servicesCol(), {
      service,
      description,
      price,
      created_at: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteService(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "services", id));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}