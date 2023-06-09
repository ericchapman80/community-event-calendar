// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { createHash } from "crypto";
export async function digest(str) {
    const hash = createHash("sha256");
    hash.update(str, "utf8");
    return hash.digest("hex");
}
//# sourceMappingURL=digest.js.map