import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let moviesDb: Database | null = null;
let ratingsDb: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!moviesDb) {
    const dbPath = path.join(__dirname, '../db/movies.db');
    console.log('Trying to open movies DB:', dbPath);
    try {
      moviesDb = await open({
        filename: dbPath,
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE,
      });
      console.log('Movies DB opened successfully!');
    } catch (err) {
      console.error('Failed to open movies DB:', err);
      throw err;
    }
  }
  return moviesDb;
}

export async function getRatingsDb(): Promise<Database> {
  if (!ratingsDb) {
    const dbPath = path.join(__dirname, '../db/ratings.db');
    console.log('Trying to open ratings DB:', dbPath);
    try {
      ratingsDb = await open({
        filename: dbPath,
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READONLY,
      });
      console.log('Ratings DB opened successfully!');
    } catch (err) {
      console.error('Failed to open ratings DB:', err);
      throw err;
    }
  }
  return ratingsDb;
}