import { Client, createClient } from '@libsql/client/http';
import OpenAI from 'openai';

export function tursoClient(): Client {
    // Debug logs
    console.log("Environment variables:");
    console.log("TURSO_DB_URL:", process.env.TURSO_DB_URL);
    console.log("TURSO_DB_AUTH_TOKEN length:", process.env.TURSO_DB_AUTH_TOKEN?.length);
    
    const url = process.env.TURSO_DB_URL?.trim();
    if (url == undefined) {
        throw new Error("TURSO_DB_URL is not set");
    }

    const authToken = process.env.TURSO_DB_AUTH_TOKEN?.trim();
    if (authToken == undefined) {
        throw new Error("TURSO_DB_AUTH_TOKEN is not set");
    }

    return createClient({ url, authToken });
}

export async function createEmbeddings(input: string | Array<string>) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input
    });
    return response.data.map((item: any) => item.embedding)
}