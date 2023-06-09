import { CosmosHeaders } from "../../queryExecutionContext";
import { ResourceResponse } from "../../request/ResourceResponse";
import { Resource } from "../Resource";
import { Database } from "./Database";
import { DatabaseDefinition } from "./DatabaseDefinition";
/** Response object for Database operations */
export declare class DatabaseResponse extends ResourceResponse<DatabaseDefinition & Resource> {
    constructor(resource: DatabaseDefinition & Resource, headers: CosmosHeaders, statusCode: number, database: Database);
    /** A reference to the {@link Database} that the returned {@link DatabaseDefinition} corresponds to. */
    readonly database: Database;
}
//# sourceMappingURL=DatabaseResponse.d.ts.map