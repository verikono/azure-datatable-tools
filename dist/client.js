"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureDataTablesClient = void 0;
const data_tables_1 = require("@azure/data-tables");
const C = __importStar(require("./const"));
class AzureDataTablesClient {
    constructor(props = {}) {
        this.authentication_method = props.method || C.default_authentication_method;
    }
    service_client() {
        try {
            switch (this.authentication_method) {
                case 'sharedKeyCredential':
                    return this._clientBySharedKeyCredential({ type: 'service' });
                default:
                    throw Error(`unknown authentication method ${this.authentication_method}`);
            }
        }
        catch (err) {
            throw Error(`AzureDataTablesClient::service_client has failed - ${err.message}`);
        }
    }
    table_client(props) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table } = props;
                let { create_table } = props;
                let client;
                let serviceclient;
                create_table = create_table === undefined ? true : create_table;
                switch (this.authentication_method) {
                    case 'sharedKeyCredential':
                        serviceclient = this._clientBySharedKeyCredential({ type: 'service' });
                        client = this._clientBySharedKeyCredential({ type: 'table', table });
                        break;
                    default:
                        throw Error(`unknown authentication method ${this.authentication_method}`);
                }
                if (create_table && !(yield this.exists({ table }))) {
                    try {
                        yield serviceclient.createTable(table);
                    }
                    catch (err) {
                        if (typeof err.message === 'string' && err.message.includes('TableBeingDeleted')) {
                            console.warn(`Table ${table} is currently queued for deletion, retry in 2 seconds`);
                            yield new Promise(r => setTimeout(() => r(true), 2000));
                            client = yield this.table_client(props);
                        }
                        else {
                            throw err;
                        }
                    }
                }
                return client;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::table_client has failed - ${err.message}`);
            }
        });
    }
    /**
     * Check for the existence of a table
     *
     * @param props the keyword argument object
     * @param props.table the table name
     * @returns true when the table exists
     */
    exists(props) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table } = props;
                if (!table || !table.length)
                    throw Error('invalid table argued');
                const client = this.service_client();
                const tables = yield client.listTables();
                try {
                    for (var tables_1 = __asyncValues(tables), tables_1_1; tables_1_1 = yield tables_1.next(), !tables_1_1.done;) {
                        const tbl = tables_1_1.value;
                        if (tbl.tableName === table)
                            return true;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (tables_1_1 && !tables_1_1.done && (_a = tables_1.return)) yield _a.call(tables_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return false;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::exists has failed - ${err.message}`);
            }
        });
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
    drop(props) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table } = props;
                const client = this.service_client();
                yield client.deleteTable(table);
                return true;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::drop has failed - ${err.message}`);
            }
        });
    }
    /**
     * Empty a table
     *
     * This method can be useful when replacing a table entirely due to Azure's operation queue taking upwards of 45 seconds
     * at times until it can make a tablename available for common use.
     */
    empty(props) {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table } = props;
                if (!table || !table.length)
                    throw Error(`invalid keyword "table" argued`);
                const client = yield this.table_client({ table });
                let spool = {};
                try {
                    for (var _b = __asyncValues(yield client.listEntities()), _c; _c = yield _b.next(), !_c.done;) {
                        const entity = _c.value;
                        if (!spool.hasOwnProperty(entity.partitionKey)) {
                            spool[entity.partitionKey] = { currentBinIdx: 0, bins: [[]] };
                        }
                        let currentBinIdx = spool[entity.partitionKey].currentBinIdx;
                        if (spool[entity.partitionKey].bins[currentBinIdx].length > 99) {
                            spool[entity.partitionKey].currentBinIdx++;
                            currentBinIdx = spool[entity.partitionKey].currentBinIdx;
                            spool[entity.partitionKey].bins.push([]);
                        }
                        spool[entity.partitionKey].bins[currentBinIdx].push(entity);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
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
                yield Promise.all(batchStack);
                yield Promise.all(batchStack.map(exec => exec.submitBatch()));
                return false;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::empty has failed - ${err.message}`);
            }
        });
    }
    /**
     * Remove a row by Parition and Row Key
     */
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            throw Error(`AzureDataTablesClient::remove is unimplemented`);
        });
    }
    /**
     * Gather rows
     *
     * @param props
     */
    rows(props) {
        var e_3, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table, fields } = props;
                const client = yield this.table_client({ table });
                const options = { queryOptions: {} };
                if (Array.isArray(fields) && fields.length) {
                    options.queryOptions.select = fields;
                }
                const result = [];
                try {
                    for (var _b = __asyncValues(client.listEntities(options)), _c; _c = yield _b.next(), !_c.done;) {
                        const entity = _c.value;
                        result.push(entity);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return result;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::rows has failed - ${err.message}`);
            }
        });
    }
    find(props) {
        var e_4, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table, fn } = props;
                const client = yield this.table_client({ table });
                try {
                    for (var _b = __asyncValues(client.listEntities()), _c; _c = yield _b.next(), !_c.done;) {
                        const entity = _c.value;
                        if (fn(entity)) {
                            return entity;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                return undefined;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::find failed - ${err.message}`);
            }
        });
    }
    /**
     *
     * @param props
     */
    reduce(props) {
        var e_5, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table, fn, initial } = props;
                let acc = JSON.parse(JSON.stringify(initial));
                const client = yield this.table_client({ table });
                let cnt = 0;
                try {
                    for (var _b = __asyncValues(client.listEntities()), _c; _c = yield _b.next(), !_c.done;) {
                        const entity = _c.value;
                        acc = fn(acc, entity, cnt);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                return acc;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::reduce has failed ${err.message}`);
            }
        });
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
    filter(props) {
        var e_6, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table, fn } = props;
                const client = yield this.table_client({ table });
                const result = [];
                const options = {};
                let cnt = 0;
                try {
                    for (var _b = __asyncValues(client.listEntities()), _c; _c = yield _b.next(), !_c.done;) {
                        const entity = _c.value;
                        if (fn(entity, cnt)) {
                            result.push(entity);
                        }
                        cnt++;
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                return result;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::filter has failed - ${err.message}`);
            }
        });
    }
    count(props) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table } = props;
                const client = yield this.table_client({ table });
                const result = yield this.rows({ table, fields: ["PartitionKey"] });
                return result.length;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::count has failed - ${err.message}`);
            }
        });
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
    persist(props) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { table, data, partition, row } = props;
                let { datatype, dropKeys, forceDrop } = props;
                datatype = datatype || 'records';
                forceDrop = forceDrop === undefined ? false : forceDrop;
                dropKeys = dropKeys === undefined ? false : dropKeys;
                //make sure we have a valid datatype
                const validDataTypes = [
                    'records'
                ];
                if (!validDataTypes.includes(datatype))
                    throw new Error(`unknown datatype ${datatype} argued`);
                //ensure a valid partition and row has been argued
                if (typeof partition !== 'function' && typeof partition !== 'string')
                    throw new Error('invalid parition argued - expected a function or a string');
                if (typeof row !== 'function' && typeof row !== 'string')
                    throw new Error('invalid row argued - expected a function or a string');
                //clean out any existance of the target tablespace
                const tableExists = yield this.exists({ table });
                if (tableExists) {
                    if (forceDrop) {
                        yield this.drop({ table });
                        yield this._waitUntilTableSpaceReady({ table });
                    }
                    else {
                        yield this.empty({ table });
                    }
                }
                switch (datatype) {
                    case 'records':
                        yield this._insertAsRecords({ table, data, partition, row, dropKeys });
                        break;
                    default:
                        throw Error(`unimplmented handler for datatype ${datatype}`);
                }
                return true;
            }
            catch (err) {
                throw Error(`AzureDataTablesClient::persist has failed - ${err.message}`);
            }
        });
    }
    _insertAsRecords(props) {
        return __awaiter(this, void 0, void 0, function* () {
            const { table, data, partition, row, dropKeys } = props;
            const resolvePartition = (record) => {
                switch (typeof partition) {
                    case 'function':
                        return partition(record);
                    case 'string':
                        return record[partition];
                    default:
                        throw Error('invalid partition argued to _insertAsRecords');
                }
            };
            const resolveRow = (record) => {
                switch (typeof row) {
                    case 'function':
                        return row(record);
                    case 'string':
                        return record[row];
                    default:
                        throw Error('invalid row argued to _insertAsRecords');
                }
            };
            //typescript's reduce is broken.. thus the <any> @see https://github.com/microsoft/TypeScript/issues/21061
            const binned = data.reduce((spool, record) => {
                record = Object.assign({}, record);
                record.partitionKey = resolvePartition(record);
                record.rowKey = resolveRow(record);
                if (dropKeys && typeof partition === 'string') {
                    delete record[partition];
                }
                if (dropKeys && typeof row === 'string') {
                    delete record[row];
                }
                if (!spool.hasOwnProperty(record.partitionKey)) {
                    spool[record.partitionKey] = { currentBinIdx: 0, bins: [[]] };
                }
                let currentBinIdx = spool[record.partitionKey].currentBinIdx;
                if (spool[record.partitionKey].bins[currentBinIdx].length > 99) {
                    spool[record.partitionKey].currentBinIdx++;
                    currentBinIdx = spool[record.partitionKey].currentBinIdx;
                    spool[record.partitionKey].bins.push([]);
                }
                spool[record.partitionKey].bins[currentBinIdx].push(record);
                return spool;
            }, {});
            const client = yield this.table_client({ table });
            const batchStack = [];
            yield Promise.all(Object.keys(binned).reduce((stack, pk) => {
                return stack.concat(binned[pk].bins.map((bin) => __awaiter(this, void 0, void 0, function* () {
                    const batch = client.createBatch(pk);
                    batchStack.push(batch);
                    return batch.createEntities(bin);
                })));
            }, []));
            yield Promise.all(batchStack.map(batch => batch.submitBatch()));
            return true;
        });
    }
    /**
     *
     * @param props
     */
    _waitUntilTableSpaceReady(props) {
    }
    _clientBySharedKeyCredential(props) {
        const { type, table } = props;
        if (type === 'table' && !Boolean(table))
            throw `clientBySharedKeyCredential requires table be argued for table client`;
        const required_keys = [
            "AZURE_STORAGE_ACCOUNT",
            "AZURE_STORAGE_ACCOUNT_KEY"
        ];
        for (const key of required_keys) {
            if (typeof process.env[key] !== 'string' || process.env[key].length === 0)
                throw Error(`missing environment key ${key}`);
        }
        const { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCOUNT_KEY } = process.env;
        const credential = new data_tables_1.TablesSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCOUNT_KEY);
        const url = `https:${AZURE_STORAGE_ACCOUNT}.table.core.windows.net`;
        switch (type) {
            case 'service':
                return new data_tables_1.TableServiceClient(url, credential);
            case 'table':
                return new data_tables_1.TableClient(url, table, credential);
        }
    }
    valid_environment() {
    }
}
exports.AzureDataTablesClient = AzureDataTablesClient;
//# sourceMappingURL=client.js.map