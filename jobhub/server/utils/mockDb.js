import fs from 'fs';
import path from 'path';
const DB_FILE = path.join(process.cwd(), 'jobhub_db.json');
// Default Seed Data
const getSeedData = () => {
    return { users: [], companies: [], jobs: [], applications: [] };
};
export const getDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        const defaultData = getSeedData();
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch (err) {
        const defaultData = getSeedData();
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
};
export const saveDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};
