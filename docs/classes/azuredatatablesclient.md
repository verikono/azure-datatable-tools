[verikono-azure-datatable-tools](../README.md) / [Exports](../modules.md) / AzureDataTablesClient

# Class: AzureDataTablesClient

## Table of contents

### Constructors

- [constructor](azuredatatablesclient.md#constructor)

### Properties

- [authentication\_method](azuredatatablesclient.md#authentication_method)
- [instance\_keys](azuredatatablesclient.md#instance_keys)

### Methods

- [\_clientBySharedKeyCredential](azuredatatablesclient.md#_clientbysharedkeycredential)
- [\_insertAsRecords](azuredatatablesclient.md#_insertasrecords)
- [\_waitUntilTableSpaceReady](azuredatatablesclient.md#_waituntiltablespaceready)
- [accumulativeFetch](azuredatatablesclient.md#accumulativefetch)
- [count](azuredatatablesclient.md#count)
- [create](azuredatatablesclient.md#create)
- [drop](azuredatatablesclient.md#drop)
- [empty](azuredatatablesclient.md#empty)
- [exists](azuredatatablesclient.md#exists)
- [existsAndHasData](azuredatatablesclient.md#existsandhasdata)
- [filter](azuredatatablesclient.md#filter)
- [find](azuredatatablesclient.md#find)
- [get\_authentication\_keys](azuredatatablesclient.md#get_authentication_keys)
- [get\_configured\_keys](azuredatatablesclient.md#get_configured_keys)
- [isEmpty](azuredatatablesclient.md#isempty)
- [map](azuredatatablesclient.md#map)
- [persist](azuredatatablesclient.md#persist)
- [reduce](azuredatatablesclient.md#reduce)
- [remove](azuredatatablesclient.md#remove)
- [rows](azuredatatablesclient.md#rows)
- [service\_client](azuredatatablesclient.md#service_client)
- [table\_client](azuredatatablesclient.md#table_client)
- [tables](azuredatatablesclient.md#tables)
- [valid\_environment](azuredatatablesclient.md#valid_environment)

## Constructors

### constructor

\+ **new AzureDataTablesClient**(`props?`: constructorProps): [*AzureDataTablesClient*](azuredatatablesclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | constructorProps |

**Returns:** [*AzureDataTablesClient*](azuredatatablesclient.md)

Defined in: [client.ts:19](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L19)

## Properties

### authentication\_method

• **authentication\_method**: *string*

Defined in: [client.ts:18](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L18)

___

### instance\_keys

• **instance\_keys**: INSTANCE\_ENVIRONMENT\_VARIABLES

Defined in: [client.ts:19](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L19)

## Methods

### \_clientBySharedKeyCredential

▸ `Private`**_clientBySharedKeyCredential**(`props`: \_clientBySharedKeyCredentialProps): *TableServiceClient* \| *TableClient*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_clientBySharedKeyCredentialProps |

**Returns:** *TableServiceClient* \| *TableClient*

Defined in: [client.ts:797](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L797)

___

### \_insertAsRecords

▸ `Private`**_insertAsRecords**(`props`: \_insertAsRecordsProps): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_insertAsRecordsProps |

**Returns:** *Promise*<any\>

Defined in: [client.ts:709](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L709)

___

### \_waitUntilTableSpaceReady

▸ `Private`**_waitUntilTableSpaceReady**(`props`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** *void*

Defined in: [client.ts:793](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L793)

___

### accumulativeFetch

▸ **accumulativeFetch**(`props`: accumulaltiveFetchProps): *Promise*<record[]\>

Fetch rows from multiple tables when each table is expected to have updated/new rows.

Eg for argued tables ["shows2021", "showsJan", "showsFeb", "showsMar"] this method is useful if we wanted to load
all the shows, then add/replace the shows with those in showsJan, then showsFeb etc.

The method uses the partitionKey and rowKey to determine if a row is a replacement. Order is non existent in Azure
Storage Tables, so if an ordering function is not provided then the rows will return in a different order each invocation.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | accumulaltiveFetchProps | the keyword argument object   |

**Returns:** *Promise*<record[]\>

Defined in: [client.ts:667](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L667)

___

### count

▸ **count**(`props`: countProps): *Promise*<number\>

Get the count of the rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | countProps | Object the keyword argument object   |

**Returns:** *Promise*<number\>

Promise<number> the number of rows

Defined in: [client.ts:549](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L549)

___

### create

▸ **create**(`props`: createProps): *Promise*<boolean\>

create a table.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | createProps | the keyword argument object   |

**Returns:** *Promise*<boolean\>

Promise resolving in a boolean. True being the table was successfully created.

Defined in: [client.ts:198](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L198)

___

### drop

▸ **drop**(`props`: dropProps): *Promise*<boolean\>

Drop a table

Due to Azure's operations queue, dropping a table makes the namespace inaccessible for ~45seconds to a minute. If you're
dropping the table to replace it or need access to the namespace quickly, use empty which will probably be faster up to
~100,000 rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | dropProps | Object the keyword object   |

**Returns:** *Promise*<boolean\>

Promise resolving true upon success.

Defined in: [client.ts:228](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L228)

___

### empty

▸ **empty**(`props`: emptyProps): *Promise*<boolean\>

Empty a table

This method can be useful when replacing a table entirely due to Azure's operation queue taking upwards of 45 seconds
at times until it can make a tablename available for common use.

#### Parameters:

Name | Type |
:------ | :------ |
`props` | emptyProps |

**Returns:** *Promise*<boolean\>

Defined in: [client.ts:252](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L252)

___

### exists

▸ **exists**(`props`: existsProps): *Promise*<boolean\>

Check for the existence of a table

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | existsProps | the keyword argument object   |

**Returns:** *Promise*<boolean\>

true when the table exists

Defined in: [client.ts:138](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L138)

___

### existsAndHasData

▸ **existsAndHasData**(`props`: existsAndHasDataProps): *Promise*<boolean\>

Essentially a check for a valid data source.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | existsAndHasDataProps | the keyword argument object   |

**Returns:** *Promise*<boolean\>

Promise resolving to boolean true if a table exists and is populated with at least one row.

Defined in: [client.ts:173](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L173)

___

### filter

▸ **filter**(`props`: filterProps): *Promise*<any[]\>

Filter rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | filterProps | Object the keyword argument object   |

**Returns:** *Promise*<any[]\>

Defined in: [client.ts:465](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L465)

___

### find

▸ **find**(`props`: findProps): *Promise*<record\>

Seek a single row in the table

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | findProps | Object the keyword argument object   |

**Returns:** *Promise*<record\>

Promise<any> the resolved row or undefined if no row was found.

Defined in: [client.ts:395](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L395)

___

### get\_authentication\_keys

▸ **get_authentication_keys**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`global_keys` | *object* |
`global_keys.AZURE_STORAGE_ACCOUNT` | *string* |
`global_keys.AZURE_STORAGE_ACCOUNT_KEY` | *string* |
`keys` | INSTANCE\_ENVIRONMENT\_VARIABLES |

Defined in: [client.ts:851](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L851)

___

### get\_configured\_keys

▸ **get_configured_keys**(): *any*

**Returns:** *any*

Defined in: [client.ts:836](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L836)

___

### isEmpty

▸ **isEmpty**(`props`: isEmptyProps): *Promise*<boolean\>

Check to see if a table has zero rows (it's empty)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | isEmptyProps |

**Returns:** *Promise*<boolean\>

Promise resolving to a boolean which is true if the table has no rows.

Defined in: [client.ts:312](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L312)

___

### map

▸ **map**(`props`: mapProps): *Promise*<any[]\>

Replace a table entirely with provided data.

#### Parameters:

Name | Type |
:------ | :------ |
`props` | mapProps |

**Returns:** *Promise*<any[]\>

Defined in: [client.ts:499](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L499)

___

### persist

▸ **persist**(`props`: persistProps): *Promise*<boolean\>

Persist data to a table initially DROPPING/EMPTYING THE TABLE IF IT EXISTS leaving the table being a persisted
representation of the argued data.

Performance concern:
This method empties the table if it exists rather than dropping it and thus avoiding the 30 second queue in azure
which occurs upon table deletion. If the datatable is quite large it may be more optimal to actually drop the table
and suffer the 30 second wait. IF that sounds like you, argue "forceDrop": true to the method keyword argument.

**`throws`** Error

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | persistProps | they keyword argument object   |

**Returns:** *Promise*<boolean\>

boolean TRUE on success

Defined in: [client.ts:589](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L589)

___

### reduce

▸ **reduce**(`props`: reduceProps): *Promise*<any\>

Reduce on rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | reduceProps | Object the keyword argument object   |

**Returns:** *Promise*<any\>

Promise<any> the reduced value

Defined in: [client.ts:431](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L431)

___

### remove

▸ **remove**(): *Promise*<void\>

Remove a row by Parition and Row Key

**Returns:** *Promise*<void\>

Defined in: [client.ts:348](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L348)

___

### rows

▸ **rows**(`props`: rowsProps): *Promise*<record[]\>

Gather rows

#### Parameters:

Name | Type |
:------ | :------ |
`props` | rowsProps |

**Returns:** *Promise*<record[]\>

Defined in: [client.ts:358](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L358)

___

### service\_client

▸ **service_client**(): *TableServiceClient*

**Returns:** *TableServiceClient*

Defined in: [client.ts:45](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L45)

___

### table\_client

▸ **table_client**(`props`: tableClientProps): *Promise*<TableClient\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | tableClientProps |

**Returns:** *Promise*<TableClient\>

Defined in: [client.ts:60](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L60)

___

### tables

▸ **tables**(`props?`: {}): *Promise*<string[]\>

List all available tables

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *object* |

**Returns:** *Promise*<string[]\>

Array - a list of tables found for this configured service client

Defined in: [client.ts:119](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L119)

___

### valid\_environment

▸ **valid_environment**(): *void*

**Returns:** *void*

Defined in: [client.ts:847](https://github.com/verikono/azure-datatable-tools/blob/231f752/src/client.ts#L847)
