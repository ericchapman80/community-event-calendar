// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export function checkURL(testString) {
    return new URL(testString);
}
export function sanitizeEndpoint(url) {
    return new URL(url).href.replace(/\/$/, "");
}
//# sourceMappingURL=checkURL.js.map