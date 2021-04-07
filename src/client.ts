import {
    TableClient,
    TableServiceClient,
    TablesSharedKeyCredential,
    ListTableEntitiesOptions
} from '@azure/data-tables';

import {
    config_keys,
    global_keys
} from './const';

import * as I from './types';
import * as C from './const';

export class AzureDataTablesClient {

    authentication_method:string;
    instance_keys:I.INSTANCE_ENVIRONMENT_VARIABLES = {};

    constructor( props:I.constructorProps={} ) {

        const {
            global_keys: argued_global_keys,
            AZURE_STORAGE_ACCOUNT,
            AZURE_STORAGE_ACCOUNT_KEY
        } = props;

        this.authentication_method = props.method || C.default_authentication_method;

        if(global_keys) {
            [
                'AZURE_STORAGE_ACCOUNT',
                'AZURE_STORAGE_ACCOUNT_KEY'
            ].forEach(key => {
                if(argued_global_keys && argued_global_keys.hasOwnProperty(key))
                    global_keys[key] = argued_global_keys[key]
            });
        }

        if(AZURE_STORAGE_ACCOUNT)
            this.instance_keys.AZURE_STORAGE_ACCOUNT = AZURE_STORAGE_ACCOUNT;
    }

    service_client():TableServiceClient {

        try {
            switch(this.authentication_method){
                case 'sharedKeyCredential':
                    return this._clientBySharedKeyCredential({type:'service'}) as TableServiceClient;
                default:
                    throw Error(`unknown authentication method ${this.authentication_method}`);
            }
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::service_client has failed - ${err.message}`);
        }
    }

    async table_client( props:I.tableClientProps ):Promise<TableClient> {

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
                    serviceclient = this._clientBySharedKeyCredential({type: 'service'}) as TableServiceClient;
                    client = this._clientBySharedKeyCredential({type:'table', table}) as TableClient;
                    break;

                default:
                    throw Error(`unknown authentication method ${this.authentication_method}`);
            }

            if(create_table && !(await this.exists({table}))) {
                try {
                    await serviceclient.createTable(table);

                } catch( err ) {

                    if(typeof err.message === 'string' && err.message.includes('TableBeingDeleted')) {
                        console.warn(`Table ${table} is currently queued for deletion, retry in 2 seconds`);
                        await new Promise(r => setTimeout(() => r(true), 2000));
                        client = await this.table_client(props);
                    }
                    else {
                        throw err;
                    }
                }
            }

            return client;

        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::table_client has failed - ${err.message}`);
        }
    }

    /**
     * List all available tables
     * 
     * @returns Array - a list of tables found for this configured service client
     */
    async tables( props={} ):Promise<Array<string>> {

        const client = this.service_client();
        const tables = client.listTables();
        let result = [];
        for await (const table of tables) {
            result.push(table.tableName)
        }
        return result;
    }

    /**
     * Check for the existence of a table
     * 
     * @param props the keyword argument object
     * @param props.table the table name 
     * 
     * @returns true when the table exists
     */
    async exists( props:I.existsProps ):Promise<boolean> {

        try {

            const {
                table
            } = props;
            
            if(!table || !table.length)
                throw Error('invalid table argued');


            const client:TableServiceClient = this.service_client();


            const tables = await client.listTables();
            for await (const tbl of tables) {
                if(tbl.tableName === table)
                    return true;
            }
            return false;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::exists has failed - ${err.message}`)
        }
    }

    /**
     * Essentially a check for a valid data source.
     * 
     * @param props the keyword argument object
     * @param props.table String the table name
     * 
     * @returns Promise resolving to boolean true if a table exists and is populated with at least one row. 
     */
    async existsAndHasData( props:I.existsAndHasDataProps ):Promise<boolean> {

        try {

            const exists = await this.exists(props);
            if(exists) {
                const empty = await this.isEmpty(props);
                return !empty;
            }

            return false
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::existsAndHasData has faileld - ${err.message}`);
        }
    }

    /**
     * create a table.
     * 
     * @param props the keyword argument object
     * @param props.table the table name
     * 
     * @returns Promise resolving in a boolean. True being the table was successfully created.
     */
    async create( props:I.createProps ):Promise<boolean> {

        try {

            const {
                table
            } = props;

            const client:TableServiceClient = this.service_client();
            await client.createTable(table);
            return true;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::drop has failed - ${err.message}`);
        }

    }

    /**
     * Drop a table
     * 
     * Due to Azure's operations queue, dropping a table makes the namespace inaccessible for ~45seconds to a minute. If you're
     * dropping the table to replace it or need access to the namespace quickly, use empty which will probably be faster up to
     * ~100,000 rows.
     * 
     * @param props Object the keyword object
     * @param props.table String the name of the table to drop
     * 
     * @returns Promise resolving true upon success.
     */
    async drop( props:I.dropProps ):Promise<boolean> {

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
     * 
     * This method can be useful when replacing a table entirely due to Azure's operation queue taking upwards of 45 seconds
     * at times until it can make a tablename available for common use.
     */
    async empty( props:I.emptyProps ):Promise<boolean> {

        try {
            const {
                table
            } = props;

            if(!table || !table.length)
                throw Error(`invalid keyword "table" argued`);

            const client = await this.table_client({table});

            let spool = {}

            for await (const entity of await client.listEntities()) {

                if(!spool.hasOwnProperty(entity.partitionKey)){
                    spool[entity.partitionKey] = {currentBinIdx: 0, bins: [[]]};
                }

                let currentBinIdx = spool[entity.partitionKey].currentBinIdx;
                if(spool[entity.partitionKey].bins[currentBinIdx].length > 99){
                    spool[entity.partitionKey].currentBinIdx++;
                    currentBinIdx = spool[entity.partitionKey].currentBinIdx;
                    spool[entity.partitionKey].bins.push([]);
                }
                spool[entity.partitionKey].bins[currentBinIdx].push(entity)

            }

            const batchStack = Object.keys(spool).reduce((acc, pk) => {
                const batches = spool[pk].bins.map(bin => {
                    const batch = client.createBatch(pk);
                    bin.forEach(entity => batch.deleteEntity(entity.partitionKey, entity.rowKey));
                    return batch;
                });
                acc = acc.concat(batches);
                return acc;
            }, []);

            await Promise.all(batchStack);
            
            await Promise.all(batchStack.map(exec => exec.submitBatch()));

            return false;
        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::empty has failed - ${err.message}`);
        }
    }

    /**
     * Check to see if a table has zero rows (it's empty)
     * 
     * @param props
     * @param props.table String the name of the table
     *  
     * @returns Promise resolving to a boolean which is true if the table has no rows. 
     */
    async isEmpty( props:I.isEmptyProps ):Promise<boolean> {

        try {
            const {
                table
            } = props;

            if(!table || !table.length)
                throw Error(`invalid keyword "table" argued`);

            const client = await this.table_client({table, create_table:false});

            //be great if either the top or take parameters were available to limit us to retrieviing
            //only 1 record as is the case with other languages.
            const options:ListTableEntitiesOptions = {
                queryOptions:{
                    select: ['partitionKey']
                }
            };

            let result = true;
            for await(const entity of client.listEntities(options)) {
                result = false;
                break;
            }

            return result;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::isEmpty has failed - ${err.message}`)
        }
    }

    /**
     * Remove a row by Parition and Row Key
     */
    async remove(){

        throw Error(`AzureDataTablesClient::remove is unimplemented`);
    }

    /**
     * Gather rows
     * 
     * @param props 
     */
    async rows( props:I.rowsProps ):Promise<Array<I.record>> {

        try {

            const {
                table,
                fields
            } = props;

            const client = await this.table_client({table});
            const options:ListTableEntitiesOptions = {queryOptions:{}};
            if(Array.isArray(fields) && fields.length) {
                options.queryOptions.select = fields;
            }

            const result = []
            for await(const entity of client.listEntities(options)) {
                result.push(entity);
            }

            return result;
        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::rows has failed - ${err.message}`);
        }
    }

    /**
     * Seek a single row in the table
     * 
     * @param props Object the keyword argument object
     * @param props.table String the table name
     * @param props.fn Function the finder function
     *  
     * @returns Promise<any> the resolved row or undefined if no row was found. 
     */
    public async find( props:I.findProps ):Promise<I.record> {

        try {

            const {
                table,
                fn
            } = props;

            const client = await this.table_client({table});

            for await(const entity of client.listEntities()) {
                if(fn(entity)) {
                    return entity;
                }
            }

            return undefined;

        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::find failed - ${err.message}`);
        }
    }

    /**
     * Reduce on rows.
     * 
     * @param props Object the keyword argument object
     * @param props.table String the table name
     * @param props.fn Function the reducer
     * @param props.initial Any the initial value for the reducer
     * 
     * @returns Promise<any> the reduced value
     */
    public async reduce( props:I.reduceProps ) {

        try {

            const {
                table,
                fn,
                initial
            } = props;

            let acc = JSON.parse(JSON.stringify(initial));

            const client = await this.table_client({table});
            let cnt = 0;
            for await(const entity of client.listEntities()) {
                acc = fn(acc, entity, cnt);
            }

            return acc;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::reduce has failed ${err.message}`);
        }
    }

    /**
     * Filter rows.
     * 
     * @param props Object the keyword argument object
     * @param props.table String the name of the table
     * @param props.fn Function the filter function @see Array.filter for the signature.
     * 
     * @returns 
     */
    public async filter( props:I.filterProps ) {

        try {

            const {
                table,
                fn
            } = props;

            const client = await this.table_client({table});
            const result = [];

            const options:ListTableEntitiesOptions = {}; 
            let cnt = 0;
            for await(const entity of client.listEntities()) {
                if(fn(entity, cnt)) {
                    result.push(entity);
                }
                cnt++;
            }

            return result;
        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::filter has failed - ${err.message}`);
        }
    }

    /**
     * Get the count of the rows.
     * 
     * @param props Object the keyword argument object
     * @param props.table String the table name 
     * 
     * @returns Promise<number> the number of rows 
     */
    public async count( props:I.countProps ):Promise<number> {

        try {

            const {
                table
            } = props;

            const client = await this.table_client({table});            
            const result = await this.rows({table, fields:["PartitionKey"]});
            return result.length;
        }
        catch( err ) {

            throw Error(`AzureDataTablesClient::count has failed - ${err.message}`);
        }

    }

    /**
     * Persist data to a table initially dropping/emptying the table if it exists leaving the table being a persisted
     * representation of the argued data.
     * 
     * Performance concern:
     * This method empties the table if it exists rather than dropping it and thus avoiding the 30 second queue in azure
     * which occurs upon table deletion. If the datatable is quite large it may be more optimal to actually drop the table
     * and suffer the 30 second wait. IF that sounds like you, argue "forceDrop": true to the method keyword argument.
     * 
     * @param props 
     */
    public async persist( props:I.persistProps ):Promise<boolean> {

        try {

            const {
                table,
                data,
                partition,
                row
            } = props;

            let {
                datatype,
                dropKeys,
                forceDrop
            } = props;

            datatype = datatype || 'records';
            forceDrop = forceDrop === undefined ? false : forceDrop;
            dropKeys = dropKeys === undefined ? false : dropKeys;

            //make sure we have a valid datatype
            const validDataTypes = [
                'records'
            ];
            if(!validDataTypes.includes(datatype))
                throw new Error(`unknown datatype ${datatype} argued`)

            //ensure a valid partition and row has been argued
            if(typeof partition !== 'function' && typeof partition !== 'string')
                throw new Error('invalid parition argued - expected a function or a string');
            if(typeof row !== 'function' && typeof row !== 'string')
                throw new Error('invalid row argued - expected a function or a string');

            //clean out any existance of the target tablespace
            const tableExists = await this.exists({table});
            if(tableExists) {
                if(forceDrop) {
                    await this.drop({table});
                    await this._waitUntilTableSpaceReady({table})
                }
                else {
                    await this.empty({table});
                }
            }

            switch(datatype)  {
                case 'records':
                    await this._insertAsRecords({table, data, partition, row, dropKeys});
                    break;
                default:
                    throw Error(`unimplmented handler for datatype ${datatype}`)
            }

            return true;
        }
        catch( err ) {
            throw Error(`AzureDataTablesClient::persist has failed - ${err.message}`);
        }

    }

    private async _insertAsRecords( props:I._insertAsRecordsProps ):Promise<any> {

        const {
            table,
            data,
            partition,
            row,
            dropKeys
        } = props;

        const resolvePartition = (record:I.record):string => {
            switch(typeof partition) {
                case 'function':
                    return partition(record);
                case 'string':
                    return record[partition] as string;
                default:
                    throw Error('invalid partition argued to _insertAsRecords');
            }
        }

        const resolveRow = (record:I.record):string => {
            switch(typeof row) {
                case 'function':
                    return row(record);
                case 'string':
                    return record[row] as string;
                default:
                    throw Error('invalid row argued to _insertAsRecords');
            }
        }

        //typescript's reduce is broken.. thus the <any> @see https://github.com/microsoft/TypeScript/issues/21061
        const binned = data.reduce<any>((spool, record) => {

            record = Object.assign({}, record);
            record.partitionKey = resolvePartition(record);
            record.rowKey = resolveRow(record);

            if(dropKeys && typeof partition === 'string') {
                delete record[partition];
            }
            if(dropKeys && typeof row === 'string') {
                delete record[row];
            }

            if(!spool.hasOwnProperty(record.partitionKey)){
                spool[record.partitionKey] = {currentBinIdx: 0, bins: [[]]};
            }

            let currentBinIdx = spool[record.partitionKey].currentBinIdx;

            if(spool[record.partitionKey].bins[currentBinIdx].length > 99){
                spool[record.partitionKey].currentBinIdx++;
                currentBinIdx = spool[record.partitionKey].currentBinIdx;
                spool[record.partitionKey].bins.push([]);
            }

            
            spool[record.partitionKey].bins[currentBinIdx].push(record)
            return spool;

        }, {});

        const client = await this.table_client({table});

        const batchStack = [];
        await Promise.all(Object.keys(binned).reduce<any>((stack, pk) => {
            return stack.concat(binned[pk].bins.map(async bin => {
                const batch = client.createBatch(pk);
                batchStack.push(batch)
                return batch.createEntities(bin);
            }))
        }, []))

        await Promise.all(batchStack.map(batch => batch.submitBatch()))

        return true;
    }

    /**
     * 
     * @param props 
     */
    private _waitUntilTableSpaceReady( props ) {

    } 

    private _clientBySharedKeyCredential(props:I._clientBySharedKeyCredentialProps):TableServiceClient|TableClient {

        const {
            type,
            table
        } = props;

        if(type === 'table' && !Boolean(table))
            throw `clientBySharedKeyCredential requires table be argued for table client`;

        const required_keys = [
            'AZURE_STORAGE_ACCOUNT',
            'AZURE_STORAGE_ACCOUNT_KEY'
        ];

        const k = this.get_configured_keys();

        for(const key of required_keys) {
            if(typeof process.env[k[key]] !== 'string' || process.env[k[key]].length === 0)
                throw Error(`missing environment key ${key}`)
        }


        const credential = new TablesSharedKeyCredential(
            process.env[k['AZURE_STORAGE_ACCOUNT']],
            process.env[k['AZURE_STORAGE_ACCOUNT_KEY']]
        );

        const url = `https://${process.env[k['AZURE_STORAGE_ACCOUNT']]}.table.core.windows.net`;

        switch(type) {
            case 'service':
                return new TableServiceClient(url, credential);
            case 'table':
                return new TableClient(url, table, credential);
        }

    }

    get_configured_keys() {

        const { instance_keys } = this;
        const _a = config_keys
        const _g = global_keys
        return config_keys.reduce<any>((acc, key) => {
                    acc[key] = instance_keys[key] || global_keys[key] 
                    return acc;
                }, {})
    }

    valid_environment() {

    }

    get_authentication_keys() {
        return {
            keys: this.instance_keys,
            global_keys: global_keys
        };
    }

}