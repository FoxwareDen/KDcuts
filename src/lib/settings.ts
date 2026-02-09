import { client, type MetaData } from "./db";


export interface Service {
  service: string,
  price: number
}

export async function getServices(): Promise<Service & MetaData[] | null> {
  try {
    const { data, error } = await client.from("services").select("*");

    if (error) throw error;

    return data as Service & MetaData[];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addService(service: string, price: number): Promise<boolean> {
  try {
    const { error } = await client.from("services").insert({ service, price })

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}


export async function deleteService(id: number): Promise<boolean> {
  try {
    const { error } = await client.from("services").delete().eq("id", id)

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
