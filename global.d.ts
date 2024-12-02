// global.d.ts
import mongoose from "mongoose";

declare global {
    namespace NodeJS {
        interface Global {
            mongoose: {
                conn: typeof mongoose | null;
                promise: Promise<typeof mongoose> | null;
            };
        }
    }
}