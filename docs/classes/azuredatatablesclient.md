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
- [count](azuredatatablesclient.md#count)
- [drop](azuredatatablesclient.md#drop)
- [empty](azuredatatablesclient.md#empty)
- [exists](azuredatatablesclient.md#exists)
- [filter](azuredatatablesclient.md#filter)
- [find](azuredatatablesclient.md#find)
- [get\_authentication\_keys](azuredatatablesclient.md#get_authentication_keys)
- [get\_configured\_keys](azuredatatablesclient.md#get_configured_keys)
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

Defined in: [client.ts:19](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L19)

## Properties

### authentication\_method

• **authentication\_method**: *string*

Defined in: [client.ts:18](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L18)

___

### instance\_keys

• **instance\_keys**: INSTANCE\_ENVIRONMENT\_VARIABLES

Defined in: [client.ts:19](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L19)

## Methods

### \_clientBySharedKeyCredential

▸ `Private`**_clientBySharedKeyCredential**(`props`: \_clientBySharedKeyCredentialProps): *TableServiceClient* \| *TableClient*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_clientBySharedKeyCredentialProps |

**Returns:** *TableServiceClient* \| *TableClient*

Defined in: [client.ts:582](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L582)

___

### \_insertAsRecords

▸ `Private`**_insertAsRecords**(`props`: \_insertAsRecordsProps): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | \_insertAsRecordsProps |

**Returns:** *Promise*<any\>

Defined in: [client.ts:494](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L494)

___

### \_waitUntilTableSpaceReady

▸ `Private`**_waitUntilTableSpaceReady**(`props`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** *void*

Defined in: [client.ts:578](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L578)

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

Defined in: [client.ts:402](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L402)

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

Defined in: [client.ts:177](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L177)

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

Defined in: [client.ts:201](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L201)

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

Defined in: [client.ts:137](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L137)

___

### filter

▸ **filter**(`props`: filterProps): *Promise*<any[]\>

Filter rows.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`props` | filterProps | Object the keyword argument object   |

**Returns:** *Promise*<any[]\>

Defined in: [client.ts:365](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L365)

___

### find

▸ **find**(`props`: findProps): *Promise*<record\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | findProps |

**Returns:** *Promise*<record\>

Defined in: [client.ts:295](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L295)

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

Defined in: [client.ts:636](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L636)

___

### get\_configured\_keys

▸ **get_configured_keys**(): *any*

**Returns:** *any*

Defined in: [client.ts:621](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L621)

___

### persist

▸ **persist**(`props`: persistProps): *Promise*<boolean\>

Persist data to a table initially dropping/emptying the table if it exists leaving the table being a persisted
representation of the argued data.

Performance concern:
This method empties the table if it exists rather than dropping it and thus avoiding the 30 second queue in azure
which occurs upon table deletion. If the datatable is quite large it may be more optimal to actually drop the table
and suffer the 30 second wait. IF that sounds like you, argue "forceDrop": true to the method keyword argument.

#### Parameters:

Name | Type |
:------ | :------ |
`props` | persistProps |

**Returns:** *Promise*<boolean\>

Defined in: [client.ts:432](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L432)

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

Defined in: [client.ts:331](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L331)

___

### remove

▸ **remove**(): *Promise*<void\>

Remove a row by Parition and Row Key

**Returns:** *Promise*<void\>

Defined in: [client.ts:257](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L257)

___

### rows

▸ **rows**(`props`: rowsProps): *Promise*<record[]\>

Gather rows

#### Parameters:

Name | Type |
:------ | :------ |
`props` | rowsProps |

**Returns:** *Promise*<record[]\>

Defined in: [client.ts:267](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L267)

___

### service\_client

▸ **service_client**(): *TableServiceClient*

**Returns:** *TableServiceClient*

Defined in: [client.ts:45](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L45)

___

### table\_client

▸ **table_client**(`props`: tableClientProps): *Promise*<TableClient\>

#### Parameters:

Name | Type |
:------ | :------ |
`props` | tableClientProps |

**Returns:** *Promise*<TableClient\>

Defined in: [client.ts:60](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L60)

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

Defined in: [client.ts:119](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L119)

___

### valid\_environment

▸ **valid_environment**(): *void*

**Returns:** *void*

Defined in: [client.ts:632](https://github.com/verikono/azure-datatable-tools/blob/d165a96/src/client.ts#L632)
