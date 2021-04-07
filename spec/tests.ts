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

describe(`simple-datatables-framework`, function() {

    //it can take some time for the azure queue to complete a task.
    this.timeout(60000);

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

        describe.only(`AzureDataTablesClient::existsAndHasData`, () => {

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