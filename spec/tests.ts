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
    TableServiceClient,
    TableClient
} from '@azure/data-tables';

import * as I from '../src/types';

import { mockData } from './mocks';

describe(`simple-datatables-framework`, function() {

    //it can take some time for the azure queue to complete a task.
    this.timeout(60000);

    describe(`Azure queue recovery/mitigation tests`, () => {

        it(`Manages a table currently queued for deletion`, async () => {

            const testRowsLength = 50;

            let result;

            const data:Array<I.record> = mockData(testRowsLength);
            const immutable_test = JSON.stringify(data);

            const table = "testDeletionQueue";

            const instance = new AzureDataTablesClient();
            result = await instance.persist({table, data, partition:"myPK", row:"myRK", dropKeys: true});
            assert(result === true, 'failed');

            assert(JSON.stringify(data) ===  immutable_test, 'data mutation has occured');

            await instance.drop({table});

            result = await instance.persist({table, data: data, partition:"myPK", row:"myRK", dropKeys: true});
            assert(result === true, 'failed');

            const count = await instance.count({table});
            assert(count === testRowsLength, 'failed')

        })


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

            it(`argued with a table`, async () => {
                const instance = new AzureDataTablesClient();
                const client = await instance.table_client({table: 'mytest'});
                assert(client instanceof TableClient, 'failed - did not receive a TableClient instance');
                const result = await client.createEntity({partitionKey: 'pk_1', rowKey: 'rk_1'});
                console.log('-')
            });

        });

        describe(`AzureDataTablesClient::exists`, () => {

            it(`argued with table`, async () => {

                const table = 'testsExists';
                const instance = new AzureDataTablesClient();
                const exists = await instance.exists({table});
                await instance.drop({table});

                assert(exists === true, 'method did not create a table');
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

            });

        });


        describe.only(`AzureDataTablesClient::reduce`, () => {

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

            });

        });


        describe(`AzureDataTablesClient::reduce`, () => {

            it(`standard usage`);
        })

        describe(`AzureDataTablesClient::filter`, () => {

            it(`standard usage`);
        });

        describe(`AzureDataTablesClient::drop`, () => {

        });



    });

});