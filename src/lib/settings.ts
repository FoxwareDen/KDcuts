import { client, type MetaData } from "./db";


export interface Service {
  service: string,
  description: string,
  price: number
}
export type ServiceResponse = {} & Service & MetaData;

export async function getServices(): Promise<ServiceResponse[] | null> {
  try {
    const { data, error } = await client.from("services").select("*");

    if (error) throw error;

    return data as ServiceResponse[];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addService(service: string, description: string, price: number): Promise<boolean> {
  try {
    const { error } = await client.from("services").insert({ service, price, description });

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
