/**
 * Represents permission Scope Values.
 */
export declare enum PermissionScopeValues {
    /**
     * Values which set permission Scope applicable to control plane related operations.
     */
    ScopeAccountReadValue = 1,
    ScopeAccountListDatabasesValue = 2,
    ScopeDatabaseReadValue = 4,
    ScopeDatabaseReadOfferValue = 8,
    ScopeDatabaseListContainerValue = 16,
    ScopeContainerReadValue = 32,
    ScopeContainerReadOfferValue = 64,
    ScopeAccountCreateDatabasesValue = 1,
    ScopeAccountDeleteDatabasesValue = 2,
    ScopeDatabaseDeleteValue = 4,
    ScopeDatabaseReplaceOfferValue = 8,
    ScopeDatabaseCreateContainerValue = 16,
    ScopeDatabaseDeleteContainerValue = 32,
    ScopeContainerReplaceValue = 64,
    ScopeContainerDeleteValue = 128,
    ScopeContainerReplaceOfferValue = 256,
    ScopeAccountReadAllAccessValue = 65535,
    ScopeDatabaseReadAllAccessValue = 124,
    ScopeContainersReadAllAccessValue = 96,
    ScopeAccountWriteAllAccessValue = 65535,
    ScopeDatabaseWriteAllAccessValue = 508,
    ScopeContainersWriteAllAccessValue = 448,
    /**
     * Values which set permission Scope applicable to data plane related operations.
     */
    ScopeContainerExecuteQueriesValue = 1,
    ScopeContainerReadFeedsValue = 2,
    ScopeContainerReadStoredProceduresValue = 4,
    ScopeContainerReadUserDefinedFunctionsValue = 8,
    ScopeContainerReadTriggersValue = 16,
    ScopeContainerReadConflictsValue = 32,
    ScopeItemReadValue = 64,
    ScopeStoredProcedureReadValue = 128,
    ScopeUserDefinedFunctionReadValue = 256,
    ScopeTriggerReadValue = 512,
    ScopeContainerCreateItemsValue = 1,
    ScopeContainerReplaceItemsValue = 2,
    ScopeContainerUpsertItemsValue = 4,
    ScopeContainerDeleteItemsValue = 8,
    ScopeContainerCreateStoredProceduresValue = 16,
    ScopeContainerReplaceStoredProceduresValue = 32,
    ScopeContainerDeleteStoredProceduresValue = 64,
    ScopeContainerExecuteStoredProceduresValue = 128,
    ScopeContainerCreateTriggersValue = 256,
    ScopeContainerReplaceTriggersValue = 512,
    ScopeContainerDeleteTriggersValue = 1024,
    ScopeContainerCreateUserDefinedFunctionsValue = 2048,
    ScopeContainerReplaceUserDefinedFunctionsValue = 4096,
    ScopeContainerDeleteUserDefinedFunctionSValue = 8192,
    ScopeContainerDeleteCONFLICTSValue = 16384,
    ScopeItemReplaceValue = 65536,
    ScopeItemUpsertValue = 131072,
    ScopeItemDeleteValue = 262144,
    ScopeStoredProcedureReplaceValue = 1048576,
    ScopeStoredProcedureDeleteValue = 2097152,
    ScopeStoredProcedureExecuteValue = 4194304,
    ScopeUserDefinedFunctionReplaceValue = 8388608,
    ScopeUserDefinedFunctionDeleteValue = 16777216,
    ScopeTriggerReplaceValue = 33554432,
    ScopeTriggerDeleteValue = 67108864,
    ScopeContainerReadAllAccessValue = 4294967295,
    ScopeItemReadAllAccessValue = 65,
    ScopeContainerWriteAllAccessValue = 4294967295,
    ScopeItemWriteAllAccessValue = 458767,
    NoneValue = 0
}
//# sourceMappingURL=PermissionScopeValues.d.ts.map