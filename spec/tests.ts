require('dotenv').config();
import {
    describe,
    it
} from 'mocha';
import { assert } from 'chai';
import {
    AzureDataTablesClient
} from '../src';
import {
    AzureDataTablesClient as otherADTC
} from '../src';

import {
    TableServiceClient,
    TableClient
} from '@azure/data-tables';

import * as I from '../src/types';

import { mockData } from './mocks';

describe(`simple-datatables-framework [tests peforming on account ${process.env.AZURE_STORAGE_ACCOUNT}]`, function() {

    //it can take some time for the azure queue to complete a task.
    this.timeout(60000);
    let tableCnt = 0;

    describe.skip(`Azure queue recovery/mitigation tests`, () => {

        it(`Manages a table currently queued for deletion`, async () => {

            const table = "testDeletionQueue";
            const testRowsLength = 50;

            let result;

            const data:Array<I.record> = mockData(testRowsLength);
            const immutable_test = JSON.stringify(data);


            const instance = new AzureDataTablesClient();
            result = await instance.persist({table, data, partition:"myPK", row:"myRK", dropKeys: true});
            assert(result === true, 'failed');

            assert(JSON.stringify(data) ===  immutable_test, 'data mutation has occured');

            await instance.drop({table});

            result = await instance.persist({table, data: data, partition:"myPK", row:"myRK", dropKeys: true});
            assert(result === true, 'failed');

            const count = await instance.count({table});
            assert(count === testRowsLength, 'failed')

            await instance.drop({table});
        })


    });

    describe(`Environment tests`, () => {

        it(`sets global environment variables to use across instances`, () => {

            const instance1 = new AzureDataTablesClient();
            const instance2 = new AzureDataTablesClient({global_keys: {AZURE_STORAGE_ACCOUNT: "def_ASA"}});
            const instance3 = new otherADTC();


            assert(
                instance2.get_configured_keys().AZURE_STORAGE_ACCOUNT === 'def_ASA' &&
                instance2.get_configured_keys().AZURE_STORAGE_ACCOUNT === 'def_ASA' &&
                instance3.get_configured_keys().AZURE_STORAGE_ACCOUNT === 'def_ASA',
                "failed"
            )
        });

        it(`sets local (specific to the instance) varabile to use`, () => {

            const instance1 = new AzureDataTablesClient();
            const instance2 = new AzureDataTablesClient({AZURE_STORAGE_ACCOUNT: "local_ASA"});

            assert(
                instance1.get_configured_keys().AZURE_STORAGE_ACCOUNT !==
                instance2.get_configured_keys().AZURE_STORAGE_ACCOUNT,
                "failed"
            )
        });

        it(`resets the globals to defaults`, () => {

            const instance  = new AzureDataTablesClient({global_keys: {AZURE_STORAGE_ACCOUNT: "AZURE_STORAGE_ACCOUNT"}});
        });

    });

    describe('method tests', () => {

        describe(`AzureDataTablesClient::service_client`, () => {

            it(`no args`, () => {
                const instance = new AzureDataTablesClient();
                const result = instance.service_client();
                assert(result instanceof TableServiceClient, 'failed');
            });
        });

        describe(`AzureDataTablesClient::table_client`, () => {

            it(`common use`, async () => {

                const table = 'testsTableClient'
                const instance = new AzureDataTablesClient();
                const client = await instance.table_client({table});
                assert(client instanceof TableClient, 'failed - did not receive a TableClient instance');
                const result = await client.createEntity({partitionKey: 'pk_1', rowKey: 'rk_1'});
                await instance.drop({table});
            });

        });

        describe(`AzureDataTablesClient::tables`, () => {

            it(`common use`, async () => {

                const instance = new AzureDataTablesClient();
                const result = await instance.tables();
                assert(Array.isArray(result), 'expected an array');
                assert(result.length, 'expected some table names');
            });

        });

        describe(`AzureDataTablesClient::exists`, () => {

            const table = 'testsExists';

            it(`returns false when a table does not exist`, async () => {

                const instance = new AzureDataTablesClient();
                const exists = await instance.exists({table});
                assert(exists === false, `table ${table} should not exist`);
            });

            it(`returns true when a table does exist`, async () => {

                const instance = new AzureDataTablesClient();
                await instance.table_client({table});
                const existsnow = await instance.exists({table});
                assert(existsnow === true, 'method did not create a table');
                await instance.drop({table});
            });

        });

        describe(`AzureDataTablesClient::persist`, () => {

            it(`simple usage`, async () => {

                const testRowsLength = 50;

                const data:Array<I.record> = mockData(testRowsLength);
                const table = "testpersist";

                const instance = new AzureDataTablesClient();
                const result = await instance.persist({table, data, partition:"myPK", row:"myRK", dropKeys: true});
                assert(result === true, 'failed');

                const count = await instance.count({table});
                assert(count == testRowsLength, 'failed');

                await instance.drop({table});
            });

        });

        describe(`AzureDataTablesClient::find`, () => {

            it(`argued with a table and a find function`, async () => {

                const table = 'testsFind';
                const instance = new AzureDataTablesClient();
                
                const data = mockData(100);
                const selectedRecord = data.find(record => record.colIncr === 20);
                assert(selectedRecord && selectedRecord.colIncr === 20, 'failed');

                await instance.persist({table, data, partition:"myPK", row:"myRK"});

                const fn = entity => 
                    entity.colIncr === selectedRecord.colIncr;

                const result = await instance.find({table, fn});

                assert(result && result.colIncr === selectedRecord.colIncr, 'failed');

                await instance.drop({table});
            });

        });

        describe(`AzureDataTablesClient::filter`, () => {

            it(`common usage`, async () => {

                const table = 'testsFilter';
                const instance = new AzureDataTablesClient();
                
                const data = mockData(100);
                const selectedRecords = data.filter(record => record.colIncr > 10 && record.colIncr <= 65);
                assert(selectedRecords && selectedRecords.length === 55 , 'failed');

                await instance.persist({table, data, partition:"myPK", row:"myRK"});

                let idxCheck = 0;
                const fn = (entity, idx) => { 
                    assert(idx === idxCheck, 'failed - mapping function is being called without regard to order');
                    idxCheck++;
                    return entity.colIncr > 10 && entity.colIncr <= 65;
                }

                const result = await instance.filter({table, fn});
                assert(Array.isArray(result) && result.length === 55, 'failed');

                await instance.drop({table});
            });

        });

        describe(`AzureDataTablesClient::reduce`, () => {

            it(`common usage`, async () => {

                const table = 'testsReduce';
                const instance = new AzureDataTablesClient();
                
                const data = mockData(100);

                await instance.persist({table, data, partition:"myPK", row:"myRK"});

                //reducer will result in an array of the colIcnr attribute, ordered.
                const fn = (acc, entity, idx) => {
                    acc.push(entity.colIncr);
                    acc = acc.sort((a,b) => b > a ? -1 : 1);
                    return acc;
                };

                const result = await instance.reduce({table, fn, initial:[]});
                
                let i = 0;
                while(i < result.length) {
                    assert(i === result[i],  'failed');
                    i++;
                }

                await instance.drop({table});

            });

        });

        describe(`AzureDataTablesClient::filter`, () => {

            it(`standard usage`);
        });

        describe(`AzureDataTablesClient::create`, () => {

            it(`standard usage`, async () => {

                const table = 'testCreate';
                const instance = new AzureDataTablesClient();
                const result = await instance.create({table});
                assert(result === true, 'failed');
                await instance.drop({table});
            });
        });

        describe(`AzureDataTablesClient::drop`, () => {
            
            it(`standard usage`, async () => {

                const table = 'testDrop';
                const instance = new AzureDataTablesClient();
                await instance.create({table});
                const result = await instance.drop({table});
                assert(result === true, 'failed');
            });
        });

        describe(`AzureDataTablesClient::map`, () => {

            it(`common usage`, async () => {

                const table = 'testMap';
                const instance = new AzureDataTablesClient();

                const data = mockData(100);
                await instance.persist({table, data, partition:"myPK", row:"myRK"});

                let lastI = null;
                const mapper = (row, i) => {
                    assert(i != lastI, `mappers incrementer is failing - sent already used value "${i}"`)
                    row.myRK = '99';
                    lastI = i;
                    return row;
                }

                const result = await instance.map({table, fn:mapper});
                await instance.drop({table});

                assert(Array.isArray(result), 'expected an array');
                assert(result.length === 100, 'expected 100 rows in the result');

                result.forEach((row, i) => {
                    assert(row.myRK === '99', `failed - row ${i} does not have the expected value of 99`);
                });

            });

            it(`map and persist`, async () => {

                const table = 'testMapPersist';
                const instance = new AzureDataTablesClient();

                const data = mockData(100);
                await instance.persist({table, data, partition:"myPK", row:"myRK"});

                const mapper = (row, i) => {
                    row.myRK = `rku${i.toString()}`;
                    return row;
                }

                const result = await instance.map({table, fn:mapper, persist: true, partition:"myPK", row:"myRK"});
                const persisted = await instance.rows({table});
                await instance.drop({table});

                assert(Array.isArray(result), 'expected an array');
                assert(result.length === 100, 'expected 100 rows in the result');

                assert(Array.isArray(persisted), 'expected an array of rows persisted to the table');
                assert(persisted.length === 100, 'expected 100 rows in the persisted rows');

                result.forEach((row, i) => {
                    assert(row.myRK.includes(`rku`), `failed - row ${i} does not have an expected value including rku`);
                });

                persisted.forEach((row, i) => {
                    assert((row.myRK as string).includes(`rku`), `failed - row ${i} does not have an expected value including rku`);
                    assert(row.myRK == row.rowKey, `failed - row ${i} myRK and rowKey should Match`);
                    assert(row.myPK == row.partitionKey, `failed - row ${i} myPK and partitionKey should Match`);
                });

            })
        });

        describe(`AzureDataTablesClient::isEmpty`, () => {

            it(`returns true when an existing table is empty`, async () => {

                const table = 'testIsEmpty1';
                const instance = new AzureDataTablesClient();
                await instance.create({table});
                const result = await instance.isEmpty({table});
                assert(result === true, 'failed');
                await instance.drop({table});
            });

            it(`returns false when an existing table is not empty`, async () => {

                const table = 'testIsEmpty2';
                const instance = new AzureDataTablesClient();
                await instance.create({table});
                
                const client = await instance.table_client({table});
                await client.createEntity({partitionKey: 'p1', rowKey: 'r1', foo:"foo"});

                const result = await instance.isEmpty({table});
                assert(result === false, 'failed');
                await instance.drop({table});
            });

            it(`errors when argued with a non-existent table`, async () => {

                const table = 'notable';
                const instance = new AzureDataTablesClient();

                return new Promise( async (resolve, reject) => {

                    try {
                        const result = await instance.isEmpty({table});
                        await instance.drop({table});
                        reject('expected an error but did not get one');
                    }
                    catch( err ) {
                        resolve(true);
                    }
                });

            })
        });

        describe(`AzureDataTablesClient::accumulatedFetch`, () => {

            it(`common usage`, async () => {

                const table = 'testsAccumulatedFetch';
                const tables = [];
                const data1 = mockData(100);
                const data2 = [
                    Object.assign({}, JSON.parse(JSON.stringify(data1[7])), {col1:'d2set-change1'}),
                    Object.assign({}, JSON.parse(JSON.stringify(data1[54])), {col1:'d2set-change2'}),
                    { col1:"new row 1", myPK: '99', myRK: '1'}
                ];

                const data3 = [
                    Object.assign({}, JSON.parse(JSON.stringify(data2[0])), {col1:'d3set-change1'}),
                    Object.assign({}, JSON.parse(JSON.stringify(data1[33])), {col1:'d3set-change2'}),
                ]

                const instance = new AzureDataTablesClient();
                await Promise.all(
                    [data1, data2, data3].map((data, i) => {
                        const tablename = `${table}${i+1}`;
                        const promise = instance.persist({table:tablename, data, partition:"myPK", row:"myRK"})
                        tables.push(tablename);
                        return promise;
                    })
                );

                const sorter = (a,b) => (
                    parseFloat(a.partitionKey) > parseFloat(b.partitionKey) ? -1 : 1
                );

                const result = await instance.accumulativeFetch({tables, sort:sorter})

                assert(
                    result.length === data1.length + 1 //+1 for the new row
                    , `expected ${data1.length+1} rows but got ${result.length}`
                );
                
                //first change is actually not in the result - data2 applies change to data1 but then data3 applies a change to data2.
                const change1 = result.find(row => row.col1 === 'd2set-change1');
                assert(!change1, 'failed - change d2set-change1 of d1 should not exists - it gets overriden by the d3 set');

                const change2 = result.find(row => row.col1 === 'd2set-change2')
                const change2Index = result.findIndex(row => row.col1 === 'd2set-change2');
                assert(!!change2, 'failed - change d2set-change2 should exist')

                const change3 = result.find(row => row.col1 === 'd3set-change1')
                const change3Index = result.findIndex(row => row.col1 === 'd3set-change1');
                assert(!!change2, 'failed - change d3set-change1 should exist')

                const change4 = result.find(row => row.col1 === 'd2set-change2')
                const change4Index = result.findIndex(row => row.col1 === 'd2set-change2');
                assert(!!change2, 'failed - change d3set-change2 should exist')

                const addition1 = result.find(row => row.col1 === 'new row 1')
                assert(!!addition1 , 'failed - addition 1 does not exist');

                await Promise.all(
                    [data1, data2, data3].map((_, i) => 
                        instance.drop({table: `${table}${i+1}`})
                    )
                );


            });
        });

        describe(`AzureDataTablesClient::existsAndHasData`, () => {

            const table = 'existsAndHasDataTest';

            it(`returns false when a table does not exist`, async () => {

                const instance = new AzureDataTablesClient();
                const result = await instance.existsAndHasData({table});
                assert(result === false, 'failed');
            });

            it(`returns false when a table does exist but is empty`, async () => {

                const instance = new AzureDataTablesClient();
                await instance.create({table});
                const result = await instance.existsAndHasData({table});
                assert(result === false, 'failed');
            });

            it(`returns true when a table does exist and has data`, async () => {

                const instance = new AzureDataTablesClient();
                
                //this sidesteps the fact we've probably run the test prior to this and azure
                //has a really slow deletion queue for tables so it will error if we simply drop it.
                const exists = await instance.exists({table});
                if(!exists)
                    await instance.create({table});

                const client = await instance.table_client({table});
                await client.createEntity({partitionKey:"p1", rowKey:"r1", foo:"foo"});

                const result = await instance.existsAndHasData({table});
                assert(result === true, 'failed');

                await instance.drop({table});

            });

        });

    });

});