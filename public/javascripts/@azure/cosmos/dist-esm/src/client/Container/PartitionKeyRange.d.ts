/**
 * @hidden
 */
export interface PartitionKeyRange {
    id: string;
    minInclusive: string;
    maxExclusive: string;
    ridPrefix: number;
    throughputFraction: number;
    status: string;
    parents: string[];
}
//# sourceMappingURL=PartitionKeyRange.d.ts.map