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

describe(`simple-datatables-framework`, function() {

    describe('method tests', () => {

        describe(`Private Authentication methods`, () => {

            it(`AzureDataTablesClient::_clientBySharedKeyCredential`, () => {

                const instance = new AzureDataTablesClient();
                const result = instance._clientBySharedKeyCredential({type:'service'});
                assert(result instanceof TableServiceClient, 'failed');
            });
        });


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

        describe.only(`AzureDataTablesClient::exists`, () => {

            it(`argued with table`, async () => {

                const table = 'testsExists';
                const instance = new AzureDataTablesClient();
                const exists = await instance.exists({table});
                await instance.drop({table});

                assert(exists === true, 'method did not create a table');
            });

        });

        describe(`AzureDataTablesClient::drop`, () => {

        });

    });

});