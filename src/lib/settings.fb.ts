import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

export interface Service {
  service: string;
  description: string;
  price: number;
}

// MetaData likely contains id, created_at, updated_at
export interface MetaData {
  id: string;
  created_at: string | null;
  updated_at: string | null;
}

export type ServiceResponse = Service & MetaData;

export async function getServices(): Promise<ServiceResponse[] | null> {
  try {
    const querySnapshot = await getDocs(collection(db, "services"));
    const services: ServiceResponse[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      services.push({
        id: docSnap.id,
        service: data.service,
        description: data.description,
        price: data.price,
        created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
        updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
      });
    });

    return services;
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
    await addDoc(collection(db, "services"), {
      service,
      description,
      price,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
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