import {
    TableClient,
    TableServiceClient,
    TablesSharedKeyCredential
} from '@azure/data-tables';


import * as I from './types';
import * as C from './const';

export class AzureDataTablesClient {

    authentication_method:string;

    constructor( props:I.constructorProps={} ) {

        this.authentication_method = props.method || C.default_authentication_method;
    }

    service_client():TableServiceClient {

        try {
            switch(this.authentication_method){
                case 'sharedKeyCredential':
                    return this._clientBySharedKeyCredential({type:'service'}) as TableServiceClient;
                default:
                    throw `unknown authentication method ${this.authentication_method}`;
            }
        }
        catch( err ) {
            throw `AzureDataTablesClient::service_client has failed - ${err.message}`;
        }
    }

    async table_client(props:I.tableClientProps):Promise<TableClient> {

        try {

            const {
                table
            } = props;

            let {
                create_table
            } = props;

            let client:TableClient;
            let serviceclient:TableServiceClient;

            create_table = create_table === undefined ? true : create_table;

            switch(this.authentication_method){
                
                case 'sharedKeyCredential':
                    client = this._clientBySharedKeyCredential({type:'table', table}) as TableClient;
                    serviceclient = this._clientBySharedKeyCredential({type: 'service'}) as TableServiceClient;
                    break;

                default:
                    throw Error(`unknown authentication method ${this.authentication_method}`);
            }

            if(create_table)
                await serviceclient.createTable(table);

            return client;
        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::table_client has failed - ${err.message}`);
        }
    }

    /**
     * Check for the existence of a table
     * 
     * @param props the keyword argument object
     * @param props.table the table name 
     * @returns true when the table exists
     */
    async exists(props:I.existsProps):Promise<boolean> {

        try {

            const {
                table
            } = props;
            
            const client:TableServiceClient = this.service_client();
            const tables = await client.listTables();
            console.log('---')
            return true;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::exists has failed - ${err.message}`)
        }
    }

    /**
     * Drop a table
     */
    async drop(props:I.dropProps):Promise<boolean> {

        try {

            const {
                table
            } = props;

            const client:TableServiceClient = this.service_client();
            await client.deleteTable(table);
            return true;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::drop has failed - ${err.message}`);
        }
    }

    /**
     * Empty a table
     */
    async empty() {

        throw Error(`AzureDataTablesClient::empty is unimplemented`);
    }

    /**
     * Remove a row by Parition and Row Key
     */
    async remove(){

        throw Error(`AzureDataTablesClient::remove is unimplemented`);
    }

    async rows(props:I.rowsProps) {

    }

    private _clientBySharedKeyCredential(props:I._clientBySharedKeyCredentialProps):TableServiceClient|TableClient {

        const {
            type,
            table
        } = props;

        if(type === 'table' && !Boolean(table))
            throw `clientBySharedKeyCredential requires table be argued for table client`;

        const required_keys = [
            "AZURE_STORAGE_ACCOUNT",
            "AZURE_STORAGE_ACCOUNT_KEY"
        ];

        for(const key of required_keys) {
            if(typeof process.env[key] !== 'string' || process.env[key].length === 0)
                throw `missing environment key ${key}`
        }

        const {
            AZURE_STORAGE_ACCOUNT,
            AZURE_STORAGE_ACCOUNT_KEY
        } = process.env;

        const credential = new TablesSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCOUNT_KEY);

        const url = `https:${AZURE_STORAGE_ACCOUNT}.table.core.windows.net`;

        switch(type) {
            case 'service':
                return new TableServiceClient(url, credential);
            case 'table':
                return new TableClient(url, table, credential);
        }

    }

    valid_environment() {

    }



}