export interface constructorProps {
    method?: 'sharedKeyCredential';
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
    reduce?: Function;
    find?: Function;
    initial?: any;
}

export interface rowProps {
    table: string;
    partitionKey: string;
    rowKey: string;
}