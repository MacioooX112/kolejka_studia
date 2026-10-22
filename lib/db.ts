import "server-only"
import { Pool, QueryResult, QueryResultRow} from "pg"

declare global{
    var pgPool: Pool | undefined

    namespace NodeJS {
        interface ProcessENV{
            DB_HOST: string;
            DB_NAME: string;
            DB_USER: string;
            DB_PASSWORD: string;
            DB_PORT?: number;
            DB_CA_CERTIFICATE?: string;
        }
        interface Global {
            pgPool?: Pool;
        }
    }
}

interface Database {
    query <T extends QueryResultRow = any>(
        text: string,
        params?: any[],
    ): Promise<QueryResult<T>>;
    getPool(): Pool;
    end(): Promise<void>;
}

const poolConfig = {
    max: 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT as number | undefined,
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } // Możesz tu dać true, jeśli na prod wgrasz certyfikat CA
        : false,
}

const getPool = (): Pool => {
    if(!global.pgPool){
        global.pgPool = new Pool(poolConfig);
        global.pgPool.on("error", (err) => {
            console.error("Unexpected error on idle client", err)
            process.exit(-1);
        })
    }
    return global.pgPool;
}

const db: Database = {
    query: <T extends QueryResultRow = any>(
        text: string,
        params?: any[],
    ): Promise<QueryResult<T>> => {
        const pool = getPool();
        return pool.query<T>(text, params)
    },
    getPool: (): Pool => {
        return getPool();
    },
    end: async (): Promise<void> => {
        if(global.pgPool){
            await global.pgPool.end();
            global.pgPool = undefined
        }
    }
};

export default db;