interface GLOBAL_ENVIRONMENT_VARIABLES {
    AZURE_STORAGE_ACCOUNT: string;
    AZURE_STORAGE_ACCOUNT_KEY?: string;
}

export interface INSTANCE_ENVIRONMENT_VARIABLES {
    AZURE_STORAGE_ACCOUNT?: string;
    AZURE_STORAGE_ACCOUNT_KEY?: string;
}

export interface constructorProps {
    method?: 'sharedKeyCredential';
    global_keys?: GLOBAL_ENVIRONMENT_VARIABLES
    AZURE_STORAGE_ACCOUNT?: string;
    AZURE_STORAGE_ACCOUNT_KEY?: string;
}

export interface _clientBySharedKeyCredentialProps {
    type: 'service'|'table';
    table?: string;
}

export interface tableClientProps {
    table: string;
    create_table?: boolean;
}

export interface dropProps {
    table: string;
}

export interface existsProps {
    table: string;
}

export interface rowsProps {
    table: string;
    limit?: number;
    fields?: Array<string>;
}

export interface emptyProps {
    table: string;
}

export interface rowProps {
    table: string;
    partitionKey: string;
    rowKey: string;
}

export interface findProps {
    table: string;
    fn: Function;
}

export interface countProps {
    table: string;
}

export interface reduceProps {
    table: string;
    fn: Function;
    initial: any;
}

export interface filterProps {
    table: string;
    fn: Function;
}

export interface azCreateEntitiesProps {
    table: string;
    data: any;
    partition: string|Function
    row: string|Function
    dropKeys: boolean
}

export interface _insertAsRecordsProps extends azCreateEntitiesProps {
    data: Array<record>;
}

export interface persistProps {
    table: string;
    data: any;
    partition: string|Function
    row: string|Function
    datatype?: 'records'
    forceDrop?: boolean
    dropKeys?: boolean
}

export interface record {
    [key: string]: string|number;
}

export interface _binDataProps {
    data: Array<record>
}

export interface dataSpool {
    [key:string]: dataSpoolBin
}

export interface dataSpoolBin {
    currentBinIdx: number
    bins: Array<Array<record>>
}